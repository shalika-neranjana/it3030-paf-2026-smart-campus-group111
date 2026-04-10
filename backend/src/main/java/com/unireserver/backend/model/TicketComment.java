package com.unireserver.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ticket_comments")
public class TicketComment {

    @Id
    private String id;

    private String ticketId;

    private String userId; // ID of AppUser who made the comment

    private String content;

    private Instant createdAt;

    private Instant updatedAt;
}
