package com.procurehub.procurehub.repository;

import com.procurehub.procurehub.entity.Order;
import com.procurehub.procurehub.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderId(String orderId);

    List<Order> findByUser_UserIdOrderByCreatedAtAsc(Long userId);

    List<Order> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findBySupplier_SupplierIdOrderByCreatedAtAsc(Long supplierId);

    List<Order> findBySupplier_SupplierIdOrderByCreatedAtDesc(Long supplierId);

    List<Order> findByProduct_ProductId(Long productId);

    Optional<Order> findByPayment_PaymentId(Long paymentId);

    List<Order> findAllByOrderByCreatedAtAsc();

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    long countByStatus(OrderStatus status);

    long countBySupplier_SupplierId(Long supplierId);

    long countBySupplier_SupplierIdAndStatus(Long supplierId, OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderId LIKE :yearPrefix%")
    long countOrdersInYear(@Param("yearPrefix") String yearPrefix);

    @Query("SELECT o FROM Order o WHERE o.supplier.supplierId = :supplierId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:search IS NULL OR (" +
           "LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(o.productName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR (o.user IS NOT NULL AND LOWER(o.user.username) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "OR (o.department IS NOT NULL AND LOWER(o.department.departmentName) LIKE LOWER(CONCAT('%', :search, '%')))))")
    Page<Order> findSupplierOrdersWithFilter(@Param("supplierId") Long supplierId,
                                            @Param("status") OrderStatus status,
                                            @Param("search") String search,
                                            Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:search IS NULL OR (" +
           "LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(o.productName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR (o.supplier IS NOT NULL AND LOWER(o.supplier.supplierName) LIKE LOWER(CONCAT('%', :search, '%')))))")
    Page<Order> findUserOrdersWithFilter(@Param("userId") Long userId,
                                        @Param("status") OrderStatus status,
                                        @Param("search") String search,
                                        Pageable pageable);

    @Query("SELECT o FROM Order o WHERE (:status IS NULL OR o.status = :status) " +
           "AND (:search IS NULL OR (" +
           "LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(o.productName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR (o.user IS NOT NULL AND LOWER(o.user.username) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "OR (o.supplier IS NOT NULL AND LOWER(o.supplier.supplierName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "OR (o.department IS NOT NULL AND LOWER(o.department.departmentName) LIKE LOWER(CONCAT('%', :search, '%')))))")
    Page<Order> findAllOrdersWithFilter(@Param("status") OrderStatus status,
                                        @Param("search") String search,
                                        Pageable pageable);
}
