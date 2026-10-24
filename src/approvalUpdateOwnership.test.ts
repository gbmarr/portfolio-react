import { describe, expect, it } from 'vitest'
import migration from '../supabase/migrations/0016_approval_update_ownership.sql?raw'

const ownershipExpr = 'lower(pr.email) = p.client_email'

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1
}

describe('migración 0016_approval_update_ownership (RT-03)', () => {
  it('recrea la policy de UPDATE de milestone_approvals', () => {
    expect(migration).toContain(
      'drop policy if exists "cliente modifica su decisión" on public.milestone_approvals;'
    )
    expect(migration).toContain('create policy "cliente modifica su decisión"')
    expect(migration).toContain('on public.milestone_approvals for update')
    expect(migration).toContain('to authenticated')
  })

  it('aplica la verificación de ownership en using y with check (como el INSERT)', () => {
    // El subquery de pertenencia debe aparecer al menos 2 veces: using + with check.
    expect(countOccurrences(migration, ownershipExpr)).toBeGreaterThanOrEqual(2)
    // Y la primera aparición debe estar bajo 'using', no solo en 'with check'.
    const usingIdx = migration.indexOf('using (')
    const withCheckIdx = migration.indexOf('with check (')
    expect(usingIdx).toBeGreaterThan(-1)
    expect(withCheckIdx).toBeGreaterThan(usingIdx)
  })

  it('sigue exigiendo auth.uid() = client_id en ambas cláusulas', () => {
    expect(countOccurrences(migration, 'auth.uid() = client_id')).toBeGreaterThanOrEqual(2)
  })

  it('no toca triggers ni funciones existentes (solo recrea la policy)', () => {
    expect(migration).not.toContain('create trigger')
    expect(migration).not.toContain('create or replace function')
    expect(migration).toContain('for update')
  })
})
