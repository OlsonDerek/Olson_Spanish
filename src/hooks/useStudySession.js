import { useState, useCallback, useEffect, useRef } from 'preact/hooks'

// Manages an explicit study session across multiple weeks.
// During an active session, reviewed vocab/phrases are tracked in-memory.
// On stop(), progress is merged into persistent "ever" progress stored under
// progress.vocabReviewed.<weekId> and progress.phraseReviewed.<weekId>.

export function useStudySession(config) {
  const [active, setActive] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [stoppedElapsedMs, setStoppedElapsedMs] = useState(null)
  const [reviewed, setReviewed] = useState({ vocab: {}, phrase: {} }) // weekId -> Set
  const [everReviewed, setEverReviewed] = useState({ vocab: {}, phrase: {} })
  const timerRef = useRef(null)

  // Load persistent ever-reviewed progress on mount or config change
  useEffect(() => {
    if (!config?.weeks) return
    const vocab = {}
    const phrase = {}
    config.weeks.forEach(week => {
      try {
        vocab[week.id] = new Set(JSON.parse(localStorage.getItem(`progress.vocabReviewed.${week.id}`) || '[]'))
        phrase[week.id] = new Set(JSON.parse(localStorage.getItem(`progress.phraseReviewed.${week.id}`) || '[]'))
      } catch {
        vocab[week.id] = new Set()
        phrase[week.id] = new Set()
      }
    })
    setEverReviewed({ vocab, phrase })
  }, [config])

  // Load last stopped elapsed time (persists after page reload until reset or new start)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('studySession.lastElapsedMs')
      if (stored && !active && stoppedElapsedMs == null) {
        const val = parseInt(stored, 10)
        if (!Number.isNaN(val)) setStoppedElapsedMs(val)
      }
    } catch {}
    // we intentionally omit dependencies for one-time load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Timer
  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAt)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [active, startedAt])

  const start = useCallback((weekIds) => {
    if (!weekIds || weekIds.length === 0) return
    const unique = Array.from(new Set(weekIds))
    const initial = { vocab: {}, phrase: {} }
    unique.forEach(id => { initial.vocab[id] = new Set(); initial.phrase[id] = new Set() })
    setReviewed(initial)
    setActive(true)
    const now = Date.now()
    if (stoppedElapsedMs && stoppedElapsedMs > 0) {
      // Resume from previous elapsed time
      setStartedAt(now - stoppedElapsedMs)
      setElapsedMs(stoppedElapsedMs)
    } else {
      setStartedAt(now)
      setElapsedMs(0)
    }
    setStoppedElapsedMs(null)
    try { localStorage.removeItem('studySession.lastElapsedMs') } catch {}
  }, [stoppedElapsedMs])

  const toggleReviewed = useCallback((weekId, itemId, type) => {
    if (!active || !weekId) return
    setReviewed(prev => {
      const next = { vocab: { ...prev.vocab }, phrase: { ...prev.phrase } }
      if (!next[type][weekId]) next[type][weekId] = new Set()
      const setRef = next[type][weekId]
      if (setRef.has(itemId)) setRef.delete(itemId); else setRef.add(itemId)
      return next
    })
  }, [active])

  const stop = useCallback(() => {
    if (!active) return
  const finalElapsed = Date.now() - (startedAt || Date.now())
    // Merge reviewed into persistent ever progress
    setEverReviewed(prev => {
      const merged = { vocab: { ...prev.vocab }, phrase: { ...prev.phrase } }
      ;['vocab','phrase'].forEach(kind => {
        Object.entries(reviewed[kind]).forEach(([weekId, setIds]) => {
          if (!merged[kind][weekId]) merged[kind][weekId] = new Set()
          setIds.forEach(id => merged[kind][weekId].add(id))
          // Persist
          try {
            const arr = Array.from(merged[kind][weekId])
            localStorage.setItem(`progress.${kind}Reviewed.${weekId}`, JSON.stringify(arr))
          } catch {}
        })
      })
      return merged
    })
    setActive(false)
    setStoppedElapsedMs(finalElapsed)
    try { localStorage.setItem('studySession.lastElapsedMs', String(finalElapsed)) } catch {}
  }, [active, reviewed, startedAt])

  const reset = useCallback(() => {
    // Clear current in-memory session (does not erase ever progress)
    setActive(false)
    setReviewed({ vocab: {}, phrase: {} })
    setStartedAt(null)
    setElapsedMs(0)
    setStoppedElapsedMs(null)
  try { localStorage.removeItem('studySession.lastElapsedMs') } catch {}
  }, [])

  const isWeekCompleted = useCallback((week) => {
    if (!week) return false
    const vocabIds = (week.vocab || []).map(v => v.id)
    const phraseIds = (week.phrases || []).map(p => p.id)
    if (vocabIds.length === 0 && phraseIds.length === 0) return false
    const evV = everReviewed.vocab[week.id] || new Set()
    const evP = everReviewed.phrase[week.id] || new Set()
    return vocabIds.every(id => evV.has(id)) && phraseIds.every(id => evP.has(id))
  }, [everReviewed])

  const formatElapsed = useCallback(() => {
    const total = active ? elapsedMs : (stoppedElapsedMs ?? 0)
    const sec = Math.floor(total / 1000) % 60
    const min = Math.floor(total / 60000) % 60
    const hr = Math.min(99, Math.floor(total / 3600000)) // cap at 99h
    const pad = (n) => n.toString().padStart(2,'0')
    return `${pad(hr)}:${pad(min)}:${pad(sec)}`
  }, [elapsedMs, active, stoppedElapsedMs])

  return {
    active,
    startedAt,
    elapsedMs,
    reviewed,
    everReviewed,
    start,
    stop,
  reset,
    toggleReviewed,
    isWeekCompleted,
    formatElapsed
  }
}
