import React, { useState, useEffect } from 'react';
import './NotificationBell.css';

const NotificationBell = ({ userId }) => {
  const getTypeIcon = (type) => {
    switch(type) {
      case 'BOOKING_APPROVED': return '✅';
      case 'BOOKING_REJECTED': return '❌';
      case 'MAINTENANCE_UPDATE': return '🔧';
      case 'SYSTEM_ALERT': return '⚠️';
      default: return '🔔';
    }
  };
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/user/${userId}`);
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'PATCH' });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:8080/api/notifications/user/${userId}/read-all`, { method: 'PATCH' });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="notification-bell-container">
      <div className="bell-icon" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="btn-mark-all" onClick={markAllAsRead}>Mark all read</button>
            )}
            <button className="btn-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="notification-content">
                    <span className="type-icon">{getTypeIcon(n.type)}</span>
                    <div className="text-wrapper">
                      <p>{n.message}</p>
                      <span className="time">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
