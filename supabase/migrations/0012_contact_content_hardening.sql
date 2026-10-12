-- ----------------------------------------------------------------------------
-- 0012_contact_content_hardening — defensa en profundidad de contenido (SEC-005)
--
-- La validación server-side de la Edge Function (`contact-notify/validation.ts`)
-- ya rechaza caracteres de control en `name`/`email`. Esta migración añade la
-- misma regla a nivel de esquema para que ni siquiera un insert directo con
-- `service_role` (o un backfill futuro) pueda guardar valores con CR/LF/NUL, que
-- son los que habilitarían inyección de headers en el email (subject/reply_to).
--
-- `message` se excluye a propósito: admite saltos de línea legítimos.
--
-- Idempotente (drop + add). Cómo aplicar:
--   Supabase Dashboard -> SQL Editor (con backup previo).
-- ----------------------------------------------------------------------------

-- 1) name: sin caracteres de control ([[:cntrl:]] = 0x00-0x1F + 0x7F) ----------
alter table public.contact_messages
  drop constraint if exists contact_messages_name_no_control;
alter table public.contact_messages
  add constraint contact_messages_name_no_control
  check (name !~ '[[:cntrl:]]');

-- 2) email: sin caracteres de control -----------------------------------------
alter table public.contact_messages
  drop constraint if exists contact_messages_email_no_control;
alter table public.contact_messages
  add constraint contact_messages_email_no_control
  check (email !~ '[[:cntrl:]]');
