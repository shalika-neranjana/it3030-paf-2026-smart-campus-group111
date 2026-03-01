package com.unireserver.backend.samarakoon.model;

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
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    private String resourceId;

    private String userId;

    private String userName;

    private Integer rating; // 1 to 5

    private String comment;

    private List<String> likedBy; // List of user IDs

    private List<Response> responses;

    private Instant createdAt;

    private Instant updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String userId;
        private String userName;
        private String content;
        private Instant timestamp;
    }
}
