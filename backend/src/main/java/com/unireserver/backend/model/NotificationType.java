package com.unireserver.backend.model;

/**
 * Enumeration of notification types for the Smart Campus Operations Hub.
 * Each type represents a different notification scenario.
 */
public enum NotificationType {
    /**
     * Sent when a booking request is approved by an administrator
     */
    BOOKING_APPROVED("Booking Approved"),

    /**
     * Sent when a booking request is rejected by an administrator
     */
    BOOKING_REJECTED("Booking Rejected"),

    /**
     * Sent when a booking request is created and waiting for approval
     */
    BOOKING_PENDING("Booking Pending"),

    /**
     * Sent when a support ticket status is updated
     */
    TICKET_UPDATED("Ticket Updated"),

    /**
     * Sent when a new comment is added to a ticket that belongs to the user
     */
    NEW_COMMENT("New Comment");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
