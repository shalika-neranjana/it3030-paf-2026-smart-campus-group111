import React from 'react';
import './ResourceCard.css';

const ResourceCard = ({ resource, onEdit, onDelete }) => {
  return (
    <div className="resource-card">
      <div className="resource-card-header">
        <span className={`status-badge ${resource.status.toLowerCase()}`}>
          {resource.status}
        </span>
        <h3>{resource.name}</h3>
        <p className="resource-type">{resource.type}</p>
      </div>
      <div className="resource-card-body">
        <p><strong>Location:</strong> {resource.location}</p>
        <p><strong>Capacity:</strong> {resource.capacity}</p>
        <p className="description">{resource.description}</p>
      </div>
      <div className="resource-card-actions">
        <button onClick={() => onEdit(resource)} className="btn-edit">Edit</button>
        <button onClick={() => onDelete(resource.id)} className="btn-delete">Delete</button>
      </div>
    </div>
  );
};

export default ResourceCard;
