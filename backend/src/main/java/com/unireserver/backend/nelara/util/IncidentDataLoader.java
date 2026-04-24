package com.unireserver.backend.nelara.util;

import com.unireserver.backend.nelara.model.Incident;
import com.unireserver.backend.nelara.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class IncidentDataLoader implements CommandLineRunner {

    private final IncidentRepository incidentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (incidentRepository.count() == 0) {
            Incident i1 = Incident.builder()
                    .reporterId("user1")
                    .category("Electrical")
                    .description("Flickering lights in Room 101")
                    .priority(Incident.Priority.MEDIUM)
                    .location("Building A, Floor 1")
                    .status(Incident.IncidentStatus.OPEN)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            Incident i2 = Incident.builder()
                    .reporterId("user2")
                    .category("Plumbing")
                    .description("Water leak in the cafeteria bathroom")
                    .priority(Incident.Priority.HIGH)
                    .location("Main Hall, Cafeteria")
                    .status(Incident.IncidentStatus.IN_PROGRESS)
                    .assignedTechnicianId("tech1")
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            incidentRepository.saveAll(Arrays.asList(i1, i2));
            System.out.println("Incident mock data loaded.");
        }
    }
}
