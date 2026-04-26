package com.unireserver.backend.dto;

import com.unireserver.backend.model.TicketPriority;
import com.unireserver.backend.model.TicketStatus;
import com.unireserver.backend.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private String id;
    private String resourceId;
    private String category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String requesterId;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private UserRole assignedTechnicianRole;
    private String preferredContactDetails;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> attachmentUrls;
    private Instant createdAt;
    private Instant updatedAt;
}
