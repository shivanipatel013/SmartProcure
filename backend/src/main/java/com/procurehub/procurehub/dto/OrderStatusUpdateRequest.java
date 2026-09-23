package com.procurehub.procurehub.dto;

public class OrderStatusUpdateRequest {
    private String status;
    private String description;
    private String changedBy;
    private String changedByRole;

    public OrderStatusUpdateRequest() {
    }

    public OrderStatusUpdateRequest(String status, String description, String changedBy, String changedByRole) {
        this.status = status;
        this.description = description;
        this.changedBy = changedBy;
        this.changedByRole = changedByRole;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public String getChangedByRole() {
        return changedByRole;
    }

    public void setChangedByRole(String changedByRole) {
        this.changedByRole = changedByRole;
    }
}
