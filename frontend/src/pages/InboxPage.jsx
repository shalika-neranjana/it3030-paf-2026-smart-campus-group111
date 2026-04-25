import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import ReactMarkdown from 'react-markdown'
import { Mail, MailOpen, Trash2, Clock, User, CheckCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import './InboxPage.css'

const InboxPage = ({ onMessageRead }) => {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/api/messages/my')
      setMessages(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message)
    const msgId = message.id || message._id
    if (!message.read && !message.isRead && msgId) {
      try {
        const { data } = await api.patch(`/api/messages/${msgId}/read`)
        const updatedMessage = { ...message, ...data, read: true, isRead: true }
        // Update local state
        setMessages(messages.map(m => (m.id === msgId || m._id === msgId) ? updatedMessage : m))
        setSelectedMessage(updatedMessage)
        if (onMessageRead) onMessageRead()
      } catch (error) {
        console.error('Failed to mark message as read:', error)
      }
    }
  }

  const handleMarkAsRead = async (e, message) => {
    e.stopPropagation()
    const msgId = message.id || message._id
    if ((message.read || message.isRead) || !msgId) return
    try {
      const { data } = await api.patch(`/api/messages/${msgId}/read`)
      const updatedMessage = { ...message, ...data, read: true, isRead: true }
      // Update local state
      setMessages(messages.map(m => (m.id === msgId || m._id === msgId) ? updatedMessage : m))
      if (selectedMessage?.id === msgId || selectedMessage?._id === msgId) {
        setSelectedMessage(updatedMessage)
      }
      if (onMessageRead) onMessageRead()
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to mark message as read. Please try again.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    }
  }

  const handleDeleteMessage = async (e, id) => {
    e.stopPropagation()
    const msgId = id
    if (!msgId) return
    try {
      await api.delete(`/api/messages/${msgId}`)
      setMessages(messages.filter(m => (m.id !== msgId && m._id !== msgId)))
      if (selectedMessage?.id === msgId || selectedMessage?._id === msgId) setSelectedMessage(null)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  if (loading) return <div className="inbox-loading">Loading messages...</div>

  return (
    <div className="inbox-container">
      <div className="inbox-sidebar">
        <div className="inbox-header">
          <h2>Inbox</h2>
          <span className="message-count">{messages.length} Messages</span>
        </div>
        <div className="message-list">
          {messages.length === 0 ? (
            <div className="no-messages" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              Your inbox is empty
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''} ${(!message.read && !message.isRead) ? 'unread' : ''}`}
                onClick={() => handleSelectMessage(message)}
              >
                <div className="message-status-icon">
                  {(message.read || message.isRead) ? <MailOpen size={18} /> : <Mail size={18} className="unread-icon" />}
                </div>
                <div className="message-preview">
                  <div className="message-title">{message.title}</div>
                  <div className="message-date">{new Date(message.sentAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="message-detail">
        {selectedMessage ? (
          <div className="message-content">
            <div className="message-detail-header">
              <div className="message-detail-top">
                <h3>{selectedMessage.title}</h3>
                <div className="message-detail-actions">
                  {!(selectedMessage.read || selectedMessage.isRead) && (
                    <button className="action-btn mark-read" onClick={(e) => handleMarkAsRead(e, selectedMessage)}>
                      <CheckCircle size={18} /> Mark as Read
                    </button>
                  )}
                  <button className="action-btn delete" onClick={(e) => handleDeleteMessage(e, selectedMessage.id)}>
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
              <div className="message-meta">
                <span className="meta-item"><User size={14} /> {selectedMessage.senderId || 'System'}</span>
                <span className="meta-item"><Clock size={14} /> {new Date(selectedMessage.sentAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="message-body markdown-body">
              <ReactMarkdown>{selectedMessage.body}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="empty-detail">
            <Mail size={48} />
            <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InboxPage
