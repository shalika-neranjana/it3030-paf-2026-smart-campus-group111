import { useEffect, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Link, useNavigate } from 'react-router-dom'
import { showError, showSuccess, showWarning, showConfirm } from '../lib/alerts'
import { api, resolveApiUrl } from '../lib/api'
import { cropImageByPixels } from '../lib/image'
import { formatSriLankanPhoneInput, isValidSriLankanMobile } from '../lib/phone'

const nameRegex = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/

const ProfileEditPage = () => {
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
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get('/api/auth/me')
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          password: '',
          confirmPassword: '',
        })
        if (data.imageUrl) {
          setImagePreview(resolveApiUrl(data.imageUrl))
        }
      } catch (error) {
        showError('Error', 'Failed to load user profile.')
      }
    }
    fetchUserData()
  }, [])

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl)
      }
    }
  }, [selectedImageUrl])

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
    if (formData.password) {
      payload.append('password', formData.password)
      payload.append('confirmPassword', formData.confirmPassword)
    }
    if (croppedImage) {
      payload.append('image', croppedImage)
    }

    try {
      const { data } = await api.put('/api/auth/profile', payload)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data))
      window.dispatchEvent(new Event('auth-changed'))
      await showSuccess('Profile updated', 'Your profile has been updated successfully.')
      navigate('/dashboard')
    } catch (error) {
      const message = error?.response?.data?.message || 'Update failed. Please try again.'
      await showError('Update failed', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDeleteProfile = async () => {
    const result = await showConfirm(
      'Are you sure?',
      'You will not be able to recover your account after deletion!',
      'Yes, delete my profile'
    )

    if (result.isConfirmed) {
      try {
        await api.delete('/api/auth/profile')
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        window.dispatchEvent(new Event('auth-changed'))
        await showSuccess('Account deleted', 'Your account has been deleted successfully.')
        navigate('/login')
      } catch (error) {
        await showError('Deletion failed', 'Could not delete your account. Please try again.')
      }
    }
  }

  return (
    <div className="auth-page auth-page-compact register-horizontal">
      <div className="auth-card auth-card-wide">
        <div className="auth-card-content">
          <div className="auth-left">
            <img className="auth-logo" src="/logo.png" alt="UniReserver" />
            <h1>Edit Profile</h1>
            <p className="auth-note">Update your account information and profile picture.</p>
            <p className="auth-switch">
              <Link to="/dashboard">Back to Dashboard</Link>
            </p>
          </div>

          <div className="auth-right">
            <form className="auth-form register-form" onSubmit={onSubmit}>
              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={onInputChange} required />
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={onInputChange} required />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={onInputChange} required />
              </div>

              <div className="form-field">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="076 296 5411"
                  value={formData.phoneNumber}
                  onChange={onInputChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={onInputChange} />
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={onInputChange}
                />
              </div>

              {!passwordMatch && (
                <div className="form-field full">
                  <span className="field-error">Passwords do not match.</span>
                </div>
              )}

              <div className="form-field">
                <label htmlFor="image">Profile Image (1:1 crop)</label>
                <input id="image" name="image" type="file" accept="image/*" onChange={onImageChange} />
              </div>

              {selectedImageUrl && (
                <div className="form-field">
                  <button className="ghost-btn full" type="button" onClick={() => setIsCropperOpen(true)}>
                    Adjust Image Crop
                  </button>
                </div>
              )}

              {imagePreview && (
                <div className="form-field">
                  <img className="image-preview" src={imagePreview} alt="Profile preview" />
                </div>
              )}

              <div className="form-field full" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="primary-btn" style={{ flex: 2 }} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving changes...' : 'Save Changes'}
                </button>
                <button
                  className="ghost-btn"
                  style={{ flex: 1, borderColor: '#d33', color: '#d33' }}
                  type="button"
                  onClick={onDeleteProfile}
                >
                  Delete Profile
                </button>
              </div>
            </form>
          </div>
        </div>
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

export default ProfileEditPage
