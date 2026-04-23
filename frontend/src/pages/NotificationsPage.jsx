import { useEffect, useState } from 'react'
import {
  Inbox,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Search,
  ChevronRight,
  Bell,
  FileText,
  CheckCheck,
  Pencil,
  Plus,
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
  },
  BOOKING_REJECTED: {
    label: 'Booking Rejected',
    icon: AlertCircle,
    color: 'error',
    bg: '#fee2e2',
    border: '#ef4444',
  },
  TICKET_UPDATED: {
    label: 'Ticket Updated',
    icon: FileText,
    color: 'info',
    bg: '#dbeafe',
    border: '#3b82f6',
  },
  NEW_COMMENT: {
    label: 'New Comment',
    icon: MessageSquare,
    color: 'warning',
    bg: '#fef3c7',
    border: '#f59e0b',
  },
  BOOKING_PENDING: {
    label: 'Booking Pending',
    icon: Clock,
    color: 'pending',
    bg: '#e0e7ff',
    border: '#6366f1',
  },
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

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const buildEditorHtml = (notification = {}) => `
  <div class="notification-editor">
    <label class="notification-editor-label" for="notification-type">Type</label>
    <select id="notification-type" class="swal2-select">
      ${Object.entries(NOTIFICATION_TYPES)
        .map(
          ([value, config]) =>
            `<option value="${value}" ${notification.type === value ? 'selected' : ''}>${config.label}</option>`
        )
        .join('')}
    </select>
    <label class="notification-editor-label" for="notification-title">Title</label>
    <input id="notification-title" class="swal2-input" value="${escapeHtml(notification.title ?? '')}" placeholder="Notification title" />
    <label class="notification-editor-label" for="notification-resource">Resource</label>
    <input id="notification-resource" class="swal2-input" value="${escapeHtml(notification.resource ?? '')}" placeholder="Lecture Hall A" />
    <label class="notification-editor-label" for="notification-message">Message</label>
    <textarea id="notification-message" class="swal2-textarea" placeholder="Write the message here">${escapeHtml(notification.message ?? '')}</textarea>
  </div>
`

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [user, setUser] = useState(getStoredUser)

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

  const promptForNotification = async (notification) => {
    const result = await Swal.fire({
      title: notification ? 'Edit notification' : 'Create notification',
      html: buildEditorHtml(notification),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: notification ? 'Save changes' : 'Create',
      preConfirm: () => {
        const popup = Swal.getPopup()
        const type = popup.querySelector('#notification-type')?.value
        const title = popup.querySelector('#notification-title')?.value.trim()
        const resource = popup.querySelector('#notification-resource')?.value.trim()
        const message = popup.querySelector('#notification-message')?.value.trim()

        if (!type || !title || !resource || !message) {
          Swal.showValidationMessage('Type, title, resource, and message are required.')
          return false
        }

        return {
          type,
          title,
          resource,
          message,
          isRead: notification?.isRead ?? false,
        }
      },
    })

    return result.isConfirmed ? result.value : null
  }

  const createNotification = async () => {
    const payload = await promptForNotification()
    if (!payload) return

    try {
      const { data } = await api.post('/api/notifications', payload)
      const created = normalizeNotification(data)
      upsertNotification(created)
      Swal.fire('Created', 'Notification created successfully.', 'success')
    } catch (error) {
      console.error('Failed to create notification:', error)
      Swal.fire('Error', 'Failed to create notification.', 'error')
    }
  }

  const editNotification = async (notification) => {
    const payload = await promptForNotification(notification)
    if (!payload) return

    try {
      const { data } = await api.put(`/api/notifications/${notification.id}`, payload)
      const updated = normalizeNotification(data)
      upsertNotification(updated)
      Swal.fire('Updated', 'Notification updated successfully.', 'success')
    } catch (error) {
      console.error('Failed to update notification:', error)
      Swal.fire('Error', 'Failed to update notification.', 'error')
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
              <button className="mark-all-btn create-btn" onClick={createNotification}>
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
                      onClick={() => editNotification(selectedNotification)}
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
    </div>
  )
}

export default NotificationsPage
