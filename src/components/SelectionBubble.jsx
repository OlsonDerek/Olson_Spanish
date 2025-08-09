import './SelectionBubble.css'

export function SelectionBubble({ state, onClick, size = 'medium', disabled = false }) {
  const getIcon = () => {
    switch (state) {
      case 'selected':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        )
      case 'partial':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      case 'none':
      default:
        return null
    }
  }

  const getAriaLabel = () => {
    switch (state) {
      case 'selected':
        return 'Fully selected'
      case 'partial':
        return 'Partially selected'
      case 'none':
      default:
        return 'Not selected'
    }
  }

  return (
    <button
      className={`selection-bubble ${state} ${size} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {getIcon()}
    </button>
  )
}