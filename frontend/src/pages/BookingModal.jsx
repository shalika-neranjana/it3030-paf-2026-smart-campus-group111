import { useState } from 'react'
import { X, Calendar, Clock, Users, MessageSquare, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

const BookingModal = ({ isOpen, onClose, facility, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: ''
  })

  if (!isOpen || !facility) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate times
      if (formData.startTime >= formData.endTime) {
        throw new Error('End time must be after start time.')
      }

      const payload = {
        ...formData,
        facilityId: facility.id,
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null
      }

      await api.post('/api/bookings', payload)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit booking request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Reserve Resource</h2>
            <p style={{ fontSize: '0.9rem', color: '#526f81' }}>{facility.name} • {facility.location}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#fff1f2', 
                color: '#e11d48', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid #fda4af'
              }}>
                {error}
              </div>
            )}

            <div className="facility-form" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> Date
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} /> Start Time
                  </label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} /> End Time
                  </label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={formData.endTime} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} /> Expected Attendees
                </label>
                <input 
                  type="number" 
                  name="expectedAttendees" 
                  value={formData.expectedAttendees} 
                  onChange={handleInputChange} 
                  placeholder={`Max capacity: ${facility.capacity}`}
                  max={facility.capacity}
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} /> Purpose of Booking
                </label>
                <textarea 
                  name="purpose" 
                  value={formData.purpose} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Weekly project meeting, Lab session, etc."
                  style={{ minHeight: '80px' }}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="ghost-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : 'Request Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal
