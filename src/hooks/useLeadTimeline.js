import { useSupabaseQuery } from './useSupabaseQuery.js'
import { TABLES } from '../lib/queries.js'

/**
 * Timeline de mensagens do lead — de `disparo_eventos` por subscriber_id.
 * Se subscriberId estiver vazio, não roda.
 */
export function useLeadTimeline(subscriberId) {
  const { data, error, loading, refetch } = useSupabaseQuery(
    (sb) => {
      if (!subscriberId) return Promise.resolve({ data: [], error: null })
      return sb
        .from(TABLES.disparoEventos)
        .select('id, criado_em, evento, passo, direcao, botao, resposta_texto, mensagem')
        .eq('subscriber_id', subscriberId)
        .order('criado_em', { ascending: true })
    },
    [subscriberId],
  )
  return { rows: data || [], error, loading, refetch, enabled: !!subscriberId }
}
