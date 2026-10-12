import { describe, expect, it } from 'vitest'

import migration from '../supabase/migrations/0014_audit_log.sql?raw'

describe('audit log de acciones sensibles (RT-04)', () => {
  it('crea la tabla audit_log con las columnas esperadas y RLS', () => {
    expect(migration).toContain('create table if not exists public.audit_log')

    for (const column of [
      'actor_id',
      'actor_email',
      'action',
      'entity',
      'entity_id',
      'metadata',
      'ip',
      'created_at',
    ]) {
      expect(migration).toContain(column)
    }

    expect(migration).toContain('alter table public.audit_log enable row level security')
  })

  it('define audit_row() como trigger genérico SECURITY DEFINER', () => {
    expect(migration).toMatch(
      /create or replace function public\.audit_row\(\)[\s\S]*?security definer/
    )
    expect(migration).toContain('tg_table_name')
    expect(migration).toContain('auth.uid()')
  })

  it('instala el trigger AFTER en las seis tablas sensibles', () => {
    const executions = (migration.match(/execute function public\.audit_row\(\)/g) ?? []).length
    expect(executions).toBeGreaterThanOrEqual(6)

    for (const table of [
      'projects',
      'project_stages',
      'project_briefs',
      'milestone_approvals',
      'contact_messages',
      'profiles',
    ]) {
      expect(migration).toMatch(
        new RegExp(`after insert or update or delete on public\\.${table}`)
      )
    }
  })

  it('en UPDATE registra solo los nombres de columnas cambiadas (metadata acotada)', () => {
    expect(migration).toContain("jsonb_build_object('changed'")
    expect(migration).toMatch(/is distinct from \(to_jsonb\(old\)/)
  })

  it('RLS: SELECT solo admin y sin vía directa de escritura', () => {
    expect(migration).toContain('using (public.is_admin())')
    expect(migration).not.toContain('for insert')
    expect(migration).toContain(
      'revoke insert, update, delete on public.audit_log from anon, authenticated'
    )
  })

  it('define índices y función de retención', () => {
    expect(migration).toContain('audit_log_created_at_idx')
    expect(migration).toContain('audit_log_entity_idx')
    expect(migration).toContain('audit_log_actor_idx')
    expect(migration).toContain('public.prune_audit_log')
  })
})
