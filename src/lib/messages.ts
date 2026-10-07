import { supabase } from './supabase'
import type { ContactMessage } from './types'

/** Bandeja de mensajes del formulario de contacto (solo admin, según RLS). */
export async function listMessages(): Promise<ContactMessage[]> {
  const result = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (result.error) throw new Error(result.error.message)
  return (result.data ?? []) as ContactMessage[]
}

export async function markMessageRead(id: string, read: boolean): Promise<void> {
  const { error } = await supabase
    .from('contact_messages')
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Guarda una copia del mensaje del formulario en el panel (insert anónimo). */
export async function saveContactMessage(input: {
  name: string
  email: string
  message: string
  subject?: string | null
}): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(input)
  if (error) throw new Error(error.message)
}
