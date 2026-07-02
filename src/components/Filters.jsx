import { RANGE_PRESETS, STATUS_BOT_OPTIONS } from '../lib/queries.js'

export function RangeFilter({ value, onChange, className = '' }) {
  return (
    <Segmented
      className={className}
      value={value}
      onChange={onChange}
      options={RANGE_PRESETS.map((p) => ({ value: p.value, label: p.label.replace('Últimos ', '') }))}
    />
  )
}

export function StatusFilter({ value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-ink-secondary">
      <span>Status:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs bg-surface border border-rule-strong rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cat-1/40"
      >
        {STATUS_BOT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

export function SqlFilter({ value, onChange }) {
  // value: null | true | false
  const opts = [
    { v: null, l: 'Todos' },
    { v: true, l: 'Só SQL' },
    { v: false, l: 'Não-SQL' },
  ]
  return (
    <Segmented
      value={String(value)}
      onChange={(v) => onChange(v === 'null' ? null : v === 'true')}
      options={opts.map((o) => ({ value: String(o.v), label: o.l }))}
    />
  )
}

export function SearchInput({ value, onChange, placeholder = 'nome, telefone, empresa…' }) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 max-w-full text-sm bg-surface border border-rule-strong rounded pl-8 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cat-1/40"
      />
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs">⌕</span>
    </div>
  )
}

export function Segmented({ value, onChange, options, className = '' }) {
  return (
    <div className={`inline-flex bg-plane border border-rule-strong rounded p-0.5 gap-0.5 ${className}`}>
      {options.map((o) => {
        const active = String(o.value) === String(value)
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={
              active
                ? 'text-xs px-2.5 py-1 rounded bg-ink text-surface font-medium'
                : 'text-xs px-2.5 py-1 rounded text-ink-secondary hover:bg-surface'
            }
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
