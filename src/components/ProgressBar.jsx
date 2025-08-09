import './ProgressBar.css'

export function ProgressBar({ weeks = [], currentWeekId, session, onReset }) {
  if (!weeks || weeks.length === 0 || !session) return null

  // Aggregate totals across selected weeks
  let vocabTotal = 0
  let phrasesTotal = 0
  weeks.forEach(w => { vocabTotal += w.vocab?.length || 0; phrasesTotal += w.phrases?.length || 0 })

  // Reviewed counts only for the currently focused week (session pertains to one weekId)
  const vocabReviewed = session.vocabReviewed?.length || 0
  const phrasesReviewed = session.phraseReviewed?.length || 0

  const hasAny = vocabTotal + phrasesTotal > 0
  if (!hasAny) return null

  const vocabPct = vocabTotal ? (vocabReviewed / vocabTotal) * 100 : 0
  const phrasePct = phrasesTotal ? (phrasesReviewed / phrasesTotal) * 100 : 0
  const hasActivity = vocabReviewed > 0 || phrasesReviewed > 0

  return (
    <div className="progress-bar-container mini">
      <div className="progress-content split">
        <div className="counter-group" aria-label="Vocabulary progress">
          <span className="counter-label">Words {vocabReviewed}/{vocabTotal}</span>
          <div className="mini-track"><div className="mini-fill" style={{ width: `${vocabPct}%` }} /></div>
        </div>
        <div className="counter-group" aria-label="Phrases progress">
          <span className="counter-label">Phrases {phrasesReviewed}/{phrasesTotal}</span>
          <div className="mini-track"><div className="mini-fill" style={{ width: `${phrasePct}%` }} /></div>
        </div>
        {hasActivity && (
          <button className="reset-button link" onClick={onReset} aria-label="Reset session progress">Reset</button>
        )}
      </div>
    </div>
  )
}