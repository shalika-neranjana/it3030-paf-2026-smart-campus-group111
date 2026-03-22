package com.unireserver.backend.neranjana.dto;

import com.unireserver.backend.neranjana.model.Resource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    @NotNull(message = "Capacity is required")
    @Min(value = 0, message = "Capacity cannot be negative")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    private Resource.ResourceStatus status;

    private List<Resource.AvailabilityWindow> availabilityWindows;
}
