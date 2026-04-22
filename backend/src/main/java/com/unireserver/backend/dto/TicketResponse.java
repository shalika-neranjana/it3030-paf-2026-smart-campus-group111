package com.unireserver.backend.dto;

import com.unireserver.backend.model.Attachment;
import com.unireserver.backend.model.TicketCategory;
import com.unireserver.backend.model.TicketComment;
import com.unireserver.backend.model.TicketPriority;
import com.unireserver.backend.model.TicketStatus;
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

    private List<Attachment> attachments;

    private List<TicketComment> comments;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant resolvedAt;

    private Instant closedAt;

    private int commentCount;

    private int attachmentCount;
}
