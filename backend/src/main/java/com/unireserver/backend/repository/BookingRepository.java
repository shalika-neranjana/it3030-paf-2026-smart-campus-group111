package com.unireserver.backend.repository;

import com.unireserver.backend.model.Booking;
import com.unireserver.backend.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Finds overlapping bookings for the same resource on the same date,
     * restricted to APPROVED or PENDING bookings.
     *
     * Overlap condition: startTime < existingEndTime AND endTime > existingStartTime
     */
    @Query("{ 'resourceId': ?0, 'date': ?1, 'status': { $in: ?4 }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findOverlappingBookings(
            String resourceId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            List<BookingStatus> statuses
    );

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(String resourceId);
}
