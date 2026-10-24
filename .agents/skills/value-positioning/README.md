# value-positioning

Skill para analizar y optimizar el posicionamiento, el copy y la percepción de valor de
una oferta, producto, servicio o sitio web — aplicando el patrón "dolor del cliente +
especificidad + autoridad + escasez + precio como señal de valor" en vez del enfoque
tradicional de "lista de características + disponibilidad total + precio bajo".

## Origen
Basada en el análisis de dos anuncios reales para el mismo servicio (clases de baile):
uno tradicional que muestra necesidad (30 €/hora, disponible para todos, sin compromiso)
y uno enfocado en el dolor del cliente que cobra el doble con más demanda (60 €/hora,
cupos limitados, autoridad específica, mensaje dirigido a un dolor concreto).

## Estructura
```
value-positioning/
├── SKILL.md                                   # Framework, modos, ruteo, reglas de oro, límites éticos
├── README.md
├── references/
│   ├── 01-fundamentos-percepcion-valor.md     # Ecuación de valor, por qué la necesidad destruye valor
│   ├── 02-niveles-de-conciencia-del-mercado.md
│   ├── 03-dolor-vs-caracteristicas.md         # PAS, cómo encontrar el dolor real
│   ├── 04-escasez-autoridad-prueba-social.md  # Cialdini aplicado, solo con elementos reales
│   ├── 05-precio-como-senal-de-valor.md
│   ├── 06-senales-necesidad-vs-valor.md       # Checklist central para auditorías
│   ├── 07-especificidad-y-nicho.md
│   ├── 08-aplicacion-web-landing.md           # Estructura de página, qué revisar en un sitio
│   └── 09-nuevo-vs-existente.md               # Cómo adaptar el proceso según el caso
├── assets/
│   ├── audit-report-template.md               # Informe de auditoría (proyecto existente)
│   └── offer-canvas.md                        # Diseño de posicionamiento (proyecto nuevo)
└── scripts/
    └── copy-scan.py                            # Escaneo heurístico de señales necesidad/valor
```

## Uso
- "Auditá mi sitio/anuncio/landing" → modo auditoría, usa `assets/audit-report-template.md`.
- "Estoy por lanzar X, ayudame a definir el posicionamiento" → modo diseño, usa `assets/offer-canvas.md`.
- "¿Por qué no vendo / por qué no puedo subir el precio?" → `references/05` y `references/06`.
- `python3 scripts/copy-scan.py archivo.html` para una primera pasada heurística sobre un texto o HTML guardado localmente.

## Límite ético (importante)
La skill nunca recomienda fabricar escasez, autoridad o prueba social falsas. Solo trabaja
con elementos reales y verificables; cuando no existen, lo señala como una brecha de negocio
a construir, no como algo para simular en el copy.

## Instalación
Copiar junto al resto de las skills en `.agents/skills/`:
```
.agents/skills/
├── app-security/
├── red-team/
└── value-positioning/
```
