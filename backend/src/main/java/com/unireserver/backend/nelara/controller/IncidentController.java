package com.unireserver.backend.nelara.controller;

import com.unireserver.backend.nelara.model.Incident;
import com.unireserver.backend.nelara.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable String id) {
        return incidentService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        return new ResponseEntity<>(incidentService.createIncident(incident), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(
            @PathVariable String id, 
            @RequestBody Map<String, String> body) {
        
        Incident.IncidentStatus status = Incident.IncidentStatus.valueOf(body.get("status"));
        String notes = body.get("notes");
        
        return ResponseEntity.ok(incidentService.updateStatus(id, status, notes));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Incident> assignTechnician(
            @PathVariable String id, 
            @RequestBody Map<String, String> body) {
        
        String technicianId = body.get("technicianId");
        return ResponseEntity.ok(incidentService.assignTechnician(id, technicianId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Incident> addComment(
            @PathVariable String id, 
            @RequestBody Incident.Comment comment) {
        
        return ResponseEntity.ok(incidentService.addComment(id, comment));
    }
}
