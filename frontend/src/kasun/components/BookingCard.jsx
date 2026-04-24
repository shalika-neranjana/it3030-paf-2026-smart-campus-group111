import React from 'react';
import './BookingCard.css';

const BookingCard = ({ booking, onStatusUpdate, onCancel, isAdmin }) => {
  const getStatusClass = (status) => {
    switch(status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <span className={`booking-status ${getStatusClass(booking.status)}`}>
          {booking.status}
        </span>
        <h3>{booking.purpose}</h3>
      </div>
      <div className="booking-card-details">
        <p><strong>Resource ID:</strong> {booking.resourceId}</p>
        <p><strong>Date:</strong> {booking.bookingDate}</p>
        <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
        <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
        {booking.rejectionReason && (
          <p className="rejection-note"><strong>Reason:</strong> {booking.rejectionReason}</p>
        )}
      </div>
      
      <div className="booking-card-actions">
        {isAdmin && booking.status === 'PENDING' && (
          <>
            <button 
              className="btn-approve" 
              onClick={() => onStatusUpdate(booking.id, 'APPROVED')}
            >
              Approve
            </button>
            <button 
              className="btn-reject" 
              onClick={() => onStatusUpdate(booking.id, 'REJECTED')}
            >
              Reject
            </button>
          </>
        )}
        
        {!isAdmin && (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
          <button 
            className="btn-cancel-booking" 
            onClick={() => onCancel(booking.id)}
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
