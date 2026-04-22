# Module C: Maintenance & Incident Ticketing
**Developed by: IT23555976 - Nelara Senevirathne**

## Overview
This module facilitates the reporting and tracking of campus maintenance issues. It provides a structured workflow from incident reporting to resolution, including technician assignment and status tracking.

## Features
- **Incident Reporting**: Users can report issues with category, location, priority, and description.
- **Workflow Management**: Tickets transition through states: Open → In Progress → Resolved → Closed.
- **Technician Assignment**: Admins can assign specific technicians to handle tickets.
- **Priority Indicators**: Visual cues for ticket urgency (Urgent, High, Medium, Low).
- **Dashboard Overview**: Real-time counts of tickets by status.

## Components
- `IncidentDashboardPage`: Central hub for managing all maintenance tickets.
- `IncidentForm`: Interface for submitting a new maintenance request.
- `IncidentCard`: Detailed view of a ticket with action buttons.
- `IncidentStats`: Summary of ticket status distribution.
- `LoadingSpinner`: Feedback during data operations.

## Backend Integration
- API Endpoint: `/api/incidents`
- Methods: `GET`, `POST`, `PATCH`
- Model: Includes support for comments and resolution notes.
