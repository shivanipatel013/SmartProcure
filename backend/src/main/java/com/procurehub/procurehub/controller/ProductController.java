package com.procurehub.procurehub.controller;

import java.time.LocalDateTime;
import java.util.*;

import com.procurehub.procurehub.dto.ApprovalRequest;
import com.procurehub.procurehub.dto.CatalogProductDTO;
import com.procurehub.procurehub.dto.PaginatedResponse;
import com.procurehub.procurehub.entity.Category;
import com.procurehub.procurehub.entity.Department;
import com.procurehub.procurehub.entity.Product;
import com.procurehub.procurehub.entity.UserEntity;
import com.procurehub.procurehub.enums.ProductStatus;
import com.procurehub.procurehub.repository.CategoryRepository;
import com.procurehub.procurehub.repository.DepartmentRepository;
import com.procurehub.procurehub.repository.ProductRepository;
import com.procurehub.procurehub.repository.UserRepository;
import com.procurehub.procurehub.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/product")
public class ProductController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.procurehub.procurehub.service.NotificationService notificationService;

    // =========================================================================
    // STANDARD PROCUREMENT CATALOG (FIXED BACKEND PRICING & CATEGORIES)
    // =========================================================================
    @GetMapping("/catalog")
    public List<CatalogProductDTO> getProductCatalog() {
        return getStandardCatalogList();
    }

    private List<CatalogProductDTO> getStandardCatalogList() {
        Long itId = 1L;
        String itName = "IT & Cloud Infrastructure";
        Long softId = 2L;
        String softName = "Software Engineering";
        Long facId = 3L;
        String facName = "Facilities & Administration";

        Long lapId = 1L;
        String lapName = "Developer Laptops & Workstations";
        Long dispId = 2L;
        String dispName = "Displays & Peripherals";
        Long netId = 3L;
        String netName = "Networking & Servers";
        Long furnId = 4L;
        String furnName = "Ergonomic Furniture";
        Long cloudId = 5L;
        String cloudName = "Cloud & SaaS Licenses";

        try {
            List<Department> depts = departmentRepository.findAll();
            if (depts != null && !depts.isEmpty()) {
                Department itDept = depts.stream().filter(d -> d.getDepartmentName() != null && d.getDepartmentName().toLowerCase().contains("it")).findFirst().orElse(null);
                Department softDept = depts.stream().filter(d -> d.getDepartmentName() != null && d.getDepartmentName().toLowerCase().contains("engineering")).findFirst().orElse(itDept);
                Department facDept = depts.stream().filter(d -> d.getDepartmentName() != null && d.getDepartmentName().toLowerCase().contains("facilities")).findFirst().orElse(itDept);

                if (itDept != null) { itId = itDept.getDepartmentId(); itName = itDept.getDepartmentName(); }
                if (softDept != null) { softId = softDept.getDepartmentId(); softName = softDept.getDepartmentName(); }
                if (facDept != null) { facId = facDept.getDepartmentId(); facName = facDept.getDepartmentName(); }
            }

            List<Category> cats = categoryRepository.findAll();
            if (cats != null && !cats.isEmpty()) {
                Category catLaptop = cats.stream().filter(c -> c.getCategoryName() != null && c.getCategoryName().toLowerCase().contains("laptop")).findFirst().orElse(null);
                Category catDisplay = cats.stream().filter(c -> c.getCategoryName() != null && (c.getCategoryName().toLowerCase().contains("display") || c.getCategoryName().toLowerCase().contains("monitor"))).findFirst().orElse(null);
                Category catNetwork = cats.stream().filter(c -> c.getCategoryName() != null && c.getCategoryName().toLowerCase().contains("network")).findFirst().orElse(null);
                Category catFurniture = cats.stream().filter(c -> c.getCategoryName() != null && c.getCategoryName().toLowerCase().contains("furniture")).findFirst().orElse(null);
                Category catCloud = cats.stream().filter(c -> c.getCategoryName() != null && c.getCategoryName().toLowerCase().contains("cloud")).findFirst().orElse(null);

                if (catLaptop != null) { lapId = catLaptop.getCategoryId(); lapName = catLaptop.getCategoryName(); }
                if (catDisplay != null) { dispId = catDisplay.getCategoryId(); dispName = catDisplay.getCategoryName(); }
                if (catNetwork != null) { netId = catNetwork.getCategoryId(); netName = catNetwork.getCategoryName(); }
                if (catFurniture != null) { furnId = catFurniture.getCategoryId(); furnName = catFurniture.getCategoryName(); }
                if (catCloud != null) { cloudId = catCloud.getCategoryId(); cloudName = catCloud.getCategoryName(); }
            }
        } catch (Exception ignored) {}

        List<CatalogProductDTO> catalog = new ArrayList<>();
        catalog.add(new CatalogProductDTO("Dell Laptop 7440", 70000.0, itId, itName, lapId, lapName, "Dell Latitude 7440 Core i7 13th Gen, 16GB RAM, 512GB NVMe SSD"));
        catalog.add(new CatalogProductDTO("HP Laptop 15s", 50000.0, itId, itName, lapId, lapName, "HP 15s Intel Core i5 12th Gen, 16GB RAM, 512GB SSD, FHD Display"));
        catalog.add(new CatalogProductDTO("Dell Mouse MS116", 5000.0, itId, itName, dispId, dispName, "Dell Optical Wired USB Mouse MS116 1000 DPI Precision"));
        catalog.add(new CatalogProductDTO("HP LaserJet Pro 4104", 25000.0, facId, facName, dispId, dispName, "HP LaserJet Pro MFP 4104dw Multi-function High-Speed Laser Printer"));
        catalog.add(new CatalogProductDTO("Apple MacBook Pro 16\" M3 Max", 249900.0, itId, itName, lapId, lapName, "Apple MacBook Pro 16-inch M3 Max (36GB Unified Memory, 1TB SSD, Space Black)"));
        catalog.add(new CatalogProductDTO("Dell UltraSharp 32\" 4K USB-C Hub Monitor", 68500.0, itId, itName, dispId, dispName, "Dell UltraSharp U3223QE 31.5-inch 4K UHD IPS USB-C Hub Monitor"));
        catalog.add(new CatalogProductDTO("Lenovo ThinkPad P16 Gen 2", 215000.0, softId, softName, lapId, lapName, "Lenovo ThinkPad P16 Mobile Workstation Intel i9, 64GB DDR5, RTX 4000"));
        catalog.add(new CatalogProductDTO("Keychron K2 Mechanical Keyboard", 7499.0, itId, itName, dispId, dispName, "Keychron K2 Wireless Mechanical Keyboard RGB Backlit Gateron G Pro"));
        catalog.add(new CatalogProductDTO("Cisco Catalyst 9300 48-Port PoE+ Switch", 420000.0, itId, itName, netId, netName, "Cisco Catalyst C9300-48P-A 48-Port Gigabit PoE+ Enterprise Switch"));
        catalog.add(new CatalogProductDTO("Steelcase Gesture Ergonomic Task Chair", 48000.0, facId, facName, furnId, furnName, "Steelcase Gesture Ergonomic Executive Office Chair with 360 Armrests"));
        catalog.add(new CatalogProductDTO("AWS Direct Connect 10Gbps Dedicated Port", 175000.0, softId, softName, cloudId, cloudName, "AWS Direct Connect 10Gbps Dedicated Cloud Connection & Enterprise Tier"));
        catalog.add(new CatalogProductDTO("Dell PowerEdge R760 2U Rack Server", 620000.0, itId, itName, netId, netName, "Dell PowerEdge R760 2U Server Dual Intel Xeon Gold, 256GB ECC RAM, 8TB NVMe"));

        return catalog;
    }

    public Double getCatalogPrice(String productName) {
        if (productName == null) return null;
        for (CatalogProductDTO p : getStandardCatalogList()) {
            if (p.getName().equalsIgnoreCase(productName.trim())) {
                return p.getPrice();
            }
        }
        return null;
    }

    // =========================================================================
    // RAISE PROCUREMENT REQUEST (FIXED BACKEND PRICING & VALIDATION)
    // =========================================================================
    @PostMapping("/raiseRequest")
    public ResponseEntity<?> raiseRequest(@RequestBody Product product) {
        try {
            if (product.getUser() == null || product.getUser().getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required.");
            }

            if (product.getName() == null || product.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Product Name is required.");
            }

            int quantity = (product.getNumberOfQuantities() != null && product.getNumberOfQuantities() > 0)
                    ? product.getNumberOfQuantities() : 1;
            product.setNumberOfQuantities(quantity);

            // Fetch Fixed Unit Price from Backend Catalog (Never trust frontend price)
            Double catalogPrice = getCatalogPrice(product.getName());
            if (catalogPrice != null) {
                product.setPricePerProduct(catalogPrice);
            } else if (product.getPricePerProduct() == null || product.getPricePerProduct() <= 0) {
                product.setPricePerProduct(50000.0);
            }

            // Backend calculates the final Total Price
            product.setTotalPrice(product.getPricePerProduct() * quantity);

            // Ensure Department and Category entities are verified
            if (product.getDepartment() != null && product.getDepartment().getDepartmentId() != null) {
                Department dept = departmentRepository.findById(product.getDepartment().getDepartmentId()).orElse(null);
                if (dept != null) product.setDepartment(dept);
            }
            if (product.getCategory() != null && product.getCategory().getCategoryId() != null) {
                Category cat = categoryRepository.findById(product.getCategory().getCategoryId()).orElse(null);
                if (cat != null) product.setCategory(cat);
            }

            UserEntity user = userRepository.findById(product.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + product.getUser().getUserId()));
            product.setUser(user);

            product.setStatus(ProductStatus.PENDING);
            LocalDateTime now = LocalDateTime.now();
            product.setCreatedDate(now);
            product.setUpdatedDate(now);

            Product saved = productRepository.save(product);

            // Create persistent notifications
            try {
                // For User
                notificationService.createNotification(
                        user.getUserId(),
                        "USER",
                        "Request Submitted",
                        "REQ-" + saved.getProductId() + " (" + saved.getName() + ", Qty: " + saved.getNumberOfQuantities() + ") submitted successfully.",
                        "REQUEST_SUBMITTED",
                        "REQ-" + saved.getProductId(),
                        "REQUEST"
                );
                // For Admin
                notificationService.createNotification(
                        null,
                        "ADMIN",
                        "New Procurement Request",
                        "New requisition REQ-" + saved.getProductId() + " (" + saved.getName() + ") submitted by " + user.getUsername() + " (" + (saved.getDepartment() != null ? saved.getDepartment().getDepartmentName() : "General") + ").",
                        "REQUEST_SUBMITTED",
                        "REQ-" + saved.getProductId(),
                        "REQUEST"
                );
            } catch (Exception notifEx) {
                System.out.println("Notification log: " + notifEx.getMessage());
            }

            // Send notification email
            try {
                emailService.sendProductRaisedMail(
                        saved.getName(),
                        user.getUsername(),
                        saved.getDepartment() != null ? saved.getDepartment().getDepartmentName() : "General",
                        saved.getCategory() != null ? saved.getCategory().getCategoryName() : "General",
                        saved.getNumberOfQuantities(),
                        saved.getPricePerProduct(),
                        saved.getTotalPrice()
                );
            } catch (Exception ignored) {}

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to raise request: " + e.getMessage());
        }
    }

    @PostMapping("/addProduct")
    public Product addProduct(@RequestBody Product product) {
        int qty = product.getNumberOfQuantities() != null ? product.getNumberOfQuantities() : 1;
        product.setNumberOfQuantities(qty);
        Double catPrice = getCatalogPrice(product.getName());
        if (catPrice != null) {
            product.setPricePerProduct(catPrice);
        }
        product.setTotalPrice((product.getPricePerProduct() != null ? product.getPricePerProduct() : 0.0) * qty);
        product.setCreatedDate(LocalDateTime.now());
        product.setUpdatedDate(LocalDateTime.now());
        product.setStatus(ProductStatus.PENDING);
        return productRepository.save(product);
    }

    // =========================================================================
    // GET ALL PRODUCTS / REQUESTS (BACKWARD COMPATIBLE & PAGINATED)
    // =========================================================================
    @GetMapping("/getAllProducts")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Product> getProductsByUserId(@PathVariable Long userId) {
        return productRepository.findByUser_UserIdOrderByCreatedDateAsc(userId);
    }

    // SERVER-SIDE PAGINATED USER REQUESTS (DEFAULT ASCENDING BY CREATED DATE)
    @GetMapping("/user/{userId}/paginated")
    public PaginatedResponse<Product> getUserRequestsPaginated(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 10;

        Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? Sort.by("createdDate").descending()
                : Sort.by("createdDate").ascending();

        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        ProductStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            try {
                statusEnum = ProductStatus.valueOf(status.trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Product> resultPage = productRepository.findUserRequestsWithFilter(userId, statusEnum, searchPattern, pageable);

        return new PaginatedResponse<>(
                resultPage.getContent(),
                page,
                pageSize,
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.hasNext(),
                resultPage.hasPrevious()
        );
    }

    // SERVER-SIDE PAGINATED ALL REQUESTS (ADMIN DASHBOARD, DEFAULT ASCENDING)
    @GetMapping("/paginated")
    public PaginatedResponse<Product> getAllRequestsPaginated(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 10;

        Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? Sort.by("createdDate").descending()
                : Sort.by("createdDate").ascending();

        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        ProductStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            try {
                statusEnum = ProductStatus.valueOf(status.trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Product> resultPage = productRepository.findAllWithFilter(statusEnum, searchPattern, pageable);

        return new PaginatedResponse<>(
                resultPage.getContent(),
                page,
                pageSize,
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.hasNext(),
                resultPage.hasPrevious()
        );
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) return null;

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        Double catPrice = getCatalogPrice(product.getName());
        if (catPrice != null) {
            existing.setPricePerProduct(catPrice);
        } else if (product.getPricePerProduct() != null) {
            existing.setPricePerProduct(product.getPricePerProduct());
        }
        int qty = product.getNumberOfQuantities() != null ? product.getNumberOfQuantities() : 1;
        existing.setNumberOfQuantities(qty);
        existing.setTotalPrice((existing.getPricePerProduct() != null ? existing.getPricePerProduct() : 0.0) * qty);

        existing.setDepartment(product.getDepartment());
        existing.setCategory(product.getCategory());
        existing.setUser(product.getUser());
        existing.setUpdatedDate(LocalDateTime.now());

        return productRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return "Product Not Found";
        }
        productRepository.deleteById(id);
        return "Product Deleted Successfully";
    }

    // =========================================================================
    // ADMIN APPROVAL / REJECTION DECISION (DIRECT APPROVAL - NO MANAGER GATE)
    // =========================================================================
    @PutMapping("/decision/{id}")
    public String handleDecision(@PathVariable Long id, @RequestBody ApprovalRequest request) {
        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return "Product Not Found";
        }

        if (request.getAction() == null) {
            return "Action is required: APPROVE or REJECT";
        }

        String action = request.getAction().toUpperCase();

        if (action.equals("APPROVE")) {
            product.setStatus(ProductStatus.APPROVED);
            product.setUpdatedDate(LocalDateTime.now());
            Product saved = productRepository.save(product);

            try {
                if (saved.getUser() != null) {
                    notificationService.createNotification(
                            saved.getUser().getUserId(),
                            "USER",
                            "Request Approved",
                            "Your procurement request REQ-" + saved.getProductId() + " (" + saved.getName() + ") has been approved by Admin.",
                            "REQUEST_APPROVED",
                            "REQ-" + saved.getProductId(),
                            "REQUEST"
                    );
                }
                notificationService.createNotification(
                        null,
                        "ADMIN",
                        "Request Approved",
                        "Request REQ-" + saved.getProductId() + " (" + saved.getName() + ") approved and ready for supplier assignment.",
                        "REQUEST_APPROVED",
                        "REQ-" + saved.getProductId(),
                        "REQUEST"
                );
            } catch (Exception notifEx) {
                System.out.println("Notification log: " + notifEx.getMessage());
            }

            if (saved.getUser() != null && saved.getUser().getEmail() != null) {
                try {
                    emailService.sendApprovalMail(
                            saved.getUser().getEmail(),
                            saved.getName()
                    );
                } catch (Exception ignored) {}
            }

            return "Request Approved by Admin and Ready for Supplier Selection & Payment";
        }

        if (action.equals("REJECT")) {
            product.setStatus(ProductStatus.REJECTED);
            product.setUpdatedDate(LocalDateTime.now());
            Product saved = productRepository.save(product);

            String reasonNote = request.getReason() != null && !request.getReason().trim().isEmpty()
                    ? " Reason: " + request.getReason().trim()
                    : "";

            try {
                if (saved.getUser() != null) {
                    notificationService.createNotification(
                            saved.getUser().getUserId(),
                            "USER",
                            "Request Rejected",
                            "Your procurement request REQ-" + saved.getProductId() + " (" + saved.getName() + ") was rejected by Admin." + reasonNote,
                            "REQUEST_REJECTED",
                            "REQ-" + saved.getProductId(),
                            "REQUEST"
                    );
                }
                notificationService.createNotification(
                        null,
                        "ADMIN",
                        "Request Rejected",
                        "Request REQ-" + saved.getProductId() + " rejected." + reasonNote,
                        "REQUEST_REJECTED",
                        "REQ-" + saved.getProductId(),
                        "REQUEST"
                );
            } catch (Exception notifEx) {
                System.out.println("Notification log: " + notifEx.getMessage());
            }

            if (saved.getUser() != null && saved.getUser().getEmail() != null) {
                try {
                    emailService.sendRejectionMail(
                            saved.getUser().getEmail(),
                            saved.getName()
                    );
                } catch (Exception ignored) {}
            }

            return "Request Rejected by Admin and Requester Notified";
        }

        return "Invalid action. Use APPROVE or REJECT";
    }
}
