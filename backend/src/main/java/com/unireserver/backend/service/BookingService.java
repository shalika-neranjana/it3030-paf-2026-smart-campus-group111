package com.unireserver.backend.service;

import com.unireserver.backend.dto.BookingResponse;
import com.unireserver.backend.exception.ResourceNotFoundException;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.Booking;
import com.unireserver.backend.model.BookingStatus;
import com.unireserver.backend.model.Facility;
import com.unireserver.backend.repository.BookingRepository;
import com.unireserver.backend.repository.FacilityRepository;
import com.unireserver.backend.model.Message;
import com.unireserver.backend.service.MessageService;
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
    private final MessageService messageService;

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

    public List<BookingResponse> getBookingsForFacility(String facilityId) {
        return bookingRepository.findByFacilityId(facilityId).stream()
            .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public Booking approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);

        String facilityName = booking.getFacilityId() != null ?
            facilityRepository.findById(booking.getFacilityId()).map(Facility::getName).orElse("Resource") : "Resource";
        String title = "Booking Approved";
        String body = String.format("Your booking for %s on %s from %s to %s has been approved.",
            facilityName,
            booking.getDate() != null ? booking.getDate().toString() : "",
            booking.getStartTime() != null ? booking.getStartTime().toString() : "",
            booking.getEndTime() != null ? booking.getEndTime().toString() : "");

        Message message = Message.builder()
            .receiverId(booking.getUserId())
            .title(title)
            .body(body)
            .sentAt(java.time.LocalDateTime.now())
            .isRead(false)
            .build();
        messageService.createMessage(message);

        return saved;
    }

    public Booking rejectBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);

        String facilityName = booking.getFacilityId() != null ?
            facilityRepository.findById(booking.getFacilityId()).map(Facility::getName).orElse("Resource") : "Resource";
        String title = "Booking Rejected";
        String body = String.format("Your booking for %s on %s from %s to %s was rejected. Reason: %s",
            facilityName,
            booking.getDate() != null ? booking.getDate().toString() : "",
            booking.getStartTime() != null ? booking.getStartTime().toString() : "",
            booking.getEndTime() != null ? booking.getEndTime().toString() : "",
            reason != null ? reason : "No reason provided");

        Message message = Message.builder()
            .receiverId(booking.getUserId())
            .title(title)
            .body(body)
            .sentAt(java.time.LocalDateTime.now())
            .isRead(false)
            .build();
        messageService.createMessage(message);

        return saved;
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
