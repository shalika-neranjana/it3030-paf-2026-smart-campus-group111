package com.unireserver.backend.repository;

import com.unireserver.backend.model.Ticket;
import com.unireserver.backend.model.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    Page<Ticket> findByCreatedBy(String userId, Pageable pageable);

    Page<Ticket> findByAssignedTechnicianId(String technicianId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    @Query("{ 'status': ?0, 'priority': ?1 }")
    Page<Ticket> findByStatusAndPriority(TicketStatus status, String priority, Pageable pageable);

    @Query("{ 'createdBy': ?0, 'status': { $in: ?1 } }")
    Page<Ticket> findByCreatedByAndStatusIn(String userId, java.util.List<TicketStatus> statuses, Pageable pageable);

    @Query("{ 'status': { $in: ?0 } }")
    Page<Ticket> findByStatusIn(java.util.List<TicketStatus> statuses, Pageable pageable);

    long countByStatus(TicketStatus status);

    long countByCreatedBy(String userId);

    Page<Ticket> findAll(Pageable pageable);
}
