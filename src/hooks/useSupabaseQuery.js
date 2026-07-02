import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, missingEnv } from '../lib/supabase.js'

/**
 * Hook genérico: cada view/tabela isola seu loading/erro.
 * Se as env vars faltam, seta erro claro em vez de quebrar.
 */
export function useSupabaseQuery(builder, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const alive = useRef(true)

  const run = useCallback(async () => {
    if (missingEnv || !supabase) {
      setState({
        data: null,
        error: new Error('Env VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não estão configuradas.'),
        loading: false,
      })
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { data, error } = await builder(supabase)
      if (!alive.current) return
      if (error) setState({ data: null, error, loading: false })
      else setState({ data: data ?? [], error: null, loading: false })
    } catch (err) {
      if (!alive.current) return
      setState({ data: null, error: err, loading: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    alive.current = true
    run()
    return () => { alive.current = false }
  }, [run])

  return { ...state, refetch: run }
}
