# ManyChat — Guia passo-a-passo do flow do disparo

Como construir, **clique por clique dentro do ManyChat**, o flow do disparo de amanhã (promo 30% → atendente) e fazer com que **todos os 5 eventos** (enviado, clique, resposta, opt_out, transfer_humano) cheguem na dash.

> **Webhook**: `https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento`
> **`disparo_id` do dia**: `promo_2026_06_30`

---

## Visão geral — o que você vai construir

Três peças no ManyChat:

1. **Template Message** aprovado pelo Meta (obrigatório no WhatsApp para iniciar conversa).
2. **Flow** com 5 External Requests + handoff para Live Chat.
3. **Trigger via Tag** (alternativa a Broadcast puro) — permite registrar `enviado` para todos antes da mensagem sair.

Arquitetura visual:
```
                  ┌─ Tag adicionada: "promo_06_30_target"
                  │
                  ▼
        ┌─────────────────────────┐
        │ ER #1: "enviado"        │  ← roda para TODOS
        └─────────────────────────┘
                  ▼
        ┌─────────────────────────┐
        │ Send Template promo     │
        └─────────────────────────┘
                  ▼
              [aguarda botão]
              /          \
   ┌─────────┘            └────────┐
   ▼                                ▼
[Quero o desconto]            [Hoje não]
   ▼                                ▼
[ER #2 clique]                [ER #2 opt_out]
   ▼                                ▼
[Send Message:                [Send Message:
 "Qual seu interesse?"]        "Tudo bem, até a próxima!"]
   ▼                                ▼
[User Input]                   [end]
   ▼
[ER #3 resposta]
   ▼
[Actions: add tag + set field + disable followup]
   ▼
[ER #4 transfer_humano]
   ▼
[Open Live Chat → atendente assume]
```

---

## Parte A — Variáveis do ManyChat que vamos usar

Cole exatamente assim nos campos de Body do External Request:

| Variável (cola dentro do JSON) | O que devolve | Onde usamos |
|---|---|---|
| `{{user_id}}` | ID único do subscriber | `subscriber_id` no payload |
| `{{first_name}}` | Primeiro nome | personalização do texto |
| `{{user_whatsapp_phone}}` | Número WhatsApp (`+55…`) | `whatsapp_phone` no payload |
| `{{last_input_text}}` | Última msg digitada pelo lead | `resposta` no payload |
| `{{flow_ns}}` | Namespace do flow atual | alternativa a hardcodar `passo` |

> O ManyChat substitui essas variáveis na hora do envio. **Sempre** mantenha aspas em volta quando o valor for string no JSON (`"subscriber_id": "{{user_id}}"`).

---

## Parte B — Criar o Template Message (uma vez só)

**Onde**: `Settings` (engrenagem no rodapé esquerdo) → `WhatsApp` → `Message Templates` → **+ New Template**

**Configure:**

| Campo | Valor |
|---|---|
| Name | `promo_30_off_06_30` |
| Category | `Marketing` |
| Language | `Portuguese (BR)` |
| Header | (deixe vazio ou adicione imagem da promo) |
| Body | `Oi {{1}}! Hoje você tem 30% off na Spark. Quer falar AGORA com um consultor para garantir?` |
| Footer | `Spark Maxx · Promoção válida só hoje` |

**Buttons** (Quick Reply, NÃO use "URL" porque a gente quer rastrear o clique no ManyChat):

- Botão 1 (texto exato): `Quero o desconto`
- Botão 2 (texto exato): `Hoje não`

**Sample values** (na hora de submeter, o Meta pede exemplo):
- `{{1}}` → `Caio`

Clique **Submit for approval**. Aprovação leva de 5min a 24h. Confira em `Settings → WhatsApp → Message Templates` que o status virou `Approved`.

---

## Parte C — Criar o Flow

### C.1 Abrir o editor

**Onde**: `Automation` (menu lateral) → `+ New Flow` → escolher canal **WhatsApp** → nomeie **`Promo 30/06 — captura e handoff`**

Você cai no canvas. À esquerda tem a coluna de blocos arrastáveis.

### C.2 Configurar o trigger por tag

No topo do canvas tem o card **Triggers**. Clique nele.

- Botão **+ New Trigger** → escolha **Subscriber tagged**
- Em **Tag**, crie/selecione: `promo_06_30_target`
- Salve

Esse trigger faz o flow rodar **automaticamente** assim que você marcar um subscriber com a tag. Vamos usar isso no broadcast (parte D).

### C.3 Bloco 1 — External Request "enviado"

No canvas, clique no botão **+ Add Step** logo após o Trigger.

Escolha **Action** → **External Request**.

Configure:

| Campo | Valor |
|---|---|
| Method | **POST** |
| URL | `https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento` |
| Auth | (deixe `None`) |
| Headers | adicione 1 linha: `Content-Type` = `application/json` |
| Body Format | **JSON** |
| Body | (veja abaixo) |
| Response Mapping | (vazio — não precisamos salvar a resposta) |

**Body do ER #1 (cole exato):**
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "enviado",
  "passo": "01_disparo_envio",
  "direcao": "bot",
  "whatsapp_phone": "{{user_whatsapp_phone}}",
  "mensagem": "Oi {{first_name}}! Promo 30% off — quer falar agora com um consultor?"
}
```

Salve o bloco. Renomeie para **`ER enviado`** (clica nos 3 pontinhos do bloco → Rename).

### C.4 Bloco 2 — Send Template

**+ Add Step** → **Send Message** → no editor de mensagem, clique no ícone de relâmpago (⚡) → **Send Template** → selecione `promo_30_off_06_30` (precisa estar aprovado).

No campo de substituição da variável `{{1}}` do template, escolha `{{first_name}}`.

Salve.

### C.5 Bloco 3 — Listen (aguarda clique nos botões)

**+ Add Step** → **Smart Delay** → **Wait for user reply** com timeout de **24h** (limite do WhatsApp).

> Alternativa mais avançada: pular esse Smart Delay e usar **2 triggers paralelos** no canvas — um para cada botão. Faz o que a gente quer e dá mais clareza visual. Veja C.5-alt abaixo.

### C.5-alt — Branches por botão (recomendado)

ManyChat faz o roteamento automático de Quick Reply via "Reply on Button Click". Configure:

1. No bloco **Send Template** do C.4, na aba **On Reply**, defina:
   - Se o usuário clicar **"Quero o desconto"** → vai para o bloco **`Branch QUERO`** (vamos criar abaixo).
   - Se clicar **"Hoje não"** → vai para o bloco **`Branch OPT`**.
2. Crie os dois blocos com **+ Add Step** ao lado e renomeie como acima.

### C.6 Branch "Quero o desconto"

Dentro do bloco `Branch QUERO`, adicione em sequência:

#### C.6.1 — ER #2 clique
**+ Add Step** → **Action** → **External Request**:

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

Renomeie para **`ER clique`**.

#### C.6.2 — Mensagem de qualificação
**+ Add Step** → **Send Message** → modo texto livre (não template — já está dentro do window de 24h porque o lead acabou de clicar):

> "Boa, {{first_name}}! Em uma frase: qual seu interesse — quer entender preço, agendar reunião ou tirar dúvida?"

#### C.6.3 — User Input (Quick Question)
**+ Add Step** → **User Input** (ou **Quick Question** se sua UI assim chama):
- **Question type**: `Free Text`
- **Save Response to**: crie um custom field chamado `promo_interesse` (tipo text).
- **Skip validation**: ON.

#### C.6.4 — ER #3 resposta
**+ Add Step** → **External Request**:

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

Renomeie para **`ER resposta`**.

#### C.6.5 — Actions pré-handoff
**+ Add Step** → **Action** (action sem chamar webhook, é diferente do External Request):

Adicione 4 ações nesse bloco:

1. **Add Tag** → `promo_06_30_handoff`
2. **Set Custom Field** → `status_atendimento` = `aguardando_humano`
3. **Disable Followup** → ON (impede que outros flows interrompam)
4. **Pause Automation** → ON (opcional — bot fica em silêncio até o atendente liberar)

#### C.6.6 — ER #4 transfer_humano
**+ Add Step** → **External Request**:

```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "transfer_humano",
  "passo": "04_handoff_atendente",
  "direcao": "bot"
}
```

Renomeie para **`ER transfer`**.

#### C.6.7 — Open Live Chat
**+ Add Step** → **Action** → **Open Live Chat**.

Em **Assigned to**, escolha o usuário/time atendente plantonista.

(opcional) Adicione no mesmo bloco uma **Notificação** → Slack ou e-mail → `"Lead Caio aceitou promo! Inbox: {{live_chat_url}}"` se você quiser alerta em real time.

#### C.6.8 — Send Message final do bot
**+ Add Step** → **Send Message**:

> "Beleza! Já chamei um consultor aqui, te respondem em até 5 minutos."

### C.7 Branch "Hoje não"

Dentro do bloco `Branch OPT`:

#### C.7.1 — ER opt_out
**+ Add Step** → **External Request**:

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

#### C.7.2 — Tag de opt-out
**+ Add Step** → **Action** → **Add Tag**: `promo_06_30_recusou`.

(Use essa tag depois para excluir esses leads do próximo disparo.)

#### C.7.3 — Mensagem amigável
**+ Add Step** → **Send Message**:

> "Sem problema, {{first_name}}. Quando quiser saber das novidades, é só me mandar **promo**. Bom dia! 👋"

---

## Parte D — Disparar para o segmento

Aqui você tem duas opções. Recomendo a **opção 2** porque já registra `enviado` antes do template sair.

### Opção 1 (simples mas perde tracking de `enviado`)

`Broadcasting` → **+ New Broadcast** → escolha o template `promo_30_off_06_30` → defina audiência → agende. O flow só dispara quando o lead clicar.

### Opção 2 — Bulk Tag (recomendada) ✅

1. **Construa o segmento** em `Audience` → **+ New Segment**:
   - Filtros: por exemplo, **WhatsApp subscriber** + **última interação nos últimos 90 dias** + **NÃO tem tag `optout_geral`** + **NÃO tem tag `cliente_atual`**
   - Salve com nome `audiencia_promo_06_30`
2. **Aplique a tag para todo o segmento de uma vez**:
   - Abra o segmento → no canto superior direito **Bulk Action** → **Add Tag** → escolha `promo_06_30_target`.
   - ManyChat vai aplicar a tag em todos os subscribers do segmento (pode levar minutos).
3. **Pronto**: o flow `Promo 30/06 — captura e handoff` dispara automaticamente para cada um (foi configurado em C.2 para escutar essa tag). Como o flow começa com `ER enviado` → `Send Template`, todos os eventos `enviado` chegam na dash + o template é enviado em sequência.

> **Cuidado**: na opção 2, se já existe alguém com a tag `promo_06_30_target`, ele NÃO dispara de novo (ManyChat de-duplica). Se quiser repetir, remova a tag antes.

---

## Parte E — Smoke test antes do disparo real

Faça isso **agora**, com você mesmo como cobaia, antes de aplicar a tag em massa:

1. No ManyChat, vá em `Audience` → busque seu próprio nome → abra seu subscriber.
2. Clique em **Add Tag** → `promo_06_30_target`.
3. Aguarde 30s e verifique:
   - Você recebeu a mensagem do template no seu WhatsApp.
   - A dash em **Eventos recentes** mostra um `enviado` com `passo=01_disparo_envio`.
4. Clique no botão **"Quero o desconto"** no seu WhatsApp.
5. Verifique:
   - Recebeu a pergunta de qualificação.
   - Dash mostra `clique` com `passo=02_cta_quero_desconto`, `botão="Quero o desconto"`.
6. Responda algo (ex: `"quero saber preço"`).
7. Verifique:
   - Dash mostra `resposta` com `passo=03_qualifica`, `resposta="quero saber preço"`.
   - Bot mandou a mensagem final ("já chamei um consultor…").
   - Dash mostra `transfer_humano` com `passo=04_handoff_atendente`.
8. Confira na seção **Contatos** da dash que seu nome aparece com flags `enviado`, `clicou`, `respondeu`, `transferido_humano` todas marcadas.

Se algum evento não chegou, abra o n8n → **Executions** → procure o ID do seu subscriber → veja em qual nó falhou. Os 6 nós devem todos mostrar status **success**.

---

## Parte F — No dia D

Checklist sequencial:

- [ ] Template `promo_30_off_06_30` **aprovado** pelo Meta (status verde)
- [ ] Flow `Promo 30/06 — captura e handoff` **ligado** (toggle no topo direito do editor)
- [ ] Atendente plantonista logado no ManyChat Inbox
- [ ] Linha do `disparo_id` em `disparos` (já criada automaticamente — só confere na dash que apareceu no selector)
- [ ] Smoke test (parte E) passou
- [ ] Segmento `audiencia_promo_06_30` revisado (excluiu `optout_geral`, `cliente_atual`)
- [ ] Dash aberta em outra aba, filtro = `disparo_id: promo_2026_06_30`, janela = `24h`, auto-refresh **on**
- [ ] Aplicar tag `promo_06_30_target` no segmento (Bulk Action)
- [ ] Acompanhar pelos primeiros 30min — taxa de opt-out deve ficar abaixo de 3%

---

## Parte G — Cheat sheet para colar nos External Requests

Copie e cole direto nos blocos do ManyChat. Tudo é POST em `https://growthsparkmaxx.app.n8n.cloud/webhook/disparo-evento` com header `Content-Type: application/json`.

### ER #1 — enviado
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "enviado",
  "passo": "01_disparo_envio",
  "direcao": "bot",
  "whatsapp_phone": "{{user_whatsapp_phone}}",
  "mensagem": "Oi {{first_name}}! Promo 30% off — quer falar agora com um consultor?"
}
```

### ER #2 — clique
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

### ER #3 — resposta
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

### ER #4 — transfer_humano
```json
{
  "disparo_id": "promo_2026_06_30",
  "subscriber_id": "{{user_id}}",
  "evento": "transfer_humano",
  "passo": "04_handoff_atendente",
  "direcao": "bot"
}
```

### ER #5 — opt_out
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

---

## Parte H — Erros comuns e como debugar

| Sintoma | Provável causa | Solução |
|---|---|---|
| Dash não mostra nada novo | Flow não está ligado | Toggle no topo direito do editor do flow |
| `disparo_id` vem como `sem_id` | Você esqueceu `disparo_id` no Body do ER | Adiciona o campo no JSON e republica o flow |
| `passo` aparece vazio na dash | Body sem `passo` | Adicionar `"passo": "XX_nome"` no JSON |
| `direcao` vazia | Body sem `direcao` | `"direcao": "bot"` ou `"lead"` |
| Evento chega como `evento=evento` | Body sem `evento` ou nome diferente | Use exatamente `enviado`, `clique`, `resposta`, `opt_out`, `transfer_humano` |
| Template não envia | Não foi aprovado ou nome diferente | Verifique status no Meta Business Manager |
| Lead recebe template mas não dispara branch | Botão tem texto diferente do template | Texto do botão DEVE bater 100% (case sensitive) |
| Dash mostra contagem mas drawer da conversa vazio | `mensagem` / `resposta` vazios no ER | Sempre preenche `mensagem` no ER `enviado` e `resposta` no ER `resposta` |
| Atendente não vê a conversa | Live Chat não está aberto ou bot ainda ativo | `Disable Followup` + `Pause Automation` antes do `Open Live Chat` |

---

## Apêndice — Custom fields que a dash mostra automaticamente

Tudo que você setar via **Action → Set Custom Field** vai aparecer na seção **Qualificação** da dash (até 8 colunas mais frequentes). Sugestões para o flow de amanhã:

| Field name | Quando setar | Valor |
|---|---|---|
| `promo_interesse` | Após a resposta do lead | `{{last_input_text}}` |
| `status_atendimento` | Antes do handoff | `aguardando_humano` |
| `promo_origem` | No ER #1 (via Action: Set Custom Field) | `disparo_30_06` |
| `consultor_designado` | Quando o atendente aceitar a conversa | nome do atendente (manual ou via Slack) |

Os custom fields são lidos pela dash via `getInfo` do ManyChat — populam automaticamente sem nenhum trabalho do lado da dash.
