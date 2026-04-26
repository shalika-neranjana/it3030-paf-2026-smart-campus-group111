import { Send } from 'lucide-react'
import Button from '../ui/Button'

const InputBar = ({ value, onChange, onSubmit, canSend, loading, placeholder, inputRef }) => {
  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (canSend) {
        onSubmit()
      }
    }
  }

  return (
    <form
      className="ai-assistant-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      aria-label="Message composer"
    >
      <textarea
        ref={inputRef}
        className="ui-textarea ai-composer"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={3}
        aria-label="Chat input"
      />
      <Button type="submit" variant="primary" disabled={!canSend || loading}>
        <Send size={16} aria-hidden="true" />
        Send
      </Button>
    </form>
  )
}

export default InputBar
