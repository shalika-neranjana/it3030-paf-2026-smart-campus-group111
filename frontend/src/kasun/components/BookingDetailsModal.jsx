import React from 'react';
import './BookingDetailsModal.css';

const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Booking Details</h2>
        <div className="detail-item">
          <label>Purpose</label>
          <p>{booking.purpose}</p>
        </div>
        <div className="detail-item">
          <label>Resource</label>
          <p>{booking.resourceId}</p>
        </div>
        <div className="detail-item">
          <label>Status</label>
          <p>{booking.status}</p>
        </div>
        <button onClick={onClose} className="btn-close">Close</button>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
