package com.procurehub.procurehub.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurehub.procurehub.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Get all payments made for a particular user's requests
    List<Payment> findByProduct_User_UserId(Long userId);
}