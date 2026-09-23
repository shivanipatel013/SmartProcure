package com.procurehub.procurehub.repository;

import com.procurehub.procurehub.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    List<OrderStatusHistory> findByOrder_IdOrderByCreatedAtAsc(Long orderId);

    List<OrderStatusHistory> findByOrder_OrderIdOrderByCreatedAtAsc(String orderId);
}
