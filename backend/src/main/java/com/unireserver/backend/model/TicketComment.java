package com.unireserver.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {

    private String id;
    
    private String content;
    
    private String authorId;
    
    private String authorName;
    
    private String authorRole;
    
    private Instant createdAt;
    
    private Instant updatedAt;
    
    private boolean edited;
}
