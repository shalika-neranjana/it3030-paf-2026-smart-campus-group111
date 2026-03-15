import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trash2, Edit, Plus, X, Save } from 'lucide-react';
import './ManageFacilities.css';

const ManageFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFacility, setCurrentFacility] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        description: '',
        availabilityWindows: ''
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/facilities');
            setFacilities(response.data);
        } catch (error) {
            console.error('Error fetching facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (facility = null) => {
        if (facility) {
            setCurrentFacility(facility);
            setFormData({
                ...facility,
                availabilityWindows: facility.availabilityWindows?.join(', ') || ''
            });
        } else {
            setCurrentFacility(null);
            setFormData({
                name: '',
                type: 'LECTURE_HALL',
                capacity: '',
                location: '',
                status: 'ACTIVE',
                description: '',
                availabilityWindows: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            availabilityWindows: formData.availabilityWindows.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            if (currentFacility) {
                await api.put(`/api/facilities/${currentFacility.id}`, data);
            } else {
                await api.post('/api/facilities', data);
            }
            setIsModalOpen(false);
            fetchFacilities();
        } catch (error) {
            console.error('Error saving facility:', error);
            alert('Failed to save facility. Check permissions or network.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await api.delete(`/api/facilities/${id}`);
            fetchFacilities();
        } catch (error) {
            console.error('Error deleting facility:', error);
            alert('Failed to delete facility.');
        }
    };

    return (
        <div className="manage-facilities">
            <div className="manage-header">
                <h2>Manage Campus Resources</h2>
                <button className="add-btn" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add New Resource
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading assets...</div>
            ) : (
                <div className="facilities-table-wrapper">
                    <table className="facilities-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilities.map(f => (
                                <tr key={f.id}>
                                    <td>{f.name}</td>
                                    <td>{f.type.replace('_', ' ')}</td>
                                    <td>{f.capacity}</td>
                                    <td>{f.location}</td>
                                    <td>
                                        <span className={`status-pill ${f.status.toLowerCase()}`}>
                                            {f.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="icon-btn edit" onClick={() => handleOpenModal(f)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(f.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{currentFacility ? 'Edit Resource' : 'Add New Resource'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="facility-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Resource Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}>
                                        <option value="LECTURE_HALL">Lecture Hall</option>
                                        <option value="LAB">Laboratory</option>
                                        <option value="MEETING_ROOM">Meeting Room</option>
                                        <option value="EQUIPMENT">Equipment</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input name="location" value={formData.location} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="OUT_OF_SERVICE">Out of Service</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
                            </div>
                            <div className="form-group">
                                <label>Availability Windows (comma separated)</label>
                                <input name="availabilityWindows" value={formData.availabilityWindows} onChange={handleInputChange} placeholder="e.g. 08:00-12:00, 14:00-18:00" />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn"><Save size={18} /> {currentFacility ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFacilities;
