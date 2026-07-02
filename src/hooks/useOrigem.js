import { useSupabaseQuery } from './useSupabaseQuery.js'
import { VIEWS } from '../lib/queries.js'

export function useOrigem() {
  const { data, error, loading, refetch } = useSupabaseQuery(
    (sb) => sb.from(VIEWS.origem).select('*'),
    [],
  )
  const rows = (data || []).slice().sort((a, b) => Number(b.qtd) - Number(a.qtd))
  return { rows, error, loading, refetch }
}
