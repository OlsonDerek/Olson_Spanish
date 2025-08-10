import { Component } from 'preact'
import { trackError } from '../utils/analytics'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Error' }
  }
  componentDidCatch(error, info) {
    trackError(error, { component_stack: info?.componentStack })
  }
  render(props, state) {
    if (state.hasError) {
      return props.fallback || <div className="app error"><p>Something went wrong.</p></div>
    }
    return props.children
  }
}
