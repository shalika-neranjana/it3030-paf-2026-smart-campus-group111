import React, { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import ResourceForm from '../components/ResourceForm';
import './ResourceManagementPage.css';

const ResourceManagementPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResources = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/resources${query ? `?search=${query}` : ''}`);
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources(searchTerm);
  };

  const handleCreateOrUpdate = async (formData) => {
    const url = formData.id 
      ? `http://localhost:8080/api/resources/${formData.id}`
      : 'http://localhost:8080/api/resources';
    
    const method = formData.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsFormOpen(false);
        setEditingResource(null);
        fetchResources();
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/resources/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchResources();
        }
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const openEditForm = (resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  return (
    <div className="resource-management-page">
      <header className="page-header">
        <h1>Facilities & Assets Catalogue</h1>
        <button className="btn-add" onClick={() => setIsFormOpen(true)}>
          Add New Resource
        </button>
      </header>

      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            onChange={(e) => {
              const type = e.target.value;
              fetchResources(type ? `?type=${type}` : '');
            }}
          >
            <option value="">All Types</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Lab">Lab</option>
            <option value="Meeting Room">Meeting Room</option>
            <option value="Equipment">Equipment</option>
          </select>
          <button type="submit">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading resources...</div>
      ) : (
        <div className="resource-grid">
          {resources.length > 0 ? (
            resources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="no-resources">No resources found.</div>
          )}
        </div>
      )}

      {isFormOpen && (
        <ResourceForm 
          resource={editingResource} 
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
};

export default ResourceManagementPage;
