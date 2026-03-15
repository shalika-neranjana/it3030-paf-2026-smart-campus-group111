import React from 'react';
import './IncidentCard.css';

const IncidentCard = ({ incident, onStatusUpdate, onComment }) => {
  const getPriorityClass = (priority) => priority.toLowerCase();
  const getStatusClass = (status) => status.toLowerCase().replace('_', '-');

  return (
    <div className="incident-card">
      <div className="incident-card-header">
        <span className={`priority-tag ${getPriorityClass(incident.priority)}`}>
          {incident.priority}
        </span>
        <span className={`status-tag ${getStatusClass(incident.status)}`}>
          {incident.status}
        </span>
      </div>
      <div className="incident-card-body">
        <h3>{incident.category}</h3>
        <p className="location">📍 {incident.location}</p>
        <p className="description">{incident.description}</p>
      </div>
      <div className="incident-card-footer">
        <div className="technician-info">
          <strong>Assigned to:</strong> {incident.assignedTechnicianId || 'Unassigned'}
        </div>
        <div className="actions">
          <button onClick={() => onStatusUpdate(incident.id)}>Update Status</button>
          <button onClick={() => onComment(incident.id)}>View Comments ({incident.comments?.length || 0})</button>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
