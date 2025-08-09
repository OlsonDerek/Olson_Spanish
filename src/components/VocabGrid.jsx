import { VocabCard } from './VocabCard'
import './VocabGrid.css'

export function VocabGrid({ vocab, reviewedItems, onMarkReviewed, audioConfig }) {
  if (!vocab || vocab.length === 0) {
    return (
      <div className="empty-state">
        <p>No vocabulary items for this week</p>
      </div>
    )
  }

  return (
    <div className="vocab-grid">
      {vocab.map((vocabItem) => (
        <VocabCard
          key={`${vocabItem.weekId}-${vocabItem.id}`}
          vocab={vocabItem}
          isReviewed={(reviewedItems || []).includes(vocabItem.id)}
          onMarkReviewed={() => onMarkReviewed(vocabItem.id)}
          audioConfig={audioConfig}
        />
      ))}
    </div>
  )
}