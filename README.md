# ManyChat — Dash de Disparos & 1ª Mensagem

Dashboard estático (single-file) para analisar a performance dos **disparos no WhatsApp via ManyChat** e das **primeiras mensagens inbound** dos leads.

Dados consultados ao vivo no Supabase (REST, anon key), em três tabelas:

| Tabela | Conteúdo |
|---|---|
| `disparos` | metadados do disparo (nome, canal, criado_em) |
| `disparo_contatos` | rollup por contato (enviado / clicou / respondeu / opt-out, tags, custom fields) |
| `disparo_eventos` | log granular (1 linha por evento — envio, clique, resposta, opt-out, mensagem) |

## O que tem na dash

**01 · Funil de conversão** — KPIs Enviados → Clicaram → Responderam → Opt-out, taxa entre etapas, **tempo médio até clique e até resposta**, taxa de engajamento total.

**02 · Funil por etapa da automação** — quantos contatos únicos chegaram em cada passo do flow (campo `passo`, alimentado por `{{flow_ns}}` no ManyChat). Mostra queda vs. anterior e tempo médio até a próxima etapa.

**03 · Engajamento & horário** — eventos por tipo, eventos ao longo do tempo, **heatmap dia-da-semana × hora** para escolher janela de disparo.

**04 · Conteúdo** — **top botões clicados** e **top respostas em texto livre** (palavras mais frequentes).

**05 · Perfil dos contatos** — top tags ManyChat e distribuição de status do subscriber.

**06 · Contatos** — tabela com busca livre, filtro (responderam / clicaram / opt-out / só enviado), **export CSV** e **deep-link WhatsApp** (`wa.me`).

**07 · Qualificação** — custom fields preenchidos no flow (budget, position, company_size, etc.).

**08 · Eventos recentes** — log cronológico das últimas 250 interações.

**Drawer de conversa** — clique em qualquer linha de contato/qualificação para abrir a thread completa (estilo WhatsApp), com botões para abrir o número no WhatsApp e copiar o telefone.

## Filtros globais

- **Aba**: `Disparo (bot iniciou)` · `1ª mensagem (lead iniciou)` · `Todos` — usa `iniciou_por` em `disparo_contatos`, com fallback pelo primeiro evento do contato (`direcao`).
- **Disparo específico** — selector populado a partir de `disparos`.
- **Janela**: `24h` · `7d` · `30d` · `tudo`.
- **Auto-refresh** a cada 60 s.

## Rodando localmente

É um único arquivo HTML — basta abrir:

```bash
open index.html
# ou
python3 -m http.server 8000  # depois http://localhost:8000
```

## Deploy estático

Funciona em qualquer host de arquivos estáticos: Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3+CloudFront.

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir .
```

## Configuração

URL e anon key do Supabase ficam no topo do `<script>` em `index.html`:

```js
const SUPABASE_URL = 'https://<project>.supabase.co';
const SUPABASE_KEY = '<anon-key>';
```

> ⚠️ Como o front faz chamadas REST diretas, as tabelas precisam estar legíveis para o role `anon`. Se você habilitar RLS, lembre de adicionar `policy ... for select to anon using (true)` (ou restringir como achar melhor).

## Notas sobre o esquema esperado

A dash espera que cada evento do ManyChat seja gravado em `disparo_eventos` com pelo menos:

- `criado_em` (timestamptz)
- `disparo_id` (text) — o mesmo da tabela `disparos`
- `subscriber_id` (text)
- `evento` (text) — `enviado` · `clique` · `resposta` · `opt_out` · `mensagem`
- `passo` (text) — convém usar `{{flow_ns}}` do ManyChat
- `direcao` (text) — `bot` ou `lead`
- `botao`, `resposta_texto`, `mensagem` (textos)
- `manychat_snapshot` (jsonb) — opcional, snapshot do subscriber

E que `disparo_contatos` carregue o rollup do contato (flags `enviado`/`clicou`/`respondeu`/`optout`, último evento, tags e custom fields).
