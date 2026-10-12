# red-team

Skill de evaluación ofensiva **autorizada** de aplicaciones y sistemas, complementaria a `app-security`.

`app-security` define los controles (qué debe tener un sistema). `red-team` aporta la metodología para
validarlos de verdad: perfiles de atacante, cadenas de ataque que combinan fallas menores en un impacto
mayor, planes de prueba, y el bucle de purple team que retroalimenta logging y detección.

## Estructura
```
red-team/
├── SKILL.md                              # Autorización/alcance, límites, fases, ruteo
├── README.md
├── references/
│   ├── 01-metodologia-fases.md           # Perfiles de atacante, fases de un ejercicio
│   ├── 02-cadenas-de-ataque.md           # 14 cadenas tipo con corte y detección
│   ├── 03-authn-authz-abuso.md           # Matriz de pruebas de identidad/autorización
│   ├── 04-logica-negocio-fraude.md       # Abuse cases, race conditions, fraude
│   ├── 05-cloud-cicd-supplychain.md      # Rutas de compromiso en cloud/CI-CD
│   ├── 06-ia-agentes.md                  # Pruebas de prompt injection y abuso de agentes
│   └── 07-deteccion-y-purple-team.md     # Bucle de validación de detección
└── assets/
    ├── plan-de-pruebas.md
    └── informe-cadena-ataque.md
```

## Requisito
Asume o exige autorización explícita del dueño del sistema antes de ejecutar pruebas activas (`SKILL.md`, sección 0).
No genera malware, exploits armados ni herramientas de ataque operativas contra terceros.

## Relación con app-security
Reutiliza el catálogo de `../app-security/references/` para "qué buscar"; esta skill aporta "cómo encadenarlo,
cómo probarlo y cómo reportarlo". Cada hallazgo debería terminar en un fix y un test de regresión en
`app-security`, y cada ataque no detectado en una alerta nueva (`references/07`).

## Instalación
Copiar junto a `app-security` en `.agents/skills/`:
```
.agents/skills/
├── app-security/
└── red-team/
```
