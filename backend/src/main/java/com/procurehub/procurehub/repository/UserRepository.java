package com.procurehub.procurehub.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurehub.procurehub.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByPassword(String password);
}
