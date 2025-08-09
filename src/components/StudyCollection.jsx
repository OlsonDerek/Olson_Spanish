import { StudyCard } from './StudyCard'
import './StudyCollection.css'

export function StudyCollection({ type, items = [], reviewedIds = [], onToggleReviewed, audioConfig, vocabList }) {
  if (!items.length) {
    return <div className="empty-state"><p>No {type === 'vocab' ? 'vocabulary' : 'phrases'} items</p></div>
  }
  return (
    <div className={`study-collection ${type}`}>
      {items.map(item => (
        <StudyCard
          key={`${item.weekId}-${type}-${item.id}`}
          type={type}
          item={item}
            isReviewed={reviewedIds.includes(item.id)}
          onToggleReviewed={() => onToggleReviewed(item.id)}
          audioConfig={audioConfig}
          vocabList={vocabList}
        />
      ))}
    </div>
  )
}
