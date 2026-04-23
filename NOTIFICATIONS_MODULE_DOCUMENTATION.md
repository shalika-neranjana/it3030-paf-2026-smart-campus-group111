# Notifications Module Documentation

## Overview
The Notifications Module provides a comprehensive inbox messaging system for the Smart Campus Operations Hub. It allows users to receive, manage, and view notifications related to bookings, tickets, and comments.

## Features

### Core Features
- **Real-time Notifications**: Receive notifications for booking approvals/rejections, ticket updates, and new comments
- **Inbox Management**: View all notifications in an organized, filterable inbox
- **Read/Unread Tracking**: Mark notifications as read or unread
- **Search Functionality**: Quick search across notification titles, messages, and resources
- **Advanced Filtering**: Filter by notification type and read status
- **Detail View**: View comprehensive notification details in a side panel
- **Notification Types**: Multiple notification categories with visual indicators

### Notification Types

1. **BOOKING_APPROVED** - Green Badge
   - When a booking request is approved by an admin
   - Includes resource name and booking details

2. **BOOKING_REJECTED** - Red Badge
   - When a booking request is rejected
   - Includes rejection reason

3. **BOOKING_PENDING** - Indigo Badge
   - When a booking request is created and waiting for approval

4. **TICKET_UPDATED** - Blue Badge
   - When a support ticket status changes
   - Includes ticket number and status update

5. **NEW_COMMENT** - Amber Badge
   - When someone adds a comment to a user's ticket
   - Includes commenter name and comment preview

## Component Structure

### NotificationsPage Component
Main component that manages the entire notifications interface.

**Location**: `src/pages/NotificationsPage.jsx`

**Key State Variables**:
- `notifications`: Array of all notifications
- `filteredNotifications`: Current filtered view of notifications
- `selectedNotification`: Currently selected notification in detail panel
- `searchQuery`: Search input value
- `filterType`: Active notification type filter
- `filterStatus`: Read/unread filter status

### Styling
All styles are centralized in CSS with CSS custom properties for easy theming.

**Location**: `src/styles/NotificationsPage.css`

## Usage

### Integration with Dashboard
The NotificationsPage is integrated into the DashboardPage component. Admins can access it via the "Inbox Messages" navigation link.

```jsx
{activeSection === 'inbox-messages' ? (
  <NotificationsPage />
) : (
  // Other dashboard sections
)}
```

### Displaying Notifications
Notifications are displayed as a list with:
- Icon indicating notification type
- Title and brief message
- Resource reference
- Type badge
- Timestamp
- Unread indicator

### Filtering & Search
Users can:
1. **Search**: Type in the search box to find notifications by title, message, or resource
2. **Filter by Type**: Select specific notification types from dropdown
3. **Filter by Status**: View all, unread, or read notifications

### Notification Details
Click on any notification to view:
- Full notification title
- Complete message content
- Related resource information
- Type badge and status
- Actions (Mark as read/unread, Delete)

## API Integration

### Current Implementation
Currently using mock data. Ready for backend integration with these endpoints:

### Endpoints to Implement

#### Get All Notifications
```
GET /api/notifications
Response: Array of notifications
```

#### Get Notification by ID
```
GET /api/notifications/:id
Response: Single notification object
```

#### Mark as Read
```
PATCH /api/notifications/:id/read
Response: Updated notification
```

#### Mark as Unread
```
PATCH /api/notifications/:id/unread
Response: Updated notification
```

#### Mark All as Read
```
POST /api/notifications/mark-all-read
Response: Success message
```

#### Delete Notification
```
DELETE /api/notifications/:id
Response: Success message
```

## Notification Data Structure

```javascript
{
  id: Number,
  type: String, // BOOKING_APPROVED, BOOKING_REJECTED, etc.
  title: String,
  message: String,
  resource: String,
  timestamp: Date,
  isRead: Boolean
}
```

## Styling System

### CSS Variables
The component uses a comprehensive CSS variable system for theming:

**Colors**:
- `--primary-color`: #3b82f6
- `--success-color`: #10b981
- `--error-color`: #ef4444
- `--warning-color`: #f59e0b
- `--pending-color`: #6366f1

**Backgrounds**:
- `--bg-primary`: #ffffff
- `--bg-secondary`: #f9fafb
- `--bg-tertiary`: #f3f4f6

**Text**:
- `--text-primary`: #1f2937
- `--text-secondary`: #6b7280
- `--text-tertiary`: #9ca3af

## Responsive Design

The component is fully responsive across all device sizes:
- **Desktop (1024px+)**: Full side-by-side layout with list and details
- **Tablet (768px-1023px)**: Stacked layout with details below list
- **Mobile (480px-767px)**: Single column with collapsible sections
- **Small Mobile (<480px)**: Optimized for smaller screens

## Features to Implement

### Backend Integration
1. Replace mock data with API calls
2. Implement real-time notifications (WebSocket/Server-Sent Events)
3. Add notification preferences/settings
4. Implement batch operations (delete multiple, mark multiple)

### Frontend Enhancements
1. Add notification sound/browser notifications
2. Implement auto-refresh
3. Add notification count badge to navigation
4. Add pagination for large notification lists
5. Add export/archive functionality

### Advanced Features
1. Notification templates
2. Email digest options
3. Notification scheduling
4. Group similar notifications
5. Notification history/archive

## Testing

### Manual Testing Checklist
- [ ] View all notifications
- [ ] Search notifications
- [ ] Filter by type
- [ ] Filter by status
- [ ] Mark as read/unread
- [ ] Delete notification
- [ ] Mark all as read
- [ ] View notification details
- [ ] Responsive on different screen sizes
- [ ] Keyboard navigation (Tab, Enter)

### Mock Data
The component includes mock notifications for demonstration:
- Booking approved notification
- Booking rejected notification
- Ticket updated notification
- New comment notification
- Booking pending notification
- Ticket resolved notification

## Accessibility Features

- **Keyboard Navigation**: All buttons and interactive elements are keyboard accessible
- **ARIA Labels**: Proper ARIA labels for screen readers
- **Focus Management**: Clear focus indicators for keyboard users
- **Semantic HTML**: Proper semantic elements throughout
- **Color Contrast**: Meets WCAG AA standards

## Performance Considerations

- **Virtual Scrolling**: Consider implementing for large lists
- **Pagination**: Implement for scalability
- **Lazy Loading**: Load notification details on demand
- **Caching**: Cache notifications to reduce API calls

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── NotificationsPage.jsx      # Main component
│   │   └── DashboardPage.jsx          # Integration point
│   ├── styles/
│   │   └── NotificationsPage.css      # Styling
│   └── lib/
│       └── api.js                     # API utility
```

## Development Notes

### Icon Library
Uses `lucide-react` for icons:
- `Bell`: Bell icon
- `CheckCircle`: Approval icon
- `AlertCircle`: Rejection icon
- `FileText`: Ticket icon
- `MessageSquare`: Comment icon
- `Clock`: Pending icon
- `Search`: Search icon
- `Filter`: Filter icon
- `ChevronRight`: Navigation icon
- `Trash2`: Delete icon
- `Archive`: Archive icon
- `CheckCheck`: Mark all read icon

### Dependencies
- React 19.2.4+
- lucide-react 1.7.0+
- sweetalert2 11.26.24+
- axios 1.14.0+ (for API calls)

## Future Enhancements

1. **Notification Center Widget**: Quick notification preview in header
2. **Real-time Updates**: WebSocket integration for live notifications
3. **Notification Preferences**: User settings for notification types
4. **Advanced Analytics**: Notification engagement metrics
5. **Mobile App Support**: Native app notifications
6. **AI-powered Summaries**: Auto-summarize multiple similar notifications

## Support & Questions

For questions or issues with the notifications module:
1. Check this documentation
2. Review mock data implementation
3. Check CSS for styling issues
4. Verify API integration when backend endpoints are ready
