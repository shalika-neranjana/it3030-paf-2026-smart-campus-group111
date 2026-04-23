package com.unireserver.backend.service;

import com.unireserver.backend.dto.NotificationDTO;
import com.unireserver.backend.exception.ResourceNotFoundException;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.Notification;
import com.unireserver.backend.model.NotificationType;
import com.unireserver.backend.repository.NotificationRepository;
import com.unireserver.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing notifications.
 * Handles business logic for notification CRUD operations and management.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Get paginated notifications for a user
     *
     * @param email the user's email
     * @param pageable pagination information
     * @return paginated notifications
     */
    public Page<NotificationDTO> getUserNotifications(String email, Pageable pageable) {
        AppUser user = getUserByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::convertToDTO);
    }

    /**
     * Get a specific notification by ID, ensuring it belongs to the authenticated user
     *
     * @param id the notification ID
     * @param email the user's email
     * @return the notification DTO
     */
    public NotificationDTO getNotification(String id, String email) {
        AppUser user = getUserByEmail(email);
        Notification notification = getOwnedNotification(id, user.getId());
        return convertToDTO(notification);
    }

    /**
     * Get all unread notifications for a user
     *
     * @param email the user's email
     * @return list of unread notifications
     */
    public List<NotificationDTO> getUnreadNotifications(String email) {
        AppUser user = getUserByEmail(email);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Get count of unread notifications for a user
     *
     * @param email the user's email
     * @return count of unread notifications
     */
    public long getUnreadCount(String email) {
        AppUser user = getUserByEmail(email);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    /**
     * Create a new notification for the authenticated user
     *
     * @param notificationDTO the notification data
     * @param email the user's email
     * @return the created notification DTO
     */
    public NotificationDTO createNotification(NotificationDTO notificationDTO, String email) {
        AppUser user = getUserByEmail(email);

        Notification notification = Notification.builder()
                .userId(user.getId())
                .type(parseNotificationType(notificationDTO.getType()))
                .title(notificationDTO.getTitle())
                .message(notificationDTO.getMessage())
                .resource(notificationDTO.getResource())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    /**
     * Update an existing notification
     *
     * @param id the notification ID
     * @param notificationDTO the updated data
     * @param email the user's email
     * @return the updated notification DTO
     */
    public NotificationDTO updateNotification(String id, NotificationDTO notificationDTO, String email) {
        AppUser user = getUserByEmail(email);
        Notification notification = getOwnedNotification(id, user.getId());

        if (notificationDTO.getType() != null) {
            notification.setType(parseNotificationType(notificationDTO.getType()));
        }
        if (notificationDTO.getTitle() != null) {
            notification.setTitle(notificationDTO.getTitle());
        }
        if (notificationDTO.getMessage() != null) {
            notification.setMessage(notificationDTO.getMessage());
        }
        if (notificationDTO.getResource() != null) {
            notification.setResource(notificationDTO.getResource());
        }
        if (notificationDTO.getIsRead() != null) {
            notification.setIsRead(notificationDTO.getIsRead());
        }
        notification.setUpdatedAt(LocalDateTime.now());

        Notification updatedNotification = notificationRepository.save(notification);
        return convertToDTO(updatedNotification);
    }

    /**
     * Mark a notification as read
     *
     * @param id the notification ID
     * @param email the user's email
     * @return the updated notification DTO
     */
    public NotificationDTO markAsRead(String id, String email) {
        AppUser user = getUserByEmail(email);
        Notification notification = getOwnedNotification(id, user.getId());
        notification.setIsRead(true);
        notification.setUpdatedAt(LocalDateTime.now());
        Notification updatedNotification = notificationRepository.save(notification);
        return convertToDTO(updatedNotification);
    }

    /**
     * Mark all notifications as read for a user
     *
     * @param email the user's email
     */
    public void markAllAsRead(String email) {
        AppUser user = getUserByEmail(email);
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setUpdatedAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Delete a specific notification
     *
     * @param id the notification ID
     * @param email the user's email
     */
    public void deleteNotification(String id, String email) {
        AppUser user = getUserByEmail(email);
        Notification notification = getOwnedNotification(id, user.getId());
        notificationRepository.delete(notification);
    }

    /**
     * Delete all notifications for a user
     *
     * @param email the user's email
     */
    public void deleteAllNotifications(String email) {
        AppUser user = getUserByEmail(email);
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), Pageable.unpaged()).getContent();
        notificationRepository.deleteAll(userNotifications);
    }

    /**
     * Convert a Notification entity to a NotificationDTO
     *
     * @param notification the notification entity
     * @return the notification DTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationType type = notification.getType();
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(type != null ? type.name() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .resource(notification.getResource())
                .isRead(notification.getIsRead())
                .timestamp(notification.getCreatedAt())
                .formattedTimestamp(notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null)
                .typeDisplayName(type != null ? type.getDisplayName() : null)
                .build();
    }

    private Notification getOwnedNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!userId.equals(notification.getUserId())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        return notification;
    }

    private NotificationType parseNotificationType(String type) {
        try {
            return NotificationType.valueOf(type);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Invalid notification type: " + type, ex);
        }
    }

    /**
     * Get a user by email
     *
     * @param email the user's email
     * @return the AppUser
     */
    private AppUser getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
