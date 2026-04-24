package com.unireserver.backend.controller;

import com.unireserver.backend.dto.AddCommentRequest;
import com.unireserver.backend.dto.AssignTechnicianRequest;
import com.unireserver.backend.dto.CreateTicketRequest;
import com.unireserver.backend.dto.PageResponse;
import com.unireserver.backend.dto.TicketResponse;
import com.unireserver.backend.dto.UpdateTicketStatusRequest;
import com.unireserver.backend.model.Attachment;
import com.unireserver.backend.model.TicketComment;
import com.unireserver.backend.model.TicketStatus;
import com.unireserver.backend.model.UserRole;
import com.unireserver.backend.service.AttachmentService;
import com.unireserver.backend.service.CommentService;
import com.unireserver.backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;
    private final AttachmentService attachmentService;

    // ============ TICKET ENDPOINTS ============

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication) {
        log.info("Creating ticket from user: {}", authentication.getName());
        TicketResponse response = ticketService.createTicket(
                request,
                authentication.getName(),
                extractUserName(authentication)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<TicketResponse> getTicket(
            @PathVariable String id,
            Authentication authentication) {
        UserRole role = extractUserRole(authentication);
        TicketResponse response = ticketService.getTicket(id, authentication.getName(), role);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<PageResponse<TicketResponse>> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        PageResponse<TicketResponse> response = ticketService.getMyTickets(authentication.getName(), page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<PageResponse<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<TicketResponse> response = ticketService.getAllTickets(status, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<PageResponse<TicketResponse>> getAssignedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        PageResponse<TicketResponse> response = ticketService.getAssignedTickets(authentication.getName(), page, size);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication) {
        UserRole role = extractUserRole(authentication);
        TicketResponse response = ticketService.updateTicketStatus(id, request, authentication.getName(), role);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable String id,
            @RequestBody AssignTechnicianRequest request,
            Authentication authentication) {
        UserRole role = extractUserRole(authentication);
        TicketResponse response = ticketService.assignTechnician(id, request, role);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String id,
            Authentication authentication) {
        UserRole role = extractUserRole(authentication);
        ticketService.deleteTicket(id, authentication.getName(), role);
        return ResponseEntity.noContent().build();
    }

    // ============ COMMENT ENDPOINTS ============

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable String id,
            @Valid @RequestBody AddCommentRequest request,
            Authentication authentication) {
        UserRole role = extractUserRole(authentication);
        TicketComment comment = commentService.addComment(
                id,
                request,
                authentication.getName(),
                extractUserName(authentication),
                role
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PutMapping("/{id}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @Valid @RequestBody AddCommentRequest request,
            Authentication authentication) {
        UserRole role = extractUserRole(authentication);
        TicketComment comment = commentService.updateComment(id, commentId, request, authentication.getName(), role);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            Authentication authentication) {
        UserRole role = extractUserRole(authentication);
        commentService.deleteComment(id, commentId, authentication.getName(), role);
        return ResponseEntity.noContent().build();
    }

    // ============ ATTACHMENT ENDPOINTS ============

    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<Attachment> uploadAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Attachment attachment = attachmentService.uploadAttachment(
                id,
                file,
                authentication.getName(),
                extractUserName(authentication)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId,
            Authentication authentication) throws IOException {
        attachmentService.deleteAttachment(id, attachmentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/attachments/{attachmentId}/download")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'LECTURER', 'STAFF', 'TECHNICIAN', 'MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId) throws IOException {
        byte[] content = attachmentService.downloadAttachment(id, attachmentId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(content);
    }

    // ============ HELPER METHODS ============

    private UserRole extractUserRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(auth -> {
                    String role = auth.getAuthority().replace("ROLE_", "");
                    return UserRole.valueOf(role);
                })
                .orElse(UserRole.STUDENT);
    }

    private String extractUserName(Authentication authentication) {
        return authentication.getName();
    }
}
