import { supabase } from './supabase'
import { unwrapList } from './supabase-result'

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

  const profiles = unwrapList(profilesResult)
  const projects = unwrapList(projectsResult)

  const rows = new Map<string, ClientRow>()

  for (const project of projects) {
    const email = project.client_email
    const existing = rows.get(email)
    if (existing) {
      existing.projectCount += 1
    } else {
      rows.set(email, { email, active: false, full_name: null, projectCount: 1 })
    }
  }

  for (const profile of profiles) {
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
