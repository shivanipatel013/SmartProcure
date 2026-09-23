package com.procurehub.procurehub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "approval_hierarchy")
public class ApprovalHierarchy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_hierarchy_id")
    private Long approvalHierarchyId;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private Integer level;

    public ApprovalHierarchy() {
    }

    public Long getApprovalHierarchyId() {
        return approvalHierarchyId;
    }

    public void setApprovalHierarchyId(Long approvalHierarchyId) {
        this.approvalHierarchyId = approvalHierarchyId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}