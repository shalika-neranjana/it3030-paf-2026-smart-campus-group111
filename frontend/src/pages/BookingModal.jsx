import { useState } from 'react'
import { Calendar, Clock, Loader2, MessageSquare, Users } from 'lucide-react'
import { api } from '../lib/api'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Modal from '../components/ui/Modal'

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
    <Modal
      title="Reserve Resource"
      subtitle={`${facility.name}${facility.building ? ` • ${facility.building}` : ''}`}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="booking-request-form" disabled={loading}>
            {loading ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : 'Request Booking'}
          </Button>
        </>
      }
    >
      <form id="booking-request-form" onSubmit={handleSubmit}>
        {error ? <div className="booking-form-error">{error}</div> : null}

        <div className="ui-field-grid">
          <FormField
            label="Date"
            htmlFor="booking-date"
            required
            labelContent={
              <>
                <Calendar size={16} className="ui-label-icon" />
                <span>Date</span>
              </>
            }
          >
            <input
              className="ui-input"
              id="booking-date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </FormField>

          <div className="ui-field-grid ui-field-grid--two">
            <FormField
              label="Start Time"
              htmlFor="booking-start"
              required
              labelContent={
                <>
                  <Clock size={16} className="ui-label-icon" />
                  <span>Start Time</span>
                </>
              }
            >
              <input
                className="ui-input"
                id="booking-start"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </FormField>
            <FormField
              label="End Time"
              htmlFor="booking-end"
              required
              labelContent={
                <>
                  <Clock size={16} className="ui-label-icon" />
                  <span>End Time</span>
                </>
              }
            >
              <input
                className="ui-input"
                id="booking-end"
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </FormField>
          </div>

          <FormField
            label="Expected Attendees"
            htmlFor="booking-attendees"
            required
            hint={`Capacity: ${facility.capacity}`}
            labelContent={
              <>
                <Users size={16} className="ui-label-icon" />
                <span>Expected Attendees</span>
              </>
            }
          >
            <input
              className="ui-input"
              id="booking-attendees"
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleInputChange}
              placeholder={`Max capacity: ${facility.capacity}`}
              max={facility.capacity}
              required
            />
          </FormField>

          <FormField
            label="Purpose of Booking"
            htmlFor="booking-purpose"
            required
            labelContent={
              <>
                <MessageSquare size={16} className="ui-label-icon" />
                <span>Purpose of Booking</span>
              </>
            }
          >
            <textarea
              className="ui-textarea"
              id="booking-purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="e.g. Weekly project meeting, lab session, or seminar"
              required
            ></textarea>
          </FormField>
        </div>
      </form>
    </Modal>
  )
}

export default BookingModal
