import React, { useState, useEffect } from 'react';
import './ResourceForm.css';

const ResourceForm = ({ resource, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Lecture Hall',
    capacity: 0,
    location: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (resource) {
      setFormData(resource);
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="resource-form-container">
      <form onSubmit={handleSubmit} className="resource-form">
        <h2>{resource ? 'Edit Resource' : 'Add New Resource'}</h2>
        
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Lab">Lab</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Capacity</label>
            <input 
              type="number" 
              name="capacity" 
              value={formData.capacity} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input 
            type="text" 
            name="location" 
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
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        <div className="form-group">
          <label>Availability Windows</label>
          {formData.availabilityWindows?.map((window, index) => (
            <div key={index} className="availability-row">
              <select 
                value={window.dayOfWeek} 
                onChange={(e) => {
                  const newWindows = [...formData.availabilityWindows];
                  newWindows[index].dayOfWeek = e.target.value;
                  setFormData({...formData, availabilityWindows: newWindows});
                }}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <input 
                type="time" 
                value={window.startTime} 
                onChange={(e) => {
                  const newWindows = [...formData.availabilityWindows];
                  newWindows[index].startTime = e.target.value;
                  setFormData({...formData, availabilityWindows: newWindows});
                }}
              />
              <input 
                type="time" 
                value={window.endTime} 
                onChange={(e) => {
                  const newWindows = [...formData.availabilityWindows];
                  newWindows[index].endTime = e.target.value;
                  setFormData({...formData, availabilityWindows: newWindows});
                }}
              />
              <button 
                type="button" 
                className="btn-remove"
                onClick={() => {
                  const newWindows = formData.availabilityWindows.filter((_, i) => i !== index);
                  setFormData({...formData, availabilityWindows: newWindows});
                }}
              >
                &times;
              </button>
            </div>
          ))}
          <button 
            type="button" 
            className="btn-add-window"
            onClick={() => {
              const newWindows = [...(formData.availabilityWindows || []), { dayOfWeek: 'Monday', startTime: '08:00', endTime: '17:00' }];
              setFormData({...formData, availabilityWindows: newWindows});
            }}
          >
            + Add Availability Window
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {resource ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
