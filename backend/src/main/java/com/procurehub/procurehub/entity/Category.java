package com.procurehub.procurehub.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    public Category() {
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

    public Department getDepartment() {
    return department;
}

    public void setDepartment(Department department) {
    this.department = department;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}