package com.unireserver.backend.controller;

import com.unireserver.backend.model.Facility;
import com.unireserver.backend.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final FacilityRepository facilityRepository;

    @GetMapping
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }
}
