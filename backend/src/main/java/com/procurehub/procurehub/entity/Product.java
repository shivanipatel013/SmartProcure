package com.procurehub.procurehub.entity;

import com.procurehub.procurehub.enums.ProductStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "product")
public class Product {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "product_id")
private Long productId;
private String name;

@ManyToOne
@JoinColumn(name = "user_id")
private UserEntity user;

private Double pricePerProduct;
private Double totalPrice;

private Integer numberOfQuantities;
@ManyToOne
@JoinColumn(name = "department_id")
private Department department;
@ManyToOne
@JoinColumn(name = "category_id")
private Category category;
private String description;
@Enumerated(EnumType.STRING)
@Column(name = "status", length = 50, columnDefinition = "VARCHAR(50)")
private ProductStatus status;
private LocalDateTime createdDate;
private LocalDateTime updatedDate;

public Product() {
}

public Long getProductId() {
    return productId;
}

public void setProductId(Long productId) {
    this.productId = productId;
}

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}

public UserEntity getUser() {
    return user;
}

public void setUser(UserEntity user) {
    this.user = user;
}

public Double getPricePerProduct() {
    return pricePerProduct;
}

public void setPricePerProduct(Double pricePerProduct) {
    this.pricePerProduct = pricePerProduct;
}

public Integer getNumberOfQuantities() {
    return numberOfQuantities;
}

public void setNumberOfQuantities(Integer numberOfQuantities) {
    this.numberOfQuantities = numberOfQuantities;
}

public Department getDepartment() {
    return department;
}

public void setDepartment(Department department) {
    this.department = department;
}

public Category getCategory() {
    return category;
}

public void setCategory(Category category) {
    this.category = category;
}

public String getDescription() {
    return description;
}

public void setDescription(String description) {
    this.description = description;
}

public LocalDateTime getCreatedDate() {
    return createdDate;
}

public void setCreatedDate(LocalDateTime createdDate) {
    this.createdDate = createdDate;
}

public LocalDateTime getUpdatedDate() {
    return updatedDate;
}

public void setUpdatedDate(LocalDateTime updatedDate) {
    this.updatedDate = updatedDate;
}

public Double getTotalPrice() {
    return totalPrice;
}

public void setTotalPrice(Double totalPrice) {
    this.totalPrice = totalPrice;
}

public ProductStatus getStatus() {
    return status;
}

public void setStatus(ProductStatus status) {
    this.status = status;
}
}