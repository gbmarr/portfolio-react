---
name: portfolio-design
description: Design system for the portfolio / web services site (Gabriel Marrero), React + Tailwind CSS v4. Activate when building, styling or reviewing any UI component, page or visual element. Provides the exact color tokens, fonts, spacing, elevation and motion rules sourced from src/index.css @theme. Read references/DESIGN.md for the component pattern inventory before writing CSS or JSX.
---

# portfolio-design Design System (Tailwind CSS v4)

Design system del sitio (React 19 + Tailwind CSS v4). **Los tokens viven en `src/index.css` bajo `@theme`** — esa es la fuente única de verdad. No existe `tailwind.config.*`; en Tailwind v4 las clases como `bg-surface`, `text-text`, `shadow-glow` se generan desde esas variables CSS.

## Design Philosophy

- **Dark, cool, industrial** — fondo oscuro `#0f172a`, superficies escalonadas hacia `#334155`, texto casi blanco `#f8fafc`.
- **Elevation con glow** — se usa `shadow-glow` (y `hover:shadow-glow`, `shadow-glow-violet`), no sombras duras ni gradientes.
- **Dos familias** — `Inter` (sans, texto general) y `Space Grotesk` (display, títulos). Nunca mezclar otras.
- **Compact density** — grid base de 4px.
- **Accent cian** — `#22d3ee` para CTAs, links, focus rings, estados activos; `#8b5cf6` (violeta) como acento secundario.
- **Motion sutil** — transiciones 150–300ms, `ease-out`; respetar `prefers-reduced-motion`.

## Color Tokens (src/index.css @theme)

| Clase | Var CSS | Hex | Uso |
|---|---|---|---|
| `bg-background` / `text-text` | `--color-background` | `#0f172a` | Fondo de página, superficie más oscura |
| `bg-surface` | `--color-surface` | `#1e293b` | Cards, paneles |
| `bg-surface-light` | `--color-surface-light` | `#334155` | Superficies elevadas, chips, detalles |
| `border-border` | `--color-border` | `#334155` | Bordes (mismo valor que surface-light) |
| `text-text` | `--color-text` | `#f8fafc` | Texto principal, títulos |
| `text-text-muted` | `--color-text-muted` | `#94a3b8` | Captions, placeholders, secundario |
| `text-accent` / `bg-accent` | `--color-accent` | `#22d3ee` | CTAs, links, focus, acentos |
| `text-accent-violet` | `--color-accent-violet` | `#8b5cf6` | Acento secundario |

## Typography

| Rol | Clase | Familia | Glyph scale típico |
|---|---|---|---|
| Headings (display) | `font-display` | `Space Grotesk` | `text-2xl`…`text-5xl`, semibold |
| Body | `font-sans` | `Inter` | `text-base`, regular |
| Código | `font-mono` (default) | monospace system | `text-sm` |

- `--font-sans: 'Inter'`, `--font-display: 'Space Grotesk'` (definidos en `@theme`).
- Jerarquía: hasta 3–4 tamaños por pantalla; headings bold (600–700), body regular (400).
- Jerarquía secundaria por color (`text-text-muted`) y opacidad, no con más tamaños.

## Spacing & Layout

- **Grid base 4px** — toda dimensión múltiplo de 4 (2, 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128).
- **Container:** `mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8` (componente `src/components/Container.tsx`).
- **Radius:** `rounded-lg` / `rounded-xl` para cards y secciones; `rounded-full` para chips/badges; `rounded-[2rem]` para mockups de teléfono.
- **Cards:** `rounded-xl border border-border bg-surface p-6` con `hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow`.

## Elevation & Motion

- `shadow-glow` (ciano) y `shadow-glow-violet` (violeta) se usan en mockups, chips y hovers de cards. No usar sombras `shadow-md/lg` genéricas.
- Transiciones: `transition-all` / `transition-colors` con `duration-150`…`duration-300`.
- `animate-pulse` para estados de carga de KPIs.
- Hover de links/interactivos: `hover:text-accent` o `hover:border-accent/40`.

## Do / Don't

- ✅ Usar solo tokens del `@theme`; extender el design token antes de inventar hexes.
- ✅ Reutilizar componentes existentes (`src/components/`, `src/components/ui/`): Button, Card, Badge, Container, FormField, Navbar, Footer.
- ✅ Múltiplos de 4 para spacing; radius de la escala declarada.
- ✅ `font-display` para títulos, `font-sans` para cuerpo.
- ❌ No introducir colores fuera de la paleta (ni `#111111`, ni Tailwind defaults).
- ❌ No mezclar fuentes fuera de Inter/Space Grotesk.
- ❌ No usar gradientes ni sombras duras; el glmow es la elevación.
- ❌ No valores arbitrarios de spacing/radius fuera de la escala.

## Component Patterns

El inventario completo (70 patrones reales con clases Tailwind y rutas de archivo) está en **`references/DESIGN.md` → Section 4. Component Stylings**. Antes de crear un componente, revisar ese inventario y reutilizar.

Conceptos clave: `Container` (max-w-5xl), cards `bg-surface border-border rounded-xl`, navbar `sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur`, inputs `bg-surface border-border rounded-lg focus:border-accent`, chips `rounded-full bg-surface px-3`.