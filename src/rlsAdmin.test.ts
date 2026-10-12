import { describe, expect, it } from 'vitest'

import migration from '../supabase/migrations/0013_admin_aal2.sql?raw'

describe('RLS admin endurecido a AAL2 (RT-01)', () => {
  it('define is_admin_aal2() exigiendo rol admin y el claim aal = aal2', () => {
    expect(migration).toContain('create or replace function public.is_admin_aal2()')
    expect(migration).toContain("role = 'admin'")
    expect(migration).toContain("coalesce(auth.jwt() ->> 'aal', '') = 'aal2'")
  })

  it('hace que is_admin() delegue en is_admin_aal2() (choke point único)', () => {
    expect(migration).toMatch(
      /create or replace function public\.is_admin\(\)[\s\S]*?select public\.is_admin_aal2\(\)/
    )
  })

  it('conserva security definer para evitar la recursión de RLS sobre profiles', () => {
    const securityDefinerCount = (migration.match(/security definer/g) ?? []).length
    expect(securityDefinerCount).toBeGreaterThanOrEqual(3)
  })

  it('documenta que is_admin_role() NO autoriza datos (rol sin AAL2)', () => {
    expect(migration).toContain('NO usar para autorizar datos')
  })
})
