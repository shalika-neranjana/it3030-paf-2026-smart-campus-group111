package com.unireserver.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class BookingRequest {

    private String resourceId;
    private String userId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private List<String> attendees;

    /** Optional: maximum number of attendees allowed for this resource. */
    private Integer resourceCapacity;
}
