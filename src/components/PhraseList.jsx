import { PhraseItem } from './PhraseItem'
import './PhraseList.css'

export function PhraseList({ phrases, vocab, reviewedItems, onMarkReviewed, audioConfig }) {
  if (!phrases || phrases.length === 0) {
    return (
      <div className="empty-state">
        <p>No phrases for this week</p>
      </div>
    )
  }

  return (
    <div className="phrase-list">
      {phrases.map((phrase) => (
        <PhraseItem
          key={`${phrase.weekId}-${phrase.id}`}
          phrase={phrase}
          vocab={vocab}
          isReviewed={(reviewedItems || []).includes(phrase.id)}
          onMarkReviewed={() => onMarkReviewed(phrase.id)}
          audioConfig={audioConfig}
        />
      ))}
    </div>
  )
}