package com.procurehub.procurehub.entity;

import com.procurehub.procurehub.enums.SupplierStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "supplier")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(nullable = false)
    private String supplierName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, columnDefinition = "VARCHAR(50)")
    private SupplierStatus status = SupplierStatus.ORDER_PLACED;

    private String mpin;

    public Supplier() {
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

    public SupplierStatus getStatus() {
    return status;
    }

    public void setStatus(SupplierStatus status) {
    this.status = status;
    }

    public String getMpin() {
        return mpin;
    }

    public void setMpin(String mpin) {
        this.mpin = mpin;
    }
}