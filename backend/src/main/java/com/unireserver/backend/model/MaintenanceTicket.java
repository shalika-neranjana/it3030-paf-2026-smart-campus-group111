package com.unireserver.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "maintenance_tickets")
public class MaintenanceTicket {

    @Id
    private String id;

    private String resourceId; // ID of the Facility or Resource

    private String category;

    private String description;

    private TicketPriority priority;

    private TicketStatus status;

    private String requesterId; // ID of AppUser who created the ticket

    private String assignedTechnicianId; // ID of AppUser assigned to the ticket

    private String preferredContactDetails;

    private String resolutionNotes;

    private String rejectionReason;

    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>();

    private Instant createdAt;

    private Instant updatedAt;
}
