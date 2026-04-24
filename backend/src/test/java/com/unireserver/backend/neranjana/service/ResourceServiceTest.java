package com.unireserver.backend.neranjana.service;

import com.unireserver.backend.neranjana.model.Resource;
import com.unireserver.backend.neranjana.repository.ResourceRepository;
import com.unireserver.backend.neranjana.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getResourceById_ShouldReturnResource_WhenFound() {
        Resource resource = new Resource();
        resource.setId("1");
        resource.setName("Test Resource");

        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));

        Optional<Resource> found = resourceService.getResourceById("1");

        assertTrue(found.isPresent());
        assertEquals("Test Resource", found.get().getName());
    }

    @Test
    void getResourceById_ShouldReturnEmpty_WhenNotFound() {
        when(resourceRepository.findById("1")).thenReturn(Optional.empty());

        Optional<Resource> found = resourceService.getResourceById("1");

        assertFalse(found.isPresent());
    }

    @Test
    void updateResource_ShouldThrowException_WhenNotFound() {
        Resource details = new Resource();
        when(resourceRepository.findById("1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            resourceService.updateResource("1", details);
        });
    }
}
