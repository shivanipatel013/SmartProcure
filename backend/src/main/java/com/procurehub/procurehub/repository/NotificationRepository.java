package com.procurehub.procurehub.repository;

import com.procurehub.procurehub.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE (n.userId = :userId OR n.recipientRole = :role OR n.recipientRole = 'ALL') ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUserOrRole(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.userId = :userId OR n.recipientRole = :role OR n.recipientRole = 'ALL') AND n.isRead = false")
    long countUnreadForUserOrRole(@Param("userId") Long userId, @Param("role") String role);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE (n.userId = :userId OR n.recipientRole = :role OR n.recipientRole = 'ALL')")
    int markAllAsReadForUserOrRole(@Param("userId") Long userId, @Param("role") String role);
}
