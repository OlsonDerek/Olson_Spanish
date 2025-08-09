import { useState, useMemo } from 'preact/hooks'
import { useAudio } from '../hooks/useAudio'
import { highlightVocabInPhrase } from '../utils/phraseHighlighting'
import './PhraseItem.css'

const PHRASE_STATES = {
  SPANISH: 'spanish',
  ENGLISH: 'english'
}

export function PhraseItem({ phrase, vocab, isReviewed, onMarkReviewed, audioConfig }) {
  const [currentState, setCurrentState] = useState(PHRASE_STATES.SPANISH)
  const { playPhrase, isPlaying, error } = useAudio(audioConfig)

  // Highlight vocabulary words in the phrase
  const highlightedPhrase = useMemo(() => {
    return highlightVocabInPhrase(phrase.spanish, vocab)
  }, [phrase.spanish, vocab])

  const handleCardClick = () => {
    setCurrentState(currentState === PHRASE_STATES.SPANISH ? PHRASE_STATES.ENGLISH : PHRASE_STATES.SPANISH)
  }

  const handleReviewClick = (e) => {
    e.stopPropagation() // Prevent card flip
    onMarkReviewed()
  }

  const handlePlayClick = async (e) => {
    e.stopPropagation() // Prevent card flip
    try {
      await playPhrase(phrase.spanish, phrase.audioUrl)
    } catch (err) {
      console.error('Failed to play phrase:', err)
    }
  }

  const renderContent = () => {
    switch (currentState) {
      case PHRASE_STATES.ENGLISH:
        return (
          <div className="card-content english">
            <div className="phrase-text">{phrase.english}</div>
          </div>
        )
      
      default:
        return (
          <div className="card-content spanish">
            <div 
              className="phrase-text"
              dangerouslySetInnerHTML={{ __html: highlightedPhrase }}
            />
          </div>
        )
    }
  }

  const getStateLabel = () => {
    switch (currentState) {
      case PHRASE_STATES.ENGLISH:
        return 'English translation'
      default:
        return 'Spanish phrase'
    }
  }

  return (
    <div className="phrase-card-wrapper">
      <div 
        className={`phrase-card ${currentState} ${isReviewed ? 'reviewed' : ''}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`Phrase card: ${phrase.spanish}. Current state: ${getStateLabel()}. Tap to cycle between Spanish and English.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick()
          }
        }}
      >
        {renderContent()}

        <div className="right-controls">
          <button
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayClick}
            disabled={isPlaying}
            aria-label={isPlaying ? 'Playing phrase' : 'Play phrase'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </button>
          <button
            className={`review-button ${isReviewed ? 'active' : ''}`}
            onClick={handleReviewClick}
            aria-label={isReviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="audio-error">
          <p>Audio not available</p>
        </div>
      )}
    </div>
  )
}