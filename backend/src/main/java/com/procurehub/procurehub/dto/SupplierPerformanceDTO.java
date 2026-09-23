package com.procurehub.procurehub.dto;

public class SupplierPerformanceDTO {
    private Long supplierId;
    private String supplierName;
    private String email;
    private String phone;
    private String address;
    private String fulfillmentStatus;
    private boolean mpinConfigured;

    private long totalOrders;
    private long totalProductsOrdered;
    private long totalQuantity;
    private long completedOrders;
    private long processingOrders;
    private long shippedOrders;
    private long outForDeliveryOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private long pendingOrders;

    private double totalProcurementValue;
    private double averageOrderValue;
    private double deliverySuccessRate;

    public SupplierPerformanceDTO() {
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getFulfillmentStatus() {
        return fulfillmentStatus;
    }

    public void setFulfillmentStatus(String fulfillmentStatus) {
        this.fulfillmentStatus = fulfillmentStatus;
    }

    public boolean isMpinConfigured() {
        return mpinConfigured;
    }

    public void setMpinConfigured(boolean mpinConfigured) {
        this.mpinConfigured = mpinConfigured;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalProductsOrdered() {
        return totalProductsOrdered;
    }

    public void setTotalProductsOrdered(long totalProductsOrdered) {
        this.totalProductsOrdered = totalProductsOrdered;
    }

    public long getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(long totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public long getProcessingOrders() {
        return processingOrders;
    }

    public void setProcessingOrders(long processingOrders) {
        this.processingOrders = processingOrders;
    }

    public long getShippedOrders() {
        return shippedOrders;
    }

    public void setShippedOrders(long shippedOrders) {
        this.shippedOrders = shippedOrders;
    }

    public long getOutForDeliveryOrders() {
        return outForDeliveryOrders;
    }

    public void setOutForDeliveryOrders(long outForDeliveryOrders) {
        this.outForDeliveryOrders = outForDeliveryOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }

    public long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public double getTotalProcurementValue() {
        return totalProcurementValue;
    }

    public void setTotalProcurementValue(double totalProcurementValue) {
        this.totalProcurementValue = totalProcurementValue;
    }

    public double getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public double getDeliverySuccessRate() {
        return deliverySuccessRate;
    }

    public void setDeliverySuccessRate(double deliverySuccessRate) {
        this.deliverySuccessRate = deliverySuccessRate;
    }
}
