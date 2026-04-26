package com.unireserver.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssistantChatRequest {
    @NotBlank(message = "Message is required")
    private String message;
}
