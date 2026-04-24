package com.unireserver.backend.nelara.dto;

import com.unireserver.backend.nelara.model.Incident;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentRequest {
    @NotBlank(message = "Reporter ID is required")
    private String reporterId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private Incident.Priority priority;

    @NotBlank(message = "Location is required")
    private String location;
}
