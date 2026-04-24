import { useEffect, useState } from 'react'
import {
  Inbox,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CreditCard,
  MessageSquare,
  Megaphone,
  Search,
  Shield,
  ChevronRight,
  Bell,
  FileText,
  CheckCheck,
  Pencil,
  Plus,
  Wrench,
  X,
} from 'lucide-react'
import { api } from '../lib/api'
import Swal from 'sweetalert2'
import '../styles/NotificationsPage.css'

const NOTIFICATION_TYPES = {
  BOOKING_APPROVED: {
    label: 'Booking Approved',
    icon: CheckCircle,
    color: 'success',
    bg: '#d1fae5',
    border: '#10b981',
    description: 'Confirm approved reservations and let users know their booking is ready.',
  },
  BOOKING_REJECTED: {
    label: 'Booking Rejected',
    icon: AlertCircle,
    color: 'error',
    bg: '#fee2e2',
    border: '#ef4444',
    description: 'Explain declined booking requests and point users toward next steps.',
  },
  TICKET_UPDATED: {
    label: 'Ticket Updated',
    icon: FileText,
    color: 'info',
    bg: '#dbeafe',
    border: '#3b82f6',
    description: 'Share progress, status changes, or technician notes on support tickets.',
  },
  NEW_COMMENT: {
    label: 'New Comment',
    icon: MessageSquare,
    color: 'warning',
    bg: '#fef3c7',
    border: '#f59e0b',
    description: 'Notify users when someone has replied or left a new comment for them.',
  },
  BOOKING_PENDING: {
    label: 'Booking Pending',
    icon: Clock,
    color: 'pending',
    bg: '#e0e7ff',
    border: '#6366f1',
    description: 'Waiting list updates, approval queues, and pending room requests.',
  },
  MAINTENANCE_UPDATE: {
    label: 'Maintenance Update',
    icon: Wrench,
    color: 'info',
    bg: '#dbeafe',
    border: '#2563eb',
    description: 'Repairs, service progress, and equipment restoration updates.',
  },
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: Megaphone,
    color: 'warning',
    bg: '#fef3c7',
    border: '#d97706',
    description: 'General campus notices, admin messages, and broad communications.',
  },
  EVENT_REMINDER: {
    label: 'Event Reminder',
    icon: Calendar,
    color: 'pending',
    bg: '#ede9fe',
    border: '#7c3aed',
    description: 'Upcoming events, deadlines, workshops, or scheduled activities.',
  },
  PAYMENT_REMINDER: {
    label: 'Payment Reminder',
    icon: CreditCard,
    color: 'error',
    bg: '#fee2e2',
    border: '#dc2626',
    description: 'Fees due, invoice reminders, and payment follow-ups.',
  },
  SECURITY_NOTICE: {
    label: 'Security Notice',
    icon: Shield,
    color: 'info',
    bg: '#dbeafe',
    border: '#1d4ed8',
    description: 'Access changes, security checks, and account safety alerts.',
  },
  SYSTEM_ALERT: {
    label: 'System Alert',
    icon: AlertTriangle,
    color: 'error',
    bg: '#fee2e2',
    border: '#b91c1c',
    description: 'Urgent platform incidents, outages, or system-level disruptions.',
  },
}

const DEFAULT_NOTIFICATION_TYPE = 'BOOKING_PENDING'

const createFormState = (notification) => {
  const type = notification?.type && NOTIFICATION_TYPES[notification.type] ? notification.type : DEFAULT_NOTIFICATION_TYPE
  const resource = notification?.resource ?? ''
  const title = notification?.title ?? getNotificationTitle(type, resource)

  return {
    type,
    title,
    resource,
    message: notification?.message ?? '',
    isRead: Boolean(notification?.isRead),
  }
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'BOOKING_APPROVED',
    title: 'Booking Approved',
    message: 'Your booking for "Lecture Hall A" on April 25, 2026 from 10:00 AM to 12:00 PM has been approved.',
    resource: 'Lecture Hall A',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'TICKET_UPDATED',
    title: 'Support Ticket #2045 Updated',
    message: 'Your maintenance ticket for the projector in Lab B has been marked as IN_PROGRESS.',
    resource: 'Lab B - Projector',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    type: 'NEW_COMMENT',
    title: 'New Comment on Ticket #2045',
    message: 'John Doe added a comment: "Found the issue, replacing the lamp now."',
    resource: 'Ticket #2045',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
]

