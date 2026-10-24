import { supabase } from './supabase'
import { throwIfError, unwrapList } from './supabase-result'
import type { QuoteRequest, QuoteRequestStatus } from './types'

/** Solicitudes de presupuesto de la landing (solo admin, según RLS). */
export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  const result = await supabase
    .from('quote_requests')
    .select('*')
    .order('created_at', { ascending: false })
  return unwrapList(result)
}

export async function updateQuoteRequestStatus(
  id: string,
  status: QuoteRequestStatus
): Promise<void> {
  const patch: { status: QuoteRequestStatus; contacted_at?: string | null } = { status }
  if (status === 'contacted') patch.contacted_at = new Date().toISOString()
  if (status === 'new') patch.contacted_at = null

  const result = await supabase.from('quote_requests').update(patch).eq('id', id)
  throwIfError(result)
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  const result = await supabase.from('quote_requests').delete().eq('id', id)
  throwIfError(result)
}
