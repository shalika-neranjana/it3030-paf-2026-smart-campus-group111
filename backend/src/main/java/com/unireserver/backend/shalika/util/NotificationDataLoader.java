package com.unireserver.backend.shalika.util;

import com.unireserver.backend.shalika.model.Notification;
import com.unireserver.backend.shalika.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class NotificationDataLoader implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (notificationRepository.count() == 0) {
            Notification n1 = Notification.builder()
                    .userId("user1")
                    .message("Your booking for Lecture Hall A has been approved.")
                    .type(Notification.NotificationType.BOOKING_APPROVED)
                    .referenceId("book1")
                    .isRead(false)
                    .createdAt(Instant.now())
                    .build();

            Notification n2 = Notification.builder()
                    .userId("user1")
                    .message("Maintenance issue 'Water Leak' status updated to IN_PROGRESS.")
                    .type(Notification.NotificationType.MAINTENANCE_UPDATE)
                    .referenceId("inc1")
                    .isRead(true)
                    .createdAt(Instant.now().minusSeconds(3600))
                    .build();

            notificationRepository.saveAll(Arrays.asList(n1, n2));
            System.out.println("Notification mock data loaded.");
        }
    }
}
