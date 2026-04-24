import React, { useState, useEffect } from 'react';
import './BookingForm.css';

const BookingForm = ({ resourceId, resourceName, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    resourceId: resourceId || '',
    bookingDate: '',
    startTime: '08:00',
    endTime: '09:00',
    purpose: '',
    expectedAttendees: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'expectedAttendees' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="booking-form-overlay">
      <form onSubmit={handleSubmit} className="booking-form">
        <h2>Book {resourceName || 'Resource'}</h2>
        
        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            name="bookingDate" 
            value={formData.bookingDate} 
            onChange={handleChange} 
            required 
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Time</label>
            <input 
              type="time" 
              name="startTime" 
              value={formData.startTime} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>End Time</label>
            <input 
              type="time" 
              name="endTime" 
              value={formData.endTime} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Expected Attendees</label>
          <input 
            type="number" 
            name="expectedAttendees" 
            value={formData.expectedAttendees} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Purpose</label>
          <textarea 
            name="purpose" 
            value={formData.purpose} 
            onChange={handleChange} 
            rows="3"
            required
            placeholder="e.g., Guest Lecture, Workshop..."
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-book">Confirm Booking</button>
          <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
