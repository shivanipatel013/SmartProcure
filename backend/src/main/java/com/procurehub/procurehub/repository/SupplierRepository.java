package com.procurehub.procurehub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.procurehub.procurehub.entity.Supplier;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByEmail(String email);
    Optional<Supplier> findBySupplierName(String supplierName);
}