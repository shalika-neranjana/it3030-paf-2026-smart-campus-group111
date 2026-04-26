import { useCallback, useEffect, useState } from 'react'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  AlertCircle
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

const ManageResources = ({ isReadOnly = false }) => {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterBuilding, setFilterBuilding] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [minCapacity, setMinCapacity] = useState('')
  
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
      if (filterStatus) params.status = filterStatus

      const { data } = await api.get('/api/facilities', { params })
      setFacilities(data)
    } catch (err) {
      setError('Failed to load resources.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterBuilding, filterStatus, filterType, minCapacity])

  useEffect(() => {
    fetchFacilities()
  }, [fetchFacilities])

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.note?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenModal = (facility = null) => {
    if (isReadOnly) return
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
    if (isReadOnly) return
    try {
      if (editingFacility) {
        await api.put(`/api/facilities/${editingFacility.id}`, formData)
        await showSuccess('Resource Updated', 'Resource details have been updated successfully.', {
          timer: 1800,
          showConfirmButton: false,
        })
      } else {
        await api.post('/api/facilities', formData)
        await showSuccess('Resource Added', 'The new resource has been added to the catalogue.', {
          timer: 1800,
          showConfirmButton: false,
        })
      }
      handleCloseModal()
      fetchFacilities()
    } catch (err) {
      await showError('Save Failed', extractErrorMessage(err, 'Failed to save resource. Please try again.'))
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (isReadOnly) return
    
    const result = await showConfirm(
      'Delete Resource?',
      'This action removes the resource from the catalogue and cannot be undone.',
      'Delete Resource'
    )

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/facilities/${id}`)
        await showSuccess('Resource Deleted', 'The resource has been deleted.', {
          timer: 1600,
          showConfirmButton: false,
        })
        fetchFacilities()
      } catch (err) {
        await showError('Delete Failed', extractErrorMessage(err, 'Failed to delete resource.'))
        console.error(err)
      }
    }
  }

  const handleOpenBookingModal = (facility) => {
    setSelectedFacilityForBooking(facility)
    setIsBookingModalOpen(true)
  }

  return (
    <div className="resource-manager">
      <div className="ui-section-heading">
        <div className="ui-section-copy">
          <h2>{isReadOnly ? 'Campus Resources' : 'Resource Management'}</h2>
          <p>
            {isReadOnly ? 'Explore available facilities and assets for reservation.' : 'Add, edit, or remove campus facilities and assets.'}
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Resource
          </Button>
        )}
      </div>

      <div className="manage-controls ui-filter-row">
        <div className="search-box resource-search-box">
          <Search className="search-icon" size={20} />
          <input 
            className="ui-input"
            type="text" 
            placeholder="Filter resources by name or note..." 
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
            className="filter-select filter-select-compact manage-filter-compact" 
            placeholder="Min Cap." 
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="ui-feedback">
          <Loader2 className="animate-spin loading-spinner-icon" size={32} />
          <p className="feedback-copy-spaced">Loading catalogue...</p>
        </div>
      ) : error ? (
        <div className="ui-feedback ui-feedback--error">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : (
        <div className="facilities-table-container ui-table-card resource-table-card">
          <table className="facilities-table ui-table">
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
                      {!isReadOnly && (
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
              {filteredFacilities.length === 0 && (
                <tr>
                  <td colSpan="5" className="resource-table-empty">
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
        <Modal
          title={editingFacility ? 'Edit Resource' : 'Add New Resource'}
          subtitle="Maintain a consistent resource structure across the dashboard."
          size="md"
          onClose={handleCloseModal}
          footer={
            <>
              <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" form="manage-resource-form">Save Changes</Button>
            </>
          }
        >
          <form id="manage-resource-form" onSubmit={handleSubmit}>
            <ResourceFormFields
              formData={formData}
              onChange={handleInputChange}
              facilityTypes={FACILITY_TYPES}
              facilityStatuses={FACILITY_STATUSES}
              buildings={BUILDINGS}
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

export default ManageResources

