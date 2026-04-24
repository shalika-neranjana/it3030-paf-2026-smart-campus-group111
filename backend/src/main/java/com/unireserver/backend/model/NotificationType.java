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
     * Sent when maintenance work receives a progress update
     */
    MAINTENANCE_UPDATE("Maintenance Update"),

    /**
     * Sent when a new comment is added to a ticket that belongs to the user
     */
    NEW_COMMENT("New Comment"),

    /**
     * Sent for campus-wide announcements or broad administrative communication
     */
    ANNOUNCEMENT("Announcement"),

    /**
     * Sent to remind users about upcoming events or deadlines
     */
    EVENT_REMINDER("Event Reminder"),

    /**
     * Sent when a payment is due or requires follow-up
     */
    PAYMENT_REMINDER("Payment Reminder"),

    /**
     * Sent when a user should be made aware of a security-related concern
     */
    SECURITY_NOTICE("Security Notice"),

    /**
     * Sent for urgent platform or infrastructure level issues
     */
    SYSTEM_ALERT("System Alert");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
