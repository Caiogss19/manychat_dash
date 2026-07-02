import { useSupabaseQuery } from './useSupabaseQuery.js'
import { VIEWS } from '../lib/queries.js'

export function useMsgsDirecao() {
  const { data, error, loading, refetch } = useSupabaseQuery(
    (sb) => sb.from(VIEWS.msgsDirecao).select('*'),
    [],
  )
  return { rows: data || [], error, loading, refetch }
}
