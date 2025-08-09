import { useState, useCallback, useMemo } from 'preact/hooks'

export function useMultiWeekSelection(config, initialWeekId) {
  const [selectedWeekIds, setSelectedWeekIds] = useState(new Set(initialWeekId ? [initialWeekId] : []))

  // Calculate selection states for units and courses
  const getSelectionStates = useMemo(() => {
    if (!config || !config.courses) return {}

    const states = {
      weeks: {},
      units: {},
      courses: {}
    }

    // Mark selected weeks
    selectedWeekIds.forEach(weekId => {
      states.weeks[weekId] = 'selected'
    })

    // Calculate unit selection states
    config.units?.forEach(unit => {
      const unitWeeks = unit.weeks || []
      const selectedCount = unitWeeks.filter(week => selectedWeekIds.has(week.id)).length
      
      if (selectedCount === 0) {
        states.units[unit.id] = 'none'
      } else if (selectedCount === unitWeeks.length) {
        states.units[unit.id] = 'selected'
      } else {
        states.units[unit.id] = 'partial'
      }
    })

    // Calculate course selection states
    config.courses?.forEach(course => {
      const courseWeeks = []
      course.units?.forEach(unit => {
        unit.weeks?.forEach(week => courseWeeks.push(week))
      })
      
      const selectedCount = courseWeeks.filter(week => selectedWeekIds.has(week.id)).length
      
      if (selectedCount === 0) {
        states.courses[course.id] = 'none'
      } else if (selectedCount === courseWeeks.length) {
        states.courses[course.id] = 'selected'
      } else {
        states.courses[course.id] = 'partial'
      }
    })

    return states
  }, [config, selectedWeekIds])

  const toggleWeekSelection = useCallback((weekId) => {
    setSelectedWeekIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(weekId)) {
        newSet.delete(weekId)
      } else {
        newSet.add(weekId)
      }
      return newSet
    })
  }, [])

  const toggleUnitSelection = useCallback((unitId) => {
    if (!config?.units) return
    
    const unit = config.units.find(u => u.id === unitId)
    if (!unit?.weeks) return

    const unitWeekIds = unit.weeks.map(w => w.id)
    const currentState = getSelectionStates.units[unitId]

    setSelectedWeekIds(prev => {
      const newSet = new Set(prev)
      
      if (currentState === 'selected') {
        // Deselect all weeks in this unit
        unitWeekIds.forEach(weekId => newSet.delete(weekId))
      } else {
        // Select all weeks in this unit (partial or none -> selected)
        unitWeekIds.forEach(weekId => newSet.add(weekId))
      }
      
      return newSet
    })
  }, [config, getSelectionStates])

  const toggleCourseSelection = useCallback((courseId) => {
    if (!config?.courses) return
    
    const course = config.courses.find(c => c.id === courseId)
    if (!course?.units) return

    const courseWeekIds = []
    course.units.forEach(unit => {
      unit.weeks?.forEach(week => courseWeekIds.push(week.id))
    })
    
    const currentState = getSelectionStates.courses[courseId]

    setSelectedWeekIds(prev => {
      const newSet = new Set(prev)
      
      if (currentState === 'selected') {
        // Deselect all weeks in this course
        courseWeekIds.forEach(weekId => newSet.delete(weekId))
      } else {
        // Select all weeks in this course (partial or none -> selected)
        courseWeekIds.forEach(weekId => newSet.add(weekId))
      }
      
      return newSet
    })
  }, [config, getSelectionStates])

  const getSelectedWeeks = useMemo(() => {
    if (!config?.weeks) return []
    return config.weeks.filter(week => selectedWeekIds.has(week.id))
  }, [config, selectedWeekIds])

  const clearSelection = useCallback(() => {
    setSelectedWeekIds(new Set())
  }, [])

  const selectSingleWeek = useCallback((weekId) => {
    setSelectedWeekIds(new Set([weekId]))
  }, [])

  return {
    selectedWeekIds,
    selectionStates: getSelectionStates,
    selectedWeeks: getSelectedWeeks,
    toggleWeekSelection,
    toggleUnitSelection,
    toggleCourseSelection,
    clearSelection,
    selectSingleWeek,
    hasSelection: selectedWeekIds.size > 0,
    selectionCount: selectedWeekIds.size
  }
}