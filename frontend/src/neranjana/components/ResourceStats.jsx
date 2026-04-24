import React from 'react';
import './ResourceStats.css';

const ResourceStats = ({ resources }) => {
  const total = resources.length;
  const active = resources.filter(r => r.status === 'ACTIVE').length;
  const outOfService = total - active;

  return (
    <div className="resource-stats">
      <div className="stat-card">
        <span className="stat-label">Total Resources</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Active</span>
        <span className="stat-value">{active}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Out of Service</span>
        <span className="stat-value">{outOfService}</span>
      </div>
    </div>
  );
};

export default ResourceStats;
