package com.unireserver.backend.service;

import com.unireserver.backend.model.TicketComment;
import com.unireserver.backend.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;

    public TicketComment addComment(String ticketId, String userId, String content) {
        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .content(content)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return commentRepository.save(comment);
    }

    public List<TicketComment> getCommentsByTicket(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public void deleteComment(String commentId, String userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    public TicketComment updateComment(String commentId, String userId, String content) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this comment");
        }

        comment.setContent(content);
        comment.setUpdatedAt(Instant.now());
        return commentRepository.save(comment);
    }
}
