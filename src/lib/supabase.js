import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const missingEnv = !url || !key
export const envInfo = { url, hasKey: Boolean(key) }

// Não faz throw no import — o App decide o que renderizar quando missingEnv=true.
export const supabase = missingEnv
  ? null
  : createClient(url, key, {
      auth: { persistSession: false },
      global: { headers: { 'X-Client-Info': 'manychat-qual-dash' } },
    })
