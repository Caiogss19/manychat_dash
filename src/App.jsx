import { useState } from 'react'
import { MetricCard } from './components/MetricCard.jsx'
import { ChartCard } from './components/ChartCard.jsx'
import { LeadsTable } from './components/LeadsTable.jsx'
import { RangeFilter, Segmented } from './components/Filters.jsx'
import { FunilChart } from './components/charts/FunilChart.jsx'
import { StatusChart } from './components/charts/StatusChart.jsx'
import { LeadsDiaChart } from './components/charts/LeadsDiaChart.jsx'
import { DistribuicaoChart } from './components/charts/DistribuicaoChart.jsx'
import { OrigemChart } from './components/charts/OrigemChart.jsx'
import { MsgsDirecaoChart } from './components/charts/MsgsDirecaoChart.jsx'
import { MsgsDiaChart } from './components/charts/MsgsDiaChart.jsx'
import { useKpis } from './hooks/useKpis.js'
import { useFunilPasso } from './hooks/useFunilPasso.js'
import { useStatus } from './hooks/useStatus.js'
import { useLeadsDia } from './hooks/useLeadsDia.js'
import { useDistribuicao } from './hooks/useDistribuicao.js'
import { useOrigem } from './hooks/useOrigem.js'
import { useMsgsDirecao } from './hooks/useMsgsDirecao.js'
import { useMsgsDia } from './hooks/useMsgsDia.js'
import { DIMENSOES } from './lib/queries.js'
import { fmtInt } from './lib/format.js'

const RANGE_TO_DAYS = { '7d': 7, '30d': 30, '90d': 90, all: null }

export default function App() {
  const [range, setRange] = useState('30d')
  const [dimensao, setDimensao] = useState('budget')
  const days = RANGE_TO_DAYS[range] ?? null

  const kpis = useKpis()
  const funil = useFunilPasso()
  const status = useStatus()
  const leadsDia = useLeadsDia(days)
  const distribuicao = useDistribuicao(dimensao)
  const origem = useOrigem()
  const msgsDir = useMsgsDirecao()
  const msgsDia = useMsgsDia(days)

  const k = kpis.kpis || {}

  return (
    <div className="min-h-full bg-plane">
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <Header range={range} onRange={setRange} loading={kpis.loading} />

        {/* Erro dos KPIs (fatal — precisa aparecer no topo) */}
        {kpis.error ? (
          <div className="mb-4 rounded border border-status-critical/25 bg-status-critical/[0.04] p-3">
            <div className="text-xs font-mono text-status-critical uppercase tracking-wide mb-1">
              Erro carregando KPIs (vw_qual_kpis)
            </div>
            <div className="text-sm text-ink font-mono break-all">
              {kpis.error.message || String(kpis.error)}
            </div>
            <button
              onClick={kpis.refetch}
              className="mt-2 text-xs px-2 py-1 rounded border border-rule-strong bg-surface hover:bg-plane"
            >
              ↻ Tentar novamente
            </button>
          </div>
        ) : null}

        {/* 01 — KPIs */}
        <SectionTitle n="01" title="KPIs de qualificação" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Total de leads" value={k.total_leads} intent="primary"
            loading={kpis.loading} error={kpis.error} />
          <MetricCard label="Completos" value={k.completos} intent="good"
            hint={`${fmtInt(k.total_leads)} total`}
            loading={kpis.loading} error={kpis.error} />
          <MetricCard label="Timeouts" value={k.timeouts} intent="critical"
            loading={kpis.loading} error={kpis.error} />
          <MetricCard label="Em andamento" value={k.em_andamento} intent="warning"
            loading={kpis.loading} error={kpis.error} />
          <MetricCard label="SQLs" value={k.sqls} intent="aqua"
            loading={kpis.loading} error={kpis.error} />
          <MetricCard label="Handoffs" value={k.handoffs} intent="violet"
            loading={kpis.loading} error={kpis.error} />
          <MetricCard label="Taxa de conclusão" value={k.taxa_conclusao} kind="pct" intent="good"
            hint="completos ÷ total"
            loading={kpis.loading} error={kpis.error} />
          <MetricCard label="Taxa de timeout" value={k.taxa_timeout} kind="pct" intent="critical"
            hint="timeouts ÷ total"
            loading={kpis.loading} error={kpis.error} />
        </div>

        {/* 02 — Funil por passo + Status */}
        <SectionTitle n="02" title="Funil e status do bot" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <ChartCard
            className="lg:col-span-2"
            title="Funil por passo"
            subtitle="Quantos eventos passaram em cada etapa do flow."
            loading={funil.loading}
            error={funil.error}
            empty={!funil.loading && funil.rows.length === 0}
            onRefetch={funil.refetch}
            height={Math.max(260, 44 * Math.max(1, funil.rows.length))}
          >
            <FunilChart rows={funil.rows} />
          </ChartCard>
          <ChartCard
            title="Status do bot"
            subtitle="Distribuição por status_bot."
            loading={status.loading}
            error={status.error}
            empty={!status.loading && status.rows.length === 0}
            onRefetch={status.refetch}
            height={260}
          >
            <StatusChart rows={status.rows} />
          </ChartCard>
        </div>

        {/* 03 — Leads no tempo + Origem */}
        <SectionTitle n="03" title="Leads no tempo" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <ChartCard
            className="lg:col-span-2"
            title="Leads por dia"
            subtitle={`Janela: ${range === 'all' ? 'tudo' : range}`}
            loading={leadsDia.loading}
            error={leadsDia.error}
            empty={!leadsDia.loading && leadsDia.rows.length === 0}
            onRefetch={leadsDia.refetch}
          >
            <LeadsDiaChart rows={leadsDia.rows} />
          </ChartCard>
          <ChartCard
            title="Origem dos leads"
            subtitle="De onde entraram no ManyChat."
            loading={origem.loading}
            error={origem.error}
            empty={!origem.loading && origem.rows.length === 0}
            onRefetch={origem.refetch}
          >
            <OrigemChart rows={origem.rows} />
          </ChartCard>
        </div>

        {/* 04 — Mensagens no tempo + Direção */}
        <SectionTitle n="04" title="Mensagens" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <ChartCard
            className="lg:col-span-2"
            title="Mensagens por dia"
            subtitle={`Volume total (in + out) por dia. Janela: ${range === 'all' ? 'tudo' : range}`}
            loading={msgsDia.loading}
            error={msgsDia.error}
            empty={!msgsDia.loading && msgsDia.rows.length === 0}
            onRefetch={msgsDia.refetch}
          >
            <MsgsDiaChart rows={msgsDia.rows} />
          </ChartCard>
          <ChartCard
            title="Entrada × saída"
            subtitle="Msg do lead vs do bot."
            loading={msgsDir.loading}
            error={msgsDir.error}
            empty={!msgsDir.loading && msgsDir.rows.length === 0}
            onRefetch={msgsDir.refetch}
          >
            <MsgsDirecaoChart rows={msgsDir.rows} />
          </ChartCard>
        </div>

        {/* 05 — Distribuição */}
        <SectionTitle n="05" title="Distribuição dos leads" />
        <ChartCard
          className="mb-6"
          title={`Por ${DIMENSOES.find((d) => d.value === dimensao)?.label.toLowerCase()}`}
          subtitle="Selecione a dimensão para trocar o eixo."
          loading={distribuicao.loading}
          error={distribuicao.error}
          empty={!distribuicao.loading && distribuicao.rows.length === 0}
          onRefetch={distribuicao.refetch}
          action={
            <Segmented
              value={dimensao}
              onChange={setDimensao}
              options={DIMENSOES.map((d) => ({ value: d.value, label: d.label }))}
            />
          }
        >
          <DistribuicaoChart rows={distribuicao.rows} />
        </ChartCard>

        {/* 06 — Tabela */}
        <SectionTitle n="06" title="Leads detalhados" />
        <LeadsTable />

        <Footer />
      </main>
    </div>
  )
}

