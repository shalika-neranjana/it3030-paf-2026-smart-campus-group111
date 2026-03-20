import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import ReactMarkdown from 'react-markdown'
import { Mail, MailOpen, Trash2, Clock, User } from 'lucide-react'
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
    if (!message.read) {
      try {
        await api.patch(`/api/messages/${message.id}/read`)
        // Update local state
        setMessages(messages.map(m => m.id === message.id ? { ...m, read: true, readAt: new Date().toISOString() } : m))
        if (onMessageRead) onMessageRead()
      } catch (error) {
        console.error('Failed to mark message as read:', error)
      }
    }
  }

  const handleDeleteMessage = async (e, id) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/messages/${id}`)
      setMessages(messages.filter(m => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
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
                className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''} ${!message.read ? 'unread' : ''}`}
                onClick={() => handleSelectMessage(message)}
              >
                <div className="message-status-icon">
                  {message.read ? <MailOpen size={18} /> : <Mail size={18} className="unread-icon" />}
                </div>
                <div className="message-preview">
                  <div className="message-title">{message.title}</div>
                  <div className="message-date">{new Date(message.sentAt).toLocaleDateString()}</div>
                </div>
                <button className="delete-message-btn" onClick={(e) => handleDeleteMessage(e, message.id)} title="Delete message">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="message-detail">
        {selectedMessage ? (
          <div className="message-content">
            <div className="message-detail-header">
              <h3>{selectedMessage.title}</h3>
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
