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
    // Note: flattened config.units currently have empty weeks arrays (weeks loaded only into courses.units)
    // so derive weeks by filtering config.weeks when unit.weeks is empty
    config.units?.forEach(unit => {
      const unitWeeks = (unit.weeks && unit.weeks.length > 0)
        ? unit.weeks
        : (config.weeks?.filter(w => w.unitId === unit.id) || [])
      const selectedCount = unitWeeks.filter(week => selectedWeekIds.has(week.id)).length

      if (unitWeeks.length === 0) {
        // No weeks found for this unit (should not normally happen) => treat as none
        states.units[unit.id] = 'none'
      } else if (selectedCount === 0) {
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
    if (!config) return

    // Gather week IDs for this unit. Prefer unit.weeks if present, else derive from global weeks list.
    let unitWeekIds = []
    const flatUnit = config.units?.find(u => u.id === unitId)
    if (flatUnit?.weeks && flatUnit.weeks.length > 0) {
      unitWeekIds = flatUnit.weeks.map(w => w.id)
    } else if (config.weeks) {
      unitWeekIds = config.weeks.filter(w => w.unitId === unitId).map(w => w.id)
    }
    if (unitWeekIds.length === 0) return

    const currentState = getSelectionStates.units[unitId]

    setSelectedWeekIds(prev => {
      const newSet = new Set(prev)

      if (currentState === 'selected') {
        unitWeekIds.forEach(weekId => newSet.delete(weekId))
      } else {
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