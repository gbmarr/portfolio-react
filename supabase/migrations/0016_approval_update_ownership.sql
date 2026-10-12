-- =============================================================================
-- 0016_approval_update_ownership.sql   (RT-03 — issue #28, CWE-639 / A01:2021)
-- -----------------------------------------------------------------------------
-- Hallazgo: la policy de UPDATE de `milestone_approvals` (0001_init.sql, L341-345)
-- solo exigía `auth.uid() = client_id`. Un cliente autenticado podía modificar su
-- fila de aprobación y apuntar `project_id`/`stage_id` a un proyecto ajeno
-- (requiere conocer el UUID; el trigger `check_approval_stage` valida etapa→proyecto
-- pero NO que el proyecto sea del cliente). El INSERT sí verificaba ownership.
--
-- Fix: se recrea la policy de UPDATE con la MISMA verificación de pertenencia
-- (join profiles por auth.uid() y `lower(pr.email) = p.client_email`) en `using`
-- y en `with check`, consistente con la policy de INSERT (L328-339).
--
-- Idempotente: `drop policy if exists` + `create policy`.
-- No rompe el caso legítimo: el cliente sigue editando su decisión en su proyecto.
-- El UPDATE de admin no cambia (la policy sigue siendo solo para clientes).
-- =============================================================================

drop policy if exists "cliente modifica su decisión" on public.milestone_approvals;

create policy "cliente modifica su decisión"
  on public.milestone_approvals for update
  to authenticated
  using (
    auth.uid() = client_id
    and exists (
      select 1
      from public.projects p
      join public.profiles pr on pr.id = auth.uid()
      where p.id = project_id and lower(pr.email) = p.client_email
    )
  )
  with check (
    auth.uid() = client_id
    and exists (
      select 1
      from public.projects p
      join public.profiles pr on pr.id = auth.uid()
      where p.id = project_id and lower(pr.email) = p.client_email
    )
  );