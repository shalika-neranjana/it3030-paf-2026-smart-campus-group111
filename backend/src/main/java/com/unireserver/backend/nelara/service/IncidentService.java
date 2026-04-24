package com.unireserver.backend.nelara.service;

import com.unireserver.backend.nelara.model.Incident;
import com.unireserver.backend.nelara.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Optional<Incident> getIncidentById(String id) {
        return incidentRepository.findById(id);
    }

    public Incident createIncident(Incident incident) {
        incident.setStatus(Incident.IncidentStatus.OPEN);
        incident.setCreatedAt(Instant.now());
        incident.setUpdatedAt(Instant.now());
        incident.setComments(new ArrayList<>());
        return incidentRepository.save(incident);
    }

    public Incident updateStatus(String id, Incident.IncidentStatus status, String notes) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        incident.setStatus(status);
        if (notes != null) {
            incident.setResolutionNotes(notes);
        }
        incident.setUpdatedAt(Instant.now());
        return incidentRepository.save(incident);
    }

    public Incident assignTechnician(String id, String technicianId) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        incident.setAssignedTechnicianId(technicianId);
        incident.setStatus(Incident.IncidentStatus.IN_PROGRESS);
        incident.setUpdatedAt(Instant.now());
        return incidentRepository.save(incident);
    }

    public Incident addComment(String id, Incident.Comment comment) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        comment.setTimestamp(Instant.now());
        if (incident.getComments() == null) {
            incident.setComments(new ArrayList<>());
        }
        incident.getComments().add(comment);
        incident.setUpdatedAt(Instant.now());
        return incidentRepository.save(incident);
    }
}
