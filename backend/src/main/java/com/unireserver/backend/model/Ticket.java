package com.unireserver.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    @Indexed
    private String ticketNumber;

    private String resourceLocation;

    private TicketCategory category;

    private String description;

    private TicketPriority priority;

    private TicketStatus status;

    private String createdBy;

    private String creatorName;

    private String preferredContact;

    private String assignedTechnicianId;

    private String assignedTechnicianName;

    private String resolutionNotes;

    private String rejectionReason;

    @Builder.Default
    private List<Attachment> attachments = new ArrayList<>();

    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    private Instant createdAt;

    private Instant updatedAt;

    private Instant resolvedAt;

    private Instant closedAt;
}
