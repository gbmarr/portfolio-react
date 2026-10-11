# Plan: Línea base DevSecOps y cadena de suministro

> **Track ID:** `sec_devsecops_baseline_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente

---

## Fase 1 — Controles básicos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | `.github/dependabot.yml` (npm + github-actions, weekly) | `.github/dependabot.yml` | ☐ |
| T1.2 | Workflow CI (install/lint/typecheck/test/build/audit) | `.github/workflows/ci.yml` | ☐ |
| T1.3 | `public/.well-known/security.txt` | `public/.well-known/security.txt` | ☐ |

## Fase 2 — SAST/SBOM (opcional)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Evaluar SAST (p. ej. CodeQL / semgrep) en CI | `.github/workflows/*` | ☐ |
| T2.2 | Generar SBOM (CycloneDX) y publicarlo como artefacto | `.github/workflows/*` | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | CI verde en `main` | GitHub Actions | ☐ |
| V.2 | `security.txt` accesible en prod | curl | ☐ |
| V.3 | Commit `ci(security): baseline DevSecOps + security.txt (SEC-007)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `npm audit` con falsos positivos bloquea PRs | Empezar en modo aviso; política de severidad documentada |
| CI lento o con consumo | Cache de npm; jobs mínimos |
