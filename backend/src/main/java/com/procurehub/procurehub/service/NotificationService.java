package com.procurehub.procurehub.service;

import com.procurehub.procurehub.entity.Notification;
import com.procurehub.procurehub.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Long userId, String role, String title, String message, String type, String refId, String refType) {
        Notification notification = new Notification(userId, role, title, message, type, refId, refType);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(Long userId, String role) {
        String queryRole = (role != null && !role.trim().isEmpty()) ? role.trim().toUpperCase() : "ALL";
        return notificationRepository.findNotificationsForUserOrRole(userId, queryRole);
    }

    public long getUnreadCount(Long userId, String role) {
        String queryRole = (role != null && !role.trim().isEmpty()) ? role.trim().toUpperCase() : "ALL";
        return notificationRepository.countUnreadForUserOrRole(userId, queryRole);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElse(null);
        if (n != null) {
            n.setRead(true);
            return notificationRepository.save(n);
        }
        return null;
    }

    @Transactional
    public int markAllAsRead(Long userId, String role) {
        String queryRole = (role != null && !role.trim().isEmpty()) ? role.trim().toUpperCase() : "ALL";
        return notificationRepository.markAllAsReadForUserOrRole(userId, queryRole);
    }
}
