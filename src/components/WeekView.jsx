import { useState, useMemo, useEffect } from 'preact/hooks'
import { track } from '../utils/analytics.js'
import { StudyCollection } from './StudyCollection'
import './WeekView.css'

export function WeekView({
  weeks,
  viewMode,
  currentWeek,
  currentUnit,
  currentCourse,
  studySession,
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
    vocabReviewed: Object.values(studySession.reviewed.vocab).reduce((a, set) => a + set.size, 0),
    phraseReviewed: Object.values(studySession.reviewed.phrase).reduce((a, set) => a + set.size, 0),
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
            <div className="session-bar compact">
              <div className="session-timer" aria-label="Elapsed study time">{studySession.formatElapsed()}</div>
              <div className="session-right">
                {!studySession.active && (
                  <button className="secondary start-btn" disabled={!singleWeek} onClick={() => singleWeek && studySession.start([singleWeek.id])}>Start</button>
                )}
                {studySession.active && (
                  <button className="secondary stop-btn" onClick={() => studySession.stop()}>Stop</button>
                )}
                <button className="ghost reset-btn" onClick={() => studySession.reset()} aria-label="Reset session">Reset</button>
              </div>
            </div>
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
          <div className="session-bar multi">
            <div className="session-left counts-inline">{counts.vocabReviewed}/{counts.vocabTotal} words · {counts.phraseReviewed}/{counts.phraseTotal} phrases</div>
            <div className="hero-actions">
              <div className="session-bar compact">
                <div className="session-timer" aria-label="Elapsed study time">{studySession.formatElapsed()}</div>
                <div className="session-right">
                  {!studySession.active && (
                    <button className="secondary start-btn" disabled={weeks.length === 0} onClick={() => weeks.length && studySession.start(weeks.map(w => w.id))}>Start</button>
                  )}
                  {studySession.active && (
                    <button className="secondary stop-btn" onClick={() => studySession.stop()}>Stop</button>
                  )}
                  <button className="ghost reset-btn" onClick={() => studySession.reset()} aria-label="Reset session">Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tab-rail">
        <button
          className={`pill-tab ${activeTab === 'vocab' ? 'active' : ''}`}
          onClick={() => { setActiveTab('vocab'); track('nav.tab_change', { to_tab: 'vocab' }) }}
        >
          Vocabulary <span className="count">{combinedContent.vocab.length}</span>
        </button>
        <button
          className={`pill-tab ${activeTab === 'phrases' ? 'active' : ''}`}
          onClick={() => { setActiveTab('phrases'); track('nav.tab_change', { to_tab: 'phrases' }) }}
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
                      reviewedIds={Array.from(studySession.reviewed.vocab[w.id] || [])}
                      onToggleReviewed={(itemId) => studySession.toggleReviewed(w.id, itemId, 'vocab')}
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
                reviewedIds={combinedContent.vocab.filter(v => (studySession.reviewed.vocab[v.weekId] || new Set()).has(v.id)).map(v => v.id)}
                onToggleReviewed={(itemId) => {
                  const item = combinedContent.vocab.find(v => v.id === itemId)
                  if (item) studySession.toggleReviewed(item.weekId, itemId, 'vocab')
                }}
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
                      reviewedIds={Array.from(studySession.reviewed.phrase[w.id] || [])}
                      onToggleReviewed={(itemId) => studySession.toggleReviewed(w.id, itemId, 'phrase')}
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
                reviewedIds={combinedContent.phrases.filter(p => (studySession.reviewed.phrase[p.weekId] || new Set()).has(p.id)).map(p => p.id)}
                onToggleReviewed={(itemId) => {
                  const item = combinedContent.phrases.find(p => p.id === itemId)
                  if (item) studySession.toggleReviewed(item.weekId, itemId, 'phrase')
                }}
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