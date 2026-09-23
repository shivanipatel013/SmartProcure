package com.procurehub.procurehub.controller;

import com.procurehub.procurehub.entity.Notification;
import com.procurehub.procurehub.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "ALL") String role) {

        List<Notification> list = notificationService.getNotifications(userId, role);
        long unreadCount = notificationService.getUnreadCount(userId, role);

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", list);
        response.put("unreadCount", unreadCount);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "ALL") String role) {

        int count = notificationService.markAllAsRead(userId, role);
        return ResponseEntity.ok(Map.of("markedCount", count, "status", "SUCCESS"));
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Notification notification) {
        Notification created = notificationService.createNotification(
                notification.getUserId(),
                notification.getRecipientRole(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.getReferenceType()
        );
        return ResponseEntity.ok(created);
    }
}
