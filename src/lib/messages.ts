import { supabase } from './supabase'
import { throwIfError, unwrapList } from './supabase-result'
import type { ContactMessage } from './types'

/** Bandeja de mensajes del formulario de contacto (solo admin, según RLS). */
export async function listMessages(): Promise<ContactMessage[]> {
  const result = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  return unwrapList(result)
}

export async function markMessageRead(id: string, read: boolean): Promise<void> {
  const result = await supabase
    .from('contact_messages')
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq('id', id)
  throwIfError(result)
}

export async function deleteMessage(id: string): Promise<void> {
  const result = await supabase.from('contact_messages').delete().eq('id', id)
  throwIfError(result)
}
