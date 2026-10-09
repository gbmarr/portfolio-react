-- ----------------------------------------------------------------------------
-- CIERRE DE PROYECTO
-- El admin puede "finalizar" un proyecto: se registra la fecha de cierre
-- (completed_at) al pasar el status a 'completado' y se limpia al reabrir.
-- Es reversible y no toca las etapas. La fecha la gestiona un trigger para
-- que quede consistente sin importar la vía (botón del detalle o formulario).
-- Migración 0004 (ver conductor/tracks/panel_ux_20261008/spec.md).
-- ----------------------------------------------------------------------------
alter table public.projects
  add column if not exists completed_at timestamptz;

-- Setea completed_at = now() al entrar en 'completado' y lo limpia al salir.
create or replace function public.set_project_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completado' and old.status is distinct from 'completado' then
    new.completed_at := now();
  elsif new.status is distinct from 'completado' and old.completed_at is not null then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger projects_completed_at
  before update on public.projects
  for each row execute function public.set_project_completed_at();
