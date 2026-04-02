package com.unireserver.backend.repository;

import com.unireserver.backend.model.MaintenanceTicket;
import com.unireserver.backend.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTicketRepository extends MongoRepository<MaintenanceTicket, String> {
    List<MaintenanceTicket> findByRequesterId(String requesterId);
    List<MaintenanceTicket> findByAssignedTechnicianId(String technicianId);
    List<MaintenanceTicket> findByStatus(TicketStatus status);
}
