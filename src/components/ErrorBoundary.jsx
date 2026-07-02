import { Component } from 'react'

/** Boundary de topo — captura qualquer erro de render/inicialização
 *  e mostra a stack em vez de tela em branco. */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    // Também loga no console pra debug em prod (Vercel logs)
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }
  reset = () => this.setState({ error: null })
  render() {
    if (!this.state.error) return this.props.children
    const err = this.state.error
    return (
      <div className="min-h-screen bg-plane px-6 py-10">
        <div className="max-w-2xl mx-auto rounded-lg bg-surface shadow-card p-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-status-critical font-semibold mb-2">
            Erro no app
          </div>
          <h1 className="text-2xl font-semibold text-ink mb-2">Algo quebrou.</h1>
          <p className="text-sm text-ink-secondary mb-3">
            A mensagem crua do erro (útil pra debug):
          </p>
          <pre className="text-xs font-mono bg-plane border border-rule rounded p-3 overflow-auto whitespace-pre-wrap break-words">
            {err?.message || String(err)}
          </pre>
          {err?.stack ? (
            <details className="mt-2">
              <summary className="text-xs text-ink-muted cursor-pointer">stack trace</summary>
              <pre className="text-[11px] font-mono bg-plane border border-rule rounded p-3 overflow-auto mt-2 whitespace-pre-wrap break-words">
                {err.stack}
              </pre>
            </details>
          ) : null}
          <button
            onClick={this.reset}
            className="mt-4 text-xs px-3 py-1.5 rounded border border-rule-strong bg-plane hover:bg-surface"
          >
            ↻ Tentar remontar
          </button>
        </div>
      </div>
    )
  }
}
