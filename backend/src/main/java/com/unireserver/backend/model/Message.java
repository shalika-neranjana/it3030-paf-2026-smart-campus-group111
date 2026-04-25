package com.unireserver.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    private String senderId; // Optional sender

    private String receiverId; // Required receiver

    private LocalDateTime sentAt;

    private boolean isRead;

    private LocalDateTime readAt;

    private String title;

    private String body;
}
