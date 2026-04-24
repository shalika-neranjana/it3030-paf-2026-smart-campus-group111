package com.unireserver.backend.service;

import com.unireserver.backend.dto.BookingRequest;
import com.unireserver.backend.model.Booking;
import com.unireserver.backend.model.BookingStatus;
import com.unireserver.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final MongoTemplate mongoTemplate;

    // 1. Create a new booking (defaults to PENDING, rejects if conflicts exist)
    public Booking createBooking(BookingRequest request) {
        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateCapacity(request.getAttendees(), request.getResourceCapacity());
        checkForConflicts(request.getResourceId(), request.getDate(),
                request.getStartTime(), request.getEndTime(), null);

        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .userId(request.getUserId())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    // 2. Approve a PENDING booking — re-checks conflicts excluding itself
    public Booking approveBooking(String bookingId) {
        Booking booking = findById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }

        checkForConflicts(booking.getResourceId(), booking.getDate(),
                booking.getStartTime(), booking.getEndTime(), bookingId);

        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    // 3. Reject a booking with a reason
    public Booking rejectBooking(String bookingId, String reason) {
        Booking booking = findById(bookingId);

        if (booking.getStatus() == BookingStatus.REJECTED
                || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return bookingRepository.save(booking);
    }

    // 4. Cancel a booking — only allowed when APPROVED
    public Booking cancelBooking(String bookingId) {
        Booking booking = findById(bookingId);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // 5. Get all bookings for a specific user
    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // 6. Get all bookings with optional filters (resourceId, userId, date, status)
    public List<Booking> getAllBookingsWithFilters(String resourceId, String userId,
                                                   LocalDate date, BookingStatus status) {
        Query query = new Query();

        if (resourceId != null) {
            query.addCriteria(Criteria.where("resourceId").is(resourceId));
        }
        if (userId != null) {
            query.addCriteria(Criteria.where("userId").is(userId));
        }
        if (date != null) {
            query.addCriteria(Criteria.where("date").is(date));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        return mongoTemplate.find(query, Booking.class);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Booking findById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private void validateCapacity(List<String> attendees, Integer resourceCapacity) {
        if (resourceCapacity == null || attendees == null) {
            return;
        }
        if (attendees.size() > resourceCapacity) {
            throw new IllegalArgumentException(
                    "Number of attendees (" + attendees.size() + ") exceeds resource capacity (" + resourceCapacity + ")");
        }
    }

    /**
     * Throws if any APPROVED or PENDING booking overlaps the requested slot.
     * Pass {@code excludeBookingId} (non-null) when approving so the booking
     * being approved does not conflict with itself.
     */
    private void checkForConflicts(String resourceId, LocalDate date,
                                   LocalTime startTime, LocalTime endTime,
                                   String excludeBookingId) {
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                resourceId, date, startTime, endTime,
                List.of(BookingStatus.APPROVED, BookingStatus.PENDING)
        );

        boolean hasConflict = conflicts.stream()
                .anyMatch(b -> !b.getId().equals(excludeBookingId));

        if (hasConflict) {
            throw new IllegalStateException(
                    "Booking conflicts with an existing APPROVED or PENDING booking");
        }
    }
}
