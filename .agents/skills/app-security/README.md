# app-security

Skill de ingeniería de seguridad de aplicaciones (AppSec) para agentes de IA.

## Estructura
```
app-security/
├── SKILL.md                      # Instrucciones principales, modos de trabajo, ruteo y reglas de oro
├── README.md
├── references/                   # Conocimiento por dominio (cargado bajo demanda)
│   ├── 00-checklist-rapido.md
│   ├── 01-gobernanza-ssdlc.md ... 23-principios-diseno.md
├── assets/
│   ├── report-template.md        # Plantilla de informe de hallazgos
│   └── threat-model-template.md  # Plantilla de modelado de amenazas
└── scripts/
    └── quick-scan.sh             # Escaneo heurístico (grep) de patrones inseguros
```

## Instalación
Copiar la carpeta a `.agents/skills/app-security/` en el proyecto (o al directorio global de skills de tu agente).

## Uso
- "Revisá la seguridad de este módulo/PR" → review con informe.
- "Hacé el threat model de la feature X" → plantilla STRIDE.
- Al escribir código (login, uploads, endpoints, pagos...) el skill aplica los controles correspondientes.
- `scripts/quick-scan.sh ./src` para una primera pasada heurística.

## Mantenimiento
Revisar anualmente contra OWASP Top 10, API Top 10, ASVS, LLM Top 10 y normativa vigente.
