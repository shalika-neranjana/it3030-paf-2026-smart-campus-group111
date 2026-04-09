import { useEffect, useState } from 'react'
import { api, resolveApiUrl } from '../lib/api'
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, Image as ImageIcon, Send, Trash2, Edit2 } from 'lucide-react'
import './MaintenanceTicketing.css'

const MaintenanceTicketing = ({ mode = 'my' }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [facilities, setFacilities] = useState([])
  
  // Create Ticket Form State
  const [newTicket, setNewTicket] = useState({
    resourceId: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    preferredContactDetails: '',
    attachmentUrls: []
  })
  const [uploading, setUploading] = useState(false)

  // Comments State
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  const user = JSON.parse(localStorage.getItem('authUser') || '{}')
  const isAdmin = user.role === 'ADMINISTRATOR' || user.role === 'MANAGER' || user.role === 'STAFF'

  useEffect(() => {
    fetchTickets()
    fetchFacilities()
  }, [mode])

  useEffect(() => {
    if (selectedTicket) {
      fetchComments(selectedTicket.id)
    }
  }, [selectedTicket])

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
    try {
      await api.post('/api/tickets', newTicket)
      setShowCreateModal(false)
      setNewTicket({
        resourceId: '',
        category: '',
        description: '',
        priority: 'MEDIUM',
        preferredContactDetails: '',
        attachmentUrls: []
      })
      fetchTickets()
    } catch (error) {
      alert('Failed to create ticket: ' + (error.response?.data?.message || error.message))
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

  const handleUpdateStatus = async (ticketId, status, extra = {}) => {
    try {
      await api.put(`/api/tickets/${ticketId}`, { status, ...extra })
      fetchTickets()
      if (selectedTicket?.id === ticketId) {
        const { data } = await api.get(`/api/tickets/${ticketId}`)
        setSelectedTicket(data)
      }
    } catch (error) {
      alert('Failed to update status')
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

  if (loading) return <div className="loading-spinner">Loading tickets...</div>

  return (
    <div className="maintenance-container">
      <div className="maintenance-header">
        <h1>{mode === 'my' ? 'My Support Tickets' : 'Support Ticket Management'}</h1>
        {mode === 'my' && (
          <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> New Ticket
          </button>
        )}
      </div>

      <div className="tickets-grid">
        <div className="tickets-list">
          {tickets.length === 0 ? (
            <div className="empty-state">No tickets found.</div>
          ) : (
            tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`ticket-card ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
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
                  <span className="ticket-date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="ticket-details-view">
          {selectedTicket ? (
            <div className="ticket-details-content">
              <div className="details-header">
                <h2>Ticket #{selectedTicket.id.substring(0, 8)}</h2>
                <div className="details-actions">
                  {isAdmin && (
                    <>
                      {selectedTicket.status === 'OPEN' && (
                        <button className="action-btn progress" onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS', { assignedTechnicianId: user.id })}>
                          Take Ownership
                        </button>
                      )}
                      {selectedTicket.status === 'IN_PROGRESS' && (
                        <button className="action-btn resolved" onClick={() => {
                          const notes = prompt('Enter resolution notes:')
                          if (notes) handleUpdateStatus(selectedTicket.id, 'RESOLVED', { resolutionNotes: notes })
                        }}>
                          Mark Resolved
                        </button>
                      )}
                      {selectedTicket.status === 'OPEN' && (
                        <button className="action-btn rejected" onClick={() => {
                          const reason = prompt('Enter rejection reason:')
                          if (reason) handleUpdateStatus(selectedTicket.id, 'REJECTED', { rejectionReason: reason })
                        }}>
                          Reject
                        </button>
                      )}
                    </>
                  )}
                  {selectedTicket.status === 'RESOLVED' && (selectedTicket.requesterId === user.id || isAdmin) && (
                    <button className="action-btn closed" onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}>
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>

              <div className="details-grid">
                <div className="details-info">
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
                  <h3>Comments</h3>
                  <div className="comments-list">
                    {comments.map(comment => (
                      <div key={comment.id} className={`comment-item ${comment.userId === user.id ? 'own' : ''}`}>
                        <div className="comment-header">
                          <span className="comment-user"><User size={12} /> {comment.userId === user.id ? 'You' : 'Staff'}</span>
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
          <div className="modal-content">
            <h2>Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label>Resource / Location</label>
                <select 
                  required 
                  value={newTicket.resourceId} 
                  onChange={(e) => setNewTicket({...newTicket, resourceId: e.target.value})}
                >
                  <option value="">Select a location</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name} ({f.location})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Electrical, Plumbing, IT" 
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                />
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
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  required 
                  placeholder="Describe the issue in detail" 
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Preferred Contact Details</label>
                <input 
                  type="text" 
                  placeholder="Email or Phone" 
                  value={newTicket.preferredContactDetails}
                  onChange={(e) => setNewTicket({...newTicket, preferredContactDetails: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Attachments (Max 3)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={uploading || newTicket.attachmentUrls.length >= 3}
                />
                {uploading && <span>Uploading...</span>}
                <div className="upload-previews">
                  {newTicket.attachmentUrls.map((url, i) => (
                    <div key={i} className="preview-item">
                      <img src={resolveApiUrl('/uploads/' + url)} alt="preview" />
                      <button type="button" onClick={() => setNewTicket({...newTicket, attachmentUrls: newTicket.attachmentUrls.filter((_, idx) => idx !== i)})}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" disabled={uploading}>Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceTicketing
