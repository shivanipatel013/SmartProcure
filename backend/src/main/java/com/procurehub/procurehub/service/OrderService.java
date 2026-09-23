package com.procurehub.procurehub.service;

import com.procurehub.procurehub.dto.OrderStatusUpdateRequest;
import com.procurehub.procurehub.dto.SupplierPerformanceDTO;
import com.procurehub.procurehub.entity.*;
import com.procurehub.procurehub.enums.OrderStatus;
import com.procurehub.procurehub.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    // =========================================================================
    // GENERATE UNIQUE FORMATTED ORDER ID: ORD-YYYY-XXXX
    // =========================================================================
    public synchronized String generateNextOrderId() {
        int currentYear = Year.now().getValue();
        String yearPrefix = "ORD-" + currentYear + "-";
        long countInYear = orderRepository.countOrdersInYear(yearPrefix);
        long nextSeq = countInYear + 1;
        String formatted = String.format("%04d", nextSeq);
        String candidate = yearPrefix + formatted;

        // Double check uniqueness
        while (orderRepository.findByOrderId(candidate).isPresent()) {
            nextSeq++;
            candidate = yearPrefix + String.format("%04d", nextSeq);
        }
        return candidate;
    }

    // =========================================================================
    // CREATE ORDER AUTOMATICALLY FROM SUCCESSFUL PAYMENT
    // =========================================================================
    @Transactional
    public Order createOrderFromPayment(Payment payment) {
        if (payment == null || payment.getProduct() == null) {
            return null;
        }

        // Check if an order already exists for this payment
        Optional<Order> existing = orderRepository.findByPayment_PaymentId(payment.getPaymentId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Product product = payment.getProduct();
        Supplier supplier = payment.getSupplier();
        UserEntity user = product.getUser();

        Order order = new Order();
        order.setOrderId(generateNextOrderId());
        order.setProduct(product);
        order.setPayment(payment);
        order.setSupplier(supplier);
        order.setUser(user);
        order.setDepartment(product.getDepartment());
        order.setCategory(product.getCategory());
        order.setProductName(product.getName());
        order.setQuantity(product.getNumberOfQuantities() != null ? product.getNumberOfQuantities() : 1);
        order.setUnitPrice(product.getPricePerProduct() != null ? product.getPricePerProduct() : 0.0);
        order.setTotalAmount(payment.getAmount() != null ? payment.getAmount() : product.getTotalPrice());
        order.setStatus(OrderStatus.ORDER_PLACED);
        order.setPaymentStatus(payment.getPaymentStatus() != null ? payment.getPaymentStatus() : "COMPLETED");
        order.setTransactionId(payment.getTransactionId() != null ? payment.getTransactionId() : ("TXN-" + System.currentTimeMillis()));

        LocalDateTime now = LocalDateTime.now();
        order.setOrderDate(payment.getPaymentDate() != null ? payment.getPaymentDate() : now);
        order.setExpectedDeliveryDate(now.plusDays(5));
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        // Add initial status history record
        OrderStatusHistory initialHistory = new OrderStatusHistory(
                order,
                OrderStatus.ORDER_PLACED,
                "Order successfully created and placed with supplier following MPIN payment verification.",
                "Admin",
                "ADMIN"
        );
        order.addStatusHistory(initialHistory);

        Order savedOrder = orderRepository.save(order);

        // Dispatch notifications
        try {
            if (user != null) {
                notificationService.createNotification(
                        user.getUserId(),
                        "USER",
                        "Order Placed",
                        "Your order " + savedOrder.getOrderId() + " (" + savedOrder.getProductName() + ") has been placed successfully.",
                        "ORDER_PLACED",
                        savedOrder.getOrderId(),
                        "ORDER"
                );
            }
            notificationService.createNotification(
                    null,
                    "SUPPLIER",
                    "New Order Assigned",
                    "New order " + savedOrder.getOrderId() + " (" + savedOrder.getProductName() + ", Qty: " + savedOrder.getQuantity() + ") has been assigned to you.",
                    "ORDER_PLACED",
                    savedOrder.getOrderId(),
                    "ORDER"
            );
            notificationService.createNotification(
                    null,
                    "ADMIN",
                    "Payment Completed & Order Placed",
                    "Payment completed for order " + savedOrder.getOrderId() + " (" + (supplier != null ? supplier.getSupplierName() : "Supplier") + ").",
                    "ORDER_PLACED",
                    savedOrder.getOrderId(),
                    "ORDER"
            );
        } catch (Exception notifEx) {
            System.out.println("Notification log: " + notifEx.getMessage());
        }

        // Dispatch Email Notification
        if (user != null && user.getEmail() != null) {
            emailService.sendOrderPlacedMail(
                    user.getEmail(),
                    user.getUsername(),
                    savedOrder.getOrderId(),
                    savedOrder.getProductName(),
                    savedOrder.getQuantity(),
                    savedOrder.getTotalAmount(),
                    supplier != null ? supplier.getSupplierName() : "Assigned Supplier"
            );
        }

        return savedOrder;
    }

    // =========================================================================
    // UPDATE ORDER STATUS (ROLE-BASED & STRICT AUDIT LOGGED)
    // =========================================================================
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid order status: " + request.getStatus());
        }

        String changedBy = request.getChangedBy() != null ? request.getChangedBy() : "System";
        String changedByRole = request.getChangedByRole() != null ? request.getChangedByRole().toUpperCase() : "ADMIN";

        // Validate state transitions
        validateStatusTransition(order.getStatus(), newStatus, changedByRole);

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        String description = request.getDescription();
        if (description == null || description.trim().isEmpty()) {
            description = getDefaultStatusDescription(newStatus, changedBy);
        }

        OrderStatusHistory history = new OrderStatusHistory(
                order,
                newStatus,
                description,
                changedBy,
                changedByRole
        );
        order.addStatusHistory(history);

        Order updatedOrder = orderRepository.save(order);

        // Dispatch notifications
        try {
            String statusTitle = "Order " + newStatus.name().replace("_", " ");
            if (order.getUser() != null) {
                notificationService.createNotification(
                        order.getUser().getUserId(),
                        "USER",
                        statusTitle,
                        "Order " + order.getOrderId() + " is now " + newStatus.name().replace("_", " ") + ": " + description,
                        "ORDER_" + newStatus.name(),
                        order.getOrderId(),
                        "ORDER"
                );
            }
            notificationService.createNotification(
                    null,
                    "ADMIN",
                    "Order Status Updated",
                    "Order " + order.getOrderId() + " updated to " + newStatus.name().replace("_", " ") + " by " + changedBy + ".",
                    "ORDER_" + newStatus.name(),
                    order.getOrderId(),
                    "ORDER"
            );
        } catch (Exception notifEx) {
            System.out.println("Notification log: " + notifEx.getMessage());
        }

        // Dispatch status update email
        if (order.getUser() != null && order.getUser().getEmail() != null) {
            emailService.sendOrderStatusUpdateMail(
                    order.getUser().getEmail(),
                    order.getUser().getUsername(),
                    order.getOrderId(),
                    order.getProductName(),
                    newStatus.name(),
                    description
            );
        }

        return updatedOrder;
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next, String role) {
        if (current == next) {
            return; // No change
        }

        if (next == OrderStatus.CANCELLED) {
            if ("ADMIN".equalsIgnoreCase(role)) {
                if (current == OrderStatus.RECEIVED || current == OrderStatus.DELIVERED) {
                    throw new RuntimeException("Delivered orders cannot be cancelled.");
                }
                return;
            } else {
                throw new RuntimeException("Only administrators can cancel orders.");
            }
        }

        // Sequential Supplier Workflow: APPROVED / ORDER_PLACED -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> RECEIVED
        boolean valid = false;
        switch (current) {
            case ORDER_PLACED:
            case APPROVED:
            case ORDER_CONFIRMED:
                valid = (next == OrderStatus.PACKED || next == OrderStatus.PROCESSING || next == OrderStatus.ORDER_CONFIRMED);
                break;
            case PACKED:
            case PROCESSING:
                valid = (next == OrderStatus.SHIPPED);
                break;
            case SHIPPED:
                valid = (next == OrderStatus.OUT_FOR_DELIVERY);
                break;
            case OUT_FOR_DELIVERY:
                valid = (next == OrderStatus.RECEIVED || next == OrderStatus.DELIVERED);
                break;
            case RECEIVED:
            case DELIVERED:
                throw new RuntimeException("Order is already in final Received status and cannot be transitioned further.");
            case CANCELLED:
                throw new RuntimeException("Cancelled order cannot be transitioned.");
            default:
                valid = true;
        }

        if (!valid) {
            throw new RuntimeException("Invalid status transition from " + current + " to " + next + ". Allowed next stage is: " + getNextRecommendedStatus(current));
        }
    }

    public OrderStatus getNextRecommendedStatus(OrderStatus current) {
        switch (current) {
            case ORDER_PLACED:
            case APPROVED:
            case ORDER_CONFIRMED:
                return OrderStatus.PACKED;
            case PACKED:
            case PROCESSING:
                return OrderStatus.SHIPPED;
            case SHIPPED:
                return OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY:
                return OrderStatus.RECEIVED;
            default:
                return current;
        }
    }

    private String getDefaultStatusDescription(OrderStatus status, String changedBy) {
        switch (status) {
            case APPROVED:
            case ORDER_CONFIRMED:
                return "Order acknowledged and accepted by Supplier " + changedBy + ".";
            case PACKED:
            case PROCESSING:
                return "Order items picked, packed, and packaged for dispatch by " + changedBy + ".";
            case SHIPPED:
                return "Consignment handed over to express cargo & courier logistics partner.";
            case OUT_FOR_DELIVERY:
                return "Consignment arrived at destination regional hub and is out for local delivery.";
            case RECEIVED:
            case DELIVERED:
                return "Order consignment successfully received and verified at department.";
            case CANCELLED:
                return "Order cancelled by " + changedBy + ".";
            case DELAYED:
                return "Shipment delivery has encountered transit delay.";
            default:
                return "Order status transitioned to " + status.name() + " by " + changedBy + ".";
        }
    }

    // =========================================================================
    // GET REAL SUPPLIER PERFORMANCE ANALYTICS
    // =========================================================================
    public SupplierPerformanceDTO getSupplierPerformance(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + supplierId));

        List<Order> supplierOrders = orderRepository.findBySupplier_SupplierIdOrderByCreatedAtDesc(supplierId);

        SupplierPerformanceDTO dto = new SupplierPerformanceDTO();
        dto.setSupplierId(supplier.getSupplierId());
        dto.setSupplierName(supplier.getSupplierName());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setFulfillmentStatus(supplier.getStatus() != null ? supplier.getStatus().name() : "ORDER_PLACED");
        dto.setMpinConfigured(supplier.getMpin() != null && !supplier.getMpin().trim().isEmpty());

        long totalOrders = supplierOrders.size();
        long totalProducts = 0;
        long totalQty = 0;
        long completed = 0;
        long processing = 0;
        long shipped = 0;
        long outForDelivery = 0;
        long delivered = 0;
        long cancelled = 0;
        long pending = 0;
        double totalValue = 0.0;

        for (Order o : supplierOrders) {
            totalProducts++;
            totalQty += (o.getQuantity() != null ? o.getQuantity() : 1);
            double amount = o.getTotalAmount() != null ? o.getTotalAmount() : 0.0;
            totalValue += amount;

            if (o.getStatus() == OrderStatus.DELIVERED) {
                delivered++;
                completed++;
            } else if (o.getStatus() == OrderStatus.SHIPPED) {
                shipped++;
            } else if (o.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                outForDelivery++;
            } else if (o.getStatus() == OrderStatus.PROCESSING || o.getStatus() == OrderStatus.ORDER_CONFIRMED) {
                processing++;
            } else if (o.getStatus() == OrderStatus.CANCELLED) {
                cancelled++;
            } else {
                pending++;
            }
        }

        dto.setTotalOrders(totalOrders);
        dto.setTotalProductsOrdered(totalProducts);
        dto.setTotalQuantity(totalQty);
        dto.setCompletedOrders(completed);
        dto.setProcessingOrders(processing);
        dto.setShippedOrders(shipped);
        dto.setOutForDeliveryOrders(outForDelivery);
        dto.setDeliveredOrders(delivered);
        dto.setCancelledOrders(cancelled);
        dto.setPendingOrders(pending);
        dto.setTotalProcurementValue(totalValue);

        double avgOrderValue = totalOrders > 0 ? (totalValue / totalOrders) : 0.0;
        dto.setAverageOrderValue(Math.round(avgOrderValue * 100.0) / 100.0);

        long nonCancelled = totalOrders - cancelled;
        double successRate = nonCancelled > 0 ? ((double) delivered / nonCancelled * 100.0) : (totalOrders > 0 ? 0.0 : 100.0);
        dto.setDeliverySuccessRate(Math.round(successRate * 10.0) / 10.0);

        return dto;
    }

    public List<SupplierPerformanceDTO> getAllSupplierPerformances() {
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplierPerformanceDTO> list = new ArrayList<>();
        for (Supplier s : suppliers) {
            list.add(getSupplierPerformance(s.getSupplierId()));
        }
        return list;
    }

    // =========================================================================
    // PAGINATED ORDERS (DEFAULT ASCENDING ORDER)
    // =========================================================================
    public com.procurehub.procurehub.dto.PaginatedResponse<Order> getSupplierOrdersPaginated(
            Long supplierId, int page, int limit, String search, String statusStr, String sortOrder) {

        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 10;

        org.springframework.data.domain.Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? org.springframework.data.domain.Sort.by("createdAt").descending()
                : org.springframework.data.domain.Sort.by("createdAt").ascending();

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(pageIndex, pageSize, sort);

        OrderStatus statusEnum = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusStr.trim())) {
            try {
                statusEnum = OrderStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        org.springframework.data.domain.Page<Order> resultPage =
                orderRepository.findSupplierOrdersWithFilter(supplierId, statusEnum, searchPattern, pageable);

        return new com.procurehub.procurehub.dto.PaginatedResponse<>(
                resultPage.getContent(),
                page,
                pageSize,
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.hasNext(),
                resultPage.hasPrevious()
        );
    }

    public com.procurehub.procurehub.dto.PaginatedResponse<Order> getUserOrdersPaginated(
            Long userId, int page, int limit, String search, String statusStr, String sortOrder) {

        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 10;

        org.springframework.data.domain.Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? org.springframework.data.domain.Sort.by("createdAt").descending()
                : org.springframework.data.domain.Sort.by("createdAt").ascending();

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(pageIndex, pageSize, sort);

        OrderStatus statusEnum = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusStr.trim())) {
            try {
                statusEnum = OrderStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        org.springframework.data.domain.Page<Order> resultPage =
                orderRepository.findUserOrdersWithFilter(userId, statusEnum, searchPattern, pageable);

        return new com.procurehub.procurehub.dto.PaginatedResponse<>(
                resultPage.getContent(),
                page,
                pageSize,
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.hasNext(),
                resultPage.hasPrevious()
        );
    }

    public com.procurehub.procurehub.dto.PaginatedResponse<Order> getAllOrdersPaginated(
            int page, int limit, String search, String statusStr, String sortOrder) {

        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 10;

        org.springframework.data.domain.Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? org.springframework.data.domain.Sort.by("createdAt").descending()
                : org.springframework.data.domain.Sort.by("createdAt").ascending();

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(pageIndex, pageSize, sort);

        OrderStatus statusEnum = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusStr.trim())) {
            try {
                statusEnum = OrderStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        org.springframework.data.domain.Page<Order> resultPage =
                orderRepository.findAllOrdersWithFilter(statusEnum, searchPattern, pageable);

        return new com.procurehub.procurehub.dto.PaginatedResponse<>(
                resultPage.getContent(),
                page,
                pageSize,
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.hasNext(),
                resultPage.hasPrevious()
        );
    }

    public java.util.Map<String, Object> getSupplierDashboardStats(Long supplierId) {
        List<Order> orders = orderRepository.findBySupplier_SupplierIdOrderByCreatedAtAsc(supplierId);

        long total = orders.size();
        long pending = 0;
        long inProgress = 0;
        long completed = 0;
        long packed = 0;
        long shipped = 0;
        long outForDelivery = 0;
        double totalValue = 0.0;

        for (Order o : orders) {
            totalValue += (o.getTotalAmount() != null ? o.getTotalAmount() : 0.0);
            if (o.getStatus() == OrderStatus.DELIVERED || o.getStatus() == OrderStatus.RECEIVED) {
                completed++;
            } else if (o.getStatus() == OrderStatus.SHIPPED) {
                inProgress++;
                shipped++;
            } else if (o.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                inProgress++;
                outForDelivery++;
            } else if (o.getStatus() == OrderStatus.PACKED || o.getStatus() == OrderStatus.PROCESSING) {
                inProgress++;
                packed++;
            } else {
                pending++;
            }
        }

        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("totalOrders", total);
        map.put("pendingOrders", pending);
        map.put("inProgressOrders", inProgress);
        map.put("completedOrders", completed);
        map.put("packedOrders", packed);
        map.put("shippedOrders", shipped);
        map.put("outForDeliveryOrders", outForDelivery);
        map.put("receivedOrders", completed);
        map.put("totalProcurementValue", totalValue);
        return map;
    }

    // =========================================================================
    // DATA BACKFILL / SYNC ON STARTUP (Ensures existing payments have Orders)
    // =========================================================================
    @PostConstruct
    public void syncExistingPaymentsToOrders() {
        try {
            List<Payment> allPayments = paymentRepository.findAll();
            for (Payment p : allPayments) {
                if (p.getProduct() != null) {
                    Optional<Order> existing = orderRepository.findByPayment_PaymentId(p.getPaymentId());
                    if (existing.isEmpty()) {
                        createOrderFromPayment(p);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Payment-Order sync check: " + e.getMessage());
        }
    }
}
