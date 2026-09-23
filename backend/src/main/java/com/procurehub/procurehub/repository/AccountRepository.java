package com.procurehub.procurehub.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurehub.procurehub.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
}