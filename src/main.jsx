import { render } from 'preact'
// NOTE: File name is 'App.jsx' (capital A). Linux (Vercel) is case-sensitive.
import { App } from './App.jsx'
import './index.css'

render(<App />, document.getElementById('app'))