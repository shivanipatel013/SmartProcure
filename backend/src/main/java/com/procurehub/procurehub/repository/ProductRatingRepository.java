package com.procurehub.procurehub.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurehub.procurehub.entity.ProductRating;

public interface ProductRatingRepository
        extends JpaRepository<ProductRating, Long> {
}