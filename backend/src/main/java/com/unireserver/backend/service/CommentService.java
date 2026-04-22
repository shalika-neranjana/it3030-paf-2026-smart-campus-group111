package com.unireserver.backend.service;

import com.unireserver.backend.dto.AddCommentRequest;
import com.unireserver.backend.event.CommentAddedEvent;
import com.unireserver.backend.model.Ticket;
import com.unireserver.backend.model.TicketComment;
import com.unireserver.backend.model.UserRole;
import com.unireserver.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final TicketRepository ticketRepository;
    private final ApplicationEventPublisher eventPublisher;

    public TicketComment addComment(String ticketId, AddCommentRequest request, String userId, String userName, UserRole role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .content(request.getContent())
                .authorId(userId)
                .authorName(userName)
                .authorRole(role.toString())
                .createdAt(Instant.now())
                .edited(false)
                .build();

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(Instant.now());

        ticketRepository.save(ticket);
        eventPublisher.publishEvent(new CommentAddedEvent(this, ticket, comment));

        log.info("Comment added to ticket: {} by user: {}", ticketId, userId);
        return comment;
    }

    public TicketComment updateComment(String ticketId, String commentId, AddCommentRequest request, String userId, UserRole role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketComment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Only admin or comment author can edit
        if (role != UserRole.ADMINISTRATOR && !comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("Unauthorized to edit this comment");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(Instant.now());
        comment.setEdited(true);

        ticket.setUpdatedAt(Instant.now());
        ticketRepository.save(ticket);

        log.info("Comment updated: {} in ticket: {}", commentId, ticketId);
        return comment;
    }

    public void deleteComment(String ticketId, String commentId, String userId, UserRole role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketComment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Only admin or comment author can delete
        if (role != UserRole.ADMINISTRATOR && !comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }

        ticket.getComments().remove(comment);
        ticket.setUpdatedAt(Instant.now());
        ticketRepository.save(ticket);

        log.info("Comment deleted: {} from ticket: {}", commentId, ticketId);
    }
}
