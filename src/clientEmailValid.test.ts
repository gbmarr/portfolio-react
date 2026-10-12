import { describe, expect, it } from 'vitest'

import migration from '../supabase/migrations/0015_client_email_valid.sql?raw'

describe('validación estructural de client_email (RT-02)', () => {
  it('define is_valid_email() como función immutable espejo del EMAIL_PATTERN', () => {
    expect(migration).toContain('create or replace function public.is_valid_email(value text)')
    expect(migration).toContain('immutable')
    expect(migration).toMatch(/value ~ '\^\[A-Za-z0-9\._\+-\]\+@/)
  })

  it('agrega el CHECK projects_client_email_valid con la función', () => {
    expect(migration).toContain('projects_client_email_valid')
    expect(migration).toContain('check (public.is_valid_email(client_email)) not valid')
  })

  it('documenta el paso de validación global (validate constraint)', () => {
    expect(migration).toContain('validate constraint projects_client_email_valid')
  })

  it('deja intacta la exigencia de minúsculas de 0001', () => {
    expect(migration).not.toContain('drop constraint projects_client_email_check')
  })
})