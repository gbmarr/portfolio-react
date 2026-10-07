import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.DATABASE_URL
const publishableKey = import.meta.env.DATABASE_PUBLISHABLE_KEY

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
  },
})
