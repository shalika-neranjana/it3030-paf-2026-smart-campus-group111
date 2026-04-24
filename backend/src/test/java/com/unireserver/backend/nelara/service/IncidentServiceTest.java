package com.unireserver.backend.nelara.service;

import com.unireserver.backend.nelara.model.Incident;
import com.unireserver.backend.nelara.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private IncidentService incidentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createIncident_ShouldSetStatusToOpen() {
        Incident incident = Incident.builder()
                .category("IT")
                .description("Test issue")
                .build();
        
        when(incidentRepository.save(any())).thenReturn(incident);

        Incident result = incidentService.createIncident(incident);

        assertEquals(Incident.IncidentStatus.OPEN, result.getStatus());
        assertNotNull(result.getComments());
    }

    @Test
    void updateStatus_ShouldChangeStatus() {
        Incident incident = Incident.builder().id("1").status(Incident.IncidentStatus.OPEN).build();
        
        when(incidentRepository.findById("1")).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any())).thenReturn(incident);

        Incident result = incidentService.updateStatus("1", Incident.IncidentStatus.RESOLVED, "Fixed");

        assertEquals(Incident.IncidentStatus.RESOLVED, result.getStatus());
        assertEquals("Fixed", result.getResolutionNotes());
    }
}
