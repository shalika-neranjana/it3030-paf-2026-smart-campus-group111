import { useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { extractErrorMessage } from '../lib/alerts'
import ChatContainer from '../components/assistant/ChatContainer'
import InputBar from '../components/assistant/InputBar'
import SuggestionPanel from '../components/assistant/SuggestionPanel'

const SUGGESTIONS = [
  'Is Auditorium available next sunday?',
  'Request a Book A403 lab for 20 students friday 3 pm',
  'Summary of my booked schedule',
  'Create support ticket: projector not working in A403 with high priority',
]

const PLACEHOLDER_BY_INTENT = {
  availability: 'Ask about availability or request a booking...',
  bookings: 'Request a booking. Example: Book A403 for friday 3 pm for 20 students',
  tickets: 'Describe the issue to create a support ticket...',
}

const AiAssistantPage = () => {
  const [threadTitle, setThreadTitle] = useState('Campus Booking Assistant')
  const [activeIntent, setActiveIntent] = useState('availability')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)
  const status = loading ? 'PROCESSING' : 'READY'

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])
  const dynamicPlaceholder = PLACEHOLDER_BY_INTENT[activeIntent]

  const resetConversation = () => {
    setThreadTitle('Campus Booking Assistant')
    setMessages([])
    setInput('')
    textareaRef.current?.focus()
  }

  const sendMessage = async (value) => {
    const text = value.trim()
    if (!text || loading) return

    if (messages.length <= 1) {
      setThreadTitle(text.length > 45 ? `${text.slice(0, 45)}...` : text)
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((previous) => [...previous, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/api/assistant/chat', { message: text })
      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message || 'I could not generate a response.',
          action: data.action,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: extractErrorMessage(error, 'Unable to process your request right now.'),
          action: 'ERROR',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    await sendMessage(input)
  }

  const handleSuggestionAutofill = (text) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  return (
    <section className="ai-assistant">
      <div className="ai-assistant-shell">
        <SuggestionPanel
          suggestions={SUGGESTIONS}
          onSuggestionClick={handleSuggestionAutofill}
          loading={loading}
          onReset={resetConversation}
        />

        <div className="ai-chat-column">
          <ChatContainer
            title={threadTitle}
            status={status}
            messages={messages}
            loading={loading}
            suggestions={SUGGESTIONS}
            activeIntent={activeIntent}
            onIntentChange={setActiveIntent}
          />
          <InputBar
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            canSend={canSend}
            loading={loading}
            placeholder={dynamicPlaceholder}
            inputRef={textareaRef}
          />
        </div>
      </div>
    </section>
  )
}

export default AiAssistantPage
