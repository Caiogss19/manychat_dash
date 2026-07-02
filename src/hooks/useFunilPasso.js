import { useSupabaseQuery } from './useSupabaseQuery.js'
import { VIEWS } from '../lib/queries.js'

export function useFunilPasso() {
  const { data, error, loading, refetch } = useSupabaseQuery(
    (sb) => sb.from(VIEWS.funilPasso).select('*'),
    [],
  )
  // Ordena pelo prefixo numérico do passo se existir (ex: "01_...", "02_...")
  const rows = (data || []).slice().sort((a, b) => String(a.passo).localeCompare(String(b.passo)))
  return { rows, error, loading, refetch }
}
