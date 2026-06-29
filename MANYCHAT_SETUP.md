# ManyChat → n8n → Supabase · Setup Playbook

Guia operacional para que **todo evento relevante do ManyChat (WhatsApp) caia certinho na dash**, sem `sem_id`, sem `evento=evento`, sem `passo=""`.

> Webhook do n8n (já ativo): `POST https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento`
> Workflow: **Coletor de Disparo ManyChat → Supabase** (`4javV42sxS8WGNEm`)

---

## 1. Como o n8n recebe os eventos

O nó `Normalizar evento` aceita estes nomes de campo (apelidos válidos do **mais comum** ao alternativo):

| Campo na dash | Nomes aceitos no JSON enviado pelo ManyChat |
|---|---|
| `disparo_id` | `disparo_id`, `campanha` |
| `subscriber_id` | `subscriber_id`, `id` |
| `phone` | `phone`, `telefone`, `whatsapp_phone` |
| `evento` | `evento`, `event` — valores: `enviado` · `clique` · `resposta` · `opt_out` · `transfer_humano` |
| `passo` | `passo`, `step` |
| `botao` | `botao`, `button`, `payload` |
| `resposta_texto` | `resposta`, `resposta_texto`, `last_input_text` |
| `direcao` | `direcao` — valores: `bot` ou `lead` |
| `mensagem` | `mensagem`, `resposta`, `last_input_text` |

**Regra de ouro:** sempre que cair em `'sem_id'` ou `'evento'` significa que **o External Request não enviou aquele campo** — vale revisar.

---

## 2. External Request padrão no ManyChat

Em qualquer **flow** do ManyChat, adicione um bloco **External Request** sempre que quiser registrar um evento. Configuração:

- **Method**: `POST`
- **URL**: `https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):

```json
{
  "disparo_id": "<id-curto-do-disparo>",
  "subscriber_id": "{{user_id}}",
  "evento": "<enviado|clique|resposta|opt_out|transfer_humano>",
  "passo": "<NN_nome_da_etapa>",
  "direcao": "<bot|lead>",
  "whatsapp_phone": "{{user_whatsapp_phone}}",
  "mensagem": "",
  "botao": "",
  "resposta": ""
}
```

Preencha **só os campos relevantes pro evento** (ver §4). O `subscriber_id`, `evento`, `passo`, `direcao` e `disparo_id` são **obrigatórios em todo request**.

### Convenções

- **`disparo_id`**: slug curto e estável da campanha. Ex: `promo_2026_06_30`, `inbound_whatsapp`, `lancamento_jun26`.
- **`passo`**: prefixo numérico para ordenar no funil. Ex: `01_disparo_envio`, `02_oferta`, `03_qualifica`, `04_handoff`. Em ManyChat, dá pra usar `{{flow_ns}}` direto se o nome do flow já for descritivo.
- **`direcao`**:
  - `bot` quando o evento foi gerado pelo bot (envio de mensagem, transferência para humano).
  - `lead` quando o evento foi gerado pelo lead (clique, resposta, opt-out).

---

## 3. Tabela de External Request por tipo de evento

### 3.1 Mensagem enviada pelo bot
Coloque o External Request **logo após cada `Send Message`** que você quiser medir.

```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "enviado",
  "passo": "01_disparo_envio",
  "direcao": "bot",
  "whatsapp_phone": "{{user_whatsapp_phone}}",
  "mensagem": "Promoção exclusiva para você, {{first_name}}..."
}
```

### 3.2 Clique em botão
Coloque o External Request **dentro do branch que disparou o clique**.

```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "clique",
  "passo": "02_cta_quero_o_desconto",
  "direcao": "lead",
  "botao": "Quero o desconto"
}
```

### 3.3 Resposta em texto livre
Coloque após um bloco **User Input** que captura texto.

```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "resposta",
  "passo": "03_qualifica",
  "direcao": "lead",
  "resposta": "{{last_input_text}}"
}
```

### 3.4 Opt-out / "não tenho interesse"
Quando o usuário clica num CTA negativo ou no flow de descadastro.

```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "opt_out",
  "passo": "saida",
  "direcao": "lead",
  "botao": "Não tenho interesse"
}
```

### 3.5 Transferência para atendente humano
Disparado **antes** de tirar o bot de cena (set Field, disable followup, etc).

```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "transfer_humano",
  "passo": "04_handoff_atendente",
  "direcao": "bot"
}
```

---

## 4. Disparo de amanhã — Promo → Atendente

Cenário: **disparo de promoção em massa** com botão que leva direto para um atendente humano.

### 4.1 Estrutura do flow (ManyChat)

```
[Trigger: Broadcast — segmento alvo]
        │
        ▼
