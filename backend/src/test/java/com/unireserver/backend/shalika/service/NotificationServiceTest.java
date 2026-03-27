package com.unireserver.backend.shalika.service;

import com.unireserver.backend.shalika.model.Notification;
import com.unireserver.backend.shalika.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createNotification_ShouldSetInitialStatusToUnread() {
        Notification notification = Notification.builder().message("Test").build();
        when(notificationRepository.save(any())).thenReturn(notification);

        Notification result = notificationService.createNotification("user1", "Test", Notification.NotificationType.SYSTEM_ALERT, "ref1");

        assertNotNull(result);
        verify(notificationRepository, times(1)).save(any());
    }

    @Test
    void markAsRead_ShouldUpdateStatus() {
        Notification n = Notification.builder().id("1").isRead(false).build();
        when(notificationRepository.findById("1")).thenReturn(Optional.of(n));

        notificationService.markAsRead("1");

        assertTrue(n.isRead());
        verify(notificationRepository, times(1)).save(n);
    }
}
