import { envInfo } from '../lib/supabase.js'

/** Tela mostrada quando falta VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY. */
export function ConfigMissing() {
  return (
    <div className="min-h-screen bg-plane px-6 py-10">
      <div className="max-w-2xl mx-auto rounded-lg bg-surface shadow-card p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-status-warning font-semibold mb-2">
          Configuração pendente
        </div>
        <h1 className="text-2xl font-semibold text-ink mb-3">
          Variáveis de ambiente não estão setadas
        </h1>
        <p className="text-sm text-ink-secondary mb-4">
          A dashboard precisa das duas variáveis abaixo pra conectar no Supabase.
        </p>

        <ul className="text-sm mb-4 space-y-1.5">
          <li className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                envInfo.url
                  ? 'bg-status-good/10 text-status-good border-status-good/20'
                  : 'bg-status-critical/10 text-status-critical border-status-critical/20'
              }`}
            >
              {envInfo.url ? 'OK' : 'faltando'}
            </span>
            <code className="font-mono text-[13px]">VITE_SUPABASE_URL</code>
            {envInfo.url ? (
              <span className="text-xs text-ink-muted">= {envInfo.url}</span>
            ) : null}
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                envInfo.hasKey
                  ? 'bg-status-good/10 text-status-good border-status-good/20'
                  : 'bg-status-critical/10 text-status-critical border-status-critical/20'
              }`}
            >
              {envInfo.hasKey ? 'OK' : 'faltando'}
            </span>
            <code className="font-mono text-[13px]">VITE_SUPABASE_ANON_KEY</code>
          </li>
        </ul>

        <div className="rounded border border-rule bg-plane p-4 mb-4">
          <div className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-2">
            Deploy na Vercel
          </div>
          <ol className="text-sm text-ink-secondary space-y-1 list-decimal pl-4">
            <li>
              Vercel Dashboard → seu projeto → <b>Settings</b> → <b>Environment Variables</b>.
            </li>
            <li>
              Adicionar <code className="font-mono">VITE_SUPABASE_URL</code> e{' '}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> nos ambientes{' '}
              <b>Production</b> e <b>Preview</b>.
            </li>
            <li>
              <b>Redeploy</b> a partir do commit atual — Vite embute env vars no build,
              então a mudança só aparece no próximo deploy.
            </li>
          </ol>
        </div>

        <div className="rounded border border-rule bg-plane p-4">
          <div className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-2">
            Localmente
          </div>
          <pre className="text-xs font-mono overflow-auto">
{`cp .env.example .env
# edita .env com os dois valores
npm run dev`}
          </pre>
        </div>
      </div>
    </div>
  )
}
