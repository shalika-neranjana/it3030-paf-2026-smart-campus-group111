import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  Users, 
  Building2, 
  Layers, 
  Edit2, 
  Trash2, 
  Info
} from 'lucide-react'
import { api } from '../lib/api'
import BookingModal from './BookingModal'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ResourceFormFields from '../components/resources/ResourceFormFields'
import { extractErrorMessage, showConfirm, showError, showSuccess } from '../lib/alerts'

const FACILITY_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPECIAL']
const FACILITY_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']
const BUILDINGS = [
  'Main Building',
  'Engineering faculty Building',
  'Business faculty building',
  'New Academic Building',
  'William Angliss Building'
]

const isAdminRole = (role) => {
  if (!role) return false
  const r = role.toUpperCase()
  return r === 'ADMINISTRATOR' || r === 'MANAGER'
}

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterBuilding, setFilterBuilding] = useState('')
  const [minCapacity, setMinCapacity] = useState('')

  // User state for roles
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem('authUser')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    building: BUILDINGS[0],
    floorNumber: '',
    capacity: '',
    status: 'ACTIVE',
    note: '',
    imageUrl: ''
  })

  // Booking Modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState(null)

  const fetchFacilities = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterType) params.type = filterType
      if (filterBuilding) params.building = filterBuilding
      if (minCapacity) params.minCapacity = minCapacity

      const { data } = await api.get('/api/facilities', { params })
      
      let filtered = data
      if (searchQuery) {
        filtered = data.filter(f => 
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.note?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      setFacilities(filtered)
    } catch (err) {
      setError('Failed to load facilities. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterBuilding, filterType, minCapacity, searchQuery])

  useEffect(() => {
    fetchFacilities()
  }, [fetchFacilities])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities()
    }, 400)
    return () => clearTimeout(timer)
  }, [fetchFacilities])

  const handleOpenModal = (facility = null) => {
    if (facility) {
      setEditingFacility(facility)
      setFormData({
        name: facility.name || '',
        type: facility.type || 'LECTURE_HALL',
        building: facility.building || BUILDINGS[0],
        floorNumber: facility.floorNumber || '',
        capacity: facility.capacity || '',
        status: facility.status || 'ACTIVE',
        note: facility.note || '',
        imageUrl: facility.imageUrl || ''
      })
    } else {
      setEditingFacility(null)
      setFormData({
        name: '',
        type: 'LECTURE_HALL',
        building: BUILDINGS[0],
        floorNumber: '',
        capacity: '',
        status: 'ACTIVE',
        note: '',
        imageUrl: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFacility(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFacility) {
        await api.put(`/api/facilities/${editingFacility.id}`, formData)
        await showSuccess('Resource Updated', 'Resource details were saved successfully.', {
          timer: 1800,
          showConfirmButton: false,
        })
      } else {
        await api.post('/api/facilities', formData)
        await showSuccess('Resource Added', 'The new resource is now available in the catalogue.', {
          timer: 1800,
          showConfirmButton: false,
        })
      }
      handleCloseModal()
      fetchFacilities()
    } catch (err) {
      await showError('Save Failed', extractErrorMessage(err, 'Failed to save facility. Please check your permissions.'))
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    const result = await showConfirm(
      'Delete Resource?',
      'This action removes the resource from the catalogue and cannot be undone.',
      'Delete Resource'
    )

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/facilities/${id}`)
        await showSuccess('Resource Deleted', 'The resource has been removed.', {
          timer: 1600,
          showConfirmButton: false,
        })
        fetchFacilities()
      } catch (err) {
        await showError('Delete Failed', extractErrorMessage(err, 'Failed to delete facility.'))
        console.error(err)
      }
    }
  }

  const handleOpenBookingModal = (facility) => {
    setSelectedFacilityForBooking(facility)
    setIsBookingModalOpen(true)
  }

  const isAdmin = isAdminRole(user?.role)

  return (
    <div className="facilities-page">
      <div className="facilities-container">
        <header className="topbar">
          <Link className="brand" to="/" aria-label="UniReserver home">
            <img className="brand-logo" src="/logo.png" alt="UniReserver logo" />
          </Link>
          <div className="nav-links">
            <Link className="nav-link ui-button ui-button--secondary" to="/dashboard">Dashboard</Link>
          </div>
        </header>

        <section className="hero-section">
          <p className="eyebrow">Facilities & Assets</p>
          <h1>Campus Catalogue</h1>
          <p className="subtitle">
            Browse and manage university resources, from lecture halls and high-tech labs to portable equipment.
          </p>
        </section>

        <div className="facilities-controls">
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input 
              className="ui-input"
              type="text" 
              placeholder="Search by name or note..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters-group">
            <select 
              className="filter-select" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {FACILITY_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>

            <select 
              className="filter-select" 
              value={filterBuilding} 
              onChange={(e) => setFilterBuilding(e.target.value)}
            >
              <option value="">All Buildings</option>
              {BUILDINGS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <input 
              type="number" 
              className="filter-select filter-select-compact" 
              placeholder="Min Capacity" 
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
            />
          </div>

          <div className="view-toggler">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="admin-controls admin-controls-spaced">
            <Button onClick={() => handleOpenModal()}>
              <Plus size={18} /> Add Resource
            </Button>
          </div>
        )}

        {loading ? (
          <div className="ui-feedback">
            <div className="spinner"></div>
            <p>Fetching resources...</p>
          </div>
        ) : error ? (
          <div className="ui-feedback ui-feedback--error">
            <strong>Unable to load resources</strong>
            <p>{error}</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="ui-feedback ui-feedback-card">
            <Info size={48} className="ui-feedback-icon" />
            <p>No resources match your criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="facilities-grid">
            {facilities.map((facility) => (
              <div key={facility.id} className="facility-card">
                <div className="facility-image-container">
                  <img 
                    src={facility.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'} 
                    alt={facility.name} 
                    className="facility-image" 
                  />
                  <StatusBadge className="status-badge" status={facility.status} />
                </div>
                <div className="facility-info">
                  <div className="facility-meta">
                    <span className="facility-tag tag-type">{facility.type?.replace('_', ' ')}</span>
                  </div>
                  <h3>{facility.name}</h3>
                  <p className="facility-description">{facility.note || 'No notes available for this resource.'}</p>
                  
                  <div className="facility-details-mini">
                    <div className="detail-item">
                      <Users size={14} /> <span>{facility.capacity} Seats</span>
                    </div>
                    <div className="detail-item">
                      <Building2 size={14} /> <span>{facility.building || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <Layers size={14} /> <span>Floor {facility.floorNumber || '0'}</span>
                    </div>
                  </div>

                  <div className="facility-actions">
                    <Button onClick={() => handleOpenBookingModal(facility)}>Reserve</Button>
                    {isAdmin && (
                      <>
                        <Button variant="secondary" className="icon-btn" iconOnly onClick={() => handleOpenModal(facility)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="danger" className="icon-btn delete" iconOnly onClick={() => handleDelete(facility.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="facilities-table-container">
            <table className="facilities-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => (
                  <tr key={facility.id}>
                    <td>
                      <div className="table-facility-name">
                        <img 
                          src={facility.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=100'} 
                          className="table-facility-img" 
                          alt="" 
                        />
                        <div className="name-cell">
                          <h4>{facility.name}</h4>
                          <p>{facility.building}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="facility-tag tag-type">{facility.type?.replace('_', ' ')}</span></td>
                    <td>{facility.capacity}</td>
                    <td>
                      <StatusBadge status={facility.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button variant="secondary" className="table-action-button" onClick={() => handleOpenBookingModal(facility)}>
                          Reserve
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="secondary" className="icon-btn" iconOnly onClick={() => handleOpenModal(facility)}>
                              <Edit2 size={16} />
                            </Button>
                            <Button variant="danger" className="icon-btn delete" iconOnly onClick={() => handleDelete(facility.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Facility Modal */}
      {isModalOpen && (
        <Modal
          title={editingFacility ? 'Edit Resource' : 'Add New Resource'}
          subtitle="Use the same structure and metadata across all campus facilities."
          size="md"
          onClose={handleCloseModal}
          footer={
            <>
              <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" form="facility-form">
                {editingFacility ? 'Update Resource' : 'Create Resource'}
              </Button>
            </>
          }
        >
          <form id="facility-form" onSubmit={handleSubmit}>
            <ResourceFormFields
              formData={formData}
              onChange={handleInputChange}
              facilityTypes={FACILITY_TYPES}
              facilityStatuses={FACILITY_STATUSES}
              buildings={BUILDINGS}
              includeImageUrl
            />
          </form>
        </Modal>
      )}

      {/* Booking Request Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        facility={selectedFacilityForBooking}
        onSuccess={() => {
          showSuccess('Booking Submitted', 'Booking request submitted successfully. You can track its status in your dashboard.')
        }}
      />
    </div>
  )
}

export default FacilitiesPage

