import { useCallback, useEffect, useState } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Calendar,
  User,
  MapPin,
  Users,
  Loader2,
  Trash2,
  MessageSquare,
  Ban
} from 'lucide-react'
import { api } from '../lib/api'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { extractErrorMessage, showConfirm, showError, showSuccess } from '../lib/alerts'

const BookingManagement = ({ mode = 'my' }) => { // 'my' or 'all'
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [facilityFilter, setFacilityFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [rejectionModal, setRejectionModal] = useState({ open: false, bookingId: '', reason: '' })
  const [facilities, setFacilities] = useState([])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = mode === 'my' ? '/api/bookings/my' : '/api/bookings'
      const { data } = await api.get(endpoint)
      setBookings(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load bookings.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [mode])

  const fetchFacilities = useCallback(async () => {
    try {
      const { data } = await api.get('/api/facilities')
      setFacilities(data)
    } catch (err) {
      console.error('Failed to load facilities for filters', err)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
    fetchFacilities()
  }, [fetchBookings])

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/bookings/${id}/approve`)
      await showSuccess('Booking Approved', 'The booking request is now approved.', {
        timer: 1500,
        showConfirmButton: false,
      })
      fetchBookings()
    } catch (err) {
      await showError('Approval Failed', extractErrorMessage(err, 'Failed to approve booking.'))
    }
  }

  const handleReject = async () => {
    try {
      await api.put(`/api/bookings/${rejectionModal.bookingId}/reject`, { reason: rejectionModal.reason })
      setRejectionModal({ open: false, bookingId: '', reason: '' })
      await showSuccess('Booking Rejected', 'The requester will now see the rejection reason.', {
        timer: 1500,
        showConfirmButton: false,
      })
      fetchBookings()
    } catch (err) {
      await showError('Rejection Failed', extractErrorMessage(err, 'Failed to reject booking.'))
    }
  }

  const handleCancel = async (id) => {
    const result = await showConfirm('Cancel Booking?', 'Do you really want to cancel this booking?', 'Cancel Booking')

    if (result.isConfirmed) {
      try {
        await api.put(`/api/bookings/${id}/cancel`)
        await showSuccess('Booking Cancelled', 'Your booking has been cancelled.', {
          timer: 1500,
          showConfirmButton: false,
        })
        fetchBookings()
      } catch (err) {
        await showError('Cancellation Failed', extractErrorMessage(err, 'Failed to cancel booking.'))
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <StatusBadge status="APPROVED" icon={CheckCircle2} />
      case 'REJECTED':
        return <StatusBadge status="REJECTED" icon={XCircle} />
      case 'CANCELLED':
        return <StatusBadge status="CANCELLED" icon={Ban} />
      default:
        return <StatusBadge status="PENDING" icon={Clock} />
    }
  }

  const filteredBookings = bookings.filter(b => {
    const search = searchQuery.toLowerCase()
    const matchesSearch = 
      (b.purpose?.toLowerCase() || '').includes(search) || 
      (b.facilityName?.toLowerCase() || '').includes(search) ||
      (b.userName?.toLowerCase() || '').includes(search)
    
    const matchesStatus = statusFilter === '' || b.status === statusFilter
    const matchesFacility = facilityFilter === '' || b.facilityId === facilityFilter
    const bookingDate = b.date ? new Date(b.date) : null
    const fromOk = !dateFrom || (bookingDate && bookingDate >= new Date(dateFrom))
    const toOk = !dateTo || (bookingDate && bookingDate <= new Date(dateTo))
    return matchesSearch && matchesStatus
      && matchesFacility && fromOk && toOk
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (loading) {
    return (
      <div className="ui-feedback">
        <Loader2 className="animate-spin loading-spinner-icon" size={32} />
        <p>Loading reservations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ui-feedback ui-feedback--error">
        <AlertTriangle size={48} />
        <p>{error}</p>
        <Button onClick={fetchBookings}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="booking-management">
      <div className="ui-section-copy booking-section-copy">
        <h2>{mode === 'my' ? 'My Reservations' : 'Manage Booking Requests'}</h2>
        <p>
          {mode === 'my' ? 'Track your upcoming and past resource requests.' : 'Review, approve, or reject reservation requests from campus users.'}
        </p>
      </div>

      <div className="manage-controls ui-filter-row">
        <div className="search-box booking-search-box">
          <Search className="search-icon" size={20} />
          <input 
            className="ui-input"
            type="text" 
            placeholder="Search by purpose or resource..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          className="filter-select" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          className="filter-select"
          value={facilityFilter}
          onChange={(e) => setFacilityFilter(e.target.value)}
        >
          <option value="">All Resources</option>
          {facilities.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <input
          type="date"
          className="filter-select filter-select-compact"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          className="filter-select filter-select-compact"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To"
        />
      </div>

      <div className="bookings-list booking-list">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-info">
              <div className="booking-date-box">
                <Calendar size={20} className="booking-date-icon" />
                <div className="booking-date-value">{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                <div className="booking-date-year">{new Date(booking.date).getFullYear()}</div>
              </div>

              <div className="booking-details">
                <div className="booking-meta-row">
                  {getStatusBadge(booking.status)}
                  <span className="booking-time">
                    <Clock size={14} /> {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <h3 className="booking-title">{booking.purpose}</h3>
                <div className="booking-detail-row">
                  <div className="booking-detail-chip">
                    <MapPin size={14} /> {booking.facilityName}
                  </div>
                  {booking.expectedAttendees && (
                    <div className="booking-detail-chip">
                      <Users size={14} /> {booking.expectedAttendees} Attendees
                    </div>
                  )}
                  {mode === 'all' && (
                    <div className="booking-detail-chip">
                      <User size={14} /> Requested by: {booking.userName}
                    </div>
                  )}
                </div>
                {booking.status === 'REJECTED' && booking.rejectionReason && (
                  <div className="booking-rejection-note">
                    <MessageSquare size={14} /> <strong>Reason:</strong> {booking.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            <div className="booking-actions">
              {mode === 'all' && booking.status === 'PENDING' && (
                <>
                  <Button onClick={() => handleApprove(booking.id)}>Approve</Button>
                  <Button variant="danger" onClick={() => setRejectionModal({ open: true, bookingId: booking.id, reason: '' })}>Reject</Button>
                </>
              )}
              {mode === 'my' && booking.status === 'PENDING' && (
                <Button variant="danger" iconOnly onClick={() => handleCancel(booking.id)}><Trash2 size={18} /></Button>
              )}
              {booking.status === 'APPROVED' && (
                <Button variant="secondary" onClick={() => handleCancel(booking.id)}>Cancel Booking</Button>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="ui-feedback ui-feedback-card">
            <AlertTriangle size={48} className="ui-feedback-icon" />
            <p>No bookings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectionModal.open && (
        <Modal
          title="Reject Booking"
          subtitle="Provide a short explanation so the requester understands what needs to change."
          size="sm"
          onClose={() => setRejectionModal({ ...rejectionModal, open: false })}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRejectionModal({ ...rejectionModal, open: false })}>Cancel</Button>
              <Button variant="danger" onClick={handleReject} disabled={!rejectionModal.reason.trim()}>
                Reject Request
              </Button>
            </>
          }
        >
          <FormField label="Reason for Rejection" htmlFor="rejection-reason" required>
            <textarea
              className="ui-textarea"
              id="rejection-reason"
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              placeholder="Explain why this request is being rejected..."
              required
            ></textarea>
          </FormField>
        </Modal>
      )}
    </div>
  )
}

export default BookingManagement
