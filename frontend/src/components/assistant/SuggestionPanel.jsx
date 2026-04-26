import { Lightbulb } from 'lucide-react'
import Button from '../ui/Button'

const SuggestionPanel = ({ suggestions, onSuggestionClick, loading, onReset }) => {
  return (
    <aside className="ai-assistant-sidebar" aria-label="Suggestion panel">
      <div className="ai-assistant-sidebar-head">
        <Lightbulb size={18} aria-hidden="true" />
        <h3>Try These</h3>
      </div>
      <p className="ai-assistant-sidebar-copy">
        Select an example to fill the input and edit as needed before sending.
      </p>
      <div className="ai-assistant-suggestions" role="list">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            className="ai-suggestion-chip"
            onClick={() => onSuggestionClick(item)}
            disabled={loading}
            role="listitem"
          >
            {item}
          </button>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={onReset} disabled={loading}>
        Clear Chat
      </Button>
    </aside>
  )
}

export default SuggestionPanel