function Header({ range, onRange, loading }) {
  return (
    <header className="mb-6">
      <div className="text-[11px] tracking-[0.18em] uppercase font-mono text-cat-6 font-semibold mb-2">
        Spark Maxx · Growth Ops
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink">
        Qualificação — Analytics
      </h1>
      <p className="text-sm text-ink-secondary mt-1 max-w-2xl">
        Funil de qualificação ManyChat → n8n → Supabase. Cada card lê uma view SQL (
        <code className="font-mono text-[12px] bg-plane px-1 py-0.5 rounded">vw_qual_*</code>) e falha
        isolado se a query der ruim.
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <span className="text-xs text-ink-secondary">Janela para gráficos de data:</span>
        <RangeFilter value={range} onChange={onRange} />
        <span className="ml-auto text-[11px] font-mono text-ink-muted">
          {loading ? 'carregando…' : 'ao vivo do Supabase'}
        </span>
      </div>
    </header>
  )
}

function SectionTitle({ n, title }) {
  return (
    <h2 className="text-lg font-semibold text-ink mt-8 mb-3 flex items-baseline gap-2">
      <span className="font-mono text-xs text-ink-muted font-medium">{n}</span>
      {title}
    </h2>
  )
}

function Footer() {
  return (
    <footer className="mt-10 pt-4 border-t border-rule text-[11px] text-ink-muted flex justify-between">
      <span>
        Fonte:{' '}
        <code className="font-mono">vw_qual_*</code> + <code className="font-mono">leads_manychat</code> +{' '}
        <code className="font-mono">disparo_eventos</code>
      </span>
      <span>React · Vite · Tailwind · Recharts · @supabase/supabase-js</span>
    </footer>
  )
}
