package com.unireserver.backend.controller;

import com.unireserver.backend.dto.AssistantChatRequest;
import com.unireserver.backend.dto.AssistantChatResponse;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.repository.UserRepository;
import com.unireserver.backend.service.CampusAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CampusAssistantController {

    private final CampusAssistantService campusAssistantService;
    private final UserRepository userRepository;

    @PostMapping("/chat")
    @PreAuthorize("hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_INSTRUCTOR') or hasAuthority('ROLE_LECTURER')")
    public AssistantChatResponse chat(@Valid @RequestBody AssistantChatRequest request, Authentication authentication) {
        AppUser user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return campusAssistantService.processMessage(user, request.getMessage());
    }
}
