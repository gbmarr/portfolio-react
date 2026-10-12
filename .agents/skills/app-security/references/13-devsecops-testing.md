# 13 · DevSecOps y pruebas de seguridad automatizadas

## Controles
- **SAST** (Semgrep, CodeQL, SonarQube, Bandit, gosec, Brakeman) en PR, con reglas propias para patrones del proyecto.
- **SCA** (→ 12) y **secret scanning** (→ 10) en cada commit/PR.
- **DAST** (OWASP ZAP, Burp, Nuclei) contra entornos efímeros/staging, con autenticación configurada; escaneos de API desde OpenAPI.
- **IAST/RASP** cuando aplique (apps críticas, runtime).
- **IaC scanning** (Checkov, tfsec/Trivy, KICS, kube-linter, Conftest), **container scanning** (Trivy, Grype), **CSPM** para cloud (→ 14).
- **Fuzzing** coverage-guided (AFL++, libFuzzer, Jazzer, go-fuzz, Atheris) para parsers, deserializadores, protocolos, componentes críticos; property-based testing.
- **Tests de seguridad automatizados**: autorización (matriz rol × endpoint × objeto), validación de entradas, regresión de cada vulnerabilidad corregida, headers, CORS, rate limiting, sesiones.
- **Quality gates** con umbrales claros (bloquear Críticas/Altas nuevas), gestión de falsos positivos con justificación y expiración de excepciones.
- **Pentests manuales** y revisión de código en componentes críticos (auth, pagos, criptografía, multi-tenancy); alcance y frecuencia por riesgo; retest de correcciones.
- **Entornos efímeros** de prueba, sin datos reales de producción (o enmascarados/sintéticos).
- **Métricas**: MTTR por severidad, vulnerabilidades abiertas por antigüedad, cobertura de escaneo, % de repos con gates activos.
- **Pre-commit hooks** (gitleaks, linters de seguridad) y *branch protection*.

## Pipeline de referencia
1. Pre-commit: secret scan + lint de seguridad.
2. PR: SAST + SCA + IaC scan + tests unitarios de seguridad + revisión obligatoria.
3. Build: SBOM, firma, escaneo de imagen, provenance.
4. Deploy a staging: DAST + tests de integración de seguridad.
5. Producción: admission control, monitoreo, alertas, escaneo continuo de dependencias e imágenes.

## Preguntas de revisión
- ¿Qué bloquea un merge hoy por motivos de seguridad?
- ¿Cuánto tarda en corregirse una vulnerabilidad Crítica desde su detección?
- ¿Cada bug de seguridad corregido tiene un test que evita su regreso?
