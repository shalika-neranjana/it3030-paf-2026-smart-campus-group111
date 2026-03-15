import { useEffect, useState } from 'react'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { api } from '../lib/api'

const FACILITY_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPECIAL']
const FACILITY_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

const ManageResources = () => {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [minCapacity, setMinCapacity] = useState('')
  
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
      if (filterStatus) params.status = filterStatus

      const { data } = await api.get('/api/facilities', { params })
      setFacilities(data)
    } catch (err) {
      setError('Failed to load resources.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilities()
  }, [filterType, minCapacity, filterLocation, filterStatus])

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      alert('Failed to save resource.')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this resource?')) return
    try {
      await api.delete(`/api/facilities/${id}`)
      fetchFacilities()
    } catch (err) {
      alert('Failed to delete resource.')
      console.error(err)
    }
  }

  return (
    <div className="resource-manager">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Resource Management</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#526f81', fontSize: '0.9rem' }}>Add, edit, or remove campus facilities and assets.</p>
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Resource
        </button>
      </div>

      <div className="manage-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Filter resources by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group" style={{ display: 'flex', gap: '0.75rem' }}>
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
          </select>

          <select 
            className="filter-select" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {FACILITY_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>

          <input 
            type="number" 
            className="filter-select" 
            placeholder="Min Cap." 
            style={{ width: '100px' }}
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#1167cc' }} />
          <p style={{ marginTop: '1rem' }}>Loading catalogue...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : (
        <div className="facilities-table-container" style={{ margin: 0 }}>
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
              {filteredFacilities.map((facility) => (
                <tr key={facility.id}>
                  <td>
                    <div className="table-facility-name">
                      <div className="name-cell">
                        <h4>{facility.name}</h4>
                        <p>{facility.location} • {facility.building}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="facility-tag tag-type">{facility.type?.replace('_', ' ')}</span></td>
                  <td>{facility.capacity}</td>
                  <td>
                    <span className={`status-badge status-${facility.status?.toLowerCase()}`} style={{ position: 'static' }}>
                      {facility.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => handleOpenModal(facility)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(facility.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFacilities.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#526f81' }}>
                    No resources found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - Reusing the same structure but within this component for encapsulation */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingFacility ? 'Edit Resource' : 'Add New Resource'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="facility-form" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="form-group">
                    <label>Resource Name</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Type</label>
                      <select name="type" value={formData.type} onChange={handleInputChange}>
                        {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange}>
                        {FACILITY_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Location</label>
                      <input name="location" value={formData.location} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>Building</label>
                      <input name="building" value={formData.building} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Floor</label>
                      <input type="number" name="floorNumber" value={formData.floorNumber} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Capacity</label>
                      <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange}></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="ghost-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="primary-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageResources
