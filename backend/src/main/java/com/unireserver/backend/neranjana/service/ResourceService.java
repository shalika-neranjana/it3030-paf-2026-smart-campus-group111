package com.unireserver.backend.neranjana.service;

import com.unireserver.backend.neranjana.model.Resource;
import com.unireserver.backend.neranjana.repository.ResourceRepository;
import com.unireserver.backend.neranjana.exception.ResourceNotFoundException;
import com.unireserver.backend.neranjana.util.SearchUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        resource.setCreatedAt(Instant.now());
        resource.setUpdatedAt(Instant.now());
        if (resource.getStatus() == null) {
            resource.setStatus(Resource.ResourceStatus.ACTIVE);
        }
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setDescription(resourceDetails.getDescription());
        resource.setStatus(resourceDetails.getStatus());
        resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
        resource.setUpdatedAt(Instant.now());

        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    public List<Resource> searchResources(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return resourceRepository.findAll();
        }
        String sanitizedKeyword = SearchUtils.sanitizeKeyword(keyword);
        return resourceRepository.searchResources(sanitizedKeyword);
    }

    public List<Resource> filterResources(String type, Resource.ResourceStatus status) {
        if (type != null && status != null) {
            return resourceRepository.findByTypeAndStatus(type, status);
        } else if (type != null) {
            return resourceRepository.findByType(type);
        } else if (status != null) {
            return resourceRepository.findByStatus(status);
        } else {
            return resourceRepository.findAll();
        }
    }
}
