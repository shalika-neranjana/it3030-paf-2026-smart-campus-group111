package com.unireserver.backend.controller;

import com.unireserver.backend.dto.CommentRequest;
import com.unireserver.backend.dto.TicketCreateRequest;
import com.unireserver.backend.dto.TicketUpdateRequest;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.MaintenanceTicket;
import com.unireserver.backend.model.TicketComment;
import com.unireserver.backend.repository.UserRepository;
import com.unireserver.backend.service.ImageStorageService;
import com.unireserver.backend.service.MaintenanceTicketService;
import com.unireserver.backend.service.TicketCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceTicketController {

    private final MaintenanceTicketService ticketService;
    private final TicketCommentService commentService;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("image") org.springframework.web.multipart.MultipartFile image) {
        String filename = imageStorageService.storeImage(image, "ticket");
        return filename;
    }

    @PostMapping
    public MaintenanceTicket createTicket(@RequestBody TicketCreateRequest request, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return ticketService.createTicket(request, user.getId());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR') or hasAuthority('ROLE_MANAGER') or hasAuthority('ROLE_STAFF')")
    public List<MaintenanceTicket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/my")
    public List<MaintenanceTicket> getMyTickets(Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return ticketService.getTicketsByRequester(user.getId());
    }

    @GetMapping("/{id}")
    public MaintenanceTicket getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR') or hasAuthority('ROLE_MANAGER') or hasAuthority('ROLE_STAFF')")
    public MaintenanceTicket updateTicket(@PathVariable String id, @RequestBody TicketUpdateRequest request) {
        return ticketService.updateTicket(id, request);
    }

    // Comments Endpoints

    @PostMapping("/{id}/comments")
    public TicketComment addComment(@PathVariable String id, @RequestBody CommentRequest request, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return commentService.addComment(id, user.getId(), request.getContent());
    }

    @GetMapping("/{id}/comments")
    public List<TicketComment> getComments(@PathVariable String id) {
        return commentService.getCommentsByTicket(id);
    }

    @PutMapping("/comments/{commentId}")
    public TicketComment updateComment(@PathVariable String commentId, @RequestBody CommentRequest request, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return commentService.updateComment(commentId, user.getId(), request.getContent());
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@PathVariable String commentId, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        commentService.deleteComment(commentId, user.getId());
    }

    private AppUser getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
