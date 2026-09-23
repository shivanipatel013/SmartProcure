package com.procurehub.procurehub.dto;

public class CatalogProductDTO {
    private String name;
    private Double price;
    private Long departmentId;
    private String departmentName;
    private Long categoryId;
    private String categoryName;
    private String description;

    public CatalogProductDTO() {
    }

    public CatalogProductDTO(String name, Double price, Long departmentId, String departmentName, Long categoryId, String categoryName, String description) {
        this.name = name;
        this.price = price;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
