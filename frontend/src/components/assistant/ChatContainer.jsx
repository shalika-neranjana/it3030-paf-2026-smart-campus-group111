import { Bot, CalendarClock } from 'lucide-react'
import MessageBubble from './MessageBubble'

const TypingIndicator = () => (
  <div className="ai-typing" aria-live="polite">
    <span className="ai-dot" />
    <span className="ai-dot" />
    <span className="ai-dot" />
    <span>Assistant is typing...</span>
  </div>
)

const LoadingSkeleton = () => (
  <div className="ai-skeleton-wrap" aria-hidden="true">
    <div className="ai-skeleton ai-skeleton-line" />
    <div className="ai-skeleton ai-skeleton-line ai-skeleton-line-short" />
  </div>
)

const EmptyState = ({ suggestions }) => (
  <div className="ai-empty-state">
    <Bot size={26} aria-hidden="true" />
    <h3>Welcome to Campus AI Assistant</h3>
    <p>Ask about resource availability, request bookings, and manage support quickly.</p>
    <div className="ai-empty-examples">
      {suggestions.slice(0, 2).map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  </div>
)

const ChatContainer = ({
  title,
  status,
  messages,
  loading,
  suggestions,
  activeIntent,
  onIntentChange,
}) => {
  const showEmptyState = messages.length === 0

  return (
    <div className="ai-chat-panel">
      <header className="ai-chat-head">
        <div className="ai-chat-title-row">
          <div className="ai-chat-avatar">
            <Bot size={18} aria-hidden="true" />
          </div>
          <div>
            <h2>{title}</h2>
            <p>Student / Lecturer / Instructor support</p>
          </div>
        </div>
        <div className="ai-chat-head-right">
          <span className={`ai-status-badge ai-status-${status.toLowerCase()}`}>{status}</span>
          <div className="ai-capability-tabs" role="tablist" aria-label="Assistant capabilities">
            <button
              className={`ai-capability-tab ${activeIntent === 'availability' ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeIntent === 'availability'}
              onClick={() => onIntentChange('availability')}
            >
              <CalendarClock size={14} aria-hidden="true" />
              Availability
            </button>
            <button
              className={`ai-capability-tab ${activeIntent === 'bookings' ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeIntent === 'bookings'}
              onClick={() => onIntentChange('bookings')}
            >
              Bookings
            </button>
            <button
              className={`ai-capability-tab ${activeIntent === 'tickets' ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeIntent === 'tickets'}
              onClick={() => onIntentChange('tickets')}
            >
              Tickets
            </button>
          </div>
        </div>
      </header>

      <section className="ai-chat-window" aria-label="Conversation thread">
        {showEmptyState ? <EmptyState suggestions={suggestions} /> : null}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            action={message.action}
            timestamp={message.timestamp}
          />
        ))}
        {loading ? (
          <>
            <LoadingSkeleton />
            <TypingIndicator />
          </>
        ) : null}
      </section>
    </div>
  )
}

export default ChatContainer
