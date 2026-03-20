package com.unireserver.backend.service;

import com.unireserver.backend.dto.BookingResponse;
import com.unireserver.backend.exception.ResourceNotFoundException;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.Booking;
import com.unireserver.backend.model.BookingStatus;
import com.unireserver.backend.model.Facility;
import com.unireserver.backend.repository.BookingRepository;
import com.unireserver.backend.repository.FacilityRepository;
import com.unireserver.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    public Booking createBooking(Booking booking) {
        if (hasConflict(booking)) {
            throw new IllegalArgumentException("Scheduling conflict: The resource is already booked for the requested time.");
        }
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public List<BookingResponse> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Booking approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public boolean hasConflict(Booking newBooking) {
        List<Booking> existingBookings = bookingRepository.findByFacilityIdAndDateAndStatus(
                newBooking.getFacilityId(), newBooking.getDate(), BookingStatus.APPROVED);
        
        return existingBookings.stream().anyMatch(existing -> 
            (newBooking.getStartTime().isBefore(existing.getEndTime()) && newBooking.getEndTime().isAfter(existing.getStartTime()))
        );
    }

    private BookingResponse mapToResponse(Booking booking) {
        String facilityName = "Unknown Resource";
        if (booking.getFacilityId() != null) {
            facilityName = facilityRepository.findById(booking.getFacilityId())
                    .map(Facility::getName)
                    .orElse("Unknown Resource");
        }
        
        String userName = "Unknown User";
        if (booking.getUserId() != null) {
            userName = userRepository.findById(booking.getUserId())
                    .map(user -> user.getFirstName() + " " + user.getLastName())
                    .orElse("Unknown User");
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .facilityId(booking.getFacilityId())
                .facilityName(facilityName)
                .userId(booking.getUserId())
                .userName(userName)
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
