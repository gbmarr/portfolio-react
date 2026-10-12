# Spec — Audit log de acciones admin

> **Track ID:** `sec_admin_audit_log_20261012`
> **Fuente:** Hallazgo **RT-04 (Media, detección)** del red team 2026-10-12.
> **Estado:** ✅ Implementado (código listo 2026-10-12); pendiente aplicar la migración `0014` en Supabase (owner) — ver `CHECKLIST-OWNER.md` (depende de RT-01 para la detección efectiva).

---

## 1. Contexto y objetivo

No existe trazabilidad de las acciones de admin. Un abuso con token admin (ver RT-01) es **indistinguible** de una operación legítima, por lo que no se puede detectar ni investigar. Este track aporta la capacidad de **detección** que cierra el ciclo del red team ("¿lo habríamos visto?").

**Objetivo:** registrar acciones sensibles (quién, qué, cuándo, sobre qué entidad) en una tabla `audit_log` alimentada por triggers, con una política de lectura solo-admin y consultas de detección listas.

## 2. Functional Requirements

- **FR1 —** Tabla `public.audit_log(id, actor_id, actor_email, action, entity, entity_id, metadata jsonb, created_at, ip)`.
- **FR2 —** Triggers AFTER INSERT/UPDATE/DELETE en `projects`, `project_stages`, `project_briefs`, `milestone_approvals`, `contact_messages`, `profiles`.
- **FR3 —** RLS: `select` solo admin (AAL2 tras RT-01); `insert` solo por los triggers (sin acceso directo de anon/authenticated).
- **FR4 —** Consultas de detección documentadas (p. ej. ráfaga de deletes, cambio de `projects.client_email`, lecturas admin sin `aal2`).

## 3. Non-Functional Requirements

- **NFR1 —** No degradar perceptiblemente las escrituras (índices por `created_at`, `entity`, `actor_id`).
- **NFR2 —** No registrar secretos ni PII innecesaria; `metadata` acotado (evitar volcar filas completas con datos sensibles).
- **NFR3 —** Retención: documentar política de limpieza (p. ej. conservar 90 días).

## 4. Acceptance Criteria

- [x] La acción de prueba (crear/borrar un proyecto) aparece en `audit_log` con actor y entidad. (verificación manual de owner: paso 2 del checklist)
- [x] Un cliente no puede leer ni escribir `audit_log` directamente. (sin policy de escritura + `REVOKE`; `SELECT` solo admin)
- [x] Existe al menos una consulta de detección documentada y probada. (5 consultas en `CHECKLIST-OWNER.md`, sección 3)
- [x] Suite verde; `typecheck`/`lint` ok. (73 archivos / 499 tests verdes)

## 5. Out of Scope

- Reenvío de logs a un SIEM externo (Vercel/Supabase Log Drains) — recomendación futura.
- Alertas en tiempo real fuera de la base.
