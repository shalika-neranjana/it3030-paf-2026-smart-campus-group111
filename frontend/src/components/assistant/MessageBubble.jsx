import { Bot, User } from 'lucide-react'

const formatTimestamp = (value) => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const MessageBubble = ({ role, content, action, timestamp }) => {
  const isAssistant = role === 'assistant'

  return (
    <article className={`ai-message ai-message-${isAssistant ? 'assistant' : 'user'}`} tabIndex={0}>
      <div className="ai-message-header">
        {isAssistant ? <Bot size={15} aria-hidden="true" /> : <User size={15} aria-hidden="true" />}
        <span>{isAssistant ? 'Assistant' : 'You'}</span>
        {action ? <small className="ai-message-action">{action.replaceAll('_', ' ')}</small> : null}
      </div>
      <p>{content}</p>
      <time className="ai-message-time">{formatTimestamp(timestamp)}</time>
    </article>
  )
}

export default MessageBubble
