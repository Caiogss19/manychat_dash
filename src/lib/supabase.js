import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  // Erro imediato e visível — não silenciar
  throw new Error(
    'Faltam variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY no .env — copie .env.example para .env e preencha.',
  )
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: { headers: { 'X-Client-Info': 'manychat-qual-dash' } },
})
