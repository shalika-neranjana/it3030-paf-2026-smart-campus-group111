package com.unireserver.backend.neranjana.util;

import com.unireserver.backend.neranjana.model.Resource;
import com.unireserver.backend.neranjana.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class ResourceDataLoader implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) throws Exception {
        if (resourceRepository.count() == 0) {
            Resource r1 = Resource.builder()
                    .name("Main Lecture Hall")
                    .type("Lecture Hall")
                    .capacity(200)
                    .location("Building A, Floor 1")
                    .description("Large hall with projector and sound system.")
                    .status(Resource.ResourceStatus.ACTIVE)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            Resource r2 = Resource.builder()
                    .name("Computer Lab 1")
                    .type("Lab")
                    .capacity(50)
                    .location("Building B, Floor 2")
                    .description("High-end PCs for programming classes.")
                    .status(Resource.ResourceStatus.ACTIVE)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            Resource r3 = Resource.builder()
                    .name("Meeting Room X")
                    .type("Meeting Room")
                    .capacity(10)
                    .location("Building C, Floor 3")
                    .description("Quiet room for small group discussions.")
                    .status(Resource.ResourceStatus.ACTIVE)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            resourceRepository.saveAll(Arrays.asList(r1, r2, r3));
            System.out.println("Resource mock data loaded.");
        }
    }
}
