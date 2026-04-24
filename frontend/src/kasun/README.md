# Module B: Booking Management
**Developed by: IT23554290 - Kasun Dananjana**

## Overview
This module handles the workflow for reserving campus resources. It ensures no scheduling conflicts occur and provides an approval workflow for administrators.

## Features
- **Conflict Detection**: Backend logic prevents overlapping bookings for the same resource.
- **Approval Workflow**: Admins can approve or reject bookings with reasons.
- **User Dashboard**: Users can track their booking status (Pending, Approved, Rejected, Cancelled).
- **Time Validation**: Frontend utilities ensure valid time ranges.

## Components
- `BookingManagementPage`: Dashboard for viewing and managing all bookings.
- `BookingForm`: Interface for requesting a new booking.
- `BookingCard`: Summary view of a booking with status-specific actions.
- `BookingStats`: Visual summary of booking activity.
- `BookingDetailsModal`: Detailed view of a specific booking.

## Backend Integration
- API Endpoint: `/api/bookings`
- Conflict Handling: Returns `409 Conflict` if time slot is taken.
- Status Updates: Uses `PATCH` for state transitions.
