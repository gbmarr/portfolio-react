# Informe de cadena de ataque: <nombre de la cadena>

**Fecha:** <AAAA-MM-DD> · **Entorno:** <staging/prod autorizado> · **Severidad final:** <Crítica/Alta/Media/Baja>

## Resumen ejecutivo
<2-4 líneas: qué se logró, por qué importa para el negocio, en lenguaje no técnico.>

## Objetivo (corona) y perfil de atacante
- **Objetivo comprometido:** <qué activo/función>
- **Perfil asumido:** <anónimo / usuario / insider / etc.>
- **Precondiciones:** <qué necesita el atacante antes de empezar>

## Cadena de ataque

| Paso | Acción | Vulnerabilidad / debilidad explotada | Evidencia |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

```
Diagrama simplificado:
Precondición → [Paso 1] → [Paso 2] → [Paso 3] → Impacto
```

## Evidencia (mínima necesaria)
```
<request/response enmascarados, capturas o logs — sin datos reales de terceros>
```

## Impacto de negocio
- **Confidencialidad / Integridad / Disponibilidad afectadas:** <detalle>
- **Datos o funciones comprometidas:** <detalle>
- **Alcance (blast radius):** <qué más se habría podido hacer, sin haberlo ejecutado>
- **Impacto estimado:** <financiero/reputacional/regulatorio, si aplica>

## Choke point (dónde cortar la cadena)
<El eslabón más barato de corregir que rompe esta cadena y probablemente otras.>

## Remediación
| Paso de la cadena | Corrección propuesta | Referencia | Prioridad |
|---|---|---|---|
| | | `app-security/references/XX` | |

## Detección
| Paso de la cadena | ¿Se detectó en la prueba? | Evento/log esperado | Regla propuesta | Dueño |
|---|---|---|---|---|
| | Sí/No | | | |

## Verificación y retest
- **Test de regresión propuesto:** <descripción>
- **Fecha de retest:** <AAAA-MM-DD>
- **Estado tras retest:** <Pendiente/Corregido/Mitigado parcialmente>

## Riesgo residual
<Si queda algo aceptado temporalmente, quién lo aprueba y hasta cuándo.>
