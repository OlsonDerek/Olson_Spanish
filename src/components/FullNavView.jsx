import { useState } from 'preact/hooks'
import { SelectionBubble } from './SelectionBubble'
import './FullNavView.css'

export function FullNavView({
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
  onCourseToggle
}) {
  const [expandedCourses, setExpandedCourses] = useState(new Set(config.courses?.map(c => c.id) || []))
  const allUnitIds = (config.courses || []).flatMap(c => (c.units || []).map(u => u.id))
  const [expandedUnits, setExpandedUnits] = useState(new Set(allUnitIds))
  if (!config || !config.courses || config.courses.length === 0) {
    return <div className="full-nav-view"><div className="empty-state"><h2>No Content Available</h2><p>No courses or weeks are configured.</p></div></div>
  }
  const getWeekSession = (weekId) => { try { return { vocabReviewed: JSON.parse(localStorage.getItem(`session.vocabReviewed.${weekId}`)||'[]'), phraseReviewed: JSON.parse(localStorage.getItem(`session.phraseReviewed.${weekId}`)||'[]') } } catch { return { vocabReviewed:[], phraseReviewed:[] } } }
  const isWeekFullyReviewed = (week) => { if(!week.vocab||!week.phrases) return false; const s=getWeekSession(week.id); const vocabIds=week.vocab.map(v=>v.id); const phraseIds=week.phrases.map(p=>p.id); return vocabIds.every(id=>s.vocabReviewed.includes(id)) && phraseIds.every(id=>s.phraseReviewed.includes(id)) && vocabIds.length>0 && phraseIds.length>0 }
  const isUnitFullyReviewed = (unit) => unit.weeks?.length && unit.weeks.every(isWeekFullyReviewed)
  const isCourseFullyReviewed = (course) => course.units?.length && course.units.every(isUnitFullyReviewed)
  const toggleCourse = (id) => { const n=new Set(expandedCourses); n.has(id)?n.delete(id):n.add(id); setExpandedCourses(n) }
  const toggleUnit = (id) => { const n=new Set(expandedUnits); n.has(id)?n.delete(id):n.add(id); setExpandedUnits(n) }
  const currentWeekFromConfig = config.weeks?.find(w => w.id === config.app.current_week_id)
  const findFirstIncompleteWeek = () => {
    for (const course of config.courses) {
      for (const unit of course.units || []) {
        for (const week of unit.weeks || []) {
          const s = getWeekSession(week.id)
          const vocabIds = week.vocab?.map(v=>v.id) || []
            const phraseIds = week.phrases?.map(p=>p.id) || []
          const complete = vocabIds.length>0 && phraseIds.length>0 && vocabIds.every(id=>s.vocabReviewed.includes(id)) && phraseIds.every(id=>s.phraseReviewed.includes(id))
          if (!complete) return week
        }
      }
    }
    return null
  }
  const heroWeek = findFirstIncompleteWeek() || config.weeks?.[0]

  // Inline simplified hero
  let heroCounts = { vocab:0, phrases:0 }
  if(heroWeek){ heroCounts.vocab = heroWeek.vocab?.length||0; heroCounts.phrases = heroWeek.phrases?.length||0 }

  return (
    <div className="full-nav-view">
      {heroWeek && (
        <div className="landing-hero">
          <div className="hero-left">
            <h1 className="hero-h1">{heroWeek.title}</h1>
            <div className="hero-progress-line" aria-label="Week item counts">
              <span>{heroCounts.vocab} words · {heroCounts.phrases} phrases</span>
            </div>
            <button className="primary hero-start" onClick={() => onWeekSelect(heroWeek.id)}>Study {heroWeek.title}</button>
          </div>
        </div>
      )}

      <div className="nav-content">
        {config.courses.map((course) => (
          <div key={course.id} className="course-section">
            <div className="section-header">
              <button className={`section-item course-item has-children ${expandedCourses.has(course.id)?'current':''}`} onClick={() => toggleCourse(course.id)} aria-expanded={expandedCourses.has(course.id)}>
                <div className="section-content">
                  <h3 className="section-title">{course.title}</h3>
                  <p className="section-meta">Units {course.units?.length || 0}</p>
                </div>
                <div className="section-actions">
                  <SelectionBubble state={selectionStates.courses?.[course.id] || 'none'} onClick={(e)=>{e.stopPropagation(); onCourseSelect(course.id); onCourseToggle(course.id)}} size="medium" />
                  {isCourseFullyReviewed(course) && <div className="reviewed-indicator"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>}
                </div>
              </button>
            </div>
            {expandedCourses.has(course.id) && course.units && (
              <div className="section-children">
                {course.units.map(unit => (
                  <div key={unit.id} className="unit-section">
                    <div className="section-header">
                      <button className={`section-item unit-item has-children ${expandedUnits.has(unit.id)?'current':''}`} onClick={() => toggleUnit(unit.id)} aria-expanded={expandedUnits.has(unit.id)}>
                        <div className="section-content">
                          <h4 className="section-title">{unit.title}</h4>
                          <p className="section-meta">Weeks {unit.weeks?.length || 0}</p>
                        </div>
                        <div className="section-actions">
                          <SelectionBubble state={selectionStates.units?.[unit.id] || 'none'} onClick={(e)=>{e.stopPropagation(); onUnitSelect(unit.id); onUnitToggle(unit.id)}} size="medium" />
                          {isUnitFullyReviewed(unit) && <div className="reviewed-indicator"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>}
                        </div>
                      </button>
                    </div>
                    {expandedUnits.has(unit.id) && unit.weeks && (
                      <div className="section-children">
                        <div className="weeks-grid">
                          {unit.weeks.map(week => (
                            <button key={week.id} className={`week-card ${currentWeekId===week.id?'current':''} ${selectionStates.weeks?.[week.id]?'selected':''}`} onClick={() => onWeekToggle(week.id)}>
                              <div className="week-card-content">
                                <h5 className="week-title">{week.title}</h5>
                                <p className="week-dates">{week.dateRange}</p>
                              </div>
                              <div className="week-actions">
                                <SelectionBubble state={selectionStates.weeks?.[week.id]?'selected':'none'} onClick={(e)=>{e.stopPropagation(); onWeekSelect(week.id); onWeekToggle(week.id)}} size="small" />
                                {isWeekFullyReviewed(week) && <div className="reviewed-indicator small"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}