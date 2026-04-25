import { useEffect, useState, useRef } from 'react'
import { api, resolveApiUrl } from '../lib/api'
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, Image as ImageIcon, Send, Trash2, Edit2, Search } from 'lucide-react'
import Swal from 'sweetalert2'
import './MaintenanceTicketing.css'

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'IT / Network',
  'Furniture / Carpentry',
  'Air Conditioning',
  'Janitorial / Cleaning',
  'Safety / Security',
  'General Maintenance'
]

const MaintenanceTicketing = ({ mode = 'my' }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [facilities, setFacilities] = useState([])
  const [editingTicketId, setEditingTicketId] = useState(null)
  
  // Create Ticket Form State
  const [newTicket, setNewTicket] = useState({
    resourceId: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    attachmentUrls: []
  })
  const [uploading, setUploading] = useState(false)
  const [resourceSearch, setResourceSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)

  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const user = JSON.parse(localStorage.getItem('authUser') || '{}')
  const isAdmin = user.role === 'ADMINISTRATOR' || user.role === 'MANAGER'
  const isStaffOrTech = user.role === 'STAFF' || user.role === 'TECHNICIAN'
  const isCreator = (ticket) => ticket.requesterId === user.id
  const isCreatorView = mode === 'my' && !isAdmin && !isStaffOrTech
  const canShowCreatorActions = (ticket) => (isCreatorView || isCreator(ticket)) && !isAdmin && !isStaffOrTech
  const canEditTicket = (ticket) => ticket.status === 'PENDING'
  const canDeleteTicket = (ticket) => ['RESOLVED', 'REJECTED'].includes(ticket.status)
  const adminCanManageAssignment = (ticket) => isAdmin && ['OPEN', 'IN_PROGRESS'].includes(ticket.status)
  const assignmentButtonLabel = (ticket) => ticket.assignedTechnicianId ? 'Change Assigned Person' : 'Assign'
  const canResolveAssignedTicket = (ticket) =>
    isStaffOrTech &&
    ticket.assignedTechnicianId === user.id &&
    ['OPEN', 'IN_PROGRESS'].includes(ticket.status)
  
  const [staffMembers, setStaffMembers] = useState([])

  useEffect(() => {
    fetchTickets()
    fetchFacilities()
    if (isAdmin) fetchStaffMembers()
  }, [mode])

  useEffect(() => {
    if (selectedTicket) {
      fetchComments(selectedTicket.id)
    }
  }, [selectedTicket])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const endpoint = mode === 'my' ? '/api/tickets/my' : '/api/tickets'
      const { data } = await api.get(endpoint)
      setTickets(data)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFacilities = async () => {
    try {
      const { data } = await api.get('/api/facilities')
      setFacilities(data)
    } catch (error) {
      console.error('Failed to fetch facilities:', error)
    }
  }

  const fetchStaffMembers = async () => {
    try {
      const { data } = await api.get('/api/tickets/staff')
      setStaffMembers(data)
    } catch (error) {
      console.error('Failed to fetch staff members:', error)
    }
  }

  const fetchComments = async (ticketId) => {
    try {
      const { data } = await api.get(`/api/tickets/${ticketId}/comments`)
      setComments(data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newTicket.resourceId) {
      Swal.fire({
        icon: 'error',
        title: 'Resource Required',
        text: 'Please select a valid resource from the search suggestions.'
      })
      return
    }
    try {
      if (editingTicketId) {
        await api.put(`/api/tickets/${editingTicketId}`, newTicket)
      } else {
        await api.post('/api/tickets', newTicket)
      }
      setShowCreateModal(false)
      setEditingTicketId(null)
      setNewTicket({
        resourceId: '',
        category: '',
        description: '',
        priority: 'MEDIUM',
        attachmentUrls: []
      })
      setResourceSearch('')
      Swal.fire({
        icon: 'success',
        title: `Ticket ${editingTicketId ? 'Updated' : 'Created'}`,
        text: `Your maintenance ticket has been ${editingTicketId ? 'updated' : 'submitted'}.`,
        timer: 2000,
        showConfirmButton: false
      })
      fetchTickets()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${editingTicketId ? 'update' : 'create'} ticket: ` + (error.response?.data?.message || error.message)
      })
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: 'Delete Ticket?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/tickets/${ticketId}`)
        setSelectedTicket(null)
        fetchTickets()
        Swal.fire('Deleted!', 'Ticket has been removed.', 'success')
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete ticket'
        })
      }
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (newTicket.attachmentUrls.length + files.length > 3) {
      alert('Maximum 3 attachments allowed')
      return
    }

    setUploading(true)
    const uploadedUrls = [...newTicket.attachmentUrls]
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        const { data } = await api.post('/api/tickets/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        uploadedUrls.push(data)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
    
    setNewTicket({ ...newTicket, attachmentUrls: uploadedUrls })
    setUploading(false)
  }

  const updateTicket = async (ticketId, payload, successTitle = 'Ticket Updated') => {
    try {
      await api.put(`/api/tickets/${ticketId}`, payload)
      fetchTickets()
      if (selectedTicket?.id === ticketId) {
        const { data } = await api.get(`/api/tickets/${ticketId}`)
        setSelectedTicket(data)
      }
      Swal.fire({
        icon: 'success',
        title: successTitle,
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to update ticket'
      })
    }
  }

  const handleUpdateStatus = async (ticketId, status, extra = {}) => {
    await updateTicket(ticketId, { status, ...extra }, 'Status Updated')
  }

  const handleAssignTicket = async (ticket, assignedTechnicianId) => {
    await updateTicket(ticket.id, { assignedTechnicianId }, 'Assignment Updated')
  }

  const promptAssignTicket = async (ticket) => {
    const availableStaff = staffMembers.filter(member => member.id !== user.id)
    const { value: techId } = await Swal.fire({
      title: ticket.assignedTechnicianId ? 'Change Assigned Person' : 'Assign Ticket',
      input: 'select',
      inputOptions: Object.fromEntries(
        availableStaff.map(member => [member.id, `${member.firstName} ${member.lastName} (${member.role})`.trim()])
      ),
      inputValue: ticket.assignedTechnicianId || '',
      inputPlaceholder: 'Select staff member',
      showCancelButton: true
    })

    if (techId) {
      await handleAssignTicket(ticket, techId)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      await api.post(`/api/tickets/${selectedTicket.id}/comments`, { content: newComment })
      setNewComment('')
      fetchComments(selectedTicket.id)
    } catch (error) {
      alert('Failed to add comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    try {
      await api.delete(`/api/tickets/comments/${commentId}`)
      fetchComments(selectedTicket.id)
    } catch (error) {
      alert('Failed to delete comment')
    }
  }

  const handleUpdateComment = async (commentId) => {
    try {
      await api.put(`/api/tickets/comments/${commentId}`, { content: editCommentContent })
      setEditingCommentId(null)
      fetchComments(selectedTicket.id)
    } catch (error) {
      alert('Failed to update comment')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="status-icon pending" size={16} />
      case 'OPEN': return <AlertCircle className="status-icon open" size={16} />
      case 'IN_PROGRESS': return <Clock className="status-icon progress" size={16} />
      case 'RESOLVED': return <CheckCircle className="status-icon resolved" size={16} />
      case 'CLOSED': return <CheckCircle className="status-icon closed" size={16} />
      case 'REJECTED': return <XCircle className="status-icon rejected" size={16} />
      default: return null
    }
  }

  const getPriorityClass = (priority) => {
    return `priority-badge ${priority.toLowerCase()}`
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  if (loading) return <div className="loading-spinner">Loading tickets...</div>

  return (
    <div className="maintenance-container">
      <div className="maintenance-header">
        <h1>
          {mode === 'my'
            ? 'My Support Tickets'
            : isStaffOrTech
              ? 'Assigned Support Tickets'
              : 'Support Ticket Management'}
        </h1>
        {mode === 'my' && (
          <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> New Ticket
          </button>
        )}
      </div>

      <div className="tickets-grid">
        <div className="tickets-list">
          <div className="tickets-list-filters">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="filter-row">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ gridColumn: 'span 2' }}>
                <option value="ALL">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="tickets-scroll-area">
            {filteredTickets.length === 0 ? (
              <div className="empty-state">No tickets found matching your filters.</div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className={`ticket-card ${selectedTicket?.id === ticket.id ? 'active' : ''} ${canShowCreatorActions(ticket) || canResolveAssignedTicket(ticket) ? 'creator-ticket-card' : ''}`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="ticket-card-header">
                    <span className="ticket-category">{ticket.category}</span>
                    <span className={getPriorityClass(ticket.priority)}>{ticket.priority}</span>
                  </div>
                  <h3>{ticket.description.substring(0, 50)}{ticket.description.length > 50 ? '...' : ''}</h3>
                    <div className="ticket-card-footer">
                      <div className="ticket-status">
                        {getStatusIcon(ticket.status)}
                        <span>{ticket.status.replace('_', ' ')}</span>
                      </div>
                      <div className="ticket-card-actions">
                        {canShowCreatorActions(ticket) && (
                          <button 
                            className="card-action-btn edit" 
                            type="button"
                            disabled={!canEditTicket(ticket)}
                            title={canEditTicket(ticket) ? 'Edit ticket' : 'Editing is only available while the ticket is pending'}
                            onClick={(e) => {
                              if (!canEditTicket(ticket)) return
                              e.stopPropagation()
                              setEditingTicketId(ticket.id)
                              setNewTicket({
                                resourceId: ticket.resourceId,
                                category: ticket.category,
                                description: ticket.description,
                                priority: ticket.priority,
                                attachmentUrls: ticket.attachmentUrls
                              })
                              setResourceSearch(facilities.find(f => f.id === ticket.resourceId)?.name || '')
                              setShowCreateModal(true)
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                        {canShowCreatorActions(ticket) && (
                          <button 
                            className="card-action-btn delete" 
                            type="button"
                            disabled={!canDeleteTicket(ticket)}
                            title={canDeleteTicket(ticket) ? 'Delete ticket' : 'Deletion is only available when the ticket is resolved or rejected'}
                            onClick={(e) => {
                              if (!canDeleteTicket(ticket)) return
                              e.stopPropagation()
                              handleDeleteTicket(ticket.id)
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        {canResolveAssignedTicket(ticket) && (
                          <button
                            className="card-action-btn resolve"
                            type="button"
                            title="Mark ticket as resolved"
                            onClick={async (e) => {
                              e.stopPropagation()
                              const { value: notes } = await Swal.fire({
                                title: 'Resolution Notes',
                                input: 'textarea',
                                inputLabel: 'Enter details about the fix:',
                                inputPlaceholder: 'The issue was resolved by...',
                                showCancelButton: true
                              })
                              if (notes) handleUpdateStatus(ticket.id, 'RESOLVED', { resolutionNotes: notes })
                            }}
                          >
                            <CheckCircle size={12} />
                          </button>
                        )}
                      </div>
                      <span className="ticket-date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ticket-details-view">
          {selectedTicket ? (
            <div className="ticket-details-content">
              <div className="details-header">
                <h2>Ticket #{selectedTicket.id.substring(0, 8)}</h2>
                <div className="details-actions">
                  {isAdmin && selectedTicket.status === 'PENDING' && (
                    <>
                      <button className="action-btn resolved" onClick={() => handleUpdateStatus(selectedTicket.id, 'OPEN')}>
                        Accept Ticket
                      </button>
                      <button className="action-btn rejected" onClick={async () => {
                        const { value: reason } = await Swal.fire({
                          title: 'Rejection Reason',
                          input: 'text',
                          inputLabel: 'Why is this ticket being rejected?',
                          inputPlaceholder: 'Invalid request...',
                          showCancelButton: true
                        })
                        if (reason) handleUpdateStatus(selectedTicket.id, 'REJECTED', { rejectionReason: reason })
                      }}>
                        Reject
                      </button>
                    </>
                  )}
                  
                  {adminCanManageAssignment(selectedTicket) && (
                    <>
                      <button className="action-btn progress" onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS', { assignedTechnicianId: user.id })}>
                        Take Ownership
                      </button>
                      <button className="action-btn assign" onClick={() => promptAssignTicket(selectedTicket)}>
                        {assignmentButtonLabel(selectedTicket)}
                      </button>
                    </>
                  )}

                  {isStaffOrTech && selectedTicket.status === 'OPEN' && selectedTicket.assignedTechnicianId === user.id && (
                    <button className="action-btn progress" onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}>
                      Accept & Start
                    </button>
                  )}

                  {(isAdmin || (isStaffOrTech && selectedTicket.assignedTechnicianId === user.id)) &&
                    (selectedTicket.status === 'OPEN' || selectedTicket.status === 'IN_PROGRESS') && (
                    <button className="action-btn resolved" onClick={async () => {
                      const { value: notes } = await Swal.fire({
                        title: 'Resolution Notes',
                        input: 'textarea',
                        inputLabel: 'Enter details about the fix:',
                        inputPlaceholder: 'The issue was resolved by...',
                        showCancelButton: true
                      })
                      if (notes) handleUpdateStatus(selectedTicket.id, 'RESOLVED', { resolutionNotes: notes })
                    }}>
                      Mark Resolved
                    </button>
                  )}

                  {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'REJECTED') && isCreator(selectedTicket) && !isAdmin && !isStaffOrTech && (
                    <button className="action-btn closed" onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}>
                      Close Ticket
                    </button>
                  )}

                  {canShowCreatorActions(selectedTicket) && (
                    <button 
                      className="action-btn edit-btn" 
                      type="button"
                      disabled={!canEditTicket(selectedTicket)}
                      title={canEditTicket(selectedTicket) ? 'Edit ticket' : 'Editing is only available while the ticket is pending'}
                      onClick={() => {
                        if (!canEditTicket(selectedTicket)) return
                        setEditingTicketId(selectedTicket.id)
                        setNewTicket({
                          resourceId: selectedTicket.resourceId,
                          category: selectedTicket.category,
                          description: selectedTicket.description,
                          priority: selectedTicket.priority,
                          attachmentUrls: selectedTicket.attachmentUrls
                        })
                        setResourceSearch(facilities.find(f => f.id === selectedTicket.resourceId)?.name || '')
                        setShowCreateModal(true)
                      }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}

                  {canShowCreatorActions(selectedTicket) && (
                    <button
                      className="action-btn delete-btn"
                      type="button"
                      disabled={!canDeleteTicket(selectedTicket)}
                      title={canDeleteTicket(selectedTicket) ? 'Delete ticket' : 'Deletion is only available when the ticket is resolved or rejected'}
                      onClick={() => {
                        if (!canDeleteTicket(selectedTicket)) return
                        handleDeleteTicket(selectedTicket.id)
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="details-grid">
                <div className="details-info">
                  {selectedTicket.assignedTechnicianId && (
                    <div className="info-group assigned">
                      <label>Assigned To</label>
                      <p>
                        {staffMembers.find(s => s.id === selectedTicket.assignedTechnicianId) 
                          ? `${staffMembers.find(s => s.id === selectedTicket.assignedTechnicianId).firstName} ${staffMembers.find(s => s.id === selectedTicket.assignedTechnicianId).lastName}`
                          : 'Staff Member'}
                      </p>
                    </div>
                  )}
                  <div className="info-group">
                    <label>Location / Resource</label>
                    <p>{facilities.find(f => f.id === selectedTicket.resourceId)?.name || 'Unknown'}</p>
                  </div>
                  <div className="info-group">
                    <label>Status</label>
                    <p className={`status-text ${selectedTicket.status.toLowerCase()}`}>{selectedTicket.status.replace('_', ' ')}</p>
                  </div>
                  <div className="info-group">
                    <label>Description</label>
                    <p>{selectedTicket.description}</p>
                  </div>
                  {selectedTicket.resolutionNotes && (
                    <div className="info-group resolution">
                      <label>Resolution Notes</label>
                      <p>{selectedTicket.resolutionNotes}</p>
                    </div>
                  )}
                   {selectedTicket.rejectionReason && (
                    <div className="info-group rejection">
                      <label>Rejection Reason</label>
                      <p>{selectedTicket.rejectionReason}</p>
                    </div>
                  )}
                  <div className="info-group">
                    <label>Attachments ({selectedTicket.attachmentUrls.length}/3)</label>
                    <div className="attachments-list">
                      {selectedTicket.attachmentUrls.map((url, i) => (
                        <img key={i} src={resolveApiUrl('/uploads/' + url)} alt="attachment" onClick={() => window.open(resolveApiUrl('/uploads/' + url))} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="comments-section">
                  <h3>Chat & Communication</h3>
                  <div className="comments-list">
                    {comments.map(comment => (
                      <div key={comment.id} className={`comment-item ${comment.userId === user.id ? 'own' : ''}`}>
                        <div className="comment-header">
                          <span className="comment-user"><User size={12} /> {comment.userId === user.id ? 'You' : `${comment.userName} (${comment.userRole})`}</span>
                          <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="edit-comment">
                            <textarea value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} />
                            <div className="edit-actions">
                              <button onClick={() => handleUpdateComment(comment.id)}>Save</button>
                              <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p className="comment-content">{comment.content}</p>
                        )}
                        {comment.userId === user.id && editingCommentId !== comment.id && (
                          <div className="comment-actions">
                            <button onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); }}><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteComment(comment.id)}><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <form className="comment-form" onSubmit={handleAddComment}>
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                    />
                    <button type="submit"><Send size={18} /></button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-ticket-selected">
              <MessageSquare size={48} />
              <p>Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content ticket-modal">
            <div className="modal-header">
              <h2>{editingTicketId ? 'Edit Support Ticket' : 'Create Support Ticket'}</h2>
              <p>{editingTicketId ? 'Modify the details below to update your ticket' : 'Fill in the details to submit a new maintenance request'}</p>
            </div>
            
            <form onSubmit={handleCreateTicket} className="premium-form">
              <div className="form-row">
                <div className="form-group resource-group" ref={suggestionsRef}>
                  <label>Resource / Location</label>
                  <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} />
                    <input 
                      type="text"
                      placeholder="Search resource..."
                      value={resourceSearch}
                      onChange={(e) => {
                        setResourceSearch(e.target.value)
                        setNewTicket(prev => ({ ...prev, resourceId: '' }))
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      required
                    />
                  </div>
                  {showSuggestions && (
                    <div className="suggestions-list">
                      {facilities
                        .filter(f => f.name.toLowerCase().includes(resourceSearch.toLowerCase()))
                        .map(f => (
                          <div 
                            key={f.id} 
                            className="suggestion-item"
                            onClick={() => {
                              setNewTicket({ ...newTicket, resourceId: f.id })
                              setResourceSearch(f.name)
                              setShowSuggestions(false)
                            }}
                          >
                            <span className="suggestion-name">{f.name}</span>
                            <span className="suggestion-type">{f.type}</span>
                          </div>
                        ))}
                      {facilities.filter(f => f.name.toLowerCase().includes(resourceSearch.toLowerCase())).length === 0 && (
                        <div className="no-suggestions">No resources found</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    required 
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea 
                  required 
                  placeholder="Describe the issue in detail..." 
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
                <label>Attachments (Max 3)</label>
                <div className="upload-zone">
                  <input 
                    type="file" 
                    id="file-upload"
                    multiple 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    disabled={uploading || newTicket.attachmentUrls.length >= 3}
                    className="hidden-file-input"
                  />
                  <label htmlFor="file-upload" className="upload-label">
                    <ImageIcon size={24} />
                    <span>{uploading ? 'Uploading...' : 'Click to upload or drag images'}</span>
                  </label>
                </div>
                
                <div className="upload-previews">
                  {newTicket.attachmentUrls.map((url, i) => (
                    <div key={i} className="preview-item">
                      <img src={resolveApiUrl('/uploads/' + url)} alt="preview" />
                      <button type="button" className="remove-preview" onClick={() => setNewTicket({...newTicket, attachmentUrls: newTicket.attachmentUrls.filter((_, idx) => idx !== i)})}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => { setShowCreateModal(false); setEditingTicketId(null); }}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={uploading}>
                  {uploading ? 'Processing...' : (editingTicketId ? 'Update Ticket' : 'Submit Ticket')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceTicketing
