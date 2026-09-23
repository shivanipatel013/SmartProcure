package com.procurehub.procurehub.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Mail to Admin when Product is Raised
    public void sendProductRaisedMail(String productName, 
        String employeeName, String departmentName, String categoryName, 
        int quantity, double price, double totalPrice) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo("admin@gmail.com");   // Replace with actual admin email

        message.setSubject("New Product Request Raised");

        message.setText(
               "Hello Admin,\n\n" +
    "A new product request has been raised.\n\n" +
    "====================================\n" +
    "Employee Name : " + employeeName + "\n" +
    "Product Name  : " + productName + "\n" +
    "Quantity      : " + quantity + "\n" +
    "Price         : ₹" + price + "\n" +
    "Total Price   : ₹" + totalPrice + "\n" +
    "Request Date  : " + LocalDate.now() + "\n" +
    "Status        : PENDING FOR APPROVAL\n" +
    "====================================\n\n" +
    "Please review and approve/reject this request.\n\n" +
    "Regards,\n" +
    "ProcureHub System"
        );

        mailSender.send(message);
    }

    // Mail to Manager when Request is Approved by Admin
    public void sendManagerApprovalMail(
        String managerEmail,
        String managerName,
        String employeeName,
        String productName,
        String departmentName,
        int quantity,
        double totalPrice) {

    SimpleMailMessage message = new SimpleMailMessage();

    message.setTo(managerEmail);

    message.setSubject("Manager Approval Required");

    message.setText(
            "Dear " + managerName + ",\n\n" +

            "A product request has been approved by the Admin and is waiting for your approval.\n\n" +

            "----------------------------------------\n" +
            "Employee Name : " + employeeName + "\n" +
            "Department    : " + departmentName + "\n" +
            "Product Name  : " + productName + "\n" +
            "Quantity      : " + quantity + "\n" +
            "Total Price   : ₹" + totalPrice + "\n" +
            "Status        : APPROVED BY ADMIN\n" +
            "----------------------------------------\n\n" +

            "Kindly review and approve the request.\n\n" +

            "Regards,\n" +
            "ProcureHub Team"
    );

    mailSender.send(message);
    }

    // Mail to Employee when Request is Approved by Manager
    public void sendApprovalMail(String email, String productName) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);

        message.setSubject("Product Request Approved");

        message.setText(
                "Dear Employee,\n\n" +
            "We are pleased to inform you that your product request has been APPROVED.\n\n" +

            "----------------------------------------\n" +
            "Product Name : " + productName + "\n" +
            "Status       : APPROVED\n" +
            "Approval Date: " + java.time.LocalDate.now() + "\n" +
            "----------------------------------------\n\n" +

            "Your request has been successfully approved by the administrator.\n\n" +

            "Thank you for using ProcureHub.\n\n" +

            "Regards,\n" +
            "ProcureHub Team"
        );

        mailSender.send(message);
    }

    // Mail to Employee when Request is Rejected by Manager
    public void sendRejectionMail(String email, String productName) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);

        message.setSubject("Product Request Rejected");

        message.setText(
                "Dear Employee,\n\n" +
            "We regret to inform you that your product request has been REJECTED.\n\n" +

            "----------------------------------------\n" +
            "Product Name : " + productName + "\n" +
            "Status       : REJECTED\n" +
            "Rejected Date: " + java.time.LocalDate.now() + "\n" +
            "----------------------------------------\n\n" +

            "If you need further clarification, please contact the administrator.\n\n" +

            "Thank you for using ProcureHub.\n\n" +

            "Regards,\n" +
            "ProcureHub Team"
        );

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Email notification error (rejection): " + e.getMessage());
        }
    }

    // Mail to Employee on Order Placement
    public void sendOrderPlacedMail(String email, String employeeName, String orderId, String productName, int quantity, double totalPrice, String supplierName) {
        if (email == null || email.trim().isEmpty()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("SmartProcure: Order Placed Successfully - " + orderId);
        message.setText(
            "Dear " + (employeeName != null ? employeeName : "Employee") + ",\n\n" +
            "Your procurement order has been confirmed and placed with the supplier.\n\n" +
            "========================================\n" +
            "Order ID       : " + orderId + "\n" +
            "Product Name   : " + productName + "\n" +
            "Quantity       : " + quantity + "\n" +
            "Total Amount   : ₹" + totalPrice + "\n" +
            "Supplier       : " + supplierName + "\n" +
            "Current Status : ORDER PLACED\n" +
            "Order Date     : " + java.time.LocalDateTime.now() + "\n" +
            "========================================\n\n" +
            "You can track real-time delivery status under 'Track My Orders' in your SmartProcure dashboard.\n\n" +
            "Regards,\n" +
            "SmartProcure Order Management System"
        );

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Email notification error (order placed): " + e.getMessage());
        }
    }

    // Mail to Employee on Order Status Update (Shipped, Out for delivery, Delivered)
    public void sendOrderStatusUpdateMail(String email, String employeeName, String orderId, String productName, String newStatus, String description) {
        if (email == null || email.trim().isEmpty()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("SmartProcure: Order Status Update - " + orderId + " (" + newStatus + ")");
        message.setText(
            "Dear " + (employeeName != null ? employeeName : "Employee") + ",\n\n" +
            "There is an update on your procurement order.\n\n" +
            "----------------------------------------\n" +
            "Order ID       : " + orderId + "\n" +
            "Product Name   : " + productName + "\n" +
            "Updated Status : " + newStatus + "\n" +
            "Update Details : " + (description != null ? description : "Status updated by supplier/admin") + "\n" +
            "Timestamp      : " + java.time.LocalDateTime.now() + "\n" +
            "----------------------------------------\n\n" +
            "View live progress on your SmartProcure Order Tracking timeline.\n\n" +
            "Regards,\n" +
            "SmartProcure Order Management System"
        );

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Email notification error (status update): " + e.getMessage());
        }
    }
}