# Module D: Notifications & Alerts
**Developed by: IT21049231 - Shalika Neranjana**

## Overview
This module provides real-time alerts and a history of notifications for campus users. It ensures users are promptly informed about booking approvals, maintenance updates, and system-wide announcements.

## Features
- **Real-time Polishing**: The notification bell polls for new alerts periodically.
- **Visual Categorization**: Icons represent different alert types (Booking, Maintenance, System).
- **Read Status Management**: Users can mark individual alerts or all alerts as read.
- **Full History**: A dedicated page for viewing and filtering all past notifications.
- **Summary Dashboard**: Visual counters for unread and total notifications.

## Components
- `NotificationBell`: Dropdown component for the navigation bar.
- `NotificationPage`: Full-screen view for managing alert history.
- `NotificationStats`: Visual indicators for alert counts.

## Backend Integration
- API Endpoint: `/api/notifications`
- Polling Interval: 30 seconds (configurable).
- Status: Binary `isRead` flag for each notification.
