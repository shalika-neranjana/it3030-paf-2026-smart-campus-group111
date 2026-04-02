package com.unireserver.backend.dto;

import com.unireserver.backend.model.TicketPriority;
import lombok.Data;

import java.util.List;

@Data
public class TicketCreateRequest {
    private String resourceId;
    private String category;
    private String description;
    private TicketPriority priority;
    private String preferredContactDetails;
    private List<String> attachmentUrls;
}
