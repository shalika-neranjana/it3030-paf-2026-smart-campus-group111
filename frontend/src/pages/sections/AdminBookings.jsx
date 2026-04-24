import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { showError, showSuccess } from '../../lib/alerts'
import { approveBooking, getAllBookings, rejectBooking } from '../../lib/booking'

const STATUS_COLORS = {
  PENDING: 'status-pending',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
  CANCELLED: 'status-cancelled',
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ resourceId: '', userId: '', date: '', status: '' })
  const [rejectModal, setRejectModal] = useState(null) // { id }
  const [rejectReason, setRejectReason] = useState('')
  const [actionInProgress, setActionInProgress] = useState(null)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await getAllBookings({
        resourceId: filters.resourceId || undefined,
        userId: filters.userId || undefined,
        date: filters.date || undefined,
        status: filters.status || undefined,
      })
      setBookings(data)
    } catch {
      showError('Failed to load bookings', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const onFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleApprove = async (id) => {
    setActionInProgress(id)
    try {
      await approveBooking(id)
      await showSuccess('Approved', 'The booking has been approved.')
      fetchBookings()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not approve booking.'
      showError('Approval failed', msg)
    } finally {
      setActionInProgress(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectModal) return
    setActionInProgress(rejectModal.id)
    try {
      await rejectBooking(rejectModal.id, rejectReason)
      await showSuccess('Rejected', 'The booking has been rejected.')
      setRejectModal(null)
      setRejectReason('')
      fetchBookings()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not reject booking.'
      showError('Rejection failed', msg)
    } finally {
      setActionInProgress(null)
    }
  }

  return (
    <div className="booking-section">
      <div className="booking-section-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2 className="booking-section-title">Booking Requests</h2>
        </div>
        <button type="button" className="btn-primary" onClick={fetchBookings}>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="booking-filters">
        <input
          name="resourceId"
          value={filters.resourceId}
          onChange={onFilterChange}
          placeholder="Filter by Resource ID"
          className="booking-filter-input"
        />
        <input
          name="userId"
          value={filters.userId}
          onChange={onFilterChange}
          placeholder="Filter by User ID"
          className="booking-filter-input"
        />
        <input
          name="date"
          type="date"
          value={filters.date}
          onChange={onFilterChange}
          className="booking-filter-input"
        />
        <select
          name="status"
          value={filters.status}
          onChange={onFilterChange}
          className="booking-filter-input"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button type="button" className="btn-primary" onClick={fetchBookings}>
          Apply
        </button>
      </div>

      {loading ? (
        <p className="booking-loading">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="booking-empty">No bookings found.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <p className="booking-resource">{b.resourceId}</p>
                  <p className="booking-meta">
                    User: {b.userId} &nbsp;·&nbsp; {b.date} &nbsp;·&nbsp; {b.startTime} – {b.endTime}
                  </p>
                </div>
                <span className={`booking-status ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span>
              </div>

              <p className="booking-purpose">{b.purpose}</p>

              {b.attendees?.length > 0 && (
                <p className="booking-meta">Attendees: {b.attendees.join(', ')}</p>
              )}

              {b.rejectionReason && (
                <p className="booking-rejection">Rejection reason: {b.rejectionReason}</p>
              )}

              {b.status === 'PENDING' && (
                <div className="booking-actions">
                  <button
                    type="button"
                    className="btn-success-sm"
                    disabled={actionInProgress === b.id}
                    onClick={() => handleApprove(b.id)}
                  >
                    <Check size={14} aria-hidden="true" /> Approve
                  </button>
                  <button
                    type="button"
                    className="btn-danger-sm"
                    disabled={actionInProgress === b.id}
                    onClick={() => { setRejectModal({ id: b.id }); setRejectReason('') }}
                  >
                    <X size={14} aria-hidden="true" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="booking-modal-backdrop" role="dialog" aria-modal="true" aria-label="Reject booking">
          <div className="booking-modal">
            <h3>Reject Booking</h3>
            <p>Provide a reason for rejection (optional).</p>
            <textarea
              className="booking-modal-textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Resource unavailable on this date"
            />
            <div className="booking-form-actions">
              <button
                type="button"
                className="btn-danger"
                disabled={actionInProgress === rejectModal.id}
                onClick={handleRejectSubmit}
              >
                {actionInProgress === rejectModal.id ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setRejectModal(null); setRejectReason('') }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings
