package com.unireserver.backend.dto;

import com.unireserver.backend.model.UserRole;
import lombok.Data;

import java.time.Instant;

@Data
public class TicketCommentResponse {
    private String id;
    private String ticketId;
    private String userId;
    private String userName;
    private UserRole userRole;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
}
