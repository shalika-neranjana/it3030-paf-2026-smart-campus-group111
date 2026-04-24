# Module A: Facilities & Assets Catalogue
**Developed by: IT23547360 - Neranjana K.H.P.S**

## Overview
This module manages the university's facilities (lecture halls, labs, meeting rooms) and assets (equipment). It provides a comprehensive catalogue with search, filtering, and CRUD capabilities.

## Features
- **Resource Management**: Create, view, update, and delete campus resources.
- **Search & Filtering**: Search by name/location and filter by resource type or status.
- **Availability Windows**: Manage when a resource is available for booking.
- **Responsive UI**: Modern grid layout with status indicators.

## Components
- `ResourceManagementPage`: Main orchestrator for the module.
- `ResourceCard`: Displays individual resource details.
- `ResourceForm`: Handles creation and editing of resources.
- `ResourceStats`: Provides a summary of resource counts.
- `LoadingSpinner`: Feedback during data fetching.

## Backend Integration
- API Endpoint: `/api/resources`
- Supported Methods: `GET`, `POST`, `PUT`, `DELETE`
- Validation: Jakarta Validation for data integrity.
- Exception Handling: Global handler for consistent error responses.
