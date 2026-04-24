package com.unireserver.backend.kasun.service;

import com.unireserver.backend.kasun.model.Booking;
import com.unireserver.backend.kasun.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createBooking_ShouldSucceed_WhenNoConflict() {
        Booking booking = Booking.builder()
                .resourceId("res1")
                .bookingDate(LocalDate.now())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .build();

        when(bookingRepository.findByResourceIdAndBookingDateAndStatus(anyString(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.save(any())).thenReturn(booking);

        Booking saved = bookingService.createBooking(booking);

        assertNotNull(saved);
        assertEquals(Booking.BookingStatus.PENDING, saved.getStatus());
    }

    @Test
    void createBooking_ShouldThrowException_WhenConflictExists() {
        Booking existing = Booking.builder()
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .build();
        
        Booking newBooking = Booking.builder()
                .resourceId("res1")
                .bookingDate(LocalDate.now())
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(13, 0))
                .build();

        when(bookingRepository.findByResourceIdAndBookingDateAndStatus(anyString(), any(), any()))
                .thenReturn(Collections.singletonList(existing));

        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(newBooking);
        });
    }
}
