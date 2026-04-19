package com.unireserver.backend.service;

import com.unireserver.backend.dto.TicketCreateRequest;
import com.unireserver.backend.dto.TicketUpdateRequest;
import com.unireserver.backend.model.MaintenanceTicket;
import com.unireserver.backend.model.TicketStatus;
import com.unireserver.backend.repository.MaintenanceTicketRepository;
import com.unireserver.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceTicketService {

    private final MaintenanceTicketRepository ticketRepository;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public MaintenanceTicket createTicket(TicketCreateRequest request, String requesterId) {
        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .resourceId(request.getResourceId())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .preferredContactDetails(request.getPreferredContactDetails())
                .attachmentUrls(request.getAttachmentUrls() != null ? request.getAttachmentUrls() : List.of())
                .status(TicketStatus.PENDING)
                .requesterId(requesterId)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        if (ticket.getAttachmentUrls().size() > 3) {
            throw new IllegalArgumentException("Maximum 3 attachments allowed");
        }

        return ticketRepository.save(ticket);
    }

    public List<MaintenanceTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<MaintenanceTicket> getTicketsByRequester(String requesterId) {
        return ticketRepository.findByRequesterId(requesterId);
    }

    public List<MaintenanceTicket> getTicketsByAssignedTechnician(String technicianId) {
        return ticketRepository.findByAssignedTechnicianId(technicianId);
    }

    public MaintenanceTicket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public MaintenanceTicket updateTicket(String id, TicketUpdateRequest request, com.unireserver.backend.model.AppUser currentUser) {
        MaintenanceTicket ticket = getTicketById(id);
        TicketStatus oldStatus = ticket.getStatus();

        // Creator edits: only allowed to change original ticket details while PENDING
        if (ticket.getRequesterId().equals(currentUser.getId())) {
            if (ticket.getStatus() != TicketStatus.PENDING) {
                throw new RuntimeException("Creators can only edit tickets when status is PENDING");
            }
            if (request.getCategory() != null) ticket.setCategory(request.getCategory());
            if (request.getDescription() != null) ticket.setDescription(request.getDescription());
            if (request.getPriority() != null) ticket.setPriority(request.getPriority());
            if (request.getResourceId() != null) ticket.setResourceId(request.getResourceId());

            // Creators are not allowed to change assignment/status/resolution/rejection
            if (request.getAssignedTechnicianId() != null || request.getStatus() != null ||
                    request.getResolutionNotes() != null || request.getRejectionReason() != null) {
                throw new RuntimeException("Creators cannot change status, assignment, or resolution details");
            }

        } else {
            // Non-creator: enforce role-based rules
            com.unireserver.backend.model.UserRole role = currentUser.getRole();
            boolean isAdminOrManager = role == com.unireserver.backend.model.UserRole.ADMINISTRATOR ||
                    role == com.unireserver.backend.model.UserRole.MANAGER;
            boolean isStaffOrTech = role == com.unireserver.backend.model.UserRole.STAFF ||
                    role == com.unireserver.backend.model.UserRole.TECHNICIAN;

            if (!isAdminOrManager && !isStaffOrTech) {
                throw new RuntimeException("Unauthorized to update this ticket");
            }

            if (isStaffOrTech) {
                // Staff/Technician can only act on tickets assigned to them
                if (!currentUser.getId().equals(ticket.getAssignedTechnicianId())) {
                    throw new RuntimeException("Staff/Technician can only update tickets assigned to them");
                }
            }

            // Assignment - only Admin/Manager can assign
            if (request.getAssignedTechnicianId() != null) {
                if (!isAdminOrManager) {
                    throw new RuntimeException("Only Administrators or Managers can assign tickets");
                }
                String assignedId = request.getAssignedTechnicianId();
                com.unireserver.backend.model.AppUser assignee = userRepository.findById(assignedId)
                        .orElseThrow(() -> new RuntimeException("Assignee not found"));
                if (assignee.getRole() != com.unireserver.backend.model.UserRole.STAFF &&
                        assignee.getRole() != com.unireserver.backend.model.UserRole.TECHNICIAN &&
                        assignee.getRole() != com.unireserver.backend.model.UserRole.ADMINISTRATOR &&
                        assignee.getRole() != com.unireserver.backend.model.UserRole.MANAGER) {
                    throw new RuntimeException("Assigned user must be STAFF, TECHNICIAN, ADMINISTRATOR, or MANAGER");
                }
                ticket.setAssignedTechnicianId(assignedId);
                String assigneeName = (assignee.getFirstName() != null ? assignee.getFirstName() : "") +
                    (assignee.getLastName() != null ? " " + assignee.getLastName() : "");
                if (assigneeName.isBlank()) assigneeName = assignee.getEmail();
                String title = "Ticket Assigned: #" + ticket.getId().substring(0, 8) + " → " + assigneeName;
                StringBuilder body = new StringBuilder();
                body.append("Your ticket #").append(ticket.getId().substring(0, 8)).append(" has been assigned to ")
                    .append(assigneeName).append(" (").append(assignee.getRole()).append(").");
                if (assignee.getEmail() != null && !assignee.getEmail().isBlank()) body.append(" Contact: ").append(assignee.getEmail());
                sendNotification(ticket.getRequesterId(), title, body.toString());

                // Notify the assignee as well
                String assigneeTitle = "You have been assigned ticket #" + ticket.getId().substring(0, 8);
                String assigneeBody = "You were assigned ticket #" + ticket.getId().substring(0, 8) + ": "
                    + (ticket.getCategory() != null ? ticket.getCategory() : "") + " - "
                    + (ticket.getDescription() != null ? ticket.getDescription() : "");
                sendNotification(assignedId, assigneeTitle, assigneeBody);
            }

            // Status changes
            if (request.getStatus() != null) {
                com.unireserver.backend.model.TicketStatus newStatus = request.getStatus();

                if (isAdminOrManager) {
                    // Admin/Manager: can open, reject, resolve, close, etc.
                    if (newStatus == com.unireserver.backend.model.TicketStatus.REJECTED &&
                            (request.getRejectionReason() == null || request.getRejectionReason().isBlank())) {
                        throw new RuntimeException("Rejection reason is required when rejecting a ticket");
                    }
                    if (request.getRejectionReason() != null) ticket.setRejectionReason(request.getRejectionReason());
                    ticket.setStatus(newStatus);
                } else if (isStaffOrTech) {
                    // Staff/Tech: only allowed statuses when assigned
                    if (newStatus != com.unireserver.backend.model.TicketStatus.IN_PROGRESS &&
                            newStatus != com.unireserver.backend.model.TicketStatus.RESOLVED &&
                            newStatus != com.unireserver.backend.model.TicketStatus.CLOSED) {
                        throw new RuntimeException("Staff/Technician can only set status to IN_PROGRESS, RESOLVED, or CLOSED");
                    }
                    ticket.setStatus(newStatus);
                }

                if (oldStatus != ticket.getStatus()) {
                    String title = "Ticket #" + ticket.getId().substring(0, 8) + " — " + ticket.getStatus();
                    StringBuilder body = new StringBuilder();
                    body.append("Status changed from ").append(oldStatus).append(" to ").append(ticket.getStatus()).append(".");
                    if (ticket.getStatus() == com.unireserver.backend.model.TicketStatus.REJECTED) {
                        if (ticket.getRejectionReason() != null && !ticket.getRejectionReason().isBlank()) {
                            body.append(" Reason: ").append(ticket.getRejectionReason()).append(".");
                        }
                    }
                    if (ticket.getStatus() == com.unireserver.backend.model.TicketStatus.RESOLVED) {
                        if (ticket.getResolutionNotes() != null && !ticket.getResolutionNotes().isBlank()) {
                            body.append(" Resolution: ").append(ticket.getResolutionNotes()).append(".");
                        }
                    }
                    if (ticket.getAssignedTechnicianId() != null) {
                        userRepository.findById(ticket.getAssignedTechnicianId()).ifPresent(a -> {
                            String name = (a.getFirstName() != null ? a.getFirstName() : "") + (a.getLastName() != null ? " " + a.getLastName() : "");
                            if (name.isBlank()) name = a.getEmail();
                            body.append(" Assigned to: ").append(name).append(" (").append(a.getRole()).append(").");
                        });
                    }
                    sendNotification(ticket.getRequesterId(), title, body.toString());
                }
            }

            // Resolution notes: allowed for Admin/Manager or assigned Staff/Tech
            if (request.getResolutionNotes() != null) {
                ticket.setResolutionNotes(request.getResolutionNotes());
            }

            if (request.getRejectionReason() != null && isAdminOrManager) {
                ticket.setRejectionReason(request.getRejectionReason());
            }
        }

        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id, com.unireserver.backend.model.AppUser currentUser) {
        MaintenanceTicket ticket = getTicketById(id);
        
        if (ticket.getRequesterId().equals(currentUser.getId())) {
            // Allow creators to delete their own tickets when they are RESOLVED, REJECTED, or still PENDING
            if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.REJECTED && ticket.getStatus() != TicketStatus.PENDING) {
                throw new RuntimeException("Creators can only delete tickets when status is PENDING, RESOLVED, or REJECTED");
            }
            ticketRepository.deleteById(id);
        } else {
            throw new RuntimeException("Unauthorized to delete this ticket. Only the creator can delete it when eligible.");
        }
    }

    private void sendNotification(String receiverId, String title, String body) {
        com.unireserver.backend.model.Message message = com.unireserver.backend.model.Message.builder()
                .receiverId(receiverId)
                .title(title)
                .body(body)
                .sentAt(java.time.LocalDateTime.now())
                .isRead(false)
                .build();
        messageService.createMessage(message);
    }
}
