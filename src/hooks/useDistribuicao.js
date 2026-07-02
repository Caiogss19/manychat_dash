import { useMemo } from 'react'
import { useSupabaseQuery } from './useSupabaseQuery.js'
import { VIEWS } from '../lib/queries.js'

/**
 * @param {'budget'|'cargo'|'tamanho'} dimensao
 */
export function useDistribuicao(dimensao) {
  const { data, error, loading, refetch } = useSupabaseQuery(
    (sb) => sb.from(VIEWS.distribuicao).select('*'),
    [],
  )
  const rows = useMemo(() => {
    if (!data) return []
    return data
      .filter((r) => r.dimensao === dimensao)
      .slice()
      .sort((a, b) => Number(b.qtd) - Number(a.qtd))
  }, [data, dimensao])
  return { rows, error, loading, refetch }
}
