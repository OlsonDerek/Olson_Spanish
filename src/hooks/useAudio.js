import { useState, useCallback, useRef } from 'preact/hooks'

export function useAudio(audioConfig) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const currentAudio = useRef(null)

  const stopCurrentAudio = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current = null
    }
    setIsPlaying(false)
  }, [])

  const playWithTTS = useCallback(async (text, voiceHint = 'es-ES') => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Try to find a Spanish voice
      const voices = window.speechSynthesis.getVoices()
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') || 
        voice.lang.includes(voiceHint) ||
        voice.name.toLowerCase().includes('spanish')
      )
      
      if (spanishVoice) {
        utterance.voice = spanishVoice
      }
      
      utterance.lang = voiceHint
      utterance.rate = 0.8 // Slightly slower for learning
      utterance.pitch = 1.1
      utterance.volume = 1.0

      utterance.onstart = () => {
        setIsPlaying(true)
        setError(null)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        resolve()
      }

      utterance.onerror = (event) => {
        setIsPlaying(false)
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      window.speechSynthesis.speak(utterance)
    })
  }, [])

  const playWithAudio = useCallback(async (audioUrl) => {
    return new Promise((resolve, reject) => {
      stopCurrentAudio()

      const audio = new Audio(audioUrl)
      currentAudio.current = audio

      audio.onloadstart = () => {
        setIsPlaying(true)
        setError(null)
      }

      audio.onended = () => {
        setIsPlaying(false)
        currentAudio.current = null
        resolve()
      }

      audio.onerror = () => {
        setIsPlaying(false)
        currentAudio.current = null
        reject(new Error('Failed to load audio file'))
      }

      audio.play().catch(reject)
    })
  }, [stopCurrentAudio])

  const playPhrase = useCallback(async (text, audioUrl) => {
    try {
      setError(null)
      
      // Stop any currently playing audio
      stopCurrentAudio()
      window.speechSynthesis?.cancel()

      // Prefer MP3 if available and configured
      if (audioUrl && audioUrl.trim() && (audioConfig?.preferMp3 || !audioConfig?.tts?.enabled)) {
        try {
          await playWithAudio(audioUrl)
          return
        } catch (audioError) {
          console.warn('Audio file failed, falling back to TTS:', audioError)
          // Fall through to TTS
        }
      }

      // Use TTS as primary or fallback
      if (audioConfig?.tts?.enabled !== false) {
        await playWithTTS(text, audioConfig?.tts?.voiceHint || 'es-ES')
      } else {
        throw new Error('No audio playback method available')
      }
    } catch (err) {
      console.error('Failed to play phrase:', err)
      setError(err.message)
      setIsPlaying(false)
      throw err
    }
  }, [audioConfig, playWithAudio, playWithTTS, stopCurrentAudio])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopCurrentAudio()
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setError(null)
  }, [stopCurrentAudio])

  return {
    playPhrase,
    isPlaying,
    error,
    cleanup
  }
}