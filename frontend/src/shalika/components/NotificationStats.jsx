import React from 'react';
import './NotificationStats.css';

const NotificationStats = ({ notifications }) => {
  const unread = notifications.filter(n => !n.isRead).length;
  const total = notifications.length;

  return (
    <div className="notification-stats">
      <div className="stat-item">
        <span className="value">{unread}</span>
        <span className="label">Unread</span>
      </div>
      <div className="stat-item">
        <span className="value">{total}</span>
        <span className="label">Total History</span>
      </div>
    </div>
  );
};

export default NotificationStats;
