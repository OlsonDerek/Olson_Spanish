// Lightweight analytics/event tracking utility
// Provides: track(name, props), identify(userId, traits), initAnalytics()
// Automatically adds session_id, user_id, ts, and app_version (from package.json if injected later)

const state = {
  initialized: false,
  providers: [],
  sessionId: null,
  userId: null,
  consent: 'granted'
}

function getOrCreateUserId() {
  try {
    let id = localStorage.getItem('user.id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('user.id', id)
    }
    return id
  } catch {
    return 'anon'
  }
}

export function initAnalytics() {
  if (state.initialized) return state
  state.initialized = true
  state.sessionId = crypto.randomUUID()
  state.userId = getOrCreateUserId()
  try {
    const consent = localStorage.getItem('consent.analytics')
    if (consent === 'denied') state.consent = 'denied'
  } catch {}

  // Vercel Analytics (va) if available (script injected by @vercel/analytics <Analytics /> component)
  if (typeof window !== 'undefined') {
    const tryAttach = () => {
      if (window.va && !state.providers.find(p => p.__name === 'vercel')) {
        const p = (name, props) => window.va.track?.(name, props)
        p.__name = 'vercel'
        state.providers.push(p)
      }
      if (window.posthog && !state.providers.find(p => p.__name === 'posthog')) {
        const p = (name, props) => window.posthog.capture?.(name, props)
        p.__name = 'posthog'
        state.providers.push(p)
      }
    }
    // Attempt now and after a tick
    tryAttach()
    setTimeout(tryAttach, 2000)
  }

  track('session.start', { session_id: state.sessionId })
  return state
}

export function endSession() {
  if (!state.sessionId) return
  track('session.end', { session_id: state.sessionId })
}

export function track(name, props = {}) {
  if (state.consent === 'denied') return
  const payload = {
    ...props,
    ts: Date.now(),
    session_id: state.sessionId,
    user_id: state.userId,
    evt: name
  }
  try {
    state.providers.forEach(p => {
      try { p(name, payload) } catch {/* ignore provider errors */}
    })
    // Fallback debug (only in dev)
    if (import.meta.env.DEV && state.providers.length === 0) {
      console.debug('[analytics]', name, payload)
    }
  } catch {}
}

export function identify(userId, traits = {}) {
  state.userId = userId
  if (window.posthog) window.posthog.identify?.(userId, traits)
  track('user.identify', traits)
}

// Convenience wrappers
export function trackError(err, context = {}) {
  track('error.client', {
    message: err?.message || String(err),
    stack_hash: hashString(err?.stack || ''),
    ...context
  })
}

function hashString(str) {
  let h = 0, i, chr
  if (str.length === 0) return '0'
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    h = ((h << 5) - h) + chr
    h |= 0
  }
  return h.toString(16)
}

// Auto end session on visibility/navigation
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    try { endSession() } catch {}
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      try { endSession() } catch {}
    }
  })
}
