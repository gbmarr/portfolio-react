# Informe de seguridad: <sistema / PR / módulo>

**Fecha:** <AAAA-MM-DD> · **Alcance:** <qué se revisó> · **Método:** <revisión de código / config / diseño / pentest> · **Nivel objetivo ASVS:** <L1/L2/L3>

## Resumen ejecutivo
<3-6 líneas: estado general, riesgos principales, qué hacer primero.>

| Crítica | Alta | Media | Baja | Info |
|:-:|:-:|:-:|:-:|:-:|
| 0 | 0 | 0 | 0 | 0 |

## Supuestos y límites
- <Supuestos sobre stack, entorno, exposición.>
- <Qué NO se revisó.>

## Hallazgos

### [SEC-001] <Título corto> — **<Severidad>**
- **Categoría:** <OWASP A0X / API X / CWE-XXX>
- **Ubicación:** `<archivo>:<línea>` / endpoint / recurso
- **Descripción:** <Qué ocurre y por qué es un problema.>
- **Evidencia / PoC mínima:**
  ```
  <snippet vulnerable o request de reproducción (mínimo necesario)>
  ```
- **Impacto:** <Qué puede lograr un atacante, sobre qué datos/funciones.>
- **Probabilidad / Explotabilidad:** <Alta/Media/Baja y por qué.>
- **Remediación:**
  ```
  <snippet corregido>
  ```
- **Verificación:** <test/comando/caso que confirma el fix y evita regresión.>
- **Estado:** Abierto · **Responsable:** <nombre> · **Plazo sugerido:** <SLA>

<!-- Repetir por hallazgo -->

## Controles verificados correctamente
- <Lo que está bien hecho; refuerza buenas prácticas.>

## Recomendaciones de hardening (defensa en profundidad)
- <Mejoras no críticas.>

## Plan de acción priorizado
| # | Acción | Hallazgos | Esfuerzo | Prioridad |
|---|---|---|---|---|
| 1 | | SEC-00X | S/M/L | Inmediata |

## Riesgo residual y decisiones de aceptación
- <Riesgos aceptados, responsable, fecha de revisión.>
