import { Fragment, useMemo, useState } from 'react'
import { useLeadsManychat } from '../hooks/useLeadsManychat.js'
import { fmtDateTime, fmtInt } from '../lib/format.js'
import { RangeFilter, SearchInput, SqlFilter, StatusFilter } from './Filters.jsx'
import { LeadTimeline } from './LeadTimeline.jsx'
import { StateBoundary } from './StateBoundary.jsx'

const PAGE_SIZE = 20
const RANGE_TO_DAYS = { '7d': 7, '30d': 30, '90d': 90, all: null }

export function LeadsTable() {
  const [statusBot, setStatusBot] = useState('__all__')
  const [isSql, setIsSql] = useState(null)
  const [range, setRange] = useState('30d')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState(null)

  const filters = useMemo(
    () => ({
      statusBot,
      isSql,
      days: RANGE_TO_DAYS[range] ?? null,
      search,
      page,
      pageSize: PAGE_SIZE,
    }),
    [statusBot, isSql, range, search, page],
  )

  const { rows, count, error, loading, refetch } = useLeadsManychat(filters)
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="rounded-lg bg-surface shadow-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Leads (leads_manychat)</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            {loading ? 'carregando…' : `${fmtInt(count)} lead(s) no filtro`}
          </p>
        </div>
        <button
          onClick={refetch}
          className="text-xs px-2 py-1 rounded border border-rule-strong hover:bg-plane"
        >
          ↻ Atualizar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(0) }} />
        <StatusFilter value={statusBot} onChange={(v) => { setStatusBot(v); setPage(0) }} />
        <SqlFilter value={isSql} onChange={(v) => { setIsSql(v); setPage(0) }} />
        <RangeFilter value={range} onChange={(v) => { setRange(v); setPage(0) }} className="ml-auto" />
      </div>

      <StateBoundary loading={loading} error={error} empty={!loading && rows.length === 0} onRefetch={refetch}>
        <div className="overflow-x-auto rounded border border-rule">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-plane border-b border-rule">
                <Th className="w-6" />
                <Th>Nome</Th>
                <Th>Empresa · Cargo</Th>
                <Th>Tamanho</Th>
                <Th>Budget</Th>
                <Th>Status</Th>
                <Th>SQL</Th>
                <Th>Origem</Th>
                <Th className="text-right">Criado</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const open = openId === l.id
                const q = l.qualificacao || {}
                return (
                  <Fragment key={l.id}>
                    <tr
                      className="border-b border-rule last:border-0 hover:bg-plane cursor-pointer"
                      onClick={() => setOpenId(open ? null : l.id)}
                    >
                      <Td className="text-ink-muted select-none">{open ? '▾' : '▸'}</Td>
                      <Td>
                        <div className="text-ink">{l.nome || '—'}</div>
                        <div className="text-[11px] font-mono text-ink-muted">{l.telefone || ''}</div>
                      </Td>
                      <Td>
                        <div className="text-ink">{l.empresa || '—'}</div>
                        <div className="text-xs text-ink-secondary">{l.cargo || ''}</div>
                      </Td>
                      <Td>{q.tamanho_empresa || '—'}</Td>
                      <Td>{q.budget || '—'}</Td>
                      <Td><StatusPill v={l.status_bot} /></Td>
                      <Td><Bool v={l.is_sql} /></Td>
                      <Td className="text-xs text-ink-secondary">{l.origem_ref_tabela || '—'}</Td>
                      <Td className="text-right text-xs font-mono text-ink-secondary whitespace-nowrap">
                        {fmtDateTime(l.criado_em)}
                      </Td>
                    </tr>
                    {open ? (
                      <tr className="border-b border-rule bg-plane/50">
                        <td colSpan={9} className="px-4 py-3">
                          <LeadTimeline
                            subscriberId={l.manychat_subscriber_id}
                            telefone={l.telefone}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-ink-secondary">
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-2 py-1 rounded border border-rule-strong hover:bg-plane disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-1 rounded border border-rule-strong hover:bg-plane disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        </div>
      </StateBoundary>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th
      className={`px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider font-medium text-ink-muted ${className}`}
    >
      {children}
    </th>
  )
}

function Td({ children, className = '' }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>
}

function StatusPill({ v }) {
  const s = v || 'desconhecido'
  const style = {
    completo: 'bg-status-good/10 text-status-good border-status-good/20',
    em_andamento: 'bg-status-warning/10 text-status-warning border-status-warning/25',
    timeout: 'bg-status-critical/10 text-status-critical border-status-critical/20',
    handoff: 'bg-cat-5/10 text-cat-5 border-cat-5/20',
    novo: 'bg-cat-1/10 text-cat-1 border-cat-1/20',
  }[s] || 'bg-plane text-ink-secondary border-rule'
  return (
    <span
      className={`inline-block text-[10px] font-mono font-semibold uppercase tracking-wide px-1.5 py-[1px] rounded border ${style}`}
    >
      {s}
    </span>
  )
}

function Bool({ v }) {
  return v ? (
    <span className="inline-flex items-center gap-1 text-status-good text-xs">✓</span>
  ) : (
    <span className="text-ink-muted text-xs">—</span>
  )
}
