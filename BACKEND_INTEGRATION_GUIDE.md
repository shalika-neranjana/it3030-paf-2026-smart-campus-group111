# Notifications Module - Backend Integration Guide

## Overview
This guide provides instructions for backend developers to implement the REST API endpoints required for the Notifications module.

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    resource VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);
```

## JPA Entity

```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String resource;

    @Column(nullable = false)
    private Boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Getters and Setters
}

public enum NotificationType {
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    BOOKING_PENDING,
    TICKET_UPDATED,
    NEW_COMMENT
}
```

## DTO Classes

### NotificationDTO
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String resource;
    private Boolean isRead;
    private LocalDateTime timestamp;
}
```

### NotificationResponse
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String resource;
    private Boolean isRead;
    private LocalDateTime timestamp;
}
```

## Repository

```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find all notifications for a user, ordered by creation date (newest first)
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find unread notifications for a user
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    // Count unread notifications for a user
    Long countByUserIdAndIsReadFalse(Long userId);
    
    // Find notifications by type for a user
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(
        Long userId, 
        NotificationType type, 
        Pageable pageable
    );
    
    // Find by user and search query
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId " +
           "AND (n.title LIKE %:query% OR n.message LIKE %:query% OR n.resource LIKE %:query%) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> searchNotifications(
        @Param("userId") Long userId,
        @Param("query") String query,
        Pageable pageable
    );
    
    // Delete old notifications (older than 90 days)
    void deleteByCreatedAtBefore(LocalDateTime date);
}
```

## Service Layer

```java
@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    /**
     * Get all notifications for current user with pagination
     */
    public Page<NotificationDTO> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(n -> modelMapper.map(n, NotificationDTO.class));
    }
    
    /**
     * Get unread notifications for current user
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
            .stream()
            .map(n -> modelMapper.map(n, NotificationDTO.class))
            .collect(Collectors.toList());
    }
    
    /**
     * Count unread notifications for current user
     */
    public Long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * Get notifications by type with pagination
     */
    public Page<NotificationDTO> getNotificationsByType(
        Long userId, 
        NotificationType type, 
        int page, 
        int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable)
            .map(n -> modelMapper.map(n, NotificationDTO.class));
    }
    
    /**
     * Search notifications
     */
    public Page<NotificationDTO> searchNotifications(
        Long userId, 
        String query, 
        int page, 
        int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.searchNotifications(userId, query, pageable)
            .map(n -> modelMapper.map(n, NotificationDTO.class));
    }
    
    /**
     * Get single notification
     */
    public NotificationDTO getNotificationById(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have access to this notification");
        }
        
        return modelMapper.map(notification, NotificationDTO.class);
    }
    
    /**
     * Create notification
     */
    public NotificationDTO createNotification(
        Long userId, 
        NotificationType type, 
        String title, 
        String message, 
        String resource
    ) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .message(message)
            .resource(resource)
            .isRead(false)
            .build();
        
        return modelMapper.map(notificationRepository.save(notification), NotificationDTO.class);
    }
    
    /**
     * Mark notification as read
     */
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        Notification notification = getAndValidateNotification(notificationId, userId);
        notification.setIsRead(true);
        return modelMapper.map(notificationRepository.save(notification), NotificationDTO.class);
    }
    
    /**
     * Mark notification as unread
     */
    public NotificationDTO markAsUnread(Long notificationId, Long userId) {
        Notification notification = getAndValidateNotification(notificationId, userId);
        notification.setIsRead(false);
        return modelMapper.map(notificationRepository.save(notification), NotificationDTO.class);
    }
    
    /**
     * Mark all notifications as read
     */
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = 
            notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
    
    /**
     * Delete notification
     */
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = getAndValidateNotification(notificationId, userId);
        notificationRepository.delete(notification);
    }
    
    /**
     * Delete all notifications for user
     */
    public void deleteAllNotifications(Long userId) {
        List<Notification> notifications = 
            notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged()).getContent();
        notificationRepository.deleteAll(notifications);
    }
    
    /**
     * Helper method to get and validate notification ownership
     */
    private Notification getAndValidateNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have access to this notification");
        }
        
        return notification;
    }
    
    /**
     * Clean up old notifications (run periodically)
     */
    public void cleanupOldNotifications() {
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        notificationRepository.deleteByCreatedAtBefore(ninetyDaysAgo);
    }
}
```

## REST Controller

```java
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    private final AuthenticationService authenticationService;
    
    private Long getCurrentUserId() {
        return authenticationService.getCurrentUserId();
    }
    
    /**
     * Get all notifications with pagination and filters
     * GET /api/notifications?page=0&size=20&type=BOOKING_APPROVED&search=lecture
     */
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String search
    ) {
        Long userId = getCurrentUserId();
        
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(notificationService.searchNotifications(userId, search, page, size));
        }
        
        if (type != null && !type.isBlank()) {
            NotificationType notificationType = NotificationType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(notificationService.getNotificationsByType(userId, notificationType, page, size));
        }
        
        return ResponseEntity.ok(notificationService.getNotifications(userId, page, size));
    }
    
    /**
     * Get unread notifications count
     * GET /api/notifications/unread/count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = getCurrentUserId();
        Long unreadCount = notificationService.countUnreadNotifications(userId);
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", unreadCount));
    }
    
    /**
     * Get unread notifications
     * GET /api/notifications/unread
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }
    
    /**
     * Get single notification
     * GET /api/notifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotification(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(notificationService.getNotificationById(id, userId));
    }
    
    /**
     * Mark notification as read
     * PATCH /api/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }
    
    /**
     * Mark notification as unread
     * PATCH /api/notifications/{id}/unread
     */
    @PatchMapping("/{id}/unread")
    public ResponseEntity<NotificationDTO> markAsUnread(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(notificationService.markAsUnread(id, userId));
    }
    
    /**
     * Mark all notifications as read
     * POST /api/notifications/mark-all-read
     */
    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        Long userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Collections.singletonMap("message", "All notifications marked as read"));
    }
    
    /**
     * Delete notification
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Collections.singletonMap("message", "Notification deleted successfully"));
    }
    
    /**
     * Delete all notifications
     * DELETE /api/notifications
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteAllNotifications() {
        Long userId = getCurrentUserId();
        notificationService.deleteAllNotifications(userId);
        return ResponseEntity.ok(Collections.singletonMap("message", "All notifications deleted successfully"));
    }
}
```

## API Endpoints Summary

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/notifications` | Get all notifications | page, size, type, search |
| GET | `/api/notifications/unread` | Get unread notifications | - |
| GET | `/api/notifications/unread/count` | Count unread notifications | - |
| GET | `/api/notifications/{id}` | Get single notification | - |
| PATCH | `/api/notifications/{id}/read` | Mark as read | - |
| PATCH | `/api/notifications/{id}/unread` | Mark as unread | - |
| POST | `/api/notifications/mark-all-read` | Mark all as read | - |
| DELETE | `/api/notifications/{id}` | Delete notification | - |
| DELETE | `/api/notifications` | Delete all notifications | - |

## Usage Examples

### Create Booking Approved Notification
```java
notificationService.createNotification(
    userId,
    NotificationType.BOOKING_APPROVED,
    "Booking Approved",
    "Your booking for 'Lecture Hall A' on April 25, 2026 from 10:00 AM to 12:00 PM has been approved.",
    "Lecture Hall A"
);
```

### Create Ticket Updated Notification
```java
notificationService.createNotification(
    userId,
    NotificationType.TICKET_UPDATED,
    "Support Ticket #2045 Updated",
    "Your maintenance ticket has been marked as IN_PROGRESS.",
    "Ticket #2045"
);
```

### Create New Comment Notification
```java
notificationService.createNotification(
    userId,
    NotificationType.NEW_COMMENT,
    "New Comment on Ticket #2045",
    "John Doe added a comment: 'Found the issue, replacing the lamp now.'",
    "Ticket #2045"
);
```

## Integration Points

### 1. Booking Module
Create notifications when:
- Booking is approved
- Booking is rejected
- Booking is pending approval

### 2. Ticket Module
Create notifications when:
- Ticket is updated
- Ticket status changes
- New comment is added

### 3. Authentication Module
Include current user retrieval in authentication service

## Testing with Postman

### Create Test Notification
```
POST /api/notifications
Body:
{
    "type": "BOOKING_APPROVED",
    "title": "Booking Approved",
    "message": "Your booking has been approved",
    "resource": "Lecture Hall A"
}
```

### Get All Notifications
```
GET /api/notifications?page=0&size=10
```

### Mark as Read
```
PATCH /api/notifications/{notificationId}/read
```

### Delete Notification
```
DELETE /api/notifications/{notificationId}
```

## Security Considerations

1. **Authorization**: All endpoints verify user ownership of notifications
2. **Authentication**: Requires JWT token in Authorization header
3. **Rate Limiting**: Implement rate limiting for notification endpoints
4. **Input Validation**: Validate all input parameters
5. **Data Privacy**: Ensure users can only access their own notifications

## Performance Optimization

1. **Indexing**: Create indices on frequently queried columns
2. **Pagination**: Always use pagination for large datasets
3. **Lazy Loading**: Use FetchType.LAZY for relationships
4. **Query Optimization**: Use specific queries instead of loading all data
5. **Caching**: Implement Redis caching for unread counts

## Deployment Notes

1. Run database migrations
2. Create scheduled job for cleanup (remove notifications > 90 days old)
3. Configure notification retention policies
4. Monitor notification table size
5. Set up alerting for notification system failures
