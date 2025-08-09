import { useState, useMemo } from 'preact/hooks'
import './CalendarNav.css'

export function CalendarNav({ isOpen, weeks, currentWeekId, onWeekSelect, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthData = useMemo(() => {
    if (!weeks || weeks.length === 0) return { weeks: [], monthName: '', year: '' }

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' })
    const year = currentMonth.getFullYear()
    
    // Filter weeks that fall within the current month view
    const monthWeeks = weeks.filter(week => {
      // Parse the week's start date from the dateRange
      const dateMatch = week.dateRange.match(/(\w+)\s+(\d+)/)
      if (!dateMatch) return false
      
      const [, monthStr, day] = dateMatch
      const weekDate = new Date(`${monthStr} ${day}, ${year}`)
      
      return weekDate.getMonth() === currentMonth.getMonth() && 
             weekDate.getFullYear() === currentMonth.getFullYear()
    })

    return { weeks: monthWeeks, monthName, year: year.toString() }
  }, [weeks, currentMonth])

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  if (!weeks || weeks.length === 0) return null

  return (
    <div className={`calendar-nav ${isOpen ? 'open' : ''}`}>
      <div className="calendar-header">
        <h3>Calendar</h3>
        <button 
          className="close-button"
          onClick={onClose}
          aria-label="Close calendar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="calendar-content">
        <div className="month-navigation">
          <button 
            className="nav-arrow"
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          
          <h4 className="month-title">
            {monthData.monthName} {monthData.year}
          </h4>
          
          <button 
            className="nav-arrow"
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9,6 15,12 9,18"/>
            </svg>
          </button>
        </div>

        <div className="calendar-weeks">
          {monthData.weeks.length > 0 ? (
            monthData.weeks.map((week) => (
              <button
                key={week.id}
                className={`calendar-week-item ${currentWeekId === week.id ? 'active' : ''}`}
                onClick={() => onWeekSelect(week.id)}
              >
                <div className="week-info">
                  <h5 className="week-title">{week.title}</h5>
                  <p className="week-dates">{week.dateRange}</p>
                </div>
                {currentWeekId === week.id && (
                  <div className="active-indicator">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="no-weeks">
              <p>No weeks available for {monthData.monthName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}