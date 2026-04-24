package com.unireserver.backend.event;

import com.unireserver.backend.model.Ticket;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketCreatedEvent extends ApplicationEvent {

    private final Ticket ticket;

    public TicketCreatedEvent(Object source, Ticket ticket) {
        super(source);
        this.ticket = ticket;
    }
}
