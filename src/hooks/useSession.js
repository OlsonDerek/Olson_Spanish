import { useState, useEffect, useCallback } from 'preact/hooks'

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useSession(weekId) {
  const [session, setSession] = useState({
    vocabReviewed: [],
    phraseReviewed: [],
    startedAt: null
  })

  // Load session data from localStorage when weekId changes
  useEffect(() => {
    if (!weekId) return

    const loadSession = () => {
      try {
        const vocabKey = `session.vocabReviewed.${weekId}`
        const phraseKey = `session.phraseReviewed.${weekId}`
        const startedAtKey = `session.startedAt.${weekId}`

        const vocabReviewed = JSON.parse(localStorage.getItem(vocabKey) || '[]')
        const phraseReviewed = JSON.parse(localStorage.getItem(phraseKey) || '[]')
        const startedAt = localStorage.getItem(startedAtKey)

        // Check if session has expired
        if (startedAt) {
          const sessionAge = Date.now() - parseInt(startedAt)
          if (sessionAge > SESSION_DURATION_MS) {
            // Session expired, clear it
            localStorage.removeItem(vocabKey)
            localStorage.removeItem(phraseKey)
            localStorage.removeItem(startedAtKey)
            setSession({
              vocabReviewed: [],
              phraseReviewed: [],
              startedAt: null
            })
            return
          }
        }

        setSession({
          vocabReviewed,
          phraseReviewed,
          startedAt: startedAt ? parseInt(startedAt) : null
        })
      } catch (error) {
        console.error('Failed to load session:', error)
        // Reset to empty session on error
        setSession({
          vocabReviewed: [],
          phraseReviewed: [],
          startedAt: null
        })
      }
    }

    loadSession()
  }, [weekId])

  // Save session data to localStorage
  const saveSession = useCallback((newSession) => {
    if (!weekId) return

    try {
      const vocabKey = `session.vocabReviewed.${weekId}`
      const phraseKey = `session.phraseReviewed.${weekId}`
      const startedAtKey = `session.startedAt.${weekId}`

      localStorage.setItem(vocabKey, JSON.stringify(newSession.vocabReviewed))
      localStorage.setItem(phraseKey, JSON.stringify(newSession.phraseReviewed))
      if (newSession.startedAt) {
        localStorage.setItem(startedAtKey, newSession.startedAt.toString())
      }
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }, [weekId])

  const markReviewed = useCallback((itemId, type) => {
    if (!weekId) return

    setSession(prevSession => {
      const now = Date.now()
      const startedAt = prevSession.startedAt || now
      
      let newSession
      if (type === 'vocab') {
        const vocabReviewed = prevSession.vocabReviewed.includes(itemId)
          ? prevSession.vocabReviewed.filter(id => id !== itemId)
          : [...prevSession.vocabReviewed, itemId]
        
        newSession = {
          ...prevSession,
          vocabReviewed,
          startedAt
        }
      } else if (type === 'phrase') {
        const phraseReviewed = prevSession.phraseReviewed.includes(itemId)
          ? prevSession.phraseReviewed.filter(id => id !== itemId)
          : [...prevSession.phraseReviewed, itemId]
        
        newSession = {
          ...prevSession,
          phraseReviewed,
          startedAt
        }
      } else {
        return prevSession
      }

      saveSession(newSession)
      return newSession
    })
  }, [weekId, saveSession])

  const resetSession = useCallback(() => {
    if (!weekId) return

    const newSession = {
      vocabReviewed: [],
      phraseReviewed: [],
      startedAt: null
    }

    setSession(newSession)

    // Clear from localStorage
    try {
      localStorage.removeItem(`session.vocabReviewed.${weekId}`)
      localStorage.removeItem(`session.phraseReviewed.${weekId}`)
      localStorage.removeItem(`session.startedAt.${weekId}`)
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }, [weekId])

  return {
    session,
    markReviewed,
    resetSession
  }
}