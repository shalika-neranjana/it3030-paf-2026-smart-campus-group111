package com.unireserver.backend.shalika.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;

    private String message;

    private NotificationType type;

    private String referenceId; // Booking ID or Incident ID

    private boolean isRead;

    private Instant createdAt;

    public enum NotificationType {
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        MAINTENANCE_UPDATE,
        SYSTEM_ALERT
    }
}
