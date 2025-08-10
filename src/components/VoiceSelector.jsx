import { useEffect, useState, useCallback } from 'preact/hooks'
import './VoiceSelector.css'

// Utility to load voices reliably across browsers (esp. iOS where getVoices may be empty initially)
function loadVoices() {
  return new Promise(resolve => {
    const synth = window.speechSynthesis
    if (!synth) { resolve([]); return }
    let voices = synth.getVoices()
    if (voices && voices.length) {
      resolve(voices)
      return
    }
    const handler = () => {
      voices = synth.getVoices()
      if (voices && voices.length) {
        synth.removeEventListener('voiceschanged', handler)
        resolve(voices)
      }
    }
    synth.addEventListener('voiceschanged', handler)
    // Fallback timeout
    setTimeout(() => {
      voices = synth.getVoices()
      synth.removeEventListener('voiceschanged', handler)
      resolve(voices || [])
    }, 1500)
  })
}

export function VoiceSelector({ isOpen, onClose, onSelect }) {
  const [allVoices, setAllVoices] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [preferred, setPreferred] = useState(localStorage.getItem('prefs.tts.voice') || '')

  const refresh = useCallback(async () => {
    setLoading(true)
    const voices = await loadVoices()
    // Only Spanish voices (any dialect) + maybe top Google/Microsoft with es in lang
    const esVoices = voices.filter(v => /(^|-)es(-|$)/i.test(v.lang) || v.lang.toLowerCase().startsWith('es'))
    // Sort: language code, then name
    esVoices.sort((a,b) => (a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name)))
    setAllVoices(esVoices)
    setLoading(false)
  }, [])

  useEffect(() => { if (isOpen) refresh() }, [isOpen, refresh])

  const handleSelect = (voice) => {
    setPreferred(voice.name)
    localStorage.setItem('prefs.tts.voice', voice.name)
    localStorage.setItem('prefs.tts.voiceLang', voice.lang)
    onSelect?.(voice)
    onClose?.()
  }

  if (!isOpen) return null

  const visible = allVoices.filter(v => !filter || v.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="voice-modal-overlay" onClick={onClose}>
      <div className="voice-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="voice-modal-header">
          <h3>Select Voice</h3>
          <button className="close-button" onClick={onClose} aria-label="Close voice selector">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="voice-filter-row">
          <input
            type="text"
            className="voice-filter"
            placeholder="Filter voices"
            value={filter}
            onInput={e => setFilter(e.target.value)}
          />
          <button className="refresh" onClick={refresh} disabled={loading}>{loading ? '...' : '↻'}</button>
        </div>
        <div className="voice-list" role="list">
          {visible.map(v => {
            const isPreferred = preferred === v.name
            return (
              <button
                key={v.name + v.lang}
                className={`voice-item ${isPreferred ? 'selected' : ''}`}
                onClick={() => handleSelect(v)}
              >
                <div className="voice-main">
                  <span className="voice-name">{v.name}</span>
                  {isPreferred && <span className="badge">Default</span>}
                </div>
                <div className="voice-meta">{v.lang}</div>
              </button>
            )
          })}
          {!visible.length && (
            <div className="empty">No voices found</div>
          )}
        </div>
        <div className="voice-footer">
          <p className="hint">Spanish voices detected: {allVoices.length}</p>
        </div>
      </div>
    </div>
  )
}
