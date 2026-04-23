package com.unireserver.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Notification entity representing a notification/message for a user.
 * Used to track booking approvals, ticket updates, comments, and other system events.
 */
@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private NotificationType type;

    private String title;

    private String message;

    private String resource;

    @Indexed
    private Boolean isRead = false;

    @Indexed
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Returns the notification as a string for logging purposes
     */
    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", userId=" + userId +
                ", type=" + type +
                ", title='" + title + '\'' +
                ", resource='" + resource + '\'' +
                ", isRead=" + isRead +
                ", createdAt=" + createdAt +
                '}';
    }
}
