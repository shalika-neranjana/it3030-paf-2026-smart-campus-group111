package com.unireserver.backend.controller;

import com.unireserver.backend.model.Facility;
import com.unireserver.backend.model.FacilityType;
import com.unireserver.backend.repository.FacilityRepository;
import com.unireserver.backend.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final FacilityService facilityService;
    private final FacilityRepository facilityRepository;

    @GetMapping
    public List<Facility> getAllFacilities(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location) {
        if (type != null || minCapacity != null || location != null) {
            return facilityService.searchFacilities(type, minCapacity, location);
        }
        return facilityService.getAllFacilities();
    }

    @GetMapping("/{id}")
    public Facility getFacilityById(@PathVariable String id) {
        return facilityService.getFacilityById(id);
    }

    @PostMapping
    public Facility createFacility(@RequestBody Facility facility) {
        return facilityService.createFacility(facility);
    }

    @PutMapping("/{id}")
    public Facility updateFacility(@PathVariable String id, @RequestBody Facility facility) {
        return facilityService.updateFacility(id, facility);
    }

    @DeleteMapping("/{id}")
    public void deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
    }
}
