package com.procurehub.procurehub.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.procurehub.procurehub.entity.Product;
import com.procurehub.procurehub.enums.ProductStatus;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUser_UserId(Long userId);
    List<Product> findByUser_UserIdOrderByCreatedDateAsc(Long userId);
    List<Product> findByUser_UserIdOrderByCreatedDateDesc(Long userId);

    Page<Product> findByUser_UserId(Long userId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.user.userId = :userId " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:search IS NULL OR (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))))")
    Page<Product> findUserRequestsWithFilter(@Param("userId") Long userId,
                                            @Param("status") ProductStatus status,
                                            @Param("search") String search,
                                            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE (:status IS NULL OR p.status = :status) " +
           "AND (:search IS NULL OR (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR (p.user IS NOT NULL AND LOWER(p.user.username) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "OR (p.department IS NOT NULL AND LOWER(p.department.departmentName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "OR (p.category IS NOT NULL AND LOWER(p.category.categoryName) LIKE LOWER(CONCAT('%', :search, '%')))))")
    Page<Product> findAllWithFilter(@Param("status") ProductStatus status,
                                   @Param("search") String search,
                                   Pageable pageable);
}