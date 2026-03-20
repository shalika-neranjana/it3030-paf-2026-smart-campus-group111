import React, { useState, useEffect } from 'react';
import './NotificationPage.css';

const NotificationPage = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/user/${userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  return (
    <div className="notification-page">
      <h1>All Notifications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="notification-full-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-card ${n.isRead ? 'read' : 'unread'}`}>
              <div className="card-header">
                <span className="type">{n.type}</span>
                <span className="date">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="message">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
