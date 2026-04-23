package com.unireserver.backend.controller;

import com.unireserver.backend.dto.NotificationDTO;
import com.unireserver.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Notification operations.
 * Handles CRUD operations and notification management.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications for the authenticated user (paginated)
     *
     * @param authentication the authenticated user
     * @param pageable pagination information
     * @return paginated list of notifications
     */
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getAllNotifications(
            Authentication authentication,
            Pageable pageable) {
        return ResponseEntity.ok(notificationService.getUserNotifications(authentication.getName(), pageable));
    }

    /**
     * Get a specific notification by ID
     *
     * @param id the notification ID
     * @param authentication the authenticated user
     * @return the notification if found and belongs to the user
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotification(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(notificationService.getNotification(id, authentication.getName()));
    }

    /**
     * Get unread notifications for the authenticated user
     *
     * @param authentication the authenticated user
     * @return list of unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(authentication.getName()));
    }

    /**
     * Get unread notification count for the authenticated user
     *
     * @param authentication the authenticated user
     * @return the count of unread notifications
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * Create a new notification for the authenticated user
     *
     * @param notificationDTO the notification data
     * @param authentication the authenticated user
     * @return the created notification
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<NotificationDTO> createNotification(
            @RequestBody NotificationDTO notificationDTO,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.createNotification(notificationDTO, authentication.getName()));
    }

    /**
     * Update an existing notification
     *
     * @param id the notification ID
     * @param notificationDTO the updated notification data
     * @param authentication the authenticated user
     * @return the updated notification
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<NotificationDTO> updateNotification(
            @PathVariable String id,
            @RequestBody NotificationDTO notificationDTO,
            Authentication authentication) {
        return ResponseEntity.ok(notificationService.updateNotification(id, notificationDTO, authentication.getName()));
    }

    /**
     * Mark a notification as read
     *
     * @param id the notification ID
     * @param authentication the authenticated user
     * @return the updated notification
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(notificationService.markAsRead(id, authentication.getName()));
    }

    /**
     * Mark all notifications as read for the authenticated user
     *
     * @param authentication the authenticated user
     * @return success message
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    /**
     * Delete a specific notification
     *
     * @param id the notification ID
     * @param authentication the authenticated user
     * @return success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable String id,
            Authentication authentication) {
        notificationService.deleteNotification(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }

    /**
     * Delete all notifications for the authenticated user
     *
     * @param authentication the authenticated user
     * @return success message
     */
    @DeleteMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Map<String, String>> deleteAllNotifications(Authentication authentication) {
        notificationService.deleteAllNotifications(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All notifications deleted successfully"));
    }
}
