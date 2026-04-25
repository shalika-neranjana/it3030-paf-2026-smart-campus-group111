package com.unireserver.backend.util;

import com.unireserver.backend.model.Facility;
import com.unireserver.backend.model.FacilityStatus;
import com.unireserver.backend.model.FacilityType;
import com.unireserver.backend.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final FacilityRepository facilityRepository;

    @Override
    public void run(String... args) throws Exception {
        if (facilityRepository.count() == 0) {
            Facility hall1 = Facility.builder()
                    .name("Main Lecture Hall")
                    .type(FacilityType.LECTURE_HALL)
                    .capacity(250)
                    .building("Main Building")
                    .floorNumber(1)
                    .status(FacilityStatus.ACTIVE)
                    .note("Spacious lecture hall with advanced audio-visual systems.")
                    .availabilityWindows(Arrays.asList("08:00-12:00", "13:00-17:00"))
                    .build();

            Facility lab1 = Facility.builder()
                    .name("Advanced Computing Lab")
                    .type(FacilityType.LAB)
                    .capacity(50)
                    .building("Engineering faculty Building")
                    .floorNumber(3)
                    .status(FacilityStatus.ACTIVE)
                    .note("High-performance workstations for AI and Data Science.")
                    .availabilityWindows(Arrays.asList("09:00-18:00"))
                    .build();

            Facility projector1 = Facility.builder()
                    .name("Portable 4K Projector")
                    .type(FacilityType.EQUIPMENT)
                    .capacity(1)
                    .building("New Academic Building")
                    .floorNumber(0)
                    .status(FacilityStatus.OUT_OF_SERVICE)
                    .note("High-resolution portable projector for seminars.")
                    .availabilityWindows(Arrays.asList("08:00-20:00"))
                    .build();

            facilityRepository.saveAll(Arrays.asList(hall1, lab1, projector1));
        }
    }
}
