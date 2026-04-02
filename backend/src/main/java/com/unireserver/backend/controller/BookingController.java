package com.unireserver.backend.controller;

import com.unireserver.backend.dto.BookingResponse;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.Booking;
import com.unireserver.backend.repository.UserRepository;
import com.unireserver.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking, Authentication authentication) {
        AppUser user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        booking.setUserId(user.getId());
        return bookingService.createBooking(booking);
    }

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        AppUser user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return bookingService.getMyBookings(user.getId());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR') or hasAuthority('ROLE_MANAGER')")
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/facility/{facilityId}")
    public List<BookingResponse> getBookingsForFacility(@PathVariable String facilityId) {
        return bookingService.getBookingsForFacility(facilityId);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR') or hasAuthority('ROLE_MANAGER')")
    public Booking approveBooking(@PathVariable String id) {
        return bookingService.approveBooking(id);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR') or hasAuthority('ROLE_MANAGER')")
    public Booking rejectBooking(@PathVariable String id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        return bookingService.rejectBooking(id, reason);
    }

    @PutMapping("/{id}/cancel")
    public Booking cancelBooking(@PathVariable String id, Authentication authentication) {
        // In a real app, we should check if the user is the owner or an admin
        return bookingService.cancelBooking(id);
    }
}
