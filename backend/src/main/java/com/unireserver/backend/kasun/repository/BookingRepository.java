package com.unireserver.backend.kasun.repository;

import com.unireserver.backend.kasun.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByUserId(String userId);
    
    List<Booking> findByResourceId(String resourceId);
    
    List<Booking> findByResourceIdAndBookingDateAndStatus(String resourceId, LocalDate date, Booking.BookingStatus status);
    
    List<Booking> findByStatus(Booking.BookingStatus status);
}
