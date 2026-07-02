import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * Hook genérico: cada view/tabela isola seu loading/erro.
 * @param {(sb: typeof supabase) => Promise<{data,error}>} builder  Função que monta a query
 * @param {any[]} deps                                              Deps para refetch
 */
export function useSupabaseQuery(builder, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const alive = useRef(true)

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    const { data, error } = await builder(supabase)
    if (!alive.current) return
    if (error) setState({ data: null, error, loading: false })
    else setState({ data: data ?? [], error: null, loading: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    alive.current = true
    run()
    return () => { alive.current = false }
  }, [run])

  return { ...state, refetch: run }
}
