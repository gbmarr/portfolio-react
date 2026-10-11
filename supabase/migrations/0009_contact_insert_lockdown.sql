-- ----------------------------------------------------------------------------
-- 0009_contact_insert_lockdown — cerrar el INSERT anónimo en contact_messages
--
-- Hallazgo SEC-001 (auditoría de seguridad run-2): la policy "cualquiera envía
-- mensaje" (0001) permitía INSERT a `anon, authenticated` con `with check (true)`,
-- de modo que cualquiera con la publishable key podía insertar filas directas
-- por PostgREST (POST /rest/v1/contact_messages) **esquivando Turnstile** y la
-- Edge Function `contact-notify` -> spam/flood de la tabla y del panel admin.
--
-- El insert legítimo lo hace la Edge Function con `service_role` (BYPASSRLS),
-- por lo que NO depende de esta policy. Se elimina la vía anónima y se revoca el
-- privilegio de INSERT a anon/authenticated (defensa en profundidad: aunque no
-- hubiera policy, RLS ya deniega, pero el revoke deja 0 superficie).
--
-- IMPORTANTE: NO se revocan UPDATE/DELETE. El admin es un usuario `authenticated`
-- (rol admin en profiles) y los necesita para marcar leído / eliminar vía RLS.
-- Solo se cierra INSERT.
--
-- Cómo aplicar: Supabase Dashboard -> SQL Editor (con backup previo).
-- ----------------------------------------------------------------------------

drop policy if exists "cualquiera envía mensaje" on public.contact_messages;

revoke insert on public.contact_messages from anon, authenticated;
