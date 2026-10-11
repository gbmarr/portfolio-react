-- ----------------------------------------------------------------------------
-- 0011_brief_status_derive — SEC-006: project_briefs.status se deriva en la base
--
-- Hallazgo SEC-006 (auditoría run-2): el trigger guard_brief_admin_columns
-- (0005) bloquea cambios de service_type/extra_ids por no-admin, pero NO de
-- status. La app calculaba status en el cliente (src/lib/briefs.ts), de modo
-- que un cliente podía fijar status='completado' (o revertirlo) sin cumplir la
-- lógica prevista.
--
-- Qué hace este cambio:
--   1. Crea compute_brief_status(service_type, extra_ids, answers): espejo en
--      SQL de src/data/briefTemplates.ts → computeBriefStatus(). Devuelve
--      'completado' si todos los campos requeridos del servicio (y de los
--      extras seleccionados) tienen respuesta no vacía; 'pendiente' si no.
--   2. Extiende guard_brief_admin_columns: para updates de no-admin, ignora el
--      status que mande el cliente y lo fuerza al valor derivado. Así el
--      cliente no puede marcar ni revertir la completitud arbitrariamente,
--      pero el flujo legítimo (completar respuestas → 'completado') funciona.
--
-- Cómo aplicar:
--   Opción A: Supabase Dashboard → SQL Editor → pegar y ejecutar.
--   Opción B: supabase CLI → `supabase db push` (requiere `supabase link`).
--
-- IMPORTANTE (deploy acoplado): desplegar junto con el cambio de código que
-- hace que updateBriefAnswers deje de enviar `status` (src/lib/briefs.ts).
-- ----------------------------------------------------------------------------

-- Helper: considera "respondido" un valor jsonb (string no vacía o array con
-- al menos un elemento no vacío). Espeja hasAnswer() de briefTemplates.ts.
create or replace function public.brief_answer_ok(value jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when value is null then false
    when jsonb_typeof(value) = 'array'
      then exists (select 1 from jsonb_array_elements_text(value) v where trim(v) <> '')
    else trim(value #>> '{}') <> ''
  end;
$$;

-- Deriva el status del brief desde las respuestas. Espeja computeBriefStatus()
-- de src/data/briefTemplates.ts (campos requeridos por servicio y por extra).
create or replace function public.compute_brief_status(
  p_service_type text,
  p_extra_ids jsonb,
  p_answers jsonb
)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when
      -- Requeridos del servicio base (tiers: landing/institucional/medida)
      brief_answer_ok(p_answers -> 'nombre')
      and brief_answer_ok(p_answers -> 'sector')
      and brief_answer_ok(p_answers -> 'descripcion_corta')
      and brief_answer_ok(p_answers -> 'objetivo')
      and brief_answer_ok(p_answers -> 'cta_principal')
      and brief_answer_ok(p_answers -> 'color_principal')
      -- institucional y medida agregan secciones/contacto
      and (
        p_service_type = 'landing'
        or (
          brief_answer_ok(p_answers -> 'secciones_deseadas')
          and brief_answer_ok(p_answers -> 'email_contacto')
          and brief_answer_ok(p_answers -> 'telefono')
          -- medida agrega la sección de proceso de venta
          and (p_service_type = 'institucional' or brief_answer_ok(p_answers -> 'proceso_venta'))
        )
      )
      -- Extras: solo aplican los que estén seleccionados en extra_ids
      and (not (p_extra_ids ? 'blog') or brief_answer_ok(p_answers -> 'blog_contenidos'))
      and (not (p_extra_ids ? 'integraciones') or brief_answer_ok(p_answers -> 'sistemas'))
      and (not (p_extra_ids ? 'multidioma') or brief_answer_ok(p_answers -> 'idiomas'))
      and (not (p_extra_ids ? 'logo') or brief_answer_ok(p_answers -> 'logo_existente'))
      and (not (p_extra_ids ? 'copy') or brief_answer_ok(p_answers -> 'textos_provistos'))
      and (
        not (p_extra_ids ? 'ecommerce')
        or (
          brief_answer_ok(p_answers -> 'catalogo_tienda')
          and brief_answer_ok(p_answers -> 'medios_pago')
        )
      )
    then 'completado'
    else 'pendiente'
  end;
$$;

-- Extiende el guard de columnas admin: para no-admin, el status se fuerza al
-- valor derivado de las respuestas (TODO lo que mande el cliente se ignora).
create or replace function public.guard_brief_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.service_type is distinct from old.service_type
     or new.extra_ids is distinct from old.extra_ids then
    raise exception 'service_type/extra_ids son administrados por el administrador';
  end if;

  -- SEC-006: el status lo deriva la base desde las respuestas del brief.
  new.status := public.compute_brief_status(new.service_type, new.extra_ids, new.answers);

  return new;
end;
$$;

drop trigger if exists project_briefs_guard_admin_columns on public.project_briefs;
create trigger project_briefs_guard_admin_columns
  before update on public.project_briefs
  for each row execute function public.guard_brief_admin_columns();