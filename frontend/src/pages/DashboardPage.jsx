import { useEffect, useState } from 'react'
import { api, resolveApiUrl } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const formatRole = (role) => {
  if (!role) return 'User'

  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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

  const onLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.dispatchEvent(new Event('auth-changed'))
    navigate('/login', { replace: true })
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
        <section className="dashboard-hero">
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome to UniReserver</h1>
          <p className="subtitle">
            Manage your campus reservations from one place. Your account summary is shown in the header for quick access.
          </p>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
