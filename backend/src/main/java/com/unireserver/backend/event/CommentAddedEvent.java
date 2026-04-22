package com.unireserver.backend.event;

import com.unireserver.backend.model.Ticket;
import com.unireserver.backend.model.TicketComment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentAddedEvent extends ApplicationEvent {

    private final Ticket ticket;

    private final TicketComment comment;

    public CommentAddedEvent(Object source, Ticket ticket, TicketComment comment) {
        super(source);
        this.ticket = ticket;
        this.comment = comment;
    }
}
