# ManyChat · Qualificação — Analytics Dashboard

Dashboard React que lê **views SQL** do Supabase e mostra o funil de qualificação de leads do ManyChat (via n8n → Supabase).

- **Stack**: React + Vite + Tailwind + Recharts + `@supabase/supabase-js`
- **Fonte**: 8 views (`vw_qual_*`) + `leads_manychat` + `disparo_eventos`
- **Paleta**: validada por CVD (do skill dataviz — 8 slots categorical + 4 status)
- **Sem mocks**: erro real da query aparece por card, cada view isolada.

## Instalação

```bash
git clone <repo> manychat_dash && cd manychat_dash
cp .env.example .env
# edita .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev            # http://localhost:5173
```

## Variáveis de ambiente

Em `.env` (a partir do `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Se qualquer uma faltar, `src/lib/supabase.js` lança erro na inicialização — sem silent fallback.

## Estrutura

```
src/
  main.jsx
  App.jsx                       ← composição das seções
  index.css                     ← tailwind + overrides do Recharts
  lib/
    supabase.js                 ← client Supabase (falha se falta env)
    queries.js                  ← nomes centralizados das views + filtros
    format.js                   ← fmtInt, fmtPct, fmtDate, fmtDateTime
    theme.js                    ← tokens de cor consumidos pelo Recharts
  hooks/
    useSupabaseQuery.js         ← hook genérico (loading/erro isolados)
    useKpis.js                  ← vw_qual_kpis          (1 linha)
    useFunilPasso.js            ← vw_qual_funil_passo
    useStatus.js                ← vw_qual_status
    useLeadsDia.js              ← vw_qual_leads_dia     (janela client-side)
    useDistribuicao.js          ← vw_qual_distribuicao  (filtro por dimensao)
    useOrigem.js                ← vw_qual_origem
    useMsgsDirecao.js           ← vw_qual_msgs_direcao
    useMsgsDia.js               ← vw_qual_msgs_dia      (janela client-side)
    useLeadsManychat.js         ← leads_manychat        (filtros + paginação)
    useLeadTimeline.js          ← disparo_eventos       (por subscriber_id)
  components/
    MetricCard.jsx              ← card de KPI reutilizável
    ChartCard.jsx               ← wrapper com StateBoundary
    StateBoundary.jsx           ← loading skeleton + erro + empty
    Filters.jsx                 ← RangeFilter, StatusFilter, SqlFilter, SearchInput, Segmented
    LeadsTable.jsx              ← tabela paginada + linha expansível
    LeadTimeline.jsx            ← thread de eventos do lead
    charts/
      ChartTooltip.jsx          ← tooltip padrão
      FunilChart.jsx            ← barras horizontais (ordinal single-hue)
      StatusChart.jsx           ← pizza status_bot (cores fixas por status)
      LeadsDiaChart.jsx         ← linha + área leve (blue)
      DistribuicaoChart.jsx     ← barras — dimensão selecionável
      OrigemChart.jsx           ← pizza — categorical slots
      MsgsDirecaoChart.jsx      ← barras in/out (blue+aqua)
      MsgsDiaChart.jsx          ← linha + área (aqua)
```

## Como cada view é consumida

| Card / Chart | Hook | View | Filtro cliente |
|---|---|---|---|
| KPIs (8 cards) | `useKpis` | `vw_qual_kpis` | — |
| Funil por passo | `useFunilPasso` | `vw_qual_funil_passo` | ordena por passo |
| Status do bot | `useStatus` | `vw_qual_status` | ordena por qtd desc |
| Leads / dia | `useLeadsDia(days)` | `vw_qual_leads_dia` | corta por `dia >= hoje - days` |
| Distribuição | `useDistribuicao(dim)` | `vw_qual_distribuicao` | filtra `dimensao === dim` |
| Origem | `useOrigem` | `vw_qual_origem` | ordena por qtd desc |
| Msgs in/out | `useMsgsDirecao` | `vw_qual_msgs_direcao` | — |
| Msgs / dia | `useMsgsDia(days)` | `vw_qual_msgs_dia` | corta por `dia >= hoje - days` |
| Tabela de leads | `useLeadsManychat({...})` | `leads_manychat` | server-side (`.eq`, `.gte`, `.or`, `.range`) |
| Timeline (row expand) | `useLeadTimeline(sid)` | `disparo_eventos` | `subscriber_id = sid` |

## Filtro global de janela

Aplicado só nos gráficos por dia (`leads_dia`, `msgs_dia`) e na tabela de leads (via `criado_em`). Presets: **7d · 30d · 90d · tudo**.

As views de data já vêm agrupadas por dia — o filtro roda no cliente (não faz round-trip).

## Deploy estático

```bash
npm run build
# dist/ pronta pra qualquer host estático
```

Vercel / Netlify / Cloudflare Pages / GitHub Pages funcionam direto — só configure as duas env vars no painel do host.

## Docs operacionais (mantidos do projeto anterior)

- [`MANYCHAT_FLOW_BUILD.md`](./MANYCHAT_FLOW_BUILD.md) — passo-a-passo dentro do ManyChat.
- [`MANYCHAT_SETUP.md`](./MANYCHAT_SETUP.md) — referência de payloads, review do n8n, smoke test.

## Notas de design

**Paleta** vem do skill `dataviz` (`palette.md`), light mode:
- Categorical em ordem CVD-safe: blue → aqua → yellow → green → violet → red → magenta → orange.
- Status separado (nunca usado como série): good `#0ca30c`, warning `#fab219`, serious `#ec835a`, critical `#d03b3b`.
- Sequencial single-hue (blue) para o funil ordinal.
- Grade recessiva, eixos hairline, valores em `tabular-nums` na tabela e nos KPIs.

**Erro por card**: cada view roda em hook próprio. Se `vw_qual_status` falhar, o resto da dash continua funcionando. Erros mostram a mensagem crua do PostgREST + botão "Tentar novamente".
