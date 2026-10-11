import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.PUBLIC_SUPABASE_URL
const publishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY

/**
 * `false` cuando faltan las variables de entorno: el sitio público sigue
 * operativo y el panel muestra un aviso en lugar de fallar en runtime.
 * La publishable key es pública por diseño; la protección real son las policies RLS.
 */
export const isSupabaseConfigured = Boolean(url && publishableKey)

// createClient exige strings no vacíos. Con placeholder nunca se hace network
// si no está configurado (solo se usa para las llamadas del panel, que avisan
// antes de intentar conectarse).
export const supabase = createClient(url ?? 'https://placeholder.supabase.co', publishableKey ?? 'placeholder', {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'portfolio-auth',
    // SEC-008: PKCE en vez de implicit. Los tokens ya nunca viajan en la URL
    // del redirect del magic link (solo un code), reduciendo la superficie de
    // exfiltración. El storage sigue siendo localStorage (las cookies httpOnly
    // no son viables en SPA estática sin SSR; ver conductor/decisions/0001-*).
    flowType: 'pkce',
  },
})
