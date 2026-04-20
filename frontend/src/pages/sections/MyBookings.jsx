import { useEffect, useState } from 'react'
import { CalendarPlus, X } from 'lucide-react'
import { showError, showSuccess } from '../../lib/alerts'
import { cancelBooking, createBooking, getUserBookings } from '../../lib/booking'

const STATUS_COLORS = {
  PENDING: 'status-pending',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
  CANCELLED: 'status-cancelled',
}

const EMPTY_FORM = {
  resourceId: '',
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: '',
}

const MyBookings = ({ userId }) => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const fetchBookings = async () => {
    try {
      const data = await getUserBookings(userId)
      setBookings(data)
    } catch {
      showError('Failed to load bookings', 'Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) fetchBookings()
  }, [userId])

  const validate = () => {
    const errors = {}
    if (!form.resourceId.trim()) errors.resourceId = 'Resource ID is required'
    if (!form.date) errors.date = 'Date is required'
    if (!form.startTime) errors.startTime = 'Start time is required'
    if (!form.endTime) errors.endTime = 'End time is required'
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.endTime = 'End time must be after start time'
    }
    if (!form.purpose.trim()) errors.purpose = 'Purpose is required'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSubmitting(true)

    const attendeesList = form.attendees
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)

    try {
      await createBooking({
        resourceId: form.resourceId.trim(),
        userId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose.trim(),
        attendees: attendeesList,
      })
      await showSuccess('Booking submitted', 'Your booking request is pending approval.')
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchBookings()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not create booking.'
      showError('Booking failed', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id)
      await showSuccess('Booking cancelled', 'Your booking has been cancelled.')
      fetchBookings()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not cancel booking.'
      showError('Cancel failed', msg)
    }
  }

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  return (
    <div className="booking-section">
      <div className="booking-section-header">
        <div>
          <p className="eyebrow">My Bookings</p>
          <h2 className="booking-section-title">Resource Reservations</h2>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          <CalendarPlus size={17} aria-hidden="true" />
          {showForm ? 'Hide Form' : 'New Booking'}
        </button>
      </div>

      {showForm && (
        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          <h3 className="booking-form-title">Create a Booking</h3>

          <div className="booking-form-grid">
            <div className="booking-field">
              <label htmlFor="resourceId">Resource ID</label>
              <input
                id="resourceId"
                name="resourceId"
                value={form.resourceId}
                onChange={onChange}
                placeholder="e.g. room-101"
              />
              {fieldErrors.resourceId && <p className="field-error">{fieldErrors.resourceId}</p>}
            </div>

            <div className="booking-field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={onChange}
                min={new Date().toISOString().slice(0, 10)}
              />
              {fieldErrors.date && <p className="field-error">{fieldErrors.date}</p>}
            </div>

            <div className="booking-field">
              <label htmlFor="startTime">Start Time</label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={onChange}
              />
              {fieldErrors.startTime && <p className="field-error">{fieldErrors.startTime}</p>}
            </div>

            <div className="booking-field">
              <label htmlFor="endTime">End Time</label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={onChange}
              />
              {fieldErrors.endTime && <p className="field-error">{fieldErrors.endTime}</p>}
            </div>

            <div className="booking-field booking-field-full">
              <label htmlFor="purpose">Purpose</label>
              <input
                id="purpose"
                name="purpose"
                value={form.purpose}
                onChange={onChange}
                placeholder="e.g. Team meeting"
              />
              {fieldErrors.purpose && <p className="field-error">{fieldErrors.purpose}</p>}
            </div>

            <div className="booking-field booking-field-full">
              <label htmlFor="attendees">Attendees <span className="label-hint">(comma-separated, optional)</span></label>
              <input
                id="attendees"
                name="attendees"
                value={form.attendees}
                onChange={onChange}
                placeholder="e.g. alice@uni.ac, bob@uni.ac"
              />
            </div>
          </div>

          <div className="booking-form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Booking'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFieldErrors({}) }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="booking-loading">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="booking-empty">You have no bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <p className="booking-resource">{b.resourceId}</p>
                  <p className="booking-meta">{b.date} &nbsp;·&nbsp; {b.startTime} – {b.endTime}</p>
                </div>
                <span className={`booking-status ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span>
              </div>
              <p className="booking-purpose">{b.purpose}</p>
              {b.rejectionReason && (
                <p className="booking-rejection">Reason: {b.rejectionReason}</p>
              )}
              {b.status === 'APPROVED' && (
                <button
                  type="button"
                  className="btn-danger-sm"
                  onClick={() => handleCancel(b.id)}
                >
                  <X size={14} aria-hidden="true" /> Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
