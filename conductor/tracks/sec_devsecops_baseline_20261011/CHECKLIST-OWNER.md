# CHECKLIST — SEC-007 · Baseline DevSecOps y cadena de suministro

> **Track:** `sec_devsecops_baseline_20261011` · **Issue:** #13
> **Propósito:** habilitar CI/SAST/SCA/SBOM/Dependabot y publicar `/.well-known/security.txt`.

## 1. Push y CI verde (requiere el owner)

Una vez commiteado localmente, hacer push de `main` para que GitHub Actions corra:

```powershell
git push origin main
```

Verificar en la pestaña **Actions** del repo:
- [ ] **ci** verde en `main` (install / lint / typecheck / test / build / audit / sbom).
- [ ] **codeql** verde (análisis SAST sobre `main`, corre tambián semanal).
- [ ] Artefacto `sbom-cyclonedx` disponible en el run de `ci`.

> Nota: `npm audit --audit-level=high` rompe el build solo con vulnerabilidades **high/critical** (hoy: 0). Las low/moderate no bloquean (política documentada en `ci.yml`).

## 2. Dependabot (automático)

Con el archivo `.github/dependabot.yml` ya en `main`, GitHub crea automáticamente PRs semanales para:
- `npm` (actualizaciones de dependencias, label `security`, prefijo `chore(deps)`).
- `github-actions` (acciones de los workflows, prefijo `chore(ci)`).

Verificar:
- [ ] En **Settings → Security → Dependabot** aparecen los dos ecosistemas habilitados.
- [ ] El primer PR de dependencias llega (o dentro de la semana).

## 3. security.txt en producción

Tras desplegar (`public/.well-known/security.txt` via Vercel/Netlify):

```powershell
curl -v https://gabrielmarrero.com.ar/.well-known/security.txt
```

- [ ] HTTP 200 y responde `Contact:` + `Expires:` (RFC 9116).
- [ ] `Cache-Control: no-store` presente (cabecera configurada en `vercel.json` y `netlify.toml`).

> ⚠️ **Contacto temporal:** usa `hola@gabrielmarrero.com.ar`. Si la operación tiene un canal
> dedicado de seguridad, actualizar la línea `Contact:` (y re-armar `Expires:` a ≤ 1 año).

## 4. Housekeeping recomendado (opcional)

- Definir si los PRs de Dependabot se mergean automáticamente (solo con CI verde y cambios `patch/minor`).
- Evaluar subir el SBOM (`sbom-cyclonedx.json`) a un escáner de tu elección en otra fase.
- Si el repo es privado, verificar que el plan de Actions cubra el consumo (Hobby: 2.000 min/mes; suficiente para este uso).