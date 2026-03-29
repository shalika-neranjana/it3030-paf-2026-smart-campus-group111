package com.unireserver.backend.kasun.service;

import com.unireserver.backend.kasun.model.Booking;
import com.unireserver.backend.kasun.repository.BookingRepository;
import com.unireserver.backend.kasun.exception.BookingNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public Booking createBooking(Booking booking) {
        if (hasConflict(booking)) {
            throw new RuntimeException("Time slot already booked for this resource.");
        }
        
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, Booking.BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
        
        booking.setStatus(status);
        if (reason != null) {
            booking.setRejectionReason(reason);
        }
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    private boolean hasConflict(Booking newBooking) {
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndBookingDateAndStatus(
                newBooking.getResourceId(), 
                newBooking.getBookingDate(), 
                Booking.BookingStatus.APPROVED
        );

        return existingBookings.stream().anyMatch(existing -> 
            (newBooking.getStartTime().isBefore(existing.getEndTime()) && 
             newBooking.getEndTime().isAfter(existing.getStartTime()))
        );
    }

    public void cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());
        bookingRepository.save(booking);
    }
}
