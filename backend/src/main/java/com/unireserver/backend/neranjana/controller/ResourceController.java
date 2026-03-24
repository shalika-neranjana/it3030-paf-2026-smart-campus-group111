package com.unireserver.backend.neranjana.controller;

import com.unireserver.backend.neranjana.dto.ResourceRequest;
import com.unireserver.backend.neranjana.model.Resource;
import com.unireserver.backend.neranjana.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Resource.ResourceStatus status) {
        
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(resourceService.searchResources(search));
        }
        
        if (type != null || status != null) {
            return ResponseEntity.ok(resourceService.filterResources(type, status));
        }
        
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .status(request.getStatus())
                .availabilityWindows(request.getAvailabilityWindows())
                .build();
        return new ResponseEntity<>(resourceService.createResource(resource), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable String id, @Valid @RequestBody ResourceRequest request) {
        try {
            Resource resource = Resource.builder()
                    .name(request.getName())
                    .type(request.getType())
                    .capacity(request.getCapacity())
                    .location(request.getLocation())
                    .description(request.getDescription())
                    .status(request.getStatus())
                    .availabilityWindows(request.getAvailabilityWindows())
                    .build();
            return ResponseEntity.ok(resourceService.updateResource(id, resource));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
