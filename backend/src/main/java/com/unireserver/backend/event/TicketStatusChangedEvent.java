package com.unireserver.backend.event;

import com.unireserver.backend.model.Ticket;
import com.unireserver.backend.model.TicketStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketStatusChangedEvent extends ApplicationEvent {

    private final Ticket ticket;

    private final TicketStatus previousStatus;

    private final TicketStatus newStatus;

    public TicketStatusChangedEvent(Object source, Ticket ticket, TicketStatus previousStatus, TicketStatus newStatus) {
        super(source);
        this.ticket = ticket;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
    }
}
