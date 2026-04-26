import { useEffect, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Link, useNavigate } from 'react-router-dom'
import { showError, showSuccess, showWarning, showConfirm } from '../lib/alerts'
import { api, resolveApiUrl } from '../lib/api'
import { cropImageByPixels } from '../lib/image'
import { formatSriLankanPhoneInput, isValidSriLankanMobile } from '../lib/phone'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Modal from '../components/ui/Modal'

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
      } catch {
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
      } catch {
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
            <form className="auth-form register-form ui-field-grid ui-field-grid--two" onSubmit={onSubmit}>
              <FormField label="First Name" htmlFor="firstName" required>
                <input className="ui-input" id="firstName" name="firstName" value={formData.firstName} onChange={onInputChange} required />
              </FormField>

              <FormField label="Last Name" htmlFor="lastName" required>
                <input className="ui-input" id="lastName" name="lastName" value={formData.lastName} onChange={onInputChange} required />
              </FormField>

              <FormField label="Email Address" htmlFor="email" required>
                <input className="ui-input" id="email" name="email" type="email" value={formData.email} onChange={onInputChange} required />
              </FormField>

              <FormField label="Phone Number" htmlFor="phoneNumber" required hint="Sri Lankan mobile number">
                <input
                  className="ui-input"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="076 296 5411"
                  value={formData.phoneNumber}
                  onChange={onInputChange}
                  required
                />
              </FormField>

              <FormField label="New Password" htmlFor="password" hint="Leave blank to keep your current password">
                <input className="ui-input" id="password" name="password" type="password" value={formData.password} onChange={onInputChange} />
              </FormField>

              <FormField
                label="Confirm New Password"
                htmlFor="confirmPassword"
                error={!passwordMatch ? 'Passwords do not match.' : ''}
              >
                <input
                  className="ui-input"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={onInputChange}
                />
              </FormField>

              <FormField label="Profile Image (1:1 crop)" htmlFor="image">
                <input className="ui-input" id="image" name="image" type="file" accept="image/*" onChange={onImageChange} />
              </FormField>

              {selectedImageUrl ? (
                <FormField>
                  <Button variant="secondary" fullWidth type="button" onClick={() => setIsCropperOpen(true)}>
                    Adjust Image Crop
                  </Button>
                </FormField>
              ) : null}

              {imagePreview ? (
                <FormField>
                  <img className="image-preview" src={imagePreview} alt="Profile preview" />
                </FormField>
              ) : null}

              <FormField fullWidth>
                <div className="auth-form-actions">
                  <Button className="auth-form-actions-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving changes...' : 'Save Changes'}
                  </Button>
                  <Button variant="danger" className="auth-form-actions-secondary" type="button" onClick={onDeleteProfile}>
                    Delete Profile
                  </Button>
                </div>
              </FormField>
            </form>
          </div>
        </div>
      </div>

      {isCropperOpen && selectedImageUrl && (
        <Modal
          title="Crop Profile Image"
          subtitle="Drag and zoom to refine the visible square profile area."
          size="sm"
          onClose={() => setIsCropperOpen(false)}
          footer={
            <>
              <Button variant="secondary" type="button" onClick={() => setIsCropperOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={applyCrop}>
                Apply Crop
              </Button>
            </>
          }
        >
          <div className="cropper-modal-content">
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

            <FormField className="cropper-zoom-field" label="Zoom" htmlFor="zoomRange">
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
            </FormField>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ProfileEditPage
