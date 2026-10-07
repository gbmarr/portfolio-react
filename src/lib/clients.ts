import { supabase } from './supabase'
import type { Profile } from './types'

export type ClientRow = {
  email: string
  /** `true` cuando el cliente ya se logueó alguna vez (tiene perfil activo). */
  active: boolean
  full_name: string | null
  projectCount: number
}

/**
 * Clientes conocidos: unión de los emails que tienen proyectos y de los
 * perfiles activos. El alta de un cliente es solo registrar su email en un
 * proyecto (o invitarlo con magic link); la cuenta se crea en su primer login.
 */
export async function listClients(): Promise<ClientRow[]> {
  const [profilesResult, projectsResult] = await Promise.all([
    supabase.from('profiles').select('email, full_name, role').neq('role', 'admin'),
    supabase.from('projects').select('client_email'),
  ])

  if (profilesResult.error) throw new Error(profilesResult.error.message)
  if (projectsResult.error) throw new Error(projectsResult.error.message)

  const rows = new Map<string, ClientRow>()

  for (const project of projectsResult.data ?? []) {
    const email = project.client_email
    const existing = rows.get(email)
    if (existing) {
      existing.projectCount += 1
    } else {
      rows.set(email, { email, active: false, full_name: null, projectCount: 1 })
    }
  }

  for (const profile of profilesResult.data ?? []) {
    if (profile.role === 'admin') continue
    const email = profile.email.toLowerCase()
    const existing = rows.get(email)
    if (existing) {
      existing.active = true
      existing.full_name = profile.full_name
    } else {
      rows.set(email, { email, active: true, full_name: profile.full_name, projectCount: 0 })
    }
  }

  return [...rows.values()].sort((a, b) => a.email.localeCompare(b.email))
}

export async function listClientProfiles(): Promise<Profile[]> {
  const result = await supabase.from('profiles').select('*').neq('role', 'admin').order('email')
  if (result.error) throw new Error(result.error.message)
  return (result.data ?? []) as Profile[]
}
