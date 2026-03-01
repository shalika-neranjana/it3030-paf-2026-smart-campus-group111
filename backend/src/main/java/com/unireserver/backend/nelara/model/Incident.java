package com.unireserver.backend.nelara.model;

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
@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;

    private String reporterId;

    private String category; // Plumbing, Electrical, IT, Furniture, etc.

    private String description;

    private Priority priority;

    private String location;

    private List<String> imageFilenames;

    private String assignedTechnicianId;

    private IncidentStatus status;

    private String resolutionNotes;

    private List<Comment> comments;

    private Instant createdAt;

    private Instant updatedAt;

    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum IncidentStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Comment {
        private String userId;
        private String content;
        private Instant timestamp;
    }
}
