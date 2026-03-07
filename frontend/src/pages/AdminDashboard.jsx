import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats({
      totalUsers: 150,
      activeSessions: 12,
      serverStatus: 'Healthy'
    });
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <span className="eyebrow">Admin Only</span>
        <h1>Administrator Control Panel</h1>
        <p className="subtitle">Manage system settings and view global statistics.</p>
        
        {stats && (
          <div className="feature-strip">
            <div className="feature-card">
              <h2>Total Users</h2>
              <p>{stats.totalUsers}</p>
            </div>
            <div className="feature-card">
              <h2>Active Sessions</h2>
              <p>{stats.activeSessions}</p>
            </div>
            <div className="feature-card">
              <h2>Server Status</h2>
              <p>{stats.serverStatus}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
