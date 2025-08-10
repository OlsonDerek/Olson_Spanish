import { useState, useMemo, useEffect } from 'preact/hooks'
import { useAudio } from '../hooks/useAudio'
import { highlightVocabInPhrase } from '../utils/phraseHighlighting'
import { track } from '../utils/analytics.js'
import './StudyCard.css'

const STATES = {
  SPANISH: 'spanish',
  ENGLISH: 'english',
  CONJUGATIONS: 'conjugations'
}

export function StudyCard({ type, item, isReviewed, onToggleReviewed, audioConfig, vocabList }) {
  const [state, setState] = useState(STATES.SPANISH)
  const { playPhrase, isPlaying } = useAudio(audioConfig)
  const hasConjugations = type === 'vocab' && item.conjugations && Object.keys(item.conjugations).length > 0

  const highlightedPhrase = useMemo(() => {
    if (type !== 'phrase') return ''
    return highlightVocabInPhrase(item.spanish, vocabList || [])
  }, [type, item.spanish, vocabList])

  const cycle = () => {
    let to
    if (state === STATES.SPANISH) { to = STATES.ENGLISH; setState(STATES.ENGLISH) }
    else if (state === STATES.ENGLISH && hasConjugations) { to = STATES.CONJUGATIONS; setState(STATES.CONJUGATIONS) }
    else { to = STATES.SPANISH; setState(STATES.SPANISH) }
    track('study.card_cycle', { id: item.id, from: state, to, type })
  }

  const handlePlay = async (e) => {
    e.stopPropagation()
    const started = performance.now()
    try { 
      await playPhrase(item.spanish, item.audioUrl)
      track('study.audio_play', { id: item.id, type, duration_ms: performance.now() - started })
    } catch(err) { 
      console.warn(err)
      track('error.audio_play_fail', { id: item.id, type, message: err?.message })
    }
  }
  const handleReview = (e) => {
    e.stopPropagation()
    onToggleReviewed()
    track('study.toggle_reviewed', { id: item.id, type, to_state: !isReviewed })
  }

  // Fire card shown (mount) event once
  useEffect(() => {
    track('study.card_shown', { id: item.id, type })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderContent = () => {
    if (type === 'vocab') {
      if (state === STATES.ENGLISH) {
        return <div className="card-content english"><div className="word">{item.english}</div><div className="word-type">{item.type}</div></div>
      }
      if (state === STATES.CONJUGATIONS && hasConjugations) {
        return <div className="card-content conjugations"><div className="word">{item.spanish}</div><div className="conjugation-grid">{Object.entries(item.conjugations).map(([tense, forms]) => (<div key={tense} className="tense-group"><div className="tense-title">{tense}</div><div className="conjugation-forms">{Object.entries(forms).map(([person, form]) => (<div key={person} className="conjugation-item"><span className="person">{person}:</span><span className="form">{form}</span></div>))}</div></div>))}</div></div>
      }
      return <div className="card-content spanish"><div className="word">{item.spanish}</div><div className="word-type">{item.type}</div></div>
    }
    // phrase
    if (state === STATES.ENGLISH) {
      return <div className="card-content english"><div className="phrase-text">{item.english}</div></div>
    }
    return <div className="card-content spanish"><div className="phrase-text" dangerouslySetInnerHTML={{ __html: highlightedPhrase }} /></div>
  }

  return (
    <div className="study-card-wrapper">
      <div
        className={`study-card ${type} ${state} ${isReviewed ? 'reviewed' : ''}`}
        onClick={cycle}
        role="button"
        tabIndex={0}
        onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cycle()}}}
        aria-label={`${type === 'vocab' ? 'Vocabulary' : 'Phrase'} card ${item.spanish}`}
      >
        {renderContent()}
        <div className="right-buttons">
          <button className={`play-button ${isPlaying ? 'playing': ''}`} disabled={isPlaying} onClick={handlePlay} aria-label="Play audio">
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>
          <button className={`review-button ${isReviewed? 'active':''}`} onClick={handleReview} aria-pressed={isReviewed} aria-label={isReviewed? 'Unmark reviewed':'Mark reviewed'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20,6 9,17 4,12"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
