import { useSupabaseQuery } from './useSupabaseQuery.js'
import { VIEWS } from '../lib/queries.js'

export function useKpis() {
  const { data, error, loading, refetch } = useSupabaseQuery(
    (sb) => sb.from(VIEWS.kpis).select('*').limit(1).maybeSingle(),
    [],
  )
  return { kpis: data, error, loading, refetch }
}
