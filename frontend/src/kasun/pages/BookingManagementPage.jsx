import React, { useState, useEffect } from 'react';
import BookingCard from '../components/BookingCard';
import './BookingManagementPage.css';

const BookingManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Should come from auth context

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // Check if user is admin (mock logic for now)
    setIsAdmin(true); 
  }, []);

  const handleStatusUpdate = async (id, status) => {
    const reason = status === 'REJECTED' ? prompt('Enter rejection reason:') : null;
    if (status === 'REJECTED' && !reason) return;

    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/bookings/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchBookings();
        }
      } catch (error) {
        console.error('Error canceling booking:', error);
      }
    }
  };

  return (
    <div className="booking-management-page">
      <header className="page-header">
        <h1>Booking Management</h1>
        <div className="tabs">
          <button className="active">All Bookings</button>
          <button>My Bookings</button>
        </div>
      </header>

      {loading ? (
        <div className="loading">Loading bookings...</div>
      ) : (
        <div className="booking-grid">
          {bookings.length > 0 ? (
            bookings.map(booking => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                isAdmin={isAdmin}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
              />
            ))
          ) : (
            <div className="no-data">No bookings found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingManagementPage;