const isAdminRole = (role) => {
  if (!role) return false
  return role.toUpperCase() === 'ADMINISTRATOR'
}

const normalizeNotification = (notification) => ({
  id: String(notification.id),
  type: notification.type,
  title: notification.title ?? 'Notification',
  message: notification.message ?? '',
  resource: notification.resource ?? 'General',
  timestamp: notification.timestamp ?? new Date().toISOString(),
  isRead: Boolean(notification.isRead),
})

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('authUser')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

const getNotificationTitle = (type, resource = '') => {
  const typeLabel = NOTIFICATION_TYPES[type]?.label ?? 'Notification'
  const trimmedResource = resource.trim()

  return trimmedResource ? `${typeLabel}: ${trimmedResource}` : typeLabel
}

const validateNotificationForm = (formData) => {
  const errors = {}

  if (!formData.type) {
    errors.type = 'Please choose a notification type.'
  }

  if (!formData.resource.trim()) {
    errors.resource = 'Resource is required.'
  }

  if (!formData.title.trim()) {
    errors.title = 'Title is required.'
  } else if (formData.title.trim().length < 6) {
    errors.title = 'Title should be at least 6 characters long.'
  }

  if (!formData.message.trim()) {
    errors.message = 'Message is required.'
  } else if (formData.message.trim().length < 12) {
    errors.message = 'Message should be at least 12 characters long.'
  }

  return errors
}

const getApiErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage

