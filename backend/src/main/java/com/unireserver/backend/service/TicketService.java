package com.unireserver.backend.service;

import com.unireserver.backend.dto.CreateTicketRequest;
import com.unireserver.backend.dto.TicketResponse;
import com.unireserver.backend.dto.UpdateTicketStatusRequest;
import com.unireserver.backend.dto.PageResponse;
import com.unireserver.backend.dto.AssignTechnicianRequest;
import com.unireserver.backend.event.TicketCreatedEvent;
import com.unireserver.backend.event.TicketStatusChangedEvent;
import com.unireserver.backend.model.Ticket;
import com.unireserver.backend.model.TicketStatus;
import com.unireserver.backend.model.UserRole;
import com.unireserver.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ApplicationEventPublisher eventPublisher;
    private static final String TICKET_PREFIX = "TKT";

    public TicketResponse createTicket(CreateTicketRequest request, String userId, String userName) {
        log.info("Creating ticket for user: {}", userId);

        Ticket ticket = Ticket.builder()
                .ticketNumber(generateTicketNumber())
                .resourceLocation(request.getResourceLocation())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .preferredContact(request.getPreferredContact())
                .status(TicketStatus.OPEN)
                .createdBy(userId)
                .creatorName(userName)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        eventPublisher.publishEvent(new TicketCreatedEvent(this, savedTicket));

        return mapToResponse(savedTicket);
    }

    public TicketResponse getTicket(String ticketId, String userId, UserRole role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Authorization check
        if (!canViewTicket(ticket, userId, role)) {
            throw new RuntimeException("Unauthorized to view this ticket");
        }

        return mapToResponse(ticket);
    }

    public PageResponse<TicketResponse> getMyTickets(String userId, int page, int size) {
        Page<Ticket> tickets = ticketRepository.findByCreatedBy(userId, Pageable.ofSize(size).withPage(page));
        return PageResponse.from(tickets.map(this::mapToResponse));
    }

    public PageResponse<TicketResponse> getAllTickets(TicketStatus status, int page, int size) {
        Page<Ticket> tickets;
        if (status != null) {
            tickets = ticketRepository.findByStatus(status, Pageable.ofSize(size).withPage(page));
        } else {
            tickets = ticketRepository.findAll(Pageable.ofSize(size).withPage(page));
        }
        return PageResponse.from(tickets.map(this::mapToResponse));
    }

    public PageResponse<TicketResponse> getAssignedTickets(String technicianId, int page, int size) {
        Page<Ticket> tickets = ticketRepository.findByAssignedTechnicianId(technicianId, Pageable.ofSize(size).withPage(page));
        return PageResponse.from(tickets.map(this::mapToResponse));
    }

    public TicketResponse updateTicketStatus(String ticketId, UpdateTicketStatusRequest request, String userId, UserRole role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus previousStatus = ticket.getStatus();
        validateStatusTransition(previousStatus, request.getStatus(), role);

        ticket.setStatus(request.getStatus());
        ticket.setUpdatedAt(Instant.now());

        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(request.getNotes());
            ticket.setResolvedAt(Instant.now());
        } else if (request.getStatus() == TicketStatus.REJECTED) {
            ticket.setRejectionReason(request.getRejectionReason());
        } else if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(Instant.now());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        eventPublisher.publishEvent(new TicketStatusChangedEvent(this, updatedTicket, previousStatus, request.getStatus()));

        return mapToResponse(updatedTicket);
    }

    public TicketResponse assignTechnician(String ticketId, AssignTechnicianRequest request, UserRole role) {
        if (role != UserRole.ADMINISTRATOR && role != UserRole.MANAGER) {
            throw new RuntimeException("Only administrators can assign tickets");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedTechnicianId(request.getTechnicianId());
        ticket.setAssignedTechnicianName(request.getTechnicianName());
        ticket.setUpdatedAt(Instant.now());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }

    public void deleteTicket(String ticketId, String userId, UserRole role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Only admin, manager, or creator can delete
        if (role != UserRole.ADMINISTRATOR && role != UserRole.MANAGER && !ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this ticket");
        }

        ticketRepository.deleteById(ticketId);
        log.info("Ticket deleted: {}", ticketId);
    }

    private String generateTicketNumber() {
        return TICKET_PREFIX + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }

    private void validateStatusTransition(TicketStatus currentStatus, TicketStatus newStatus, UserRole role) {
        // OPEN -> IN_PROGRESS, REJECTED
        // IN_PROGRESS -> RESOLVED, REJECTED
        // RESOLVED -> CLOSED
        // REJECTED, CLOSED -> no changes

        if (currentStatus == TicketStatus.REJECTED || currentStatus == TicketStatus.CLOSED) {
            throw new RuntimeException("Cannot update a rejected or closed ticket");
        }

        if (currentStatus == TicketStatus.OPEN) {
            if (newStatus != TicketStatus.IN_PROGRESS && newStatus != TicketStatus.REJECTED) {
                throw new RuntimeException("Invalid status transition from OPEN");
            }
        } else if (currentStatus == TicketStatus.IN_PROGRESS) {
            if (newStatus != TicketStatus.RESOLVED && newStatus != TicketStatus.REJECTED) {
                throw new RuntimeException("Invalid status transition from IN_PROGRESS");
            }
        } else if (currentStatus == TicketStatus.RESOLVED) {
            if (newStatus != TicketStatus.CLOSED) {
                throw new RuntimeException("Invalid status transition from RESOLVED");
            }
        }
    }

    private boolean canViewTicket(Ticket ticket, String userId, UserRole role) {
        return role == UserRole.ADMINISTRATOR || 
               role == UserRole.MANAGER ||
               ticket.getCreatedBy().equals(userId) ||
               (ticket.getAssignedTechnicianId() != null && ticket.getAssignedTechnicianId().equals(userId));
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .resourceLocation(ticket.getResourceLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdBy(ticket.getCreatedBy())
                .creatorName(ticket.getCreatorName())
                .preferredContact(ticket.getPreferredContact())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .assignedTechnicianName(ticket.getAssignedTechnicianName())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .attachments(ticket.getAttachments())
                .comments(ticket.getComments())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .commentCount(ticket.getComments().size())
                .attachmentCount(ticket.getAttachments().size())
                .build();
    }
}
