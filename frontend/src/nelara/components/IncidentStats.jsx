import React from 'react';
import './IncidentStats.css';

const IncidentStats = ({ incidents }) => {
  const openCount = incidents.filter(i => i.status === 'OPEN').length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="incident-stats">
      <div className="stat-box open">
        <span className="count">{openCount}</span>
        <span className="label">Open</span>
      </div>
      <div className="stat-box progress">
        <span className="count">{inProgressCount}</span>
        <span className="label">In Progress</span>
      </div>
      <div className="stat-box resolved">
        <span className="count">{resolvedCount}</span>
        <span className="label">Resolved</span>
      </div>
    </div>
  );
};

export default IncidentStats;