const buildOptimisticNotification = (payload) => ({
  id: `local-${Date.now()}`,
  type: payload.type,
  title: payload.title,
  message: payload.message,
  resource: payload.resource,
  timestamp: new Date().toISOString(),
  isRead: Boolean(payload.isRead),
})

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [user, setUser] = useState(getStoredUser)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNotificationId, setEditingNotificationId] = useState(null)
  const [formData, setFormData] = useState(() => createFormState())
  const [formErrors, setFormErrors] = useState({})
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false)
  const [toast, setToast] = useState(null)

  const isAdmin = isAdminRole(user?.role)

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser())
    window.addEventListener('storage', syncUser)
    window.addEventListener('auth-changed', syncUser)

    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('auth-changed', syncUser)
    }
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/api/notifications')
        const incoming = Array.isArray(data) ? data : data?.content ?? []
        const normalized = incoming.map(normalizeNotification)
        setNotifications(normalized)
        setFilteredNotifications(normalized)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        setNotifications(MOCK_NOTIFICATIONS)
        setFilteredNotifications(MOCK_NOTIFICATIONS)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  useEffect(() => {
    let filtered = notifications

    if (filterType !== 'all') {
      filtered = filtered.filter((notification) => notification.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((notification) =>
        filterStatus === 'unread' ? !notification.isRead : notification.isRead
      )
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query) ||
          notification.resource.toLowerCase().includes(query)
      )
    }

    setFilteredNotifications(filtered)
  }, [notifications, searchQuery, filterType, filterStatus])

  const upsertNotification = (updatedNotification) => {
    setNotifications((prev) => {
      const exists = prev.some((notification) => notification.id === updatedNotification.id)
      if (exists) {
        return prev.map((notification) =>
          notification.id === updatedNotification.id ? updatedNotification : notification
        )
      }

      return [updatedNotification, ...prev]
    })
    setSelectedNotification(updatedNotification)
  }

  const showToast = (variant, title, message) => {
    setToast({ variant, title, message })
    window.clearTimeout(showToast.timeoutId)
    showToast.timeoutId = window.setTimeout(() => setToast(null), 2600)
  }

  const resetEditor = () => {
    setIsEditorOpen(false)
    setEditingNotificationId(null)
    setFormData(createFormState())
    setFormErrors({})
    setIsSubmittingForm(false)
    setIsTitleManuallyEdited(false)
  }

  const openCreateNotificationForm = () => {
    setEditingNotificationId(null)
    setFormData(createFormState())
    setFormErrors({})
    setIsTitleManuallyEdited(false)
    setIsEditorOpen(true)
  }

  const openEditNotificationForm = (notification) => {
    setEditingNotificationId(notification.id)
    setFormData(createFormState(notification))
    setFormErrors({})
    setIsTitleManuallyEdited(true)
    setIsEditorOpen(true)
  }

  const handleTypeSelect = (type) => {
    setFormErrors((prev) => ({ ...prev, type: undefined }))
    setFormData((prev) => ({
      ...prev,
      type,
      title: isTitleManuallyEdited ? prev.title : getNotificationTitle(type, prev.resource),
    }))
  }

  const handleResourceChange = (value) => {
    setFormErrors((prev) => ({ ...prev, resource: undefined }))
    setFormData((prev) => ({
      ...prev,
      resource: value,
      title: isTitleManuallyEdited ? prev.title : getNotificationTitle(prev.type, value),
    }))
  }

  const handleTitleChange = (value) => {
    const suggestedTitle = getNotificationTitle(formData.type, formData.resource)
    setIsTitleManuallyEdited(value.trim() !== '' && value.trim() !== suggestedTitle)
    setFormErrors((prev) => ({ ...prev, title: undefined }))
    setFormData((prev) => ({
      ...prev,
      title: value,
    }))
  }

  const handleMessageChange = (value) => {
    setFormErrors((prev) => ({ ...prev, message: undefined }))
    setFormData((prev) => ({
      ...prev,
      message: value,
    }))
  }

  const submitNotificationForm = async (event) => {
    event.preventDefault()
    const errors = validateNotificationForm(formData)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = {
      type: formData.type,
      title: formData.title.trim(),
      resource: formData.resource.trim(),
      message: formData.message.trim(),
      isRead: formData.isRead,
    }

    if (!editingNotificationId) {
      const optimisticNotification = buildOptimisticNotification(payload)
      upsertNotification(optimisticNotification)
      resetEditor()
      showToast('success', 'Notification created', 'The notification was added successfully.')

      api
        .post('/api/notifications', payload)
        .then(({ data }) => {
          const created = normalizeNotification(data)
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === optimisticNotification.id ? created : notification
            )
          )
          setSelectedNotification((prev) =>
            prev?.id === optimisticNotification.id ? created : prev
          )
        })
        .catch((error) => {
          console.error('Failed to persist notification:', error)
        })

      return
    }

    setIsSubmittingForm(true)

    try {
      const { data } = await api.put(`/api/notifications/${editingNotificationId}`, payload)
      const updated = normalizeNotification(data)
      upsertNotification(updated)
      resetEditor()
      showToast('success', 'Notification updated', 'Your changes were saved.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update notification.')
      console.error('Failed to update notification:', error)
      showToast('error', 'Update failed', message)
    } finally {
      setIsSubmittingForm(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      const { data } = await api.patch(`/api/notifications/${id}/read`)
      const updated = normalizeNotification(data)
      upsertNotification(updated)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      )
    }
  }

  const deleteNotification = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Notification',
      text: 'Are you sure you want to delete this notification?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      await api.delete(`/api/notifications/${id}`)
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      setSelectedNotification((prev) => (prev?.id === id ? null : prev))
      Swal.fire('Deleted', 'Notification has been deleted.', 'success')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      Swal.fire('Error', 'Failed to delete notification.', 'error')
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all')
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      Swal.fire('Error', 'Failed to mark all messages as read.', 'error')
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification)
  }

  const formatTime = (date) => {
    const now = new Date()
    const timestamp = new Date(date)
    const diffMs = now - timestamp
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return timestamp.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      {toast && (
        <div className={`notification-toast ${toast.variant}`}>
          <div className="notification-toast-accent"></div>
          <div className="notification-toast-body">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
          <button className="notification-toast-close" onClick={() => setToast(null)} aria-label="Close notification">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="notifications-container">
        <div className="notifications-header">
          <div className="notifications-title">
            <Bell className="notifications-icon" size={28} />
            <div>
              <h1>{isAdmin ? 'Manage Notifications' : 'Inbox Messages'}</h1>
              <p className="notifications-subtitle">
                {isAdmin
                  ? 'Administrators can create, edit, and delete notifications.'
                  : `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div className="notifications-header-actions">
            {!isAdmin && unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                <CheckCheck size={18} />
                Mark all as read
              </button>
            )}
            {isAdmin && (
              <button className="mark-all-btn create-btn" onClick={openCreateNotificationForm}>
                <Plus size={18} />
                Create notification
              </button>
            )}
          </div>
        </div>

        <div className="notifications-controls">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-group">
            <div className="filter-item">
              <label htmlFor="type-filter">Type:</label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                {Object.entries(NOTIFICATION_TYPES).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="filter-select"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>

        <div className="notifications-content">
          <div className="notifications-list-container">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <Inbox size={48} className="empty-icon" />
                <h3>No notifications</h3>
                <p>{searchQuery ? 'No notifications match your search' : 'Your inbox is empty'}</p>
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map((notification) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type]
                  const Icon = typeConfig?.icon || Bell

                  return (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${selectedNotification?.id === notification.id ? 'active' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          handleNotificationClick(notification)
                        }
                      }}
                    >
                      <div className="notification-item-icon" style={{ backgroundColor: typeConfig?.bg }}>
                        <Icon
                          size={20}
                          style={{
                            color: typeConfig?.border,
                            strokeWidth: 2,
                          }}
                        />
                      </div>

                      <div className="notification-item-content">
                        <div className="notification-item-header">
                          <h3 className="notification-item-title">{notification.title}</h3>
                          <span className="notification-item-time">{formatTime(notification.timestamp)}</span>
                        </div>
                        <p className="notification-item-message">{notification.message}</p>
                        <div className="notification-item-meta">
                          <span className="notification-resource">{notification.resource}</span>
                          <span className={`notification-type-badge ${typeConfig?.color}`}>{typeConfig?.label}</span>
                        </div>
                      </div>

                      <div className="notification-item-actions">
                        {!notification.isRead && <div className="unread-indicator"></div>}
                        <ChevronRight size={20} className="chevron-icon" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {selectedNotification ? (
            <div className="notification-details">
              <div className="details-header">
                <h2>{isAdmin ? 'Notification Manager' : 'Message Details'}</h2>
                <button
                  className="close-details-btn"
                  onClick={() => setSelectedNotification(null)}
                  aria-label="Close details"
                >
                  x
                </button>
              </div>

              <div className="details-content">
                <div className="details-title-section">
                  <div
                    className="details-icon"
                    style={{
                      backgroundColor: NOTIFICATION_TYPES[selectedNotification.type]?.bg,
                    }}
                  >
                    {(() => {
                      const Icon = NOTIFICATION_TYPES[selectedNotification.type]?.icon || Bell
                      return (
                        <Icon
                          size={32}
                          style={{
                            color: NOTIFICATION_TYPES[selectedNotification.type]?.border,
                            strokeWidth: 1.5,
                          }}
                        />
                      )
                    })()}
                  </div>
                  <div>
                    <h3>{selectedNotification.title}</h3>
                    <p className="details-timestamp">
                      {new Date(selectedNotification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="details-meta">
                  <span className={`badge ${NOTIFICATION_TYPES[selectedNotification.type]?.color}`}>
                    {NOTIFICATION_TYPES[selectedNotification.type]?.label}
                  </span>
                  <span className="status-badge">
                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>

                <div className="details-message">
                  <h4>Message</h4>
                  <p>{selectedNotification.message}</p>
                </div>

                <div className="details-resource">
                  <h4>Related Resource</h4>
                  <div className="resource-info">
                    <span>{selectedNotification.resource}</span>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="details-actions">
                    {!selectedNotification.isRead && (
                      <button
                        className="action-btn secondary"
                        onClick={() => markAsRead(selectedNotification.id)}
                      >
                        <CheckCheck size={16} />
                        Mark as read
                      </button>
                    )}
                    <button
                      className="action-btn secondary"
                      onClick={() => openEditNotificationForm(selectedNotification)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => deleteNotification(selectedNotification.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="details-student-note">
                    Students can view their messages here. Create, edit, and delete actions are only available to administrators.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="notification-details-placeholder">
              <MessageSquare size={48} className="placeholder-icon" />
              <p>{isAdmin ? 'Select a notification to manage it' : 'Select a message to read it'}</p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && isEditorOpen && (
        <div className="notification-editor-modal" role="dialog" aria-modal="true" aria-labelledby="notification-editor-title">
          <div className="notification-editor-backdrop" onClick={resetEditor}></div>
          <div className="notification-editor-panel">
            <div className="notification-editor-panel-header">
              <div>
                <p className="notification-editor-eyebrow">Admin composer</p>
                <h2 id="notification-editor-title">
                  {editingNotificationId ? 'Update Notification' : 'Create Notification'}
                </h2>
                <p className="notification-editor-panel-copy">
                  Choose a type, add the affected resource, and shape the message before publishing it.
                </p>
              </div>
              <button className="notification-editor-close" onClick={resetEditor} aria-label="Close editor">
                <X size={18} />
              </button>
            </div>

            <form className="notification-editor-form" onSubmit={submitNotificationForm}>
              <div className="notification-editor-layout">
                <section className="notification-editor-main">
                  <div className="notification-editor-section">
                    <div className="notification-editor-section-head">
                      <h3>Notification Type</h3>
                      <span>{Object.keys(NOTIFICATION_TYPES).length} options</span>
                    </div>
                    <div className="notification-type-grid">
                      {Object.entries(NOTIFICATION_TYPES).map(([type, config]) => {
                        const Icon = config.icon
                        const isSelected = formData.type === type

                        return (
                          <button
                            key={type}
                            type="button"
                            className={`notification-type-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleTypeSelect(type)}
                          >
                            <div
                              className="notification-type-card-icon"
                              style={{ backgroundColor: config.bg, color: config.border }}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="notification-type-card-copy">
                              <strong>{config.label}</strong>
                              <span>{config.description}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    {formErrors.type && <p className="notification-editor-error">{formErrors.type}</p>}
                  </div>

                  <div className="notification-editor-fields">
                    <label className="notification-editor-field">
                      <span>Related Resource</span>
                      <input
                        type="text"
                        value={formData.resource}
                        onChange={(event) => handleResourceChange(event.target.value)}
                        placeholder="Lecture Hall A"
                      />
                      <small>Add the room, ticket, facility, or campus area this update belongs to.</small>
                      {formErrors.resource && <em className="notification-editor-error">{formErrors.resource}</em>}
                    </label>

                    <label className="notification-editor-field">
                      <span>Title</span>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(event) => handleTitleChange(event.target.value)}
                        placeholder="Announcement: Lecture Hall A"
                      />
                      <small>The title auto-suggests from the selected type until you customize it.</small>
                      {formErrors.title && <em className="notification-editor-error">{formErrors.title}</em>}
                    </label>

                    <label className="notification-editor-field">
                      <span>Message</span>
                      <textarea
                        value={formData.message}
                        onChange={(event) => handleMessageChange(event.target.value)}
                        placeholder="Write the full notification message here."
                      />
                      <small>Use a short first sentence, then include timing, status, or next-step details.</small>
                      {formErrors.message && <em className="notification-editor-error">{formErrors.message}</em>}
                    </label>

                    {editingNotificationId && (
                      <label className="notification-editor-toggle">
                        <input
                          type="checkbox"
                          checked={formData.isRead}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, isRead: event.target.checked }))
                          }
                        />
                        <span>Mark this notification as read</span>
                      </label>
                    )}
                  </div>
                </section>

                <aside className="notification-editor-preview">
                  <p className="notification-editor-eyebrow">Live preview</p>
                  <div className="notification-preview-card">
                    <div
                      className="notification-preview-icon"
                      style={{
                        backgroundColor: NOTIFICATION_TYPES[formData.type]?.bg,
                        color: NOTIFICATION_TYPES[formData.type]?.border,
                      }}
                    >
                      {(() => {
                        const PreviewIcon = NOTIFICATION_TYPES[formData.type]?.icon || Bell
                        return <PreviewIcon size={20} />
                      })()}
                    </div>
                    <div className="notification-preview-content">
                      <div className="notification-preview-topline">
                        <span className={`notification-type-badge ${NOTIFICATION_TYPES[formData.type]?.color}`}>
                          {NOTIFICATION_TYPES[formData.type]?.label}
                        </span>
                        <span className="notification-preview-status">
                          {formData.isRead ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <h3>{formData.title.trim() || 'Notification title'}</h3>
                      <p>{formData.message.trim() || 'Your notification preview will appear here as you type.'}</p>
                      <div className="notification-preview-resource">
                        {formData.resource.trim() || 'General campus resource'}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="notification-editor-actions">
                <button type="button" className="notification-editor-secondary" onClick={resetEditor}>
                  Cancel
                </button>
                <button type="submit" className="notification-editor-primary" disabled={isSubmittingForm}>
                  {isSubmittingForm
                    ? editingNotificationId
                      ? 'Saving...'
                      : 'Creating...'
                    : editingNotificationId
                      ? 'Save changes'
                      : 'Create notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
