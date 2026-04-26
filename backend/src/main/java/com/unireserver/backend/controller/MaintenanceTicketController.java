package com.unireserver.backend.controller;

import com.unireserver.backend.dto.CommentRequest;
import com.unireserver.backend.dto.TicketCreateRequest;
import com.unireserver.backend.dto.TicketResponse;
import com.unireserver.backend.dto.TicketUpdateRequest;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.MaintenanceTicket;
import com.unireserver.backend.model.TicketComment;
import com.unireserver.backend.dto.TicketCommentResponse;
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
import java.util.stream.Collectors;

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
    @PreAuthorize("hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_INSTRUCTOR') or hasAuthority('ROLE_LECTURER')")
    public TicketResponse createTicket(@RequestBody TicketCreateRequest request, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return mapTicketToResponse(ticketService.createTicket(request, user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR') or hasAuthority('ROLE_MANAGER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_TECHNICIAN')")
    public List<TicketResponse> getAllTickets(Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        com.unireserver.backend.model.UserRole role = user.getRole();
        if (role == com.unireserver.backend.model.UserRole.ADMINISTRATOR || role == com.unireserver.backend.model.UserRole.MANAGER) {
            return mapTicketsToResponse(ticketService.getAllTickets());
        }
        // Staff or Technician: return tickets assigned to them
        return mapTicketsToResponse(ticketService.getTicketsByAssignedTechnician(user.getId()));
    }

    @GetMapping("/my")
    public List<TicketResponse> getMyTickets(Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return mapTicketsToResponse(ticketService.getTicketsByRequester(user.getId()));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAuthority('ROLE_TECHNICIAN') or hasAuthority('ROLE_STAFF')")
    public List<TicketResponse> getAssignedTickets(Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return mapTicketsToResponse(ticketService.getTicketsByAssignedTechnician(user.getId()));
    }

    @GetMapping("/{id}")
    public TicketResponse getTicketById(@PathVariable String id) {
        return mapTicketToResponse(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public TicketResponse updateTicket(@PathVariable String id, @RequestBody TicketUpdateRequest request, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        return mapTicketToResponse(ticketService.updateTicket(id, request, user));
    }

    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable String id, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        ticketService.deleteTicket(id, user);
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR') or hasAuthority('ROLE_MANAGER')")
    public List<AppUser> getStaffMembers() {
        List<AppUser> staff = userRepository.findByRole(com.unireserver.backend.model.UserRole.STAFF);
        staff.addAll(userRepository.findByRole(com.unireserver.backend.model.UserRole.TECHNICIAN));
        return staff;
    }

    // Comments Endpoints

    @PostMapping("/{id}/comments")
    public TicketCommentResponse addComment(@PathVariable String id, @RequestBody CommentRequest request, Authentication authentication) {
        AppUser user = getCurrentUser(authentication);
        MaintenanceTicket ticket = ticketService.getTicketById(id);
        com.unireserver.backend.model.UserRole role = user.getRole();
        boolean isCreator = ticket.getRequesterId().equals(user.getId());
        boolean isAdminOrManager = role == com.unireserver.backend.model.UserRole.ADMINISTRATOR || role == com.unireserver.backend.model.UserRole.MANAGER;
        boolean isAssigned = user.getId().equals(ticket.getAssignedTechnicianId());
        if (!isCreator && !isAdminOrManager && !isAssigned) {
            throw new RuntimeException("Unauthorized to comment on this ticket");
        }
        TicketComment comment = commentService.addComment(id, user.getId(), request.getContent());
        return mapCommentToResponse(comment);
    }

    @GetMapping("/{id}/comments")
    public List<TicketCommentResponse> getComments(@PathVariable String id) {
        List<TicketComment> comments = commentService.getCommentsByTicket(id);
        java.util.List<TicketCommentResponse> responses = new java.util.ArrayList<>();
        for (TicketComment c : comments) {
            responses.add(mapCommentToResponse(c));
        }
        return responses;
    }

    private TicketCommentResponse mapCommentToResponse(TicketComment comment) {
        TicketCommentResponse resp = new TicketCommentResponse();
        resp.setId(comment.getId());
        resp.setTicketId(comment.getTicketId());
        resp.setUserId(comment.getUserId());
        com.unireserver.backend.model.AppUser author = userRepository.findById(comment.getUserId()).orElse(null);
        if (author != null) {
            String name = "";
            if (author.getFirstName() != null) name += author.getFirstName();
            if (author.getLastName() != null) name += (name.isEmpty() ? "" : " ") + author.getLastName();
            if (name.isBlank()) name = author.getEmail();
            resp.setUserName(name);
            resp.setUserRole(author.getRole());
        } else {
            resp.setUserName("Unknown");
        }
        resp.setContent(comment.getContent());
        resp.setCreatedAt(comment.getCreatedAt());
        resp.setUpdatedAt(comment.getUpdatedAt());
        return resp;
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

    private List<TicketResponse> mapTicketsToResponse(List<MaintenanceTicket> tickets) {
        return tickets.stream().map(this::mapTicketToResponse).collect(Collectors.toList());
    }

    private TicketResponse mapTicketToResponse(MaintenanceTicket ticket) {
        String assignedName = null;
        com.unireserver.backend.model.UserRole assignedRole = null;
        if (ticket.getAssignedTechnicianId() != null && !ticket.getAssignedTechnicianId().isBlank()) {
            AppUser assigned = userRepository.findById(ticket.getAssignedTechnicianId()).orElse(null);
            if (assigned != null) {
                String firstName = assigned.getFirstName() != null ? assigned.getFirstName() : "";
                String lastName = assigned.getLastName() != null ? assigned.getLastName() : "";
                String fullName = (firstName + " " + lastName).trim();
                assignedName = !fullName.isBlank() ? fullName : assigned.getEmail();
                assignedRole = assigned.getRole();
            }
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .resourceId(ticket.getResourceId())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .requesterId(ticket.getRequesterId())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .assignedTechnicianName(assignedName)
                .assignedTechnicianRole(assignedRole)
                .preferredContactDetails(ticket.getPreferredContactDetails())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .attachmentUrls(ticket.getAttachmentUrls())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
