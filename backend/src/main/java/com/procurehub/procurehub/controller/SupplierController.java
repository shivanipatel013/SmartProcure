package com.procurehub.procurehub.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.procurehub.procurehub.entity.Supplier;
import com.procurehub.procurehub.repository.SupplierRepository;
import com.procurehub.procurehub.dto.SupplierStatusRequest;
import com.procurehub.procurehub.enums.SupplierStatus;

@RestController
@RequestMapping("/supplier")
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    // Add Supplier
    @PostMapping
    public Supplier addSupplier(@RequestBody Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    // Get All Suppliers
    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    // Get Supplier By ID
    @GetMapping("/{id}")
    public Supplier getSupplierById(@PathVariable Long id) {
        return supplierRepository.findById(id).orElse(null);
    }

    // Update Supplier
    @PutMapping("/{id}")
    public Supplier updateSupplier(
            @PathVariable Long id,
            @RequestBody Supplier supplier) {

        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        existing.setSupplierName(supplier.getSupplierName());
        existing.setEmail(supplier.getEmail());
        existing.setPhone(supplier.getPhone());
        existing.setAddress(supplier.getAddress());

        return supplierRepository.save(existing);
    }

    // Delete Supplier
    @DeleteMapping("/{id}")
    public String deleteSupplier(@PathVariable Long id) {

        if (!supplierRepository.existsById(id)) {
            return "Supplier not found";
        }

        supplierRepository.deleteById(id);

        return "Supplier deleted successfully";
    }
    
    // Update Supplier Status
    @PutMapping("/{id}/status")
    public Supplier updateSupplierStatus(
        @PathVariable Long id,
        @RequestBody SupplierStatusRequest request) {

    Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Supplier not found"));

    SupplierStatus newStatus;

    try {
        newStatus = SupplierStatus.valueOf(
                request.getStatus().toUpperCase()
        );
    } catch (Exception e) {
        throw new RuntimeException(
                "Invalid status. Use ORDER_PLACED, ORDER_ACCEPTED, IN_PROCESS, SHIPPED, DELIVERED or COMPLETED"
        );
    }

    supplier.setStatus(newStatus);

    return supplierRepository.save(supplier);
    }

    // =====================================================
    // GET REAL SUPPLIER ORDERS (DEFAULT ASCENDING ORDER)
    // =====================================================
    @Autowired
    private com.procurehub.procurehub.repository.OrderRepository orderRepository;

    @Autowired
    private com.procurehub.procurehub.service.OrderService orderService;

    @GetMapping("/{id}/orders")
    public List<com.procurehub.procurehub.entity.Order> getSupplierOrders(@PathVariable Long id) {
        return orderRepository.findBySupplier_SupplierIdOrderByCreatedAtAsc(id);
    }

    @GetMapping("/{id}/orders/paginated")
    public com.procurehub.procurehub.dto.PaginatedResponse<com.procurehub.procurehub.entity.Order> getSupplierOrdersPaginated(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        return orderService.getSupplierOrdersPaginated(id, page, limit, search, status, sortOrder);
    }

    @GetMapping("/{id}/stats")
    public java.util.Map<String, Object> getSupplierStats(@PathVariable Long id) {
        return orderService.getSupplierDashboardStats(id);
    }

    // =====================================================
    // GET REAL SUPPLIER PERFORMANCE ANALYTICS
    // =====================================================
    @GetMapping("/{id}/performance")
    public com.procurehub.procurehub.dto.SupplierPerformanceDTO getSupplierPerformance(@PathVariable Long id) {
        return orderService.getSupplierPerformance(id);
    }

    @GetMapping("/performance/all")
    public List<com.procurehub.procurehub.dto.SupplierPerformanceDTO> getAllSupplierPerformances() {
        return orderService.getAllSupplierPerformances();
    }
}