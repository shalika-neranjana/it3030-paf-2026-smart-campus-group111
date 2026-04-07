import { useEffect, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Link, useNavigate } from 'react-router-dom'
import { showError, showSuccess, showWarning } from '../lib/alerts'
import { api } from '../lib/api'
import { cropImageByPixels } from '../lib/image'
import { formatSriLankanPhoneInput, isValidSriLankanMobile } from '../lib/phone'

const roleOptions = [
  'ADMINISTRATOR',
  'MANAGER',
  'STUDENT',
  'INSTRUCTOR',
  'LECTURER',
  'TECHNICIAN',
  'STAFF',
]

const nameRegex = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/

const RegisterPage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [croppedImage, setCroppedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [selectedImageName, setSelectedImageName] = useState('profile')
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  })

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl)
      }
    }
  }, [selectedImageUrl])

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const passwordMatch = useMemo(
    () => !formData.confirmPassword || formData.password === formData.confirmPassword,
    [formData.confirmPassword, formData.password],
  )

  const onInputChange = (event) => {
    const { name, value } = event.target

    if (name === 'phoneNumber') {
      setFormData((prev) => ({ ...prev, phoneNumber: formatSriLankanPhoneInput(value) }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const sourceUrl = URL.createObjectURL(file)
      setSelectedImageUrl(sourceUrl)
      setSelectedImageName((file.name.split('.').slice(0, -1).join('.') || 'profile').toLowerCase())
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setIsCropperOpen(true)
    } catch {
      await showError('Image error', 'Could not process your image. Please choose another file.')
    }
  }

  const onCropComplete = (_, areaPixels) => {
    setCroppedAreaPixels(areaPixels)
  }

  const applyCrop = async () => {
    if (!selectedImageUrl || !croppedAreaPixels) return

    try {
      const croppedFile = await cropImageByPixels(selectedImageUrl, croppedAreaPixels, selectedImageName)
      const previewUrl = URL.createObjectURL(croppedFile)
      setCroppedImage(croppedFile)
      setImagePreview(previewUrl)
      setIsCropperOpen(false)
    } catch {
      await showError('Crop failed', 'Could not crop the selected image. Please try again.')
    }
  }

  const validateBeforeSubmit = async () => {
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      await showWarning('Name validation', 'First name and last name must contain only English letters.')
      return false
    }

    if (!isValidSriLankanMobile(formData.phoneNumber)) {
      await showWarning('Phone validation', 'Phone number must be a valid Sri Lankan mobile number.')
      return false
    }

    if (!passwordMatch) {
      await showWarning('Password mismatch', 'Password and confirm password must match.')
      return false
    }

    if (!croppedImage) {
      await showWarning('Missing image', 'Please upload a profile image.')
      return false
    }

    return true
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    const valid = await validateBeforeSubmit()
    if (!valid) return

    setIsSubmitting(true)

    const payload = new FormData()
    payload.append('firstName', formData.firstName.trim())
    payload.append('lastName', formData.lastName.trim())
    payload.append('email', formData.email.trim())
    payload.append('phoneNumber', formData.phoneNumber)
    payload.append('password', formData.password)
    payload.append('confirmPassword', formData.confirmPassword)
    payload.append('role', formData.role)
    payload.append('image', croppedImage)

    try {
      const { data } = await api.post('/api/auth/register', payload)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data))
      window.dispatchEvent(new Event('auth-changed'))
      await showSuccess('Registration successful', 'Your account has been created successfully.')
      navigate('/dashboard')
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed. Please try again.'

      if (message.toLowerCase().includes('email is already in use')) {
        await showWarning('Duplicate email', message)
      } else if (message.toLowerCase().includes('phone number is already in use')) {
        await showWarning('Duplicate phone', message)
      } else {
        await showError('Registration failed', message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page auth-page-scroll">
      <div className="auth-card auth-card-wide">
        <img className="auth-logo" src="/logo.png" alt="UniReserver" />
        <h1>Create Account</h1>
        <p className="auth-note">Register to access secure campus resource management.</p>

        <form className="auth-form register-form" onSubmit={onSubmit}>
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" name="firstName" value={formData.firstName} onChange={onInputChange} required />

          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" name="lastName" value={formData.lastName} onChange={onInputChange} required />

          <label htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={onInputChange} required />

          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="076 296 5411"
            value={formData.phoneNumber}
            onChange={onInputChange}
            required
          />

          <label htmlFor="role">User Role</label>
          <select id="role" name="role" value={formData.role} onChange={onInputChange} required>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={onInputChange} required />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={onInputChange}
            required
          />
          {!passwordMatch && <span className="field-error">Passwords do not match.</span>}

          <label htmlFor="image">Profile Image (1:1 crop)</label>
          <input id="image" name="image" type="file" accept="image/*" onChange={onImageChange} />

          {selectedImageUrl && (
            <button className="ghost-btn full" type="button" onClick={() => setIsCropperOpen(true)}>
              Adjust Image Crop
            </button>
          )}

          {imagePreview && <img className="image-preview" src={imagePreview} alt="Cropped preview" />}

          <button className="primary-btn full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      {isCropperOpen && selectedImageUrl && (
        <div className="cropper-modal-backdrop">
          <div className="cropper-modal" role="dialog" aria-modal="true" aria-label="Crop profile image">
            <h2>Crop Profile Image</h2>
            <p>Drag and zoom to select a 1:1 profile image.</p>

            <div className="cropper-area">
              <Cropper
                image={selectedImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
              />
            </div>

            <label className="cropper-zoom-label" htmlFor="zoomRange">
              Zoom
            </label>
            <input
              id="zoomRange"
              className="cropper-zoom"
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />

            <div className="cropper-actions">
              <button className="ghost-btn" type="button" onClick={() => setIsCropperOpen(false)}>
                Cancel
              </button>
              <button className="primary-btn" type="button" onClick={applyCrop}>
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegisterPage
