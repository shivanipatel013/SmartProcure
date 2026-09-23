package com.procurehub.procurehub.controller;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.procurehub.procurehub.entity.Payment;
import com.procurehub.procurehub.entity.Product;
import com.procurehub.procurehub.repository.PaymentRepository;
import com.procurehub.procurehub.repository.ProductRepository;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // Admin Dashboard
    @GetMapping("/dashboard")
    public String Dashboard() {
        return "Welcome Admin";
    }

    // Admin Profile
    @GetMapping("/profile")
    public String Profile() {
        return "Admin Profile";
    }

    // Get All User Requests
    @GetMapping("/requests")
    public List<Product> getAllRequests() {
        return productRepository.findAll();
    }

    // =====================================================
    // DOWNLOAD MASTER CSB / CSV OF ALL REQUISITIONS & STATES
    // =====================================================
    @GetMapping("/csb/all")
    public ResponseEntity<byte[]> downloadAllRequestsCSB() {
        List<Product> products = productRepository.findAll();
        List<Payment> allPayments = paymentRepository.findAll();

        Map<Long, Payment> paymentMap = new HashMap<>();
        for (Payment p : allPayments) {
            if (p.getProduct() != null && p.getProduct().getProductId() != null) {
                paymentMap.put(p.getProduct().getProductId(), p);
            }
        }

        StringBuilder csv = new StringBuilder();

        // Comprehensive CSV Header
        csv.append("Request ID,")
           .append("Product Name,")
           .append("Category,")
           .append("Department,")
           .append("Department Manager,")
           .append("Manager Email,")
           .append("Requester User ID,")
           .append("Requester Username,")
           .append("Requester Email,")
           .append("Requester Phone,")
           .append("Requester Designation,")
           .append("Quantity,")
           .append("Unit Price (INR),")
           .append("Total Amount (INR),")
           .append("Current Status,")
           .append("Business Justification,")
           .append("Created Date,")
           .append("Updated Date,")
           .append("Assigned Supplier,")
           .append("Supplier Email,")
           .append("Supplier Phone,")
           .append("Debit Bank Name,")
           .append("Debit Account Number,")
           .append("Transaction ID,")
           .append("Payment Mode,")
           .append("Payment Date,")
           .append("Payment Settlement Status\n");

        for (Product p : products) {
            Payment pay = paymentMap.get(p.getProductId());

            csv.append("REQ-").append(p.getProductId()).append(",");
            csv.append(escapeCsv(p.getName())).append(",");
            csv.append(escapeCsv(p.getCategory() != null ? p.getCategory().getCategoryName() : "General")).append(",");
            csv.append(escapeCsv(p.getDepartment() != null ? p.getDepartment().getDepartmentName() : "General")).append(",");
            csv.append(escapeCsv(p.getDepartment() != null ? p.getDepartment().getManagerOfDepartment() : "N/A")).append(",");
            csv.append(escapeCsv(p.getDepartment() != null ? p.getDepartment().getManagerEmail() : "N/A")).append(",");

            csv.append(p.getUser() != null ? p.getUser().getUserId() : "N/A").append(",");
            csv.append(escapeCsv(p.getUser() != null ? p.getUser().getUsername() : "N/A")).append(",");
            csv.append(escapeCsv(p.getUser() != null ? p.getUser().getEmail() : "N/A")).append(",");
            csv.append(escapeCsv(p.getUser() != null ? p.getUser().getPhoneNumber() : "N/A")).append(",");
            csv.append(escapeCsv(p.getUser() != null ? p.getUser().getDesignation() : "N/A")).append(",");

            csv.append(p.getNumberOfQuantities()).append(",");
            csv.append(p.getPricePerProduct()).append(",");
            csv.append(p.getTotalPrice()).append(",");
            csv.append(p.getStatus() != null ? p.getStatus().name() : "PENDING").append(",");
            csv.append(escapeCsv(p.getDescription())).append(",");
            csv.append(p.getCreatedDate() != null ? p.getCreatedDate().toString() : "N/A").append(",");
            csv.append(p.getUpdatedDate() != null ? p.getUpdatedDate().toString() : "N/A").append(",");

            if (pay != null) {
                csv.append(escapeCsv(pay.getSupplier() != null ? pay.getSupplier().getSupplierName() : "N/A")).append(",");
                csv.append(escapeCsv(pay.getSupplier() != null ? pay.getSupplier().getEmail() : "N/A")).append(",");
                csv.append(escapeCsv(pay.getSupplier() != null ? pay.getSupplier().getPhone() : "N/A")).append(",");
                csv.append(escapeCsv(pay.getAccount() != null ? pay.getAccount().getBankName() : "N/A")).append(",");
                csv.append(escapeCsv(pay.getAccount() != null ? pay.getAccount().getAccountNumber() : "N/A")).append(",");
                csv.append(escapeCsv(pay.getTransactionId())).append(",");
                csv.append(escapeCsv(pay.getPaymentMethod())).append(",");
                csv.append(pay.getPaymentDate() != null ? pay.getPaymentDate().toString() : "N/A").append(",");
                csv.append(escapeCsv(pay.getPaymentStatus())).append("\n");
            } else {
                csv.append("N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,UNPAID\n");
            }
        }

        byte[] file = csv.toString().getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=SmartProcure_Master_Requisitions_Report.csv");

        return ResponseEntity.ok().headers(headers).body(file);
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "\"\"";
        }
        return "\"" + value.replace("\"", "\"\"").replace("\n", " ").replace("\r", " ") + "\"";
    }
}