package com.procurehub.procurehub.controller;

import com.procurehub.procurehub.dto.OrderStatusUpdateRequest;
import com.procurehub.procurehub.entity.Order;
import com.procurehub.procurehub.entity.OrderStatusHistory;
import com.procurehub.procurehub.enums.OrderStatus;
import com.procurehub.procurehub.repository.OrderRepository;
import com.procurehub.procurehub.repository.OrderStatusHistoryRepository;
import com.procurehub.procurehub.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import com.procurehub.procurehub.config.DatabaseSeeder;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private DatabaseSeeder databaseSeeder;

    // =========================================================================
    // SEED SAMPLE DEMO DATA (FOR PRESENTATION & TESTING)
    // =========================================================================
    @PostMapping("/seed")
    public ResponseEntity<?> seedDemoData() {
        Map<String, Object> result = databaseSeeder.seedAllDemoData();
        return ResponseEntity.ok(result);
    }

    // =========================================================================
    // GET ALL ORDERS (ADMIN) - SUPPORTS PAGINATION (DEFAULT ASCENDING ORDER)
    // =========================================================================
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtAsc();
    }

    @GetMapping("/paginated")
    public com.procurehub.procurehub.dto.PaginatedResponse<Order> getAllOrdersPaginated(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        return orderService.getAllOrdersPaginated(page, limit, search, status, sortOrder);
    }

    // =========================================================================
    // GET ORDER BY NUMERIC ID
    // =========================================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================================
    // GET ORDER BY FORMATTED ORDER CODE (e.g. ORD-2026-0001)
    // =========================================================================
    @GetMapping("/code/{orderId}")
    public ResponseEntity<?> getOrderByCode(@PathVariable String orderId) {
        return orderRepository.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================================
    // GET ORDERS FOR A SPECIFIC USER (TRACK MY ORDERS)
    // =========================================================================
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return orderRepository.findByUser_UserIdOrderByCreatedAtAsc(userId);
    }

    @GetMapping("/user/{userId}/paginated")
    public com.procurehub.procurehub.dto.PaginatedResponse<Order> getUserOrdersPaginated(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        return orderService.getUserOrdersPaginated(userId, page, limit, search, status, sortOrder);
    }

    // =========================================================================
    // GET ORDERS FOR A SPECIFIC SUPPLIER (SUPPLIER PORTAL)
    // =========================================================================
    @GetMapping("/supplier/{supplierId}")
    public List<Order> getOrdersBySupplier(@PathVariable Long supplierId) {
        return orderRepository.findBySupplier_SupplierIdOrderByCreatedAtAsc(supplierId);
    }

    @GetMapping("/supplier/{supplierId}/paginated")
    public com.procurehub.procurehub.dto.PaginatedResponse<Order> getSupplierOrdersPaginated(
            @PathVariable Long supplierId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        return orderService.getSupplierOrdersPaginated(supplierId, page, limit, search, status, sortOrder);
    }

    @GetMapping("/supplier/{supplierId}/stats")
    public Map<String, Object> getSupplierStats(@PathVariable Long supplierId) {
        return orderService.getSupplierDashboardStats(supplierId);
    }

    // =========================================================================
    // TRACK ORDER WITH VISUAL TIMELINE & AUDIT HISTORY
    // =========================================================================
    @GetMapping("/{orderId}/track")
    public ResponseEntity<?> trackOrder(@PathVariable String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElse(null);

        if (order == null) {
            try {
                Long numericId = Long.parseLong(orderId);
                order = orderRepository.findById(numericId).orElse(null);
            } catch (NumberFormatException ignored) {
            }
        }

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        List<OrderStatusHistory> history = orderStatusHistoryRepository.findByOrder_OrderIdOrderByCreatedAtAsc(order.getOrderId());
        if (history.isEmpty()) {
            history = order.getStatusHistory();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("order", order);
        response.put("timeline", history);
        response.put("currentStatus", order.getStatus());
        response.put("expectedDeliveryDate", order.getExpectedDeliveryDate());

        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // UPDATE ORDER STATUS (WITH ROLE PERMISSIONS & LOGGING)
    // =========================================================================
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        try {
            Order updated = orderService.updateOrderStatus(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> patchStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        return updateStatus(id, request);
    }

    // =========================================================================
    // GET ORDER DASHBOARD AGGREGATED METRICS
    // =========================================================================
    @GetMapping("/stats")
    public Map<String, Object> getOrderStats() {
        List<Order> all = orderRepository.findAll();

        long total = all.size();
        long pending = 0;
        long processing = 0;
        long shipped = 0;
        long outForDelivery = 0;
        long delivered = 0;
        long cancelled = 0;
        double totalValue = 0.0;

        for (Order o : all) {
            totalValue += (o.getTotalAmount() != null ? o.getTotalAmount() : 0.0);
            if (o.getStatus() == OrderStatus.DELIVERED) delivered++;
            else if (o.getStatus() == OrderStatus.SHIPPED) shipped++;
            else if (o.getStatus() == OrderStatus.OUT_FOR_DELIVERY) outForDelivery++;
            else if (o.getStatus() == OrderStatus.PROCESSING || o.getStatus() == OrderStatus.ORDER_CONFIRMED) processing++;
            else if (o.getStatus() == OrderStatus.CANCELLED) cancelled++;
            else pending++;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("processing", processing);
        stats.put("shipped", shipped);
        stats.put("outForDelivery", outForDelivery);
        stats.put("delivered", delivered);
        stats.put("cancelled", cancelled);
        stats.put("totalValue", totalValue);

        return stats;
    }
}
