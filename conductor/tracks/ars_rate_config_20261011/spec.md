# Spec — Cotización arsRate configurable del estimador

> **Track ID:** `ars_rate_config_20261011`
> **Fuente:** Gap 3 del reporte de aptitud MVP/v1 (análisis 2026-10-11) + TODO existente en `src/data/estimate.ts:146`.
> **Estado:** 🔜 Pendiente (spec + plan aprobados; enfoque confirmado con el usuario).

---

## 1. Contexto y objetivo

`src/data/estimate.ts` exporta `export const arsRate = 1400` con el comentario "TODO: ajustar a la cotización vigente antes de cada publicación relevante". El estimador usa ese valor para mostrar la aproximación en pesos. Cada vez que se mueve el dólar hay que editar código.

**Objetivo:** que la cotización se configure con una variable de entorno pública `ARS_RATE` (inyectada por Vite), sin editar código ni hacer deploy por un cambio de tasa, manteniendo 1400 como fallback razonable y validado.

## 2. Functional Requirements

- **FR1 — Fuente del valor:** `arsRate` se resuelve en runtime del cliente: `Number(import.meta.env.ARS_RATE)` si es un número positivo, si no `1400`.
- **FR2 — Prefijo de env:** se agrega `'ARS_'` a `envPrefix` en `vite.config.ts` (queda `['DATABASE_', 'ARS_', 'TURNSTILE_']`), manteniendo la convención de valores públicos documentada en `.env.example`.
- **FR3 — Documentación:** `.env.example` documenta `ARS_RATE=` (opcional, default 1400) en la sección del estimador; nota de que es público por diseño.
- **FR4 — Validación:** un valor inválido (vacío, negativo, NaN) cae al fallback; helper exportado `resolveArsRate(raw)` para testear el parse sin depender del bundle.
- **FR5 — Sin cambio de UI:** el estimador usa `arsRate` igual que hoy; no se alteran los precios base ni la escala de secciones.

## 3. Non-Functional Requirements

- **NFR1 —** Cobertura >80%; tests nuevos para `resolveArsRate` (TDD: rojo→verde).
- **NFR2 —** Build, typecheck, lint verdes.
- **NFR3 —** Sin migraciones de DB; sin fair-use impactado.
- **NFR4 —** No romper el contrato existente: cualquier código que importe `arsRate` sigue funcionando.

## 4. Acceptance Criteria

- [ ] `arsRate` usa `ARS_RATE` cuando está definida como número positivo; de lo contrario `1400`.
- [ ] `.env.example` documenta la nueva variable; `vite.config.ts` incluye el prefijo `ARS_`.
- [ ] Tests de `resolveArsRate`: override válido, vacío, no numérico, negativo y NaN (todos al fallback).
- [ ] `npm run typecheck` / `npm run lint` / `npm run test` / `npm run coverage` (≥80%) verdes.
- [ ] (Opcional deploy) el build con `ARS_RATE=1450` muestra ~1450 en el estimador.

## 5. Out of Scope

- Fuente remota de cotización (Supabase/Edge Function): más robusto pero no necesario para MVP.
- Cambiar el mecanismo de precios del estimador.
- Migrar prefijo a un esquema `PUBLIC_*` global (follow-up existente D4 en tech-stack.md, no bloqueante).