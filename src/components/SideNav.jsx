import { useState } from 'preact/hooks'
import { SelectionBubble } from './SelectionBubble'
import './SideNav.css'

export function SideNav({ 
  isOpen, 
  config, 
  currentWeekId, 
  currentUnitId, 
  currentCourseId,
  selectionStates,
  onWeekSelect, 
  onUnitSelect, 
  onCourseSelect,
  onWeekToggle,
  onUnitToggle,
  onCourseToggle,
  onClose 
}) {
  const [expandedCourses, setExpandedCourses] = useState(new Set([currentCourseId]))
  const [expandedUnits, setExpandedUnits] = useState(new Set([currentUnitId]))

  if (!config || !config.courses || config.courses.length === 0) return null

  // Helper function to get session data for any week from localStorage
  const getWeekSession = (weekId) => {
    try {
      const vocabKey = `session.vocabReviewed.${weekId}`
      const phraseKey = `session.phraseReviewed.${weekId}`
      const vocabReviewed = JSON.parse(localStorage.getItem(vocabKey) || '[]')
      const phraseReviewed = JSON.parse(localStorage.getItem(phraseKey) || '[]')
      return { vocabReviewed, phraseReviewed }
    } catch (error) {
      return { vocabReviewed: [], phraseReviewed: [] }
    }
  }

  // Helper function to check if all items in a week are reviewed
  const isWeekFullyReviewed = (week) => {
    if (!week.vocab || !week.phrases) return false
    const weekSession = getWeekSession(week.id)
    const vocabIds = week.vocab.map(v => v.id)
    const phraseIds = week.phrases.map(p => p.id)
    const allVocabReviewed = vocabIds.every(id => weekSession.vocabReviewed.includes(id))
    const allPhrasesReviewed = phraseIds.every(id => weekSession.phraseReviewed.includes(id))
    return allVocabReviewed && allPhrasesReviewed && vocabIds.length > 0 && phraseIds.length > 0
  }

  // Helper function to check if all weeks in a unit are fully reviewed
  const isUnitFullyReviewed = (unit) => {
    if (!unit.weeks || unit.weeks.length === 0) return false
    return unit.weeks.every(week => isWeekFullyReviewed(week))
  }

  // Helper function to check if all weeks in a course are fully reviewed
  const isCourseFullyReviewed = (course) => {
    if (!course.units || course.units.length === 0) return false
    return course.units.every(unit => isUnitFullyReviewed(unit))
  }

  const toggleCourse = (courseId) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId)
    } else {
      newExpanded.add(courseId)
    }
    setExpandedCourses(newExpanded)
  }

  const toggleUnit = (unitId) => {
    const newExpanded = new Set(expandedUnits)
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId)
    } else {
      newExpanded.add(unitId)
    }
    setExpandedUnits(newExpanded)
  }

  return (
    <nav className={`side-nav ${isOpen ? 'open' : ''}`}>
      <div className="side-nav-header">
        <h3>Navigation</h3>
        <button 
          className="close-button"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div className="nav-list">
        {config.courses.map((course) => {
          const courseExpanded = expandedCourses.has(course.id)
          return (
            <div key={course.id} className="nav-section">
              <button
                className={`nav-item course-item ${courseExpanded? 'current':''} has-children`}
                onClick={() => toggleCourse(course.id)}
                aria-expanded={courseExpanded}
              >
                <div className="nav-item-content">
                  <h4 className="nav-item-title">{course.title}</h4>
                  <p className="nav-item-meta">Course • {course.units?.length || 0} units</p>
                </div>
                <div className="nav-item-actions">
                  <SelectionBubble
                    state={selectionStates.courses?.[course.id] || 'none'}
                    onClick={(e) => { e.stopPropagation(); onCourseSelect(course.id); onCourseToggle(course.id) }}
                    size="medium"
                  />
                  {isCourseFullyReviewed(course) && (<div className="reviewed-indicator"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>)}
                </div>
              </button>
              {courseExpanded && course.units && (
                <div className="nav-children">
                  {course.units.map(unit => {
                    const unitExpanded = expandedUnits.has(unit.id)
                    return (
                      <div key={unit.id} className="nav-subsection">
                        <button
                          className={`nav-item unit-item ${unitExpanded? 'current':''} has-children`}
                          onClick={() => toggleUnit(unit.id)}
                          aria-expanded={unitExpanded}
                        >
                          <div className="nav-item-content">
                            <h5 className="nav-item-title">{unit.title}</h5>
                            <p className="nav-item-meta">Unit • {unit.weeks?.length || 0} weeks</p>
                          </div>
                          <div className="nav-item-actions">
                            <SelectionBubble
                              state={selectionStates.units?.[unit.id] || 'none'}
                              onClick={(e) => { e.stopPropagation(); onUnitSelect(unit.id); onUnitToggle(unit.id) }}
                              size="medium"
                            />
                            {isUnitFullyReviewed(unit) && (<div className="reviewed-indicator"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>)}
                          </div>
                        </button>
                        {unitExpanded && unit.weeks && (
                          <div className="nav-children">
                            {unit.weeks.map(week => (
                              <button
                                key={week.id}
                                className={`nav-item week-item ${currentWeekId === week.id ? 'current' : ''}`}
                                onClick={() => onWeekToggle(week.id)}
                              >
                                <div className="nav-item-content">
                                  <h6 className="nav-item-title">{week.title}</h6>
                                  <p className="nav-item-meta">{week.dateRange}</p>
                                </div>
                                <div className="nav-item-actions">
                                  <SelectionBubble
                                    state={selectionStates.weeks?.[week.id] ? 'selected' : 'none'}
                                    onClick={(e) => { e.stopPropagation(); onWeekSelect(week.id); onWeekToggle(week.id) }}
                                    size="small"
                                  />
                                  {isWeekFullyReviewed(week) && (<div className="reviewed-indicator"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>)}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}