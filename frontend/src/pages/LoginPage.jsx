import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { api } from '../lib/api'
import { showError, showSuccess } from '../lib/alerts'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'

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
    } catch {
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
          <FormField label="Email Address" htmlFor="email" required>
            <input
              className="ui-input"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="password" required>
            <input
              className="ui-input"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onChange}
              required
            />
          </FormField>

          <Button fullWidth type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="auth-alt">
          <div className="auth-divider">OR</div>
          <div className="auth-provider">
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
