import './CourseProgress.css'

export function CourseProgress({ config }) {
  if (!config || !config.courses || config.courses.length === 0) {
    return null
  }

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

  // Calculate progress for each course
  const courseProgress = config.courses.map(course => {
    const allWeeks = []
    const allUnits = course.units || []
    
    // Collect all weeks from all units
    allUnits.forEach(unit => {
      if (unit.weeks) {
        allWeeks.push(...unit.weeks)
      }
    })

    const totalWeeks = allWeeks.length
    const completedWeeks = allWeeks.filter(week => isWeekFullyReviewed(week)).length
    const totalVocab = allWeeks.reduce((sum, week) => sum + (week.vocab?.length || 0), 0)
    const totalPhrases = allWeeks.reduce((sum, week) => sum + (week.phrases?.length || 0), 0)
    
    // Calculate reviewed items
    let reviewedVocab = 0
    let reviewedPhrases = 0
    allWeeks.forEach(week => {
      const session = getWeekSession(week.id)
      reviewedVocab += session.vocabReviewed.length
      reviewedPhrases += session.phraseReviewed.length
    })

    const completionPercentage = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0
    const vocabPercentage = totalVocab > 0 ? Math.round((reviewedVocab / totalVocab) * 100) : 0
    const phrasePercentage = totalPhrases > 0 ? Math.round((reviewedPhrases / totalPhrases) * 100) : 0

    return {
      ...course,
      totalWeeks,
      completedWeeks,
      totalVocab,
      totalPhrases,
      reviewedVocab,
      reviewedPhrases,
      completionPercentage,
      vocabPercentage,
      phrasePercentage,
      unitCount: allUnits.length
    }
  })

  return (
    <div className="course-progress">     

      <div className="progress-grid">
        {courseProgress.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3 className="course-title">{course.title}</h3>
              <div className="completion-badge">
                <span className="percentage">{course.completionPercentage}%</span>
                <span className="label">Complete</span>
              </div>
            </div>

            {course.description && (
              <p className="course-description">{course.description}</p>
            )}

            <div className="progress-bars">
              <div className="progress-item">
                <div className="progress-label">
                  <span>Weeks Completed</span>
                  <span className="progress-count">{course.completedWeeks}/{course.totalWeeks}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill weeks" 
                    style={{ width: `${course.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label">
                  <span>Vocabulary</span>
                  <span className="progress-count">{course.reviewedVocab}/{course.totalVocab}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill vocab" 
                    style={{ width: `${course.vocabPercentage}%` }}
                  />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label">
                  <span>Phrases</span>
                  <span className="progress-count">{course.reviewedPhrases}/{course.totalPhrases}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill phrases" 
                    style={{ width: `${course.phrasePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="course-stats">
              <div className="stat">
                <span className="stat-number">{course.unitCount}</span>
                <span className="stat-label">Units</span>
              </div>
              <div className="stat">
                <span className="stat-number">{course.totalWeeks}</span>
                <span className="stat-label">Weeks</span>
              </div>
              <div className="stat">
                <span className="stat-number">{course.totalVocab + course.totalPhrases}</span>
                <span className="stat-label">Total Items</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}