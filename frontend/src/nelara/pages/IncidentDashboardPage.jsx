import React, { useState, useEffect } from 'react';
import IncidentCard from '../components/IncidentCard';
import IncidentForm from '../components/IncidentForm';
import './IncidentDashboardPage.css';

const IncidentDashboardPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/incidents');
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreate = async (formData) => {
    try {
      const response = await fetch('http://localhost:8080/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsFormOpen(false);
        fetchIncidents();
      }
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  const handleStatusUpdate = async (id) => {
    const status = prompt('Enter new status (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED):');
    if (!status) return;
    
    try {
      await fetch(`http://localhost:8080/api/incidents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchIncidents();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="incident-dashboard">
      <header className="page-header">
        <h1>Maintenance & Incidents</h1>
        <button className="btn-report" onClick={() => setIsFormOpen(true)}>
          Report Issue
        </button>
      </header>

      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : (
        <div className="incident-grid">
          {incidents.length > 0 ? (
            incidents.map(incident => (
              <IncidentCard 
                key={incident.id} 
                incident={incident} 
                onStatusUpdate={handleStatusUpdate}
                onComment={() => {}}
              />
            ))
          ) : (
            <div className="no-tickets">No maintenance tickets found.</div>
          )}
        </div>
      )}

      {isFormOpen && (
        <IncidentForm 
          onSubmit={handleCreate} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default IncidentDashboardPage;
