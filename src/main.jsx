import { render } from 'preact'
// NOTE: File name is 'App.jsx' (capital A). Linux (Vercel) is case-sensitive.
import { App } from './App.jsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { initAnalytics } from './utils/analytics.js'
import { initPerformance, markCustom } from './utils/performance.js'

const root = document.getElementById('app')
const start = performance.now()

initAnalytics()
initPerformance()

render(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>,
	root
)

// Custom metric: time to app render
markCustom('time_to_first_paint_app', performance.now() - start)