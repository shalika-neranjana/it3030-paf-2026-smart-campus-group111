import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { api } from '../lib/api'
import { showError, showSuccess } from '../lib/alerts'

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { data } = await api.post('/api/auth/login', formData)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data))
      window.dispatchEvent(new Event('auth-changed'))
      await showSuccess('Login successful', `Welcome back, ${data.firstName}!`)
      navigate('/dashboard')
    } catch (error) {
      const status = error?.response?.status
      const message = error?.response?.data?.message || 'Unable to log in. Please try again.'

      if (status === 404) {
        await showError('User not found', message)
      } else if (status === 401) {
        await showError('Invalid credentials', message)
      } else {
        await showError('Login failed', message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await api.post('/api/auth/google', {
        credential: credentialResponse.credential,
      })
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data))
      window.dispatchEvent(new Event('auth-changed'))
      await showSuccess('Login successful', `Welcome back, ${data.firstName}!`)
      navigate('/dashboard')
    } catch (error) {
      await showError('Google Login failed', 'Unable to authenticate with Google.')
    }
  }

  return (
    <div className="auth-page auth-page-compact">
      <div className="auth-card">
        <img className="auth-logo" src="/logo.png" alt="UniReserver" />
        <h1>Login</h1>
        <p className="auth-note">Use your UniReserver account credentials.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="email">Email Address <span className="required-star">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            required
          />

          <label htmlFor="password">Password <span className="required-star">*</span></label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={onChange}
            required
          />

          <button className="primary-btn full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>OR</div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => showError('Login Failed', 'Google authentication failed.')}
              useOneTap
              theme="filled_blue"
              shape="pill"
              text="signin_with"
            />
          </div>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
