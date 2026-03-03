package com.unireserver.backend.nelara.repository;

import com.unireserver.backend.nelara.model.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends MongoRepository<Incident, String> {
    
    List<Incident> findByReporterId(String reporterId);
    
    List<Incident> findByAssignedTechnicianId(String technicianId);
    
    List<Incident> findByStatus(Incident.IncidentStatus status);
    
    List<Incident> findByCategory(String category);
}
