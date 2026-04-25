import { useEffect, useState } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar,
  User,
  MapPin,
  Users,
  Loader2,
  Trash2,
  MessageSquare,
  Ban
} from 'lucide-react'
import Swal from 'sweetalert2'
import { api } from '../lib/api'

const BookingManagement = ({ mode = 'my' }) => { // 'my' or 'all'
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [rejectionModal, setRejectionModal] = useState({ open: false, bookingId: '', reason: '' })

  const fetchBookings = async () => {
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
  }

  useEffect(() => {
    fetchBookings()
  }, [mode])

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/bookings/${id}/approve`)
      Swal.fire({
        icon: 'success',
        title: 'Booking Approved',
        timer: 1500,
        showConfirmButton: false
      })
      fetchBookings()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: 'Failed to approve booking.'
      })
    }
  }

  const handleReject = async () => {
    try {
      await api.put(`/api/bookings/${rejectionModal.bookingId}/reject`, { reason: rejectionModal.reason })
      setRejectionModal({ open: false, bookingId: '', reason: '' })
      Swal.fire({
        icon: 'success',
        title: 'Booking Rejected',
        timer: 1500,
        showConfirmButton: false
      })
      fetchBookings()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: 'Failed to reject booking.'
      })
    }
  }

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to cancel this booking?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    })

    if (result.isConfirmed) {
      try {
        await api.put(`/api/bookings/${id}/cancel`)
        Swal.fire(
          'Cancelled!',
          'Your booking has been cancelled.',
          'success'
        )
        fetchBookings()
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Cancellation Failed',
          text: 'Failed to cancel booking.'
        })
      }
    }
  }

  const getStatusBadge = (status) => {
    const badgeStyle = { position: 'static', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }
    switch (status) {
      case 'APPROVED':
        return <span className="status-badge status-active" style={badgeStyle}><CheckCircle2 size={14} /> Approved</span>
      case 'REJECTED':
        return <span className="status-badge status-out_of_service" style={badgeStyle}><XCircle size={14} /> Rejected</span>
      case 'CANCELLED':
        return <span className="status-badge" style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}><Ban size={14} /> Cancelled</span>
      default:
        return <span className="status-badge" style={{ ...badgeStyle, backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}><Clock size={14} /> Pending</span>
    }
  }

  const filteredBookings = bookings.filter(b => {
    const search = searchQuery.toLowerCase()
    const matchesSearch = 
      (b.purpose?.toLowerCase() || '').includes(search) || 
      (b.facilityName?.toLowerCase() || '').includes(search) ||
      (b.userName?.toLowerCase() || '').includes(search)
    
    const matchesStatus = statusFilter === '' || b.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#1167cc' }} />
        <p style={{ marginTop: '1rem' }}>Loading reservations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-message" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertTriangle size={48} style={{ margin: '0 auto 1rem' }} />
        <p>{error}</p>
        <button className="primary-btn" onClick={fetchBookings} style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    )
  }

  return (
    <div className="booking-management">
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h2>{mode === 'my' ? 'My Reservations' : 'Manage Booking Requests'}</h2>
        <p style={{ color: '#526f81' }}>
          {mode === 'my' ? 'Track your upcoming and past resource requests.' : 'Review, approve, or reject reservation requests from campus users.'}
        </p>
      </div>

      <div className="manage-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '250px' }}>
          <Search className="search-icon" size={20} />
          <input 
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
      </div>

      <div className="bookings-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="booking-card" style={{ 
            backgroundColor: '#fff', 
            borderRadius: '12px', 
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #eef2f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div className="booking-info" style={{ display: 'flex', gap: '1.5rem' }}>
              <div className="booking-date-box" style={{ 
                backgroundColor: '#f8fafc', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                textAlign: 'center',
                minWidth: '80px'
              }}>
                <Calendar size={20} style={{ color: '#1167cc', marginBottom: '0.25rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(booking.date).getFullYear()}</div>
              </div>

              <div className="booking-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {getStatusBadge(booking.status)}
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{booking.purpose}</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#526f81' }}>
                    <MapPin size={14} /> {booking.facilityName}
                  </div>
                  {booking.expectedAttendees && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#526f81' }}>
                      <Users size={14} /> {booking.expectedAttendees} Attendees
                    </div>
                  )}
                  {mode === 'all' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#526f81' }}>
                      <User size={14} /> Requested by: {booking.userName}
                    </div>
                  )}
                </div>
                {booking.status === 'REJECTED' && booking.rejectionReason && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.5rem 0.75rem', 
                    backgroundColor: '#fff1f2', 
                    color: '#e11d48',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <MessageSquare size={14} /> <strong>Reason:</strong> {booking.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            <div className="booking-actions" style={{ display: 'flex', gap: '0.5rem' }}>
              {mode === 'all' && booking.status === 'PENDING' && (
                <>
                  <button className="primary-btn" onClick={() => handleApprove(booking.id)} style={{ padding: '0.5rem 1rem' }}>Approve</button>
                  <button className="ghost-btn" onClick={() => setRejectionModal({ open: true, bookingId: booking.id, reason: '' })} style={{ padding: '0.5rem 1rem', color: '#e11d48' }}>Reject</button>
                </>
              )}
              {mode === 'my' && booking.status === 'PENDING' && (
                <button className="ghost-btn" onClick={() => handleCancel(booking.id)} style={{ color: '#e11d48' }}><Trash2 size={18} /></button>
              )}
              {booking.status === 'APPROVED' && (
                 <button className="ghost-btn" onClick={() => handleCancel(booking.id)} style={{ color: '#64748b', fontSize: '0.85rem' }}>Cancel Booking</button>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p style={{ color: '#64748b' }}>No bookings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectionModal.open && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Reject Booking</h2>
              <button className="close-btn" onClick={() => setRejectionModal({ ...rejectionModal, open: false })}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Reason for Rejection</label>
                <textarea 
                  value={rejectionModal.reason} 
                  onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                  placeholder="Explain why this request is being rejected..."
                  style={{ minHeight: '100px' }}
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="ghost-btn" onClick={() => setRejectionModal({ ...rejectionModal, open: false })}>Cancel</button>
              <button className="primary-btn" style={{ backgroundColor: '#e11d48' }} onClick={handleReject} disabled={!rejectionModal.reason.trim()}>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingManagement
