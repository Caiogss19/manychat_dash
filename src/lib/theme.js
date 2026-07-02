// Tokens de cor que os Recharts consomem via prop (não conseguem ler classes Tailwind)
// Espelham /tailwind.config.js — mudou aqui → mudar lá também.
export const COLORS = {
  surface: '#fcfcfb',
  ink: '#0b0b0b',
  inkSecondary: '#52514e',
  inkMuted: '#898781',
  rule: '#e1e0d9',
  ruleStrong: '#c3c2b7',
  // Categorical slots — ordem CVD-safe validada
  cat: ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'],
  // Status
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
  // Sequential (ordinal seguro): step 250 → 550
  seqStart: '#86b6ef',
  seqEnd: '#1c5cab',
}

// Rótulos amigáveis para status_bot / origem etc.
export const LABELS = {
  status_bot: {
    completo: 'Completo',
    em_andamento: 'Em andamento',
    timeout: 'Timeout',
    handoff: 'Handoff',
    novo: 'Novo',
  },
  direcao: {
    in: 'Entrada (lead)',
    out: 'Saída (bot)',
    lead: 'Entrada (lead)',
    bot: 'Saída (bot)',
  },
  dimensao: {
    budget: 'Budget',
    cargo: 'Cargo',
    tamanho: 'Tamanho da empresa',
  },
}

export function labelFor(kind, value) {
  const v = value == null ? '—' : String(value)
  return LABELS[kind]?.[v] || v
}
