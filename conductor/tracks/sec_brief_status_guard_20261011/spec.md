# Spec — Proteger `project_briefs.status`

> **Track ID:** `sec_brief_status_guard_20261011`
> **Fuente:** Hallazgo **SEC-006 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🧪 En implementación — código listo (migración 0011 + `updateBriefAnswers` sin `status`); pendiente aplicar la migración en Supabase.

---

## 1. Contexto y objetivo

El trigger `guard_brief_admin_columns` (`0005:21-42`) bloquea cambios de `service_type`/`extra_ids` por no-admin, pero **no** de `status`. La app recalcula `status` en el cliente (`src/lib/briefs.ts:81-99`) al guardar respuestas, por lo que un cliente podría fijar `status = 'completado'` (o revertirlo) sin cumplir la lógica prevista. Es una alteración de lógica de negocio (impacto bajo, pero estado inconsistente).

**Objetivo:** que `status` no pueda ser manipulado libremente por el cliente; que se derive de reglas server-side o quede bajo control admin.

## 2. Functional Requirements

- **FR1 —** Un cliente no puede fijar `status` arbitrariamente.
- **FR2 —** El estado del brief se mantiene coherente (derivado en la base a partir de las respuestas, o gobernado por admin).
- **FR3 —** El flujo legítimo del cliente (completar respuestas, que el brief pase a `completado` cuando corresponde) sigue funcionando.

## 3. Non-Functional Requirements

- **NFR1 —** Migración idempotente.
- **NFR2 —** Suite verde.

## 4. Acceptance Criteria

- [x] Cliente intentando `status='completado'` sin respuestas válidas no lo logra (la base lo deriva a `'pendiente'` — migración 0011).
- [x] El brief pasa a `completado` por la lógica correcta (`compute_brief_status` server-side, espejo de `computeBriefStatus`).
- [x] `npm run test` / `typecheck` / `lint` verdes.

## 5. Out of Scope

- Rediseñar el brief o sus preguntas.
- Otros campos del brief.

---

## 6. Decisión de diseño (D1)

Se eligió **derivar `status` en la base** (alternativa b del plan): nueva función `compute_brief_status(service_type, extra_ids, answers)` (espejo SQL de `src/data/briefTemplates.ts → computeBriefStatus`) y el guard `guard_brief_admin_columns` fuerza el valor derivado para no-admin. El cliente deja de enviar `status` (`updateBriefAnswers` → solo `{ answers }`). El admin conserva control total del `status`.
