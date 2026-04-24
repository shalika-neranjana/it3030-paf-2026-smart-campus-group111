package com.unireserver.backend.kasun.util;

import com.unireserver.backend.kasun.model.Booking;
import com.unireserver.backend.kasun.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class BookingDataLoader implements CommandLineRunner {

    private final BookingRepository bookingRepository;

    @Override
    public void run(String... args) throws Exception {
        if (bookingRepository.count() == 0) {
            Booking b1 = Booking.builder()
                    .resourceId("res1")
                    .userId("user1")
                    .bookingDate(LocalDate.now().plusDays(1))
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(11, 0))
                    .purpose("Morning Workshop")
                    .expectedAttendees(30)
                    .status(Booking.BookingStatus.APPROVED)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            Booking b2 = Booking.builder()
                    .resourceId("res2")
                    .userId("user2")
                    .bookingDate(LocalDate.now().plusDays(2))
                    .startTime(LocalTime.of(14, 0))
                    .endTime(LocalTime.of(16, 0))
                    .purpose("Project Presentation")
                    .expectedAttendees(15)
                    .status(Booking.BookingStatus.PENDING)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            bookingRepository.saveAll(Arrays.asList(b1, b2));
            System.out.println("Booking mock data loaded.");
        }
    }
}
