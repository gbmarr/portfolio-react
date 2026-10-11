# Plan: Sincronizar documentación de producto

> **Track ID:** `docs_sync_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente
> **Reglas:** docs-only; verificación de consistencia con el código.

---

## Fase T0 — Auditoría de docs vs. realidad

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Listar referencias a bilingüe / EN / toggle y URLs viejas en `conductor/*.md` | `product.md`, `product-guidelines.md` | ⬜ |
| T0.2 | Verificar datos (dominio, repo, estado de test/coverage) contra el repo y la producción | — | ⬜ |

## Fase T1 — Edición de `product-guidelines.md`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Reemplazar sección Language (español único, fuente `src/data/copy.ts`) | `conductor/product-guidelines.md` | ⬜ |
| T1.2 | Quitar referencias a "both languages" en accesibilidad/consistencia | `conductor/product-guidelines.md` | ⬜ |

## Fase T2 — Edición de `product.md`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Actualizar Implementation Status: estado 2026-10-11 verificado + producción | `conductor/product.md` | ⬜ |
| T2.2 | Corregir URLs (dominio canónico, repo) y tratamiento de Lighthouse (marcar método/fecha) | `conductor/product.md` | ⬜ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | "grep" de referencias obsoletas (bilingüe, portfolio-blond, vercel.app) en conductor/ | lectura manual | ⬜ |
| V.2 | `npm run typecheck` / `npm run lint` / `npm run test` (regresión) | Vitest | ⬜ |
| V.3 | Commit `docs(conductor): sync product docs al sitio español y dominio canónico` + docs del track | git | ⬜ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Algún código asume copy bilingüe | No aplica: `copy.ts` es solo español; el track no toca código |
| Se pierden scores históricos de Lighthouse | Se conservan con nota de fecha/método (no se eliminan datos, se fechan) |