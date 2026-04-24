import React, { useState } from 'react';
import './IncidentForm.css';

const IncidentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    category: 'Plumbing',
    priority: 'MEDIUM',
    location: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="incident-form-overlay">
      <form onSubmit={handleSubmit} className="incident-form">
        <h2>Report an Incident</h2>
        
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="IT">IT Infrastructure</option>
            <option value="Furniture">Furniture/Carpentry</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <div className="priority-options">
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
              <label key={p} className={`priority-label ${p.toLowerCase()}`}>
                <input 
                  type="radio" 
                  name="priority" 
                  value={p} 
                  checked={formData.priority === p}
                  onChange={handleChange}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input 
            type="text" 
            name="location" 
            placeholder="e.g., Room 302, Building B"
            value={formData.location} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows="4"
            required
            placeholder="Describe the issue in detail..."
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-report">Submit Ticket</button>
          <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;
