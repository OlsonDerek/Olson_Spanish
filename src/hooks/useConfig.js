import { useState, useEffect } from 'preact/hooks'

export function useConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/config.json')
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.status}`)
        }
        
        const configData = await response.json()
        
        // Handle both old and new config formats
        let processedConfig
        
        if (configData.courses) {
          // Hierarchical format with external week files
          processedConfig = {
            app: configData.app,
            courses: configData.courses,
            units: [],
            weeks: []
          }

          // Flatten units (weeks will be populated from external files)
          configData.courses.forEach(course => {
            course.units.forEach(unit => {
              processedConfig.units.push({
                ...unit,
                courseId: course.id,
                courseTitle: course.title,
                weeks: []
              })
            })
          })

          try {
            const weekModules = import.meta.glob('../weeks/**/*.json', { eager: true })
            const weekObjects = Object.values(weekModules).map(m => m.default || m)

            if (weekObjects.length) {
              const unitIndex = {}
              processedConfig.courses.forEach(course => {
                course.units.forEach(unit => {
                  unitIndex[unit.id] = { unit, course }
                })
              })

              weekObjects.forEach(week => {
                const ref = unitIndex[week.unitId]
                if (!ref) {
                  console.warn('Week references unknown unitId', week.unitId, 'in', week.id)
                  return
                }
                const { unit, course } = ref
                unit.weeks.push(week)
                processedConfig.weeks.push({
                  ...week,
                  unitTitle: unit.title,
                  courseId: course.id,
                  courseTitle: course.title
                })
              })
            }
          } catch (e) {
            console.error('Error loading week modules', e)
          }
        } else if (configData.weeks) {
          // Legacy flat format - convert to new format
          processedConfig = {
            app: {
              ...configData.app,
              current_unit_id: 'default-unit',
              current_course_id: 'default-course'
            },
            courses: [{
              id: 'default-course',
              title: 'Spanish Course',
              description: 'Spanish language course',
              units: [{
                id: 'default-unit', 
                title: 'Spanish Lessons',
                description: 'Weekly Spanish lessons',
                weeks: configData.weeks
              }]
            }],
            units: [{
              id: 'default-unit',
              title: 'Spanish Lessons', 
              description: 'Weekly Spanish lessons',
              courseId: 'default-course',
              courseTitle: 'Spanish Course',
              weeks: configData.weeks
            }],
            weeks: configData.weeks.map(week => ({
              ...week,
              unitId: 'default-unit',
              unitTitle: 'Spanish Lessons',
              courseId: 'default-course',
              courseTitle: 'Spanish Course'
            }))
          }
        } else {
          throw new Error('Invalid config format: missing courses or weeks')
        }
        
        // Basic validation
        if (!processedConfig.app || !Array.isArray(processedConfig.weeks)) {
          throw new Error('Invalid config format after processing')
        }
        
        setConfig(processedConfig)
      } catch (err) {
        console.error('Failed to load config:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  return { config, loading, error }
}