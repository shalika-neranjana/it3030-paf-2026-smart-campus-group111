package com.unireserver.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssistantChatResponse {
    private String message;
    private String action;
}
