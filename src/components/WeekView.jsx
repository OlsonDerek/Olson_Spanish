import { useState, useMemo, useEffect } from 'preact/hooks'
import { StudyCollection } from './StudyCollection'
import './WeekView.css'

export function WeekView({ 
  weeks, 
  viewMode, 
  currentWeek, 
  currentUnit, 
  currentCourse,
  session, 
  onMarkReviewed, 
  audioConfig,
  onClearSelection
}) {
  const [activeTab, setActiveTab] = useState('vocab')
  const [showTapHint, setShowTapHint] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('hint.tapCycleShown')) {
      setShowTapHint(true)
      const timer = setTimeout(() => {
        setShowTapHint(false)
        localStorage.setItem('hint.tapCycleShown', '1')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!weeks || weeks.length === 0) return null

  // Combine all vocab and phrases from selected weeks
  const combinedContent = useMemo(() => {
    const allVocab = []
    const allPhrases = []
    weeks.forEach(week => {
      if (week.vocab) {
        week.vocab.forEach(vocabItem => {
          allVocab.push({
            ...vocabItem,
            weekId: week.id,
            weekTitle: week.title,
            unitId: week.unitId,
            unitTitle: week.unitTitle
          })
        })
      }
      if (week.phrases) {
        week.phrases.forEach(phrase => {
          allPhrases.push({
            ...phrase,
            weekId: week.id,
            weekTitle: week.title,
            unitId: week.unitId,
            unitTitle: week.unitTitle
          })
        })
      }
    })
    return { vocab: allVocab, phrases: allPhrases }
  }, [weeks])

  const singleWeek = weeks.length === 1 ? weeks[0] : null

  const counts = {
    vocabReviewed: session.vocabReviewed?.length || 0,
    phraseReviewed: session.phraseReviewed?.length || 0,
    vocabTotal: combinedContent.vocab.length,
    phraseTotal: combinedContent.phrases.length
  }

  return (
    <div className="week-view">
      {singleWeek ? (
        <div className="hero">
          <h1 className="hero-title">{singleWeek.title}</h1>
          <div className="hero-progress">
            <div className="counts">{counts.vocabReviewed}/{counts.vocabTotal} words · {counts.phraseReviewed}/{counts.phraseTotal} phrases</div>
            <div className="linear-track" aria-label="Overall progress">
              <div className="linear-fill" style={{ width: `${(counts.vocabReviewed + counts.phraseReviewed) / Math.max(1, (counts.vocabTotal + counts.phraseTotal)) * 100}%` }} />
            </div>
          </div>
          <div className="hero-actions">
            <button className="primary hero-cta">Study {singleWeek.title}</button>
          </div>
        </div>
      ) : (
        <div className="selection-chips" aria-label="Selected weeks">
          <span className="chips-label">Selected:</span>
          <div className="chips-group">
            {weeks.map(w => (
              <span key={w.id} className="chip">{w.title}</span>
            ))}
          </div>
          <button className="clear-chips" onClick={onClearSelection}>Clear</button>
        </div>
      )}

      <div className="tab-rail">
        <button
          className={`pill-tab ${activeTab === 'vocab' ? 'active' : ''}`}
          onClick={() => setActiveTab('vocab')}
        >
          Vocabulary <span className="count">{combinedContent.vocab.length}</span>
        </button>
        <button
          className={`pill-tab ${activeTab === 'phrases' ? 'active' : ''}`}
          onClick={() => setActiveTab('phrases')}
        >
          Phrases <span className="count">{combinedContent.phrases.length}</span>
        </button>
      </div>

      {showTapHint && (
        <div className="tap-hint">tap to cycle</div>
      )}

      <div className="tab-panels">
        <div className={`panel ${activeTab === 'vocab' ? 'active' : ''}`}>
          {activeTab === 'vocab' && (
            weeks.length > 1 ? (
              <div className="grouped-list">
                {weeks.map(w => (
                  <div key={w.id} className="group-block">
                    <h3 className="group-header">{w.title}</h3>
                    <StudyCollection
                      type="vocab"
                      items={combinedContent.vocab.filter(v => v.weekId === w.id)}
                      reviewedIds={session.vocabReviewed || []}
                      onToggleReviewed={(itemId) => onMarkReviewed(itemId, 'vocab')}
                      audioConfig={audioConfig}
                      vocabList={combinedContent.vocab}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <StudyCollection
                type="vocab"
                items={combinedContent.vocab}
                reviewedIds={session.vocabReviewed || []}
                onToggleReviewed={(itemId) => onMarkReviewed(itemId, 'vocab')}
                audioConfig={audioConfig}
                vocabList={combinedContent.vocab}
              />
            )
          )}
        </div>
        <div className={`panel ${activeTab === 'phrases' ? 'active' : ''}`}>
          {activeTab === 'phrases' && (
            weeks.length > 1 ? (
              <div className="grouped-list">
                {weeks.map(w => (
                  <div key={w.id} className="group-block">
                    <h3 className="group-header">{w.title}</h3>
                    <StudyCollection
                      type="phrase"
                      items={combinedContent.phrases.filter(p => p.weekId === w.id)}
                      reviewedIds={session.phraseReviewed || []}
                      onToggleReviewed={(itemId) => onMarkReviewed(itemId, 'phrase')}
                      audioConfig={audioConfig}
                      vocabList={combinedContent.vocab}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <StudyCollection
                type="phrase"
                items={combinedContent.phrases}
                reviewedIds={session.phraseReviewed || []}
                onToggleReviewed={(itemId) => onMarkReviewed(itemId, 'phrase')}
                audioConfig={audioConfig}
                vocabList={combinedContent.vocab}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}