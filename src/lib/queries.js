// Nomes centralizados das views/tabelas — trocou aqui, trocou tudo.
export const VIEWS = {
  kpis: 'vw_qual_kpis',
  funilPasso: 'vw_qual_funil_passo',
  status: 'vw_qual_status',
  leadsDia: 'vw_qual_leads_dia',
  distribuicao: 'vw_qual_distribuicao',
  origem: 'vw_qual_origem',
  msgsDirecao: 'vw_qual_msgs_direcao',
  msgsDia: 'vw_qual_msgs_dia',
}

export const TABLES = {
  leadsManychat: 'leads_manychat',
  disparoEventos: 'disparo_eventos',
  chatwootContacts: 'chatwoot_contacts',
  chatwootConversations: 'chatwoot_conversations',
  chatwootMessages: 'chatwoot_messages',
}

// Dimensões suportadas por vw_qual_distribuicao
export const DIMENSOES = [
  { value: 'budget', label: 'Budget' },
  { value: 'cargo', label: 'Cargo' },
  { value: 'tamanho', label: 'Tamanho da empresa' },
]

// Status conhecidos de status_bot (filtro select)
export const STATUS_BOT_OPTIONS = [
  { value: '__all__', label: 'Todos os status' },
  { value: 'completo', label: 'Completo' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'handoff', label: 'Handoff' },
]

// Presets de range de datas — janela client-side sobre `dia`/`criado_em`
export const RANGE_PRESETS = [
  { value: '7d', label: 'Últimos 7 dias', days: 7 },
  { value: '30d', label: 'Últimos 30 dias', days: 30 },
  { value: '90d', label: 'Últimos 90 dias', days: 90 },
  { value: 'all', label: 'Tudo', days: null },
]
