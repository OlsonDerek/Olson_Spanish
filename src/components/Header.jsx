import './Header.css'

export function Header({ title, viewMode, currentWeek, currentUnit, currentCourse, onSideNavToggle, onCalendarToggle, onVoiceToggle }) {
  const getSubtitle = () => {
    switch (viewMode) {
      case 'course':
        return currentCourse?.title
      case 'unit':
        return currentUnit?.title
      case 'week':
      default:
        return currentWeek?.title
    }
  }

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'course':
        return 'Course View'
      case 'unit':
        return 'Unit View'  
      case 'week':
      default:
        return ''
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <button 
          className="nav-toggle"
          onClick={onSideNavToggle}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 12h18m-9 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="title-section">
          <h1 className="app-title">{title}</h1>
          {getSubtitle() && <h2 className="subtitle">{getSubtitle()}</h2>}
          {getViewModeLabel() && <span className="view-mode-label">{getViewModeLabel()}</span>}
        </div>

        <div className="header-actions">
          <button 
            className="calendar-toggle"
            onClick={onCalendarToggle}
            aria-label="Toggle calendar view"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
          <button
            className="voice-toggle"
            onClick={onVoiceToggle}
            aria-label="Select voice"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" />
              <path d="M17 8v8" />
              <path d="M7 8v8" />
              <path d="M4 12h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}