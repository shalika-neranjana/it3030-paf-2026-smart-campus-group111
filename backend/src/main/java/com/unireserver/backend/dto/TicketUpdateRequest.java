package com.unireserver.backend.dto;

import com.unireserver.backend.model.TicketStatus;
import lombok.Data;

@Data
public class TicketUpdateRequest {
    private TicketStatus status;
    private String assignedTechnicianId;
    private String resolutionNotes;
    private String rejectionReason;
    private String category;
    private String description;
    private com.unireserver.backend.model.TicketPriority priority;
    private String resourceId;
}
