import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, ClipboardList, Inbox, LayoutDashboard, LifeBuoy, Wrench } from 'lucide-react'
import { api, resolveApiUrl } from '../lib/api'

import ManageResources from './ManageResources'

const ADMIN_NAV_ITEMS = [
  { key: 'inbox-messages', label: 'Inbox Messages', icon: Inbox },
  { key: 'booking-requests', label: 'Booking Requests', icon: ClipboardList },
  { key: 'support-tickets', label: 'Support Tickets', icon: LifeBuoy },
  { key: 'timetable', label: 'Timetable', icon: CalendarClock },
  { key: 'manage-resources', label: 'Manage Resources', icon: Wrench },
]

const DEFAULT_NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
]

const formatRole = (role) => {
  if (!role) return 'User'

  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const isAdminRole = (role) => {
  if (!role) return false
  const r = role.toUpperCase()
  return r === 'ADMINISTRATOR' || r === 'MANAGER'
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('authUser')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/auth/me')
        const mergedUser = { ...user, ...data }
        setUser(mergedUser)
        localStorage.setItem('authUser', JSON.stringify(mergedUser))
      } catch {
        // Keep existing local user if profile refresh fails.
      }
    }

    if (localStorage.getItem('authToken')) {
      fetchProfile()
    }
  }, [])

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Logged in user'
  const displayRole = formatRole(user?.role)
  const profileImage = resolveApiUrl(user?.imageUrl) || '/logo.png'
  const navItems = isAdminRole(user?.role) ? ADMIN_NAV_ITEMS : DEFAULT_NAV_ITEMS
  const [activeSection, setActiveSection] = useState(() => navItems[0]?.key || 'overview')

  useEffect(() => {
    setActiveSection(navItems[0]?.key || 'overview')
  }, [user?.role])

  const onLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.dispatchEvent(new Event('auth-changed'))
    navigate('/login', { replace: true })
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'manage-resources':
        return <ManageResources />
      case 'overview':
      default:
        return (
          <section className="dashboard-hero" style={{ height: '100%' }}>
            <p className="eyebrow">Dashboard</p>
            <h1>{navItems.find((item) => item.key === activeSection)?.label || 'Welcome to UniReserver'}</h1>
            <p className="subtitle">
              Manage your campus reservations from one place. Your account summary is shown in the header for quick access.
            </p>
            <div className="feature-strip" style={{ marginTop: '2rem' }}>
              <div className="feature-card">
                <h2>Quick Start</h2>
                <p>Use the sidebar to navigate through your management tools.</p>
              </div>
              <div className="feature-card">
                <h2>Notifications</h2>
                <p>You have no new notifications at this time.</p>
              </div>
            </div>
          </section>
        )
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" to="/" aria-label="UniReserver home">
          <img className="dashboard-brand-logo" src="/logo.png" alt="UniReserver logo" />
        </Link>

        <div className="dashboard-user-area">
          <div className="dashboard-user-meta">
            <p className="dashboard-user-name">{displayName}</p>
            <p className="dashboard-user-role">{displayRole}</p>
          </div>

          <img
            className="dashboard-user-avatar"
            src={profileImage}
            alt={`${displayName} profile`}
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = '/logo.png'
            }}
          />

          <button className="logout-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <p className="dashboard-sidebar-title">Navigation</p>

          <nav className="dashboard-nav">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`dashboard-nav-link ${activeSection === item.key ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.key)}
                >
                  <Icon className="dashboard-nav-icon" size={18} strokeWidth={2.1} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="dashboard-main-content" style={{ flex: 1 }}>
          {renderActiveSection()}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
