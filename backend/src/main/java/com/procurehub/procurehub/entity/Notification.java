package com.procurehub.procurehub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    private Long userId;

    private String recipientRole; // "USER", "ADMIN", "SUPPLIER", "ALL"

    private String recipientEmail;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000, nullable = false)
    private String message;

    private String type; // "REQUEST_SUBMITTED", "REQUEST_APPROVED", "REQUEST_REJECTED", "SUPPLIER_ASSIGNED", "PAYMENT_SUCCESS", "ORDER_PLACED", "ORDER_PACKED", "ORDER_SHIPPED", "OUT_FOR_DELIVERY", "ORDER_RECEIVED", "PAYMENT_FAILED"

    private String referenceId; // e.g. "REQ-101", "ORD-2026-0001"

    private String referenceType; // "REQUEST", "ORDER", "PAYMENT"

    @Column(name = "is_read")
    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {
    }

    public Notification(Long userId, String recipientRole, String title, String message, String type, String referenceId, String referenceType) {
        this.userId = userId;
        this.recipientRole = recipientRole;
        this.title = title;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(String recipientRole) {
        this.recipientRole = recipientRole;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
