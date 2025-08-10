// Web Vitals & custom performance metrics reporter
// Lazy-load web-vitals only in production (or dev if needed) to keep bundle small
import { track } from './analytics'

let webVitalsLoaded = false

export async function initPerformance() {
  if (webVitalsLoaded) return
  try {
    const mod = await import('web-vitals')
    const send = (metric) => {
      track('perf.web_vital', {
        name: metric.name,
        id: metric.id,
        value: Math.round(metric.value * 1000) / 1000,
        rating: metric.rating
      })
    }
    mod.onCLS(send)
    mod.onLCP(send)
    mod.onFID(send)
    mod.onINP?.(send)
    mod.onTTFB(send)
    mod.onFCP(send)
    webVitalsLoaded = true
  } catch (e) {
    // web-vitals not installed yet or dynamic import failed
    if (import.meta.env.DEV) console.warn('web-vitals load failed', e)
  }
}

export function markCustom(metricName, valueMs) {
  track('perf.custom', { name: metricName, value: valueMs })
}
