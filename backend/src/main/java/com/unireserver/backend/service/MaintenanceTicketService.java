package com.unireserver.backend.service;

import com.unireserver.backend.dto.TicketCreateRequest;
import com.unireserver.backend.dto.TicketUpdateRequest;
import com.unireserver.backend.model.MaintenanceTicket;
import com.unireserver.backend.model.TicketStatus;
import com.unireserver.backend.repository.MaintenanceTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceTicketService {

    private final MaintenanceTicketRepository ticketRepository;

    public MaintenanceTicket createTicket(TicketCreateRequest request, String requesterId) {
        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .resourceId(request.getResourceId())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .preferredContactDetails(request.getPreferredContactDetails())
                .attachmentUrls(request.getAttachmentUrls() != null ? request.getAttachmentUrls() : List.of())
                .status(TicketStatus.OPEN)
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

    public MaintenanceTicket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public MaintenanceTicket updateTicket(String id, TicketUpdateRequest request) {
        MaintenanceTicket ticket = getTicketById(id);

        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
        }
        if (request.getAssignedTechnicianId() != null) {
            ticket.setAssignedTechnicianId(request.getAssignedTechnicianId());
        }
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        if (request.getRejectionReason() != null) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }
}
