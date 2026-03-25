import React from 'react';
import './BookingStats.css';

const BookingStats = ({ bookings }) => {
  const pending = bookings.filter(b => b.status === 'PENDING').length;
  const approved = bookings.filter(b => b.status === 'APPROVED').length;

  return (
    <div className="booking-stats">
      <div className="stat-pill pending">
        <span>Pending Approval: {pending}</span>
      </div>
      <div className="stat-pill approved">
        <span>Upcoming Bookings: {approved}</span>
      </div>
    </div>
  );
};

export default BookingStats;
