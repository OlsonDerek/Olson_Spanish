import { useState } from 'preact/hooks'
import { useAudio } from '../hooks/useAudio'
import './VocabCard.css'

const CARD_STATES = { SPANISH:'spanish', ENGLISH:'english', CONJUGATIONS:'conjugations'}

export function VocabCard({ vocab, isReviewed, onMarkReviewed, audioConfig }) {
  const [currentState, setCurrentState] = useState(CARD_STATES.SPANISH)
  const { playPhrase, isPlaying } = useAudio(audioConfig)
  const hasConjugations = vocab.conjugations && Object.keys(vocab.conjugations).length > 0

  const cycle = () => {
    if (currentState === CARD_STATES.SPANISH) setCurrentState(CARD_STATES.ENGLISH)
    else if (currentState === CARD_STATES.ENGLISH && hasConjugations) setCurrentState(CARD_STATES.CONJUGATIONS)
    else setCurrentState(CARD_STATES.SPANISH)
  }

  const handlePlay = async (e) => { 
    e.stopPropagation(); 
    try { 
      await playPhrase(vocab.spanish) 
    } 
    catch(e){ console.warn(e)} 
  }
  const handleReview = (e) => {
    e.stopPropagation()
    onMarkReviewed()
    setTimeout(() => {
      e.currentTarget.focus()
    }, 0)
    // Remove focus from button after click
    e.currentTarget.blur()   
  }

  const renderSpanish = () => (<div className="card-content spanish"><div className="word">{vocab.spanish}</div><div className="word-type">{vocab.type}</div></div>)
  const content = currentState === CARD_STATES.ENGLISH ? (
    <div className="card-content english"><div className="word">{vocab.english}</div><div className="word-type">{vocab.type}</div></div>
  ) : currentState === CARD_STATES.CONJUGATIONS && hasConjugations ? (
    <div className="card-content conjugations"><div className="word">{vocab.spanish}</div><div className="conjugation-grid">{Object.entries(vocab.conjugations).map(([tense, forms]) => (<div key={tense} className="tense-group"><div className="tense-title">{tense}</div><div className="conjugation-forms">{Object.entries(forms).map(([person, form]) => (<div key={person} className="conjugation-item"><span className="person">{person}:</span><span className="form">{form}</span></div>))}</div></div>))}</div></div>
  ) : renderSpanish()

  return (
    <div className="vocab-card-wrapper">
      <div className={`vocab-card ${currentState} ${isReviewed ? 'reviewed' : ''}`} onClick={cycle} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cycle()}}} aria-label={`Vocabulary card ${vocab.spanish}`}> 
        {content}
        <div className="right-buttons">
          <button className={`play-button ${isPlaying ? 'playing': ''}`} disabled={isPlaying} onClick={handlePlay} aria-label="Play word audio">{isPlaying ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>}</button>
          <button className={`review-button ${isReviewed? 'active':''}`} onClick={handleReview} aria-pressed={isReviewed} aria-label={isReviewed? 'Unmark reviewed':'Mark reviewed'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20,6 9,17 4,12"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}