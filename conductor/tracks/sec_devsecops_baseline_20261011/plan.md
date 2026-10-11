# Plan: Línea base DevSecOps y cadena de suministro

> **Track ID:** `sec_devsecops_baseline_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🧪 En implementación

---

## Fase 1 — Controles básicos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | `.github/dependabot.yml` (npm + github-actions, weekly) | `.github/dependabot.yml` | ☑️ |
| T1.2 | Workflow CI (install/lint/typecheck/test/build/audit) | `.github/workflows/ci.yml` | ☑️ |
| T1.3 | `public/.well-known/security.txt` | `public/.well-known/security.txt` | ☑️ |

## Fase 2 — SAST/SBOM

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | SAST con CodeQL (js/ts, `security-and-quality`; push a main + semanal) | `.github/workflows/codeql.yml` | ☑️ |
| T2.2 | SBOM CycloneDX (`npm sbom` sobre deps de prod) publicado como artefacto | `.github/workflows/ci.yml` | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | CI verde en `main` (ci + codeql) | GitHub Actions | ☐ (requiere push) |
| V.2 | `security.txt` accesible en prod (`.well-known`) | curl | ☐ (requiere deploy) |
| V.3 | Commit `ci(security): baseline DevSecOps + security.txt (SEC-007)` + docs | git | ☑️ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `npm audit` con falsos positivos bloquea PRs | `--audit-level=high`; política documentada en `ci.yml`; hoy 0 vulnerabilidades |
| CI lento o con consumo | `cache: npm`; CodeQL acotado a main/semanal (no a PRs); timeout 15/20 min |
