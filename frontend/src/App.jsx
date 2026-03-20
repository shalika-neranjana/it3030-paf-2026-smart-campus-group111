import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResourceManagementPage from './neranjana/pages/ResourceManagementPage'
import BookingManagementPage from './kasun/pages/BookingManagementPage'
import IncidentDashboardPage from './nelara/pages/IncidentDashboardPage'

const hasAuthToken = () => Boolean(localStorage.getItem('authToken'))

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuthToken)

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(hasAuthToken())
    }

    window.addEventListener('storage', syncAuthState)
    window.addEventListener('auth-changed', syncAuthState)

    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('auth-changed', syncAuthState)
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/resources"
        element={isAuthenticated ? <ResourceManagementPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/bookings"
        element={isAuthenticated ? <BookingManagementPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/incidents"
        element={isAuthenticated ? <IncidentDashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