┌──────────────────────────────────────────────┐
│ Send Message: "Oi {{first_name}}, hoje você  │
│ tem 30% off em X. Quer falar com um          │
│ consultor agora?"                            │
│ Buttons: [Quero o desconto] [Hoje não]       │
└──────────────────────────────────────────────┘
        │
        ▼
   [External Request #1 — evento=enviado]
        │
   ┌────┴────┐
   ▼         ▼
[Quero o]  [Hoje não]
   │         │
   ▼         ▼
[ER #2-A]  [ER #2-B]
clique     opt_out
   │
   ▼
┌──────────────────────────────────────────────┐
│ Send Message: "Boa! Pode me dizer rápido     │
│ qual seu interesse? Já passo pro consultor." │
│ User Input: free text                        │
└──────────────────────────────────────────────┘
   │
   ▼
[ER #3 — resposta]
   │
   ▼
┌──────────────────────────────────────────────┐
│ Actions:                                     │
│  • Set Field: status_atendimento = "aguard." │
│  • Add Tag: "promo_06_30_handoff"            │
│  • Disable Followup                          │
│  • Notify Team (Slack/email)                 │
└──────────────────────────────────────────────┘
   │
   ▼
[ER #4 — transfer_humano]
   │
   ▼
[Pause bot — aguarda atendente]
```

### 4.2 Payloads exatos (copia e cola)

**ER #1 — envio do disparo**
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "enviado",
  "passo": "01_disparo_envio",
  "direcao": "bot",
  "whatsapp_phone": "{{user_whatsapp_phone}}",
  "mensagem": "Oi {{first_name}}, hoje você tem 30% off em X. Quer falar com um consultor agora?"
}
```

**ER #2-A — clique em "Quero o desconto"**
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "clique",
  "passo": "02_cta_quero_desconto",
  "direcao": "lead",
  "botao": "Quero o desconto"
}
```

**ER #2-B — clique em "Hoje não"**
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "opt_out",
  "passo": "02_cta_hoje_nao",
  "direcao": "lead",
  "botao": "Hoje não"
}
```

**ER #3 — resposta de qualificação**
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "resposta",
  "passo": "03_qualifica",
  "direcao": "lead",
  "resposta": "{{last_input_text}}"
}
```

**ER #4 — handoff para humano**
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "transfer_humano",
  "passo": "04_handoff_atendente",
  "direcao": "bot"
}
```

### 4.3 Tag e custom field do atendente

Antes do ER #4, **na própria action do ManyChat**:

- **Add Tag**: `promo_06_30_handoff` — aparece em "Top tags" e ajuda a filtrar quem precisa de atendimento.
- **Set Custom Field**: `status_atendimento = aguardando_humano` — aparece na seção **Qualificação** da dash.
- **Disable Followup**: para o bot não interromper a conversa.

O atendente abre `live_chat_url` direto no ManyChat para responder (a dash já mostra esse link nos snapshots do evento).

### 4.4 Antes do disparo — checklist

- [ ] Criar a linha em `disparos` (Supabase):
  ```sql
  INSERT INTO disparos (disparo_id, nome, canal, criado_em)
  VALUES ('promo_2026_06_30', 'Promo 30% — 30/06', 'whatsapp', now())
  ON CONFLICT (disparo_id) DO NOTHING;
  ```
- [ ] Testar com 1 contato real (você mesmo) e conferir os 4 eventos na dash em **Eventos recentes**.
- [ ] Ter um atendente plantonista com inbox do ManyChat aberto.
- [ ] Filtro de segmento: excluir quem já tem tag `optout_geral` ou `cliente_atual`.
- [ ] Janela de envio: usar o **heatmap** da dash (seção 03) — picos costumam ser 9h–11h e 19h–21h em dias úteis.

### 4.5 Métricas para olhar durante e depois

Na dash, com filtro `disparo: promo_2026_06_30` e janela `24h`:

| Métrica | Onde ver | Meta razoável (WhatsApp + promo + lista quente) |
|---|---|---|
| **Enviados** | KPI passo 1 | 100% da lista (qualquer queda = block / opt-out anterior) |
| **% Clique** | KPI passo 2 | 15–35% |
| **% Resposta** | KPI passo 3 | 8–20% |
| **% Opt-out** | KPI saída | < 3% (acima disso, mensagem precisa revisar) |
| **% Transferidos p/ humano** | KPI 4 (novo) | 5–15% — é o sinal de conversão real |
| **Tempo médio até resposta** | KPI | < 5min indica intenção alta |

---

## 5. Review do n8n — o que está bom e o que melhorar

### ✅ Está bom

- Webhook com **respondToWebhook** → não trava o ManyChat se o Postgres demorar.
- Normalização aceita múltiplos apelidos de campo — boa tolerância a ruído.
- Chama `getInfo` na ManyChat **a cada evento** → snapshot fresco de tags e custom fields. Custa mais (1 request extra) mas vale para a qualificação.
- Upsert com `ON CONFLICT` mantém o rollup consistente.
- `iniciou_por` usa `COALESCE` → só grava o primeiro valor, não sobrescreve.

### ⚠️ Pontos de atenção

**1. `disparo_id` defaultando para `sem_id` esconde erro de configuração**
Hoje:
```js
disparo_id: b.disparo_id || b.campanha || 'sem_id',
```
Melhor:
```js
disparo_id: b.disparo_id || b.campanha || null,
```
E adicionar um nó **IF** após o `Normalizar evento`:
- Se `disparo_id` for null/vazio → vai pra um nó **"Alerta config"** (Slack/email) avisando que tem External Request sem campanha.
- Senão segue o fluxo normal.

**2. Auto-criar `disparos` para qualquer `disparo_id` novo**
Hoje você precisa inserir manualmente em `disparos` (senão fica órfão na dash). Adicione um nó Postgres **antes do `Inserir evento`**:
```sql
INSERT INTO disparos (disparo_id, nome, canal, criado_em)
VALUES ($1, $1, 'whatsapp', now())
ON CONFLICT (disparo_id) DO NOTHING;
```
Assim qualquer campanha nova aparece no selector da dash sem intervenção.

**3. Capturar `live_chat_url` no evento**
O snapshot do MC já traz `live_chat_url`. Útil pro atendente abrir a conversa direto do dash. Atualize o `Inserir evento` para incluir uma coluna `live_chat_url`:
```sql
ALTER TABLE disparo_eventos ADD COLUMN IF NOT EXISTS live_chat_url text;
ALTER TABLE disparo_contatos ADD COLUMN IF NOT EXISTS live_chat_url text;
```
No `Montar registros`, exponha `live_chat_url: snap.live_chat_url || ''` e adicione ao INSERT.

**4. Reconhecer `transfer_humano` (já suportado, só documentar)**
O código atual já passa pelo `String(b.evento).toLowerCase()` — `transfer_humano` chega normalmente como string e cai no log. Mas o boolean `transferido_humano` não existe no rollup de `disparo_contatos`. Para a dash, calculamos via tabela de eventos (já implementado). Se quiser que apareça como flag persistente:
```sql
ALTER TABLE disparo_contatos ADD COLUMN IF NOT EXISTS transferido_humano boolean DEFAULT false;
```
E adicionar no Upsert:
```sql
transferido_humano = disparo_contatos.transferido_humano OR ($14 = 'transfer_humano'),
```

**5. RLS desativado em `disparos`, `disparo_eventos`, `disparo_contatos`**
Crítico de segurança levantado pelo Supabase advisor. Como a dash usa `anon key` no front, sugiro:
```sql
ALTER TABLE disparos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disparo_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disparo_contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON disparos FOR SELECT TO anon USING (true);
CREATE POLICY "anon read" ON disparo_eventos FOR SELECT TO anon USING (true);
CREATE POLICY "anon read" ON disparo_contatos FOR SELECT TO anon USING (true);
```
Escrita continua só pelo **service_role** (que é o que o n8n usa internamente).

**6. Latência do `getInfo` em disparos grandes**
Cada evento dispara 1 request à ManyChat. Num broadcast de 5.000 leads, isso pode estourar rate limit. Duas opções:
- **Throttle no Webhook trigger**: setar concorrência máx no n8n.
- **Skip getInfo no evento `enviado`** (o snapshot só importa quando o lead reage). Adicionar um IF antes do `MC: getInfo`: `evento != 'enviado'`.

---

## 6. Smoke test antes do disparo

Faça este teste **manualmente** com seu próprio número:

```bash
# Simula um envio
curl -X POST https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento \
  -H 'Content-Type: application/json' \
  -d '{
    "disparo_id": "promo_2026_06_30",
    "subscriber_id": "SEU_SUBSCRIBER_ID",
    "evento": "enviado",
    "passo": "01_disparo_envio",
    "direcao": "bot",
    "mensagem": "teste"
  }'

# Simula um clique
curl -X POST https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento \
  -H 'Content-Type: application/json' \
  -d '{
    "disparo_id": "promo_2026_06_30",
    "subscriber_id": "SEU_SUBSCRIBER_ID",
    "evento": "clique",
    "passo": "02_cta_quero_desconto",
    "direcao": "lead",
    "botao": "Quero o desconto"
  }'

# Simula transfer
curl -X POST https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento \
  -H 'Content-Type: application/json' \
  -d '{
    "disparo_id": "promo_2026_06_30",
    "subscriber_id": "SEU_SUBSCRIBER_ID",
    "evento": "transfer_humano",
    "passo": "04_handoff_atendente",
    "direcao": "bot"
  }'
```

Abra a dash em `?disparo=promo_2026_06_30` (ou selecione no dropdown) e confirme que:
- KPI Enviados = 1
- KPI Clicaram = 1
- KPI Transferidos = 1
- Funil por etapa mostra 4 passos (`01_disparo_envio` → `02_cta_quero_desconto` → `04_handoff_atendente`)
- O drawer da conversa abre a thread completa
