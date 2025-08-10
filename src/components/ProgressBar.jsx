import './ProgressBar.css'

// Props:
// weeks: selected week objects
// studySession: instance from useStudySession
// mode: 'auto'|'session'|'forever' (auto chooses session if active)
export function ProgressBar({ weeks = [], studySession, mode = 'auto' }) {
  if (!weeks || weeks.length === 0 || !studySession) return null
  const usingSession = mode === 'session' || (mode === 'auto' && studySession.active)

  // Compute totals across selected weeks
  let vocabTotal = 0, phraseTotal = 0
  weeks.forEach(w => { vocabTotal += w.vocab?.length || 0; phraseTotal += w.phrases?.length || 0 })

  // Reviewed counts
  let vocabReviewed = 0, phraseReviewed = 0
  if (usingSession) {
    weeks.forEach(w => {
      vocabReviewed += (studySession.reviewed.vocab[w.id]?.size) || 0
      phraseReviewed += (studySession.reviewed.phrase[w.id]?.size) || 0
    })
  } else {
    weeks.forEach(w => {
      vocabReviewed += (studySession.everReviewed.vocab[w.id]?.size) || 0
      phraseReviewed += (studySession.everReviewed.phrase[w.id]?.size) || 0
    })
  }

  const vocabPct = vocabTotal ? (vocabReviewed / vocabTotal) * 100 : 0
  const phrasePct = phraseTotal ? (phraseReviewed / phraseTotal) * 100 : 0
  const labelPrefix = usingSession ? 'Session' : 'Total'
  const hasAny = vocabTotal + phraseTotal > 0
  if (!hasAny) return null

  return (
    <div className="progress-bar-container mini" data-mode={usingSession ? 'session' : 'forever'}>
      <div className="progress-content split">
        <div className="counter-group" aria-label="Vocabulary progress">
          <span className="counter-label">{labelPrefix} Words {vocabReviewed}/{vocabTotal}</span>
          <div className="mini-track"><div className="mini-fill" style={{ width: `${vocabPct}%` }} /></div>
        </div>
        <div className="counter-group" aria-label="Phrases progress">
          <span className="counter-label">{labelPrefix} Phrases {phraseReviewed}/{phraseTotal}</span>
          <div className="mini-track"><div className="mini-fill" style={{ width: `${phrasePct}%` }} /></div>
        </div>
      </div>
    </div>
  )
}