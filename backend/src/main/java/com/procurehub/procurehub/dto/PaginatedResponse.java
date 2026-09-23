package com.procurehub.procurehub.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PaginatedResponse<T> {
    private List<T> data;
    private Map<String, Object> pagination;

    public PaginatedResponse() {
        this.pagination = new HashMap<>();
    }

    public PaginatedResponse(List<T> data, int currentPage, int pageSize, long totalItems, int totalPages, boolean hasNextPage, boolean hasPreviousPage) {
        this.data = data;
        this.pagination = new HashMap<>();
        this.pagination.put("currentPage", currentPage);
        this.pagination.put("pageSize", pageSize);
        this.pagination.put("totalItems", totalItems);
        this.pagination.put("totalPages", totalPages);
        this.pagination.put("hasNextPage", hasNextPage);
        this.pagination.put("hasPreviousPage", hasPreviousPage);
    }

    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public Map<String, Object> getPagination() {
        return pagination;
    }

    public void setPagination(Map<String, Object> pagination) {
        this.pagination = pagination;
    }
}
