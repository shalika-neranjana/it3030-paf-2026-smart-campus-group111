package com.unireserver.backend.controller;

import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.Message;
import com.unireserver.backend.repository.UserRepository;
import com.unireserver.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/my")
    public List<Message> getMyMessages(Authentication authentication) {
        AppUser user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return messageService.getMessagesForUser(user.getId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        AppUser user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return Map.of("count", messageService.getUnreadCount(user.getId()));
    }

    @PostMapping
    public Message createMessage(@RequestBody Message message) {
        return messageService.createMessage(message);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable String id, @RequestBody Message message) {
        return messageService.updateMessage(id, message)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        if (messageService.deleteMessage(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable String id) {
        return messageService.markAsRead(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
