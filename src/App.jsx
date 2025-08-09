import { useState, useEffect } from 'preact/hooks'
import { Header } from './components/Header'
import { SideNav } from './components/SideNav'
import { WeekView } from './components/WeekView'
import { CalendarNav } from './components/CalendarNav'
import { ProgressBar } from './components/ProgressBar'
import { FullNavView } from './components/FullNavView'
import { useConfig } from './hooks/useConfig'
import { useSession } from './hooks/useSession'
import { useMultiWeekSelection } from './hooks/useMultiWeekSelection'
import './app.css'

export function App() {
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [currentWeekId, setCurrentWeekId] = useState(null)
  const [viewMode, setViewMode] = useState('week') // 'week', 'unit', 'course'
  const [currentUnitId, setCurrentUnitId] = useState(null)
  const [currentCourseId, setCurrentCourseId] = useState(null)
  
  const { config, loading, error } = useConfig()
  const { session, markReviewed, resetSession } = useSession(currentWeekId)
  const {
    selectedWeekIds,
    selectionStates,
    selectedWeeks,
    toggleWeekSelection,
    toggleUnitSelection,
    toggleCourseSelection,
    selectSingleWeek
  } = useMultiWeekSelection(config, currentWeekId)

  useEffect(() => {
    if (config && !currentWeekId) {
      // Only set current IDs for context, don't auto-select weeks
      setCurrentUnitId(config.app.current_unit_id) 
      setCurrentCourseId(config.app.current_course_id)
      // Don't auto-select the current week to show FullNavView by default
      // setCurrentWeekId(config.app.current_week_id)
    }
  }, [config, currentWeekId])

  useEffect(() => {
    if (!currentWeekId && selectedWeekIds && selectedWeekIds.size > 0) {
      const first = selectedWeekIds.values().next().value
      if (first) setCurrentWeekId(first)
    }
  }, [currentWeekId, selectedWeekIds])

  const currentWeek = config?.weeks?.find(w => w.id === currentWeekId)
  const currentUnit = config?.units?.find(u => u.id === currentUnitId)
  const currentCourse = config?.courses?.find(c => c.id === currentCourseId)

  const handleWeekSelect = (weekId) => {
    setCurrentWeekId(weekId)
    setViewMode('week')
    selectSingleWeek(weekId)
    setSideNavOpen(false)
    setCalendarOpen(false)
  }

  const handleUnitSelect = (unitId) => {
    setCurrentUnitId(unitId)
    setViewMode('unit')
    setSideNavOpen(false)
    setCalendarOpen(false)
  }

  const handleCourseSelect = (courseId) => {
    setCurrentCourseId(courseId)
    setViewMode('course')
    setSideNavOpen(false)
    setCalendarOpen(false)
  }

  // Added: clear all selected weeks
  const clearSelectedWeeks = () => {
    if (selectedWeekIds && selectedWeekIds.size) {
      // create array to avoid mutating while iterating
      Array.from(selectedWeekIds).forEach(id => toggleWeekSelection(id))
    }
  }

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Spanish Weekly...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="app error">
        <div className="error-message">
          <h2>Oops! Can't load this week.</h2>
          <p>Pull to refresh or try again later.</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header 
        title={config.app.title}
        viewMode={viewMode}
        currentWeek={currentWeek}
        currentUnit={currentUnit}
        currentCourse={currentCourse}
        onSideNavToggle={() => setSideNavOpen(!sideNavOpen)}
        onCalendarToggle={() => setCalendarOpen(!calendarOpen)}
      />

      <SideNav
        isOpen={sideNavOpen}
        config={config}
        currentWeekId={currentWeekId}
        currentUnitId={currentUnitId}
        currentCourseId={currentCourseId}
        selectionStates={selectionStates}
        onWeekSelect={handleWeekSelect}
        onUnitSelect={handleUnitSelect}
        onCourseSelect={handleCourseSelect}
        onWeekToggle={toggleWeekSelection}
        onUnitToggle={toggleUnitSelection}
        onCourseToggle={toggleCourseSelection}
        onClose={() => setSideNavOpen(false)}
      />

      <CalendarNav
        isOpen={calendarOpen}
        weeks={config.weeks}
        currentWeekId={currentWeekId}
        onWeekSelect={handleWeekSelect}
        onClose={() => setCalendarOpen(false)}
      />

      <main className="main-content">
        {selectedWeeks.length > 0 ? (
          <WeekView
            weeks={selectedWeeks}
            viewMode={viewMode}
            currentWeek={currentWeek}
            currentUnit={currentUnit}
            currentCourse={currentCourse}
            session={session}
            onMarkReviewed={markReviewed}
            audioConfig={config.app.audio}
            onClearSelection={clearSelectedWeeks}
          />
        ) : (
          <FullNavView
            config={config}
            currentWeekId={currentWeekId}
            currentUnitId={currentUnitId}
            currentCourseId={currentCourseId}
            selectionStates={selectionStates}
            onWeekSelect={handleWeekSelect}
            onUnitSelect={handleUnitSelect}
            onCourseSelect={handleCourseSelect}
            onWeekToggle={toggleWeekSelection}
            onUnitToggle={toggleUnitSelection}
            onCourseToggle={toggleCourseSelection}
          />
        )}
      </main>

      <ProgressBar
        weeks={selectedWeeks}
        currentWeekId={currentWeekId}
        session={session}
        onReset={resetSession}
      />

      {(sideNavOpen || calendarOpen) && (
        <div 
          className="overlay"
          onClick={() => {
            setSideNavOpen(false)
            setCalendarOpen(false)
          }}
        />
      )}
    </div>
  )
}