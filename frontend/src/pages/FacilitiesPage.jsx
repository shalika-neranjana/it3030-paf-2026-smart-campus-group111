import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import './FacilitiesPage.css';

const FacilitiesPage = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState({
        type: '',
        minCapacity: '',
        location: ''
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async (params = {}) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (params.type) queryParams.append('type', params.type);
            if (params.minCapacity) queryParams.append('minCapacity', params.minCapacity);
            if (params.location) queryParams.append('location', params.location);

            const response = await api.get(`/api/facilities?${queryParams.toString()}`);
            setFacilities(response.data);
        } catch (error) {
            console.error('Error fetching facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchFacilities(search);
    };

    return (
        <div className="facilities-container">
            <header className="facilities-header">
                <h1>Facilities & Assets Catalogue</h1>
                <p>Explore and book campus resources for your next session.</p>
            </header>

            <section className="search-section">
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <div className="form-group">
                        <label>Resource Type</label>
                        <select name="type" value={search.type} onChange={handleSearchChange}>
                            <option value="">All Types</option>
                            <option value="LECTURE_HALL">Lecture Hall</option>
                            <option value="LAB">Laboratory</option>
                            <option value="MEETING_ROOM">Meeting Room</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Min Capacity</label>
                        <input 
                            type="number" 
                            name="minCapacity" 
                            placeholder="e.g. 50" 
                            value={search.minCapacity} 
                            onChange={handleSearchChange} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input 
                            type="text" 
                            name="location" 
                            placeholder="e.g. Block A" 
                            value={search.location} 
                            onChange={handleSearchChange} 
                        />
                    </div>
                    <button type="submit" className="search-btn">Search</button>
                </form>
            </section>

            <main className="facilities-grid">
                {loading ? (
                    <div className="loader">Loading resources...</div>
                ) : facilities.length > 0 ? (
                    facilities.map(facility => (
                        <div key={facility.id} className="facility-card">
                            <div className="facility-image">
                                <img src={facility.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={facility.name} />
                                <span className={`status-badge ${facility.status.toLowerCase()}`}>
                                    {facility.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="facility-content">
                                <h3>{facility.name}</h3>
                                <div className="facility-meta">
                                    <span><strong>Type:</strong> {facility.type.replace('_', ' ')}</span>
                                    <span><strong>Capacity:</strong> {facility.capacity}</span>
                                    <span><strong>Location:</strong> {facility.location}</span>
                                </div>
                                <p className="facility-description">{facility.description}</p>
                                <div className="availability">
                                    <strong>Availability:</strong>
                                    <ul>
                                        {facility.availabilityWindows && facility.availabilityWindows.map((win, idx) => (
                                            <li key={idx}>{win}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button className="book-btn" disabled={facility.status === 'OUT_OF_SERVICE'}>
                                    {facility.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No facilities found matching your criteria.</div>
                )}
            </main>
        </div>
    );
};

export default FacilitiesPage;
