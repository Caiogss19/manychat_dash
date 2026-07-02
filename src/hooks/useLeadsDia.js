import { useMemo } from 'react'
import { useSupabaseQuery } from './useSupabaseQuery.js'
import { VIEWS } from '../lib/queries.js'
import { daysAgoISO } from '../lib/format.js'

/**
 * `days` — janela client-side aplicada sobre coluna `dia` (date).
 * `null` = tudo.
 */
export function useLeadsDia(days) {
  const { data, error, loading, refetch } = useSupabaseQuery(
    (sb) => sb.from(VIEWS.leadsDia).select('*').order('dia', { ascending: true }),
    [],
  )
  const rows = useMemo(() => {
    if (!data) return []
    if (days == null) return data
    const cutoff = daysAgoISO(days)
    return data.filter((r) => String(r.dia) >= cutoff)
  }, [data, days])
  return { rows, error, loading, refetch }
}
