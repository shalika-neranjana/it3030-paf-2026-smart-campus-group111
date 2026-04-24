package com.unireserver.backend.service;

import com.unireserver.backend.model.Facility;
import com.unireserver.backend.model.FacilityType;
import com.unireserver.backend.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public Facility getFacilityById(String id) {
        return facilityRepository.findById(id).orElseThrow(() -> new RuntimeException("Facility not found"));
    }

    public Facility createFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    public Facility updateFacility(String id, Facility facilityDetails) {
        Facility facility = getFacilityById(id);
        facility.setName(facilityDetails.getName());
        facility.setType(facilityDetails.getType());
        facility.setCapacity(facilityDetails.getCapacity());
        facility.setLocation(facilityDetails.getLocation());
        facility.setAvailabilityWindows(facilityDetails.getAvailabilityWindows());
        facility.setStatus(facilityDetails.getStatus());
        facility.setDescription(facilityDetails.getDescription());
        facility.setImageUrl(facilityDetails.getImageUrl());
        return facilityRepository.save(facility);
    }

    public void deleteFacility(String id) {
        facilityRepository.deleteById(id);
    }

    public List<Facility> searchFacilities(FacilityType type, Integer minCapacity, String location) {
        List<Facility> facilities = facilityRepository.findAll();

        return facilities.stream()
                .filter(f -> type == null || f.getType() == type)
                .filter(f -> minCapacity == null || f.getCapacity() >= minCapacity)
                .filter(f -> location == null || location.isEmpty() || f.getLocation().toLowerCase().contains(location.toLowerCase()))
                .collect(Collectors.toList());
    }
}
