package com.procurehub.procurehub.config;

import com.procurehub.procurehub.entity.*;
import com.procurehub.procurehub.enums.OrderStatus;
import com.procurehub.procurehub.enums.ProductStatus;
import com.procurehub.procurehub.enums.SupplierStatus;
import com.procurehub.procurehub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Override
    public void run(String... args) throws Exception {
        seedInitialDataIfEmpty();
    }

    @Transactional
    public synchronized Map<String, Object> seedInitialDataIfEmpty() {
        if (orderRepository.count() > 0) {
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Database already populated with " + orderRepository.count() + " orders.");
            res.put("ordersCount", orderRepository.count());
            return res;
        }
        return seedAllDemoData();
    }

    @Transactional
    public synchronized Map<String, Object> seedAllDemoData() {
        // 1. Seed or retrieve Users
        UserEntity admin = userRepository.findByEmail("admin@smartprocure.com").orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setUsername("Admin Officer");
            u.setEmail("admin@smartprocure.com");
            u.setPassword("admin123");
            u.setDesignation("Procurement Director");
            u.setPhoneNumber("+91 98765 43210");
            u.setRole("ADMIN");
            return userRepository.save(u);
        });

        // Users: Admin, Users, Supplier (NO Manager)
        UserEntity employee = userRepository.findByEmail("employee@smartprocure.com").orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setUsername("Ananya Sharma");
            u.setEmail("employee@smartprocure.com");
            u.setPassword("user123");
            u.setDesignation("Senior Software Engineer");
            u.setPhoneNumber("+91 91234 56780");
            u.setRole("USER");
            return userRepository.save(u);
        });

        UserEntity employee2 = userRepository.findByEmail("rahul.verma@smartprocure.com").orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setUsername("Rahul Verma");
            u.setEmail("rahul.verma@smartprocure.com");
            u.setPassword("user123");
            u.setDesignation("DevOps Specialist");
            u.setPhoneNumber("+91 94567 89012");
            u.setRole("USER");
            return userRepository.save(u);
        });

        // Seed Supplier User for Portal Login
        UserEntity supplierUser = userRepository.findByEmail("supplier@dell.com").orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setUsername("Dell Commercial Operations");
            u.setEmail("supplier@dell.com");
            u.setPassword("supplier123");
            u.setDesignation("Supplier Account Manager");
            u.setPhoneNumber("+91 80 6789 0000");
            u.setRole("SUPPLIER");
            return userRepository.save(u);
        });

        // 2. Seed or retrieve Departments
        Department itDept = getOrCreateDepartment("IT & Cloud Infrastructure", "Vikram Malhotra", "manager@smartprocure.com");
        Department engineeringDept = getOrCreateDepartment("Software Engineering", "Rajesh Gupta", "rajesh.gupta@smartprocure.com");
        Department operationsDept = getOrCreateDepartment("Corporate Operations", "Priya Nair", "priya.nair@smartprocure.com");
        Department facilitiesDept = getOrCreateDepartment("Facilities & Administration", "Suresh Menon", "suresh.menon@smartprocure.com");

        // 3. Seed or retrieve Categories
        Category catHardware = getOrCreateCategory("Developer Laptops & Workstations", itDept);
        Category catMonitors = getOrCreateCategory("Displays & Peripherals", itDept);
        Category catNetworking = getOrCreateCategory("Networking & Servers", itDept);
        Category catFurniture = getOrCreateCategory("Ergonomic Furniture", facilitiesDept);
        Category catCloudLicense = getOrCreateCategory("Cloud & SaaS Licenses", engineeringDept);

        // 4. Seed or retrieve Suppliers
        Supplier dellSupplier = getOrCreateSupplier("Dell India Enterprise Direct", "supplier@dell.com", "+91 80 6789 0000", "Plot 12, Divyasree Greens, Bengaluru, Karnataka 560037", "1234");
        Supplier lenovoSupplier = getOrCreateSupplier("Lenovo Global Commercial Solutions", "commercial@lenovo.in", "+91 80 4936 8888", "Ferns Icon, Marathahalli, Outer Ring Rd, Bengaluru 560037", "4321");
        Supplier appleSupplier = getOrCreateSupplier("Apple Enterprise Reseller (Aventrix)", "support@aventrix-tech.in", "+91 22 6123 4567", "BKC Complex, Bandra East, Mumbai 400051", "5678");
        Supplier ciscoSupplier = getOrCreateSupplier("Cisco Systems India Networking", "procure@cisco-direct.in", "+91 80 4426 0000", "SEZ Kadubeesanahalli, Bengaluru 560103", "9999");
        Supplier ergonomicSupplier = getOrCreateSupplier("Steelcase & Featherlite Workspaces", "sales@workspace-solutions.in", "+91 11 4567 8901", "Okhla Industrial Area Phase III, New Delhi 110020", "1111");

        // 5. Seed or retrieve Accounts
        Account hdfcCorp = getOrCreateAccount("SmartProcure Corporate Treasury", "50200088992211", "HDFC Bank", "HDFC0001234", "Koramangala 4th Block, Bengaluru", "Current Account");
        Account iciciTreasury = getOrCreateAccount("SmartProcure Ops Account", "000205011982", "ICICI Bank", "ICIC0000002", "Indiranagar 100ft Rd, Bengaluru", "Corporate Current");

        // 6. Seed Sample Orders across all real-world stages
        List<Order> seededOrders = new ArrayList<>();

        // Order 1: DELIVERED (MacBook Pro M3 Max Workstations)
        createOrderWithHistory(
                "ORD-2026-0001",
                "Apple MacBook Pro 16\" M3 Max (36GB RAM, 1TB SSD, Space Black)",
                3,
                249900.0,
                749700.0,
                OrderStatus.DELIVERED,
                "SUCCESS",
                "TXN-2026-990142",
                employee,
                itDept,
                catHardware,
                appleSupplier,
                hdfcCorp,
                LocalDateTime.now().minusDays(12),
                LocalDateTime.now().minusDays(2),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Purchase order generated via automated MPIN procurement payment.", "Ananya Sharma", "USER", 1),
                        new StageRecord(OrderStatus.ORDER_CONFIRMED, "Supplier Aventrix Enterprise acknowledged and allocated inventory.", "Aventrix Dispatch Team", "SUPPLIER", 2),
                        new StageRecord(OrderStatus.PROCESSING, "Hardware serialization and enterprise MDM profile pre-configured at warehouse.", "Logistics Warehouse Ops", "SUPPLIER", 3),
                        new StageRecord(OrderStatus.SHIPPED, "Consignment picked up by BlueDart Express. Tracking AWB #BLUEDART-8829104.", "BlueDart Dispatch Hub", "SUPPLIER", 5),
                        new StageRecord(OrderStatus.OUT_FOR_DELIVERY, "Package arrived at Bengaluru East Hub and assigned to delivery agent Rakesh.", "BlueDart Delivery Desk", "SUPPLIER", 8),
                        new StageRecord(OrderStatus.DELIVERED, "Secure delivery received and verified at IT Asset Bay 4 by Receiving Officer.", "Vikram Malhotra", "ADMIN", 10)
                )
        );

        // Order 2: OUT_FOR_DELIVERY (Dell UltraSharp 32" 4K USB-C Hub Monitors)
        createOrderWithHistory(
                "ORD-2026-0002",
                "Dell UltraSharp 32\" 4K USB-C Hub Monitor (U3223QE PremierColor)",
                5,
                68500.0,
                342500.0,
                OrderStatus.OUT_FOR_DELIVERY,
                "SUCCESS",
                "TXN-2026-990143",
                employee2,
                itDept,
                catMonitors,
                dellSupplier,
                hdfcCorp,
                LocalDateTime.now().minusDays(6),
                LocalDateTime.now().plusHours(4),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Purchase order created following Manager and Admin financial approval.", "Rahul Verma", "USER", 1),
                        new StageRecord(OrderStatus.ORDER_CONFIRMED, "Dell Commercial team confirmed order & released from Sriperumbudur facility.", "Dell Fulfillment Desk", "SUPPLIER", 2),
                        new StageRecord(OrderStatus.PROCESSING, "Palletized with foam shock protection and calibrated before dispatch.", "Dell Quality Control", "SUPPLIER", 3),
                        new StageRecord(OrderStatus.SHIPPED, "Handed over to DTDC Priority Cargo. Waybill #DTDC-99210041.", "DTDC Central Logistics", "SUPPLIER", 4),
                        new StageRecord(OrderStatus.OUT_FOR_DELIVERY, "Consignment in delivery van out for corporate drop-off at Tech Park campus.", "DTDC Express Courier", "SUPPLIER", 6)
                )
        );

        // Order 3: SHIPPED (Cisco Catalyst 9300 48-Port PoE+ Enterprise Switches)
        createOrderWithHistory(
                "ORD-2026-0003",
                "Cisco Catalyst 9300 48-Port PoE+ Enterprise Core Switch (C9300-48P-A)",
                2,
                420000.0,
                840000.0,
                OrderStatus.SHIPPED,
                "SUCCESS",
                "TXN-2026-990144",
                employee,
                itDept,
                catNetworking,
                ciscoSupplier,
                iciciTreasury,
                LocalDateTime.now().minusDays(4),
                LocalDateTime.now().plusDays(2),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Approved requisition for datacenter network expansion PO placed.", "Ananya Sharma", "USER", 1),
                        new StageRecord(OrderStatus.ORDER_CONFIRMED, "Cisco Enterprise registered Smart Account and reserved rack equipment.", "Cisco Enterprise Partner", "SUPPLIER", 2),
                        new StageRecord(OrderStatus.PROCESSING, "Switch firmware upgraded to latest TAC recommended iOS XE image.", "Cisco Staging Lab", "SUPPLIER", 3),
                        new StageRecord(OrderStatus.SHIPPED, "Dispatched via Safexpress Air Freight with insurance container AWB #SAFE-33019.", "Safexpress Air Cargo", "SUPPLIER", 4)
                )
        );

        // Order 4: PROCESSING (Lenovo ThinkPad P16 Gen 2 Mobile Workstations)
        createOrderWithHistory(
                "ORD-2026-0004",
                "Lenovo ThinkPad P16 Gen 2 (Intel i9-13980HX, 64GB DDR5, RTX 4000 Ada)",
                4,
                215000.0,
                860000.0,
                OrderStatus.PROCESSING,
                "SUCCESS",
                "TXN-2026-990145",
                employee,
                engineeringDept,
                catHardware,
                lenovoSupplier,
                hdfcCorp,
                LocalDateTime.now().minusDays(2),
                LocalDateTime.now().plusDays(5),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Engineering AI/ML heavy computing requisition authorized and payment completed.", "Ananya Sharma", "USER", 0),
                        new StageRecord(OrderStatus.ORDER_CONFIRMED, "Lenovo Commercial Desk verified institutional pricing & confirmed build.", "Lenovo Enterprise Operations", "SUPPLIER", 1),
                        new StageRecord(OrderStatus.PROCESSING, "Workstations custom-configured in clean room and undergoing 24h stress test.", "Lenovo Manufacturing Plant", "SUPPLIER", 2)
                )
        );

        // Order 5: ORDER_CONFIRMED (Steelcase Gesture Ergonomic Executive Mesh Chairs)
        createOrderWithHistory(
                "ORD-2026-0005",
                "Steelcase Gesture Ergonomic Task Chair with 360 Armrests (Licorice Mesh)",
                10,
                48000.0,
                480000.0,
                OrderStatus.ORDER_CONFIRMED,
                "SUCCESS",
                "TXN-2026-990146",
                employee2,
                facilitiesDept,
                catFurniture,
                ergonomicSupplier,
                hdfcCorp,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(7),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Facilities ergonomic upgrade batch #4 approved & payment transferred.", "Rahul Verma", "USER", 0),
                        new StageRecord(OrderStatus.ORDER_CONFIRMED, "Featherlite / Steelcase confirmed batch allocation for delivery next week.", "Steelcase Commercial Desk", "SUPPLIER", 1)
                )
        );

        // Order 6: ORDER_PLACED (AWS Enterprise Cloud Compute Support Reservation)
        createOrderWithHistory(
                "ORD-2026-0006",
                "AWS Direct Connect 10Gbps Dedicated Port & Enterprise Support Tier",
                1,
                175000.0,
                175000.0,
                OrderStatus.ORDER_PLACED,
                "SUCCESS",
                "TXN-2026-990147",
                employee2,
                engineeringDept,
                catCloudLicense,
                ciscoSupplier,
                iciciTreasury,
                LocalDateTime.now().minusHours(8),
                LocalDateTime.now().plusDays(4),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Requisition authorized by Admin. Payment executed via Corporate UPI.", "Admin Officer", "ADMIN", 0)
                )
        );

        // Order 7: DELIVERED (Dell PowerEdge R760 Rackmount Server)
        createOrderWithHistory(
                "ORD-2026-0007",
                "Dell PowerEdge R760 2U Server (2x Intel Xeon Gold, 256GB ECC, 8TB NVMe RAID)",
                1,
                620000.0,
                620000.0,
                OrderStatus.DELIVERED,
                "SUCCESS",
                "TXN-2026-990148",
                employee,
                itDept,
                catNetworking,
                dellSupplier,
                iciciTreasury,
                LocalDateTime.now().minusDays(20),
                LocalDateTime.now().minusDays(10),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Core infrastructure capacity upgrade PO initiated.", "Ananya Sharma", "USER", 1),
                        new StageRecord(OrderStatus.ORDER_CONFIRMED, "Dell Direct Server Line confirmed factory assembly.", "Dell Commercial India", "SUPPLIER", 2),
                        new StageRecord(OrderStatus.PROCESSING, "Rack server assembled, dual power supplies tested, and BIOS hardened.", "Dell Factory Lab", "SUPPLIER", 4),
                        new StageRecord(OrderStatus.SHIPPED, "Transported via Dedicated Temperature-Controlled Logistics. AWB #DEL-90182.", "Dell Logistics Partner", "SUPPLIER", 6),
                        new StageRecord(OrderStatus.OUT_FOR_DELIVERY, "Server carrier vehicle entered main security gate at Data Center 1.", "Safexpress Transport", "SUPPLIER", 9),
                        new StageRecord(OrderStatus.DELIVERED, "Server unboxed, asset tagged as SRV-2026-BLR-01, and racked successfully.", "Admin Officer", "ADMIN", 10)
                )
        );

        // Order 8: CANCELLED (Legacy Printers Batch - Supplier Out of Stock)
        createOrderWithHistory(
                "ORD-2026-0008",
                "HP LaserJet Enterprise Multifunction Laser Printer (M636x Auto-Duplex)",
                2,
                82000.0,
                164000.0,
                OrderStatus.CANCELLED,
                "REFUNDED",
                "TXN-2026-990149",
                employee,
                operationsDept,
                catHardware,
                dellSupplier,
                hdfcCorp,
                LocalDateTime.now().minusDays(8),
                LocalDateTime.now().minusDays(5),
                List.of(
                        new StageRecord(OrderStatus.ORDER_PLACED, "Office printer replacement request generated and paid.", "Ananya Sharma", "USER", 1),
                        new StageRecord(OrderStatus.ORDER_CONFIRMED, "Order received by supplier partner desk.", "Vendor Logistics Desk", "SUPPLIER", 2),
                        new StageRecord(OrderStatus.CANCELLED, "Supplier reported end-of-life component shortage. Purchase order revoked and payment refunded.", "Admin Officer", "ADMIN", 3)
                )
        );

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Successfully seeded demo procurement database with 8 orders across all lifecycle stages!");
        result.put("ordersCount", orderRepository.count());
        result.put("suppliersCount", supplierRepository.count());
        result.put("productsCount", productRepository.count());
        return result;
    }

    private Department getOrCreateDepartment(String name, String manager, String email) {
        return departmentRepository.findAll().stream()
                .filter(d -> d.getDepartmentName() != null && d.getDepartmentName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setDepartmentName(name);
                    d.setManagerOfDepartment(manager);
                    d.setManagerEmail(email);
                    return departmentRepository.save(d);
                });
    }

    private Category getOrCreateCategory(String name, Department dept) {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getCategoryName() != null && c.getCategoryName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Category c = new Category();
                    c.setCategoryName(name);
                    c.setDepartment(dept);
                    return categoryRepository.save(c);
                });
    }

    private Supplier getOrCreateSupplier(String name, String email, String phone, String address, String mpin) {
        return supplierRepository.findByEmail(email).orElseGet(() -> {
            Supplier s = new Supplier();
            s.setSupplierName(name);
            s.setEmail(email);
            s.setPhone(phone);
            s.setAddress(address);
            s.setStatus(SupplierStatus.DELIVERED);
            s.setMpin(mpin);
            return supplierRepository.save(s);
        });
    }

    private Account getOrCreateAccount(String holder, String accNum, String bank, String ifsc, String branch, String type) {
        return accountRepository.findAll().stream()
                .filter(a -> a.getAccountNumber() != null && a.getAccountNumber().equals(accNum))
                .findFirst()
                .orElseGet(() -> {
                    Account a = new Account();
                    a.setAccountHolderName(holder);
                    a.setAccountNumber(accNum);
                    a.setBankName(bank);
                    a.setIfscCode(ifsc);
                    a.setBranchName(branch);
                    a.setAccountType(type);
                    return accountRepository.save(a);
                });
    }

    private void createOrderWithHistory(
            String orderCode,
            String productName,
            int quantity,
            double unitPrice,
            double totalAmount,
            OrderStatus finalStatus,
            String paymentStatus,
            String txnId,
            UserEntity user,
            Department dept,
            Category cat,
            Supplier supplier,
            Account account,
            LocalDateTime orderDate,
            LocalDateTime expectedDeliveryDate,
            List<StageRecord> stages
    ) {
        if (orderRepository.findByOrderId(orderCode).isPresent()) {
            return;
        }

        // 1. Create matching Product
        Product product = new Product();
        product.setName(productName);
        product.setUser(user);
        product.setPricePerProduct(unitPrice);
        product.setNumberOfQuantities(quantity);
        product.setTotalPrice(totalAmount);
        product.setDepartment(dept);
        product.setCategory(cat);
        product.setDescription("Enterprise procurement for " + productName + " allocated to " + dept.getDepartmentName());
        product.setStatus(ProductStatus.ORDER_PLACED);
        product.setCreatedDate(orderDate);
        product.setUpdatedDate(LocalDateTime.now());
        product = productRepository.save(product);

        // 2. Create matching Payment
        Payment payment = new Payment();
        payment.setProduct(product);
        payment.setSupplier(supplier);
        payment.setAccount(account);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod("CORPORATE_NET_BANKING");
        payment.setTransactionId(txnId);
        payment.setPaymentDate(orderDate.plusMinutes(15));
        payment.setPaymentStatus(paymentStatus);
        payment = paymentRepository.save(payment);

        // 3. Create Order
        Order order = new Order();
        order.setOrderId(orderCode);
        order.setProduct(product);
        order.setPayment(payment);
        order.setSupplier(supplier);
        order.setUser(user);
        order.setDepartment(dept);
        order.setCategory(cat);
        order.setProductName(productName);
        order.setQuantity(quantity);
        order.setUnitPrice(unitPrice);
        order.setTotalAmount(totalAmount);
        order.setStatus(finalStatus);
        order.setPaymentStatus(paymentStatus);
        order.setTransactionId(txnId);
        order.setOrderDate(orderDate);
        order.setExpectedDeliveryDate(expectedDeliveryDate);
        order.setCreatedAt(orderDate);
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        // 4. Create Status Histories
        List<OrderStatusHistory> historyList = new ArrayList<>();
        for (StageRecord sr : stages) {
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrder(order);
            history.setStatus(sr.status);
            history.setDescription(sr.description);
            history.setChangedBy(sr.changedBy);
            history.setChangedByRole(sr.changedByRole);
            history.setCreatedAt(orderDate.plusDays(Math.max(0, sr.daysOffset)));
            orderStatusHistoryRepository.save(history);
            historyList.add(history);
        }

        order.setStatusHistory(historyList);
        orderRepository.save(order);
    }

    private static class StageRecord {
        OrderStatus status;
        String description;
        String changedBy;
        String changedByRole;
        long daysOffset;

        StageRecord(OrderStatus status, String description, String changedBy, String changedByRole, long daysOffset) {
            this.status = status;
            this.description = description;
            this.changedBy = changedBy;
            this.changedByRole = changedByRole;
            this.daysOffset = daysOffset;
        }
    }
}
