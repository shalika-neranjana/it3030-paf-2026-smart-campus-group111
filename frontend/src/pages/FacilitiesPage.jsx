import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  MapPin, 
  Users, 
  Building2, 
  Layers, 
  Edit2, 
  Trash2, 
  X,
  Info
} from 'lucide-react'
import { api, resolveApiUrl } from '../lib/api'

const FACILITY_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPECIAL']
const FACILITY_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

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
  const [filterLocation, setFilterLocation] = useState('')
  const [minCapacity, setMinCapacity] = useState('')

  // User state for roles
  const [user, setUser] = useState(() => {
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
    location: '',
    building: '',
    floorNumber: '',
    capacity: '',
    status: 'ACTIVE',
    description: '',
    imageUrl: ''
  })

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterType) params.type = filterType
      if (minCapacity) params.minCapacity = minCapacity
      if (filterLocation) params.location = filterLocation

      const { data } = await api.get('/api/facilities', { params })
      
      // Client-side search for name if needed, or backend can handle it.
      // Current backend only handles type, capacity, location.
      let filtered = data
      if (searchQuery) {
        filtered = data.filter(f => 
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      setFacilities(filtered)
    } catch (err) {
      setError('Failed to load facilities. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilities()
  }, [filterType, minCapacity, filterLocation])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleOpenModal = (facility = null) => {
    if (facility) {
      setEditingFacility(facility)
      setFormData({
        name: facility.name || '',
        type: facility.type || 'LECTURE_HALL',
        location: facility.location || '',
        building: facility.building || '',
        floorNumber: facility.floorNumber || '',
        capacity: facility.capacity || '',
        status: facility.status || 'ACTIVE',
        description: facility.description || '',
        imageUrl: facility.imageUrl || ''
      })
    } else {
      setEditingFacility(null)
      setFormData({
        name: '',
        type: 'LECTURE_HALL',
        location: '',
        building: '',
        floorNumber: '',
        capacity: '',
        status: 'ACTIVE',
        description: '',
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
      } else {
        await api.post('/api/facilities', formData)
      }
      handleCloseModal()
      fetchFacilities()
    } catch (err) {
      alert('Failed to save facility. Please check your permissions.')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return
    try {
      await api.delete(`/api/facilities/${id}`)
      fetchFacilities()
    } catch (err) {
      alert('Failed to delete facility.')
      console.error(err)
    }
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
             <Link className="nav-link" to="/dashboard" style={{ color: '#0d4b77', fontWeight: 700, textDecoration: 'none' }}>Dashboard</Link>
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
              type="text" 
              placeholder="Search by name or description..." 
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
              value={filterLocation} 
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Main Campus">Main Campus</option>
              <option value="Engineering Block">Engineering Block</option>
              <option value="Science Wing">Science Wing</option>
              <option value="Arts Building">Arts Building</option>
            </select>

            <input 
              type="number" 
              className="filter-select" 
              placeholder="Min Capacity" 
              style={{ width: '130px' }}
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
          <div className="admin-controls" style={{ marginTop: '1.5rem' }}>
            <button className="primary-btn" onClick={() => handleOpenModal()}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Resource
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching resources...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : facilities.length === 0 ? (
          <div className="no-results">
            <Info size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
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
                  <span className={`status-badge status-${facility.status?.toLowerCase()}`}>
                    {facility.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="facility-info">
                  <div className="facility-meta">
                    <span className="facility-tag tag-type">{facility.type?.replace('_', ' ')}</span>
                    <span className="facility-tag tag-location">{facility.location}</span>
                  </div>
                  <h3>{facility.name}</h3>
                  <p className="facility-description">{facility.description || 'No description available for this resource.'}</p>
                  
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
                    <button className="primary-btn">Reserve</button>
                    {isAdmin && (
                      <>
                        <button className="icon-btn" onClick={() => handleOpenModal(facility)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(facility.id)}>
                          <Trash2 size={16} />
                        </button>
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
                  <th>Location</th>
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
                    <td>{facility.location}</td>
                    <td>{facility.capacity}</td>
                    <td>
                      <span className={`status-badge status-${facility.status?.toLowerCase()}`} style={{ position: 'static' }}>
                        {facility.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="ghost-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reserve</button>
                        {isAdmin && (
                          <>
                            <button className="icon-btn" onClick={() => handleOpenModal(facility)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn delete" onClick={() => handleDelete(facility.id)}>
                              <Trash2 size={16} />
                            </button>
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
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingFacility ? 'Edit Resource' : 'Add New Resource'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="facility-form">
                  <div className="form-group full-width">
                    <label>Resource Name</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Grand Lecture Hall A" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange}>
                      {FACILITY_TYPES.map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      {FACILITY_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Main Campus" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Building</label>
                    <input 
                      name="building" 
                      value={formData.building} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Block C" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Floor Number</label>
                    <input 
                      type="number" 
                      name="floorNumber" 
                      value={formData.floorNumber} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 2" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Seating Capacity</label>
                    <input 
                      type="number" 
                      name="capacity" 
                      value={formData.capacity} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 150" 
                      required 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Image URL</label>
                    <input 
                      name="imageUrl" 
                      value={formData.imageUrl} 
                      onChange={handleInputChange} 
                      placeholder="https://..." 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      placeholder="Provide details about equipment, specialized features, etc."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="ghost-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="primary-btn">
                  {editingFacility ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacilitiesPage
