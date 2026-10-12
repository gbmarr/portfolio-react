# Spec — Ownership en el UPDATE de `milestone_approvals`

> **Track ID:** `sec_approval_rls_20261012`
> **Fuente:** Hallazgo **RT-03 (Baja)** del red team 2026-10-12.
> **Estado:** 🚧 Pendiente de implementación.

---

## 1. Contexto y objetivo

En `public.milestone_approvals` (`supabase/migrations/0001_init.sql`):
- **INSERT** (L328-339): `with check` exige `auth.uid()=client_id` **y** pertenencia del proyecto (ownership por email).
- **UPDATE** (L341-345): `using`/`with check` exigen **solo** `auth.uid()=client_id`.
- El trigger `check_approval_stage` (L302-321) valida *stage → project*, pero **no** que el *project* sea del cliente.

Un cliente autenticado puede modificar su fila de aprobación y apuntar `project_id`/`stage_id` a un proyecto ajeno (requiere conocer el UUID, no enumerable por RLS). Impacto: **integridad** acotada.

**Objetivo:** que el `with check` del UPDATE re-valide la pertenencia del proyecto, igual que el INSERT.

## 2. Functional Requirements

- **FR1 —** Recrear la policy de UPDATE de `milestone_approvals` con ownership del proyecto en `with check` (falta Klera en `using` también, por consistencia).
- **FR2 —** Sin cambios de comportamiento para el caso legítimo (cliente editando su propia decisión en su proyecto).

## 3. Non-Functional Requirements

- **NFR1 —** Migración idempotente (`drop policy if exists` + `create policy`).
- **NFR2 —** Suite verde; sin cambios de UI.

## 4. Acceptance Criteria

- [ ] UPDATE con `project_id` ajeno → rechazado.
- [ ] UPDATE legítimo (propio proyecto) → permitido.
- [ ] Suite verde; `typecheck`/`lint` ok.

## 5. Out of Scope

- Rediseñar el modelo de aprobaciones.
- Auditoría de otras tablas (cubierta por RT-01/RT-04).
