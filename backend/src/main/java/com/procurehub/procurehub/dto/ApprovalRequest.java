package com.procurehub.procurehub.dto;

public class ApprovalRequest {

    private String action;
    private String reason;
    private String remarks;

    public ApprovalRequest() {
    }

    public ApprovalRequest(String action) {
        this.action = action;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason != null ? reason : remarks;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRemarks() {
        return remarks != null ? remarks : reason;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}