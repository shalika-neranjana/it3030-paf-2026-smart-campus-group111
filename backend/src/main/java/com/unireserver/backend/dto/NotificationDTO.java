package com.unireserver.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Notification.
 * Used to transfer notification data between frontend and backend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    /**
     * Unique identifier of the notification
     */
    private String id;

    /**
     * Type of notification (BOOKING_APPROVED, BOOKING_REJECTED, etc.)
     */
    private String type;

    /**
     * Title/subject of the notification
     */
    private String title;

    /**
     * Full message content of the notification
     */
    private String message;

    /**
     * Related resource (e.g., room name, ticket number)
     */
    private String resource;

    /**
     * Whether the notification has been read by the user
     */
    @JsonProperty("isRead")
    private Boolean isRead;

    /**
     * Timestamp when the notification was created
     */
    private LocalDateTime timestamp;

    /**
     * Display-friendly timestamp
     */
    @JsonProperty("formattedTimestamp")
    private String formattedTimestamp;

    /**
     * User-friendly display name for notification type
     */
    @JsonProperty("typeDisplayName")
    private String typeDisplayName;
}
