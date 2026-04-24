package com.unireserver.backend.neranjana.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    private String type; // Lecture Hall, Lab, Meeting Room, Equipment

    private Integer capacity;

    private String location;

    private String description;

    private ResourceStatus status;

    private List<AvailabilityWindow> availabilityWindows;

    private Instant createdAt;

    private Instant updatedAt;

    public enum ResourceStatus {
        ACTIVE,
        OUT_OF_SERVICE
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityWindow {
        private String dayOfWeek;
        private String startTime; // HH:mm
        private String endTime;   // HH:mm
    }
}
