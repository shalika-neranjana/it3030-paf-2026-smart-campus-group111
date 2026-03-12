package com.unireserver.backend.neranjana.dto;

import com.unireserver.backend.neranjana.model.Resource;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequest {
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String description;
    private Resource.ResourceStatus status;
    private List<Resource.AvailabilityWindow> availabilityWindows;
}
