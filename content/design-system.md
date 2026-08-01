# Design System: Dark & Modern

> Selected style: **Option A "Dark & Modern"** (confirmed by the developer during the content questionnaire, Phase 2).
> This document is the single source of truth for the visual language of the portfolio.
> Design tokens are implemented in `src/index.css` under the `@theme` block (Tailwind CSS v4).

## 1. Palette

Dark charcoal base with vibrant cyan/violet accents and glassmorphism surfaces.

| Token             | Value    | Usage                                        |
| ----------------- | -------- | -------------------------------------------- |
| `background`      | `#0f172a`| Page background (dark charcoal navy)         |
| `surface`         | `#1e293b`| Cards, sections, raised surfaces             |
| `surface-light`   | `#334155`| Hover states, borders, secondary surfaces    |
| `border`          | `#334155`| Hairline borders and dividers                |
| `text`            | `#f8fafc`| Primary text (near-white)                    |
| `text-muted`      | `#94a3b8`| Secondary text, captions, labels             |
| `accent`          | `#22d3ee`| Primary accent (cyan) — CTAs, highlights     |
| `accent-violet`   | `#8b5cf6`| Secondary accent (violet) — gradients, links |

Accent usage rules:
- Cyan (`accent`) is the **primary** interactive color (buttons, focus rings, active nav).
- Violet (`accent-violet`) is the **secondary** accent, used sparingly for gradient pairings, link hovers, and glow effects.
- Both accents must preserve at least AA contrast on `background`/`surface`.

## 2. Typography

| Role      | Font          | Weights             | Fallback stack                     |
| --------- | ------------- | ------------------- | ---------------------------------- |
| Display   | Space Grotesk | 500, 600, 700       | `Inter, ui-sans-serif, sans-serif` |
| Body      | Inter         | 400, 500, 600       | `ui-sans-serif, system-ui`         |

Type scale (Tailwind defaults, mobile-first):
- **Hero title**: `text-4xl` → `sm:text-5xl` → `lg:text-6xl`, Space Grotesk 700.
- **Section heading**: `text-2xl` → `sm:text-3xl`, Space Grotesk 600.
- **Body / paragraph**: `text-base` (16px), leading-relaxed, Inter 400.
- **Small / meta / labels**: `text-sm`, Inter 500, `text-muted`.

## 3. Spacing & Layout

- Layout container: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8` (shared `Container` component).
- Vertical rhythm: sections use `py-20 sm:py-24`.
- Card padding: `p-6 sm:p-8`.
- Gap between grid items: `gap-6 sm:gap-8`.
- Border radius: `rounded-xl` for cards, `rounded-full` for pills/buttons.

## 4. Components

### Button
- **Primary**: background `accent`, text `background`, `font-semibold`, rounded-full, hover raises brightness + glow shadow (`shadow-glow`).
- **Secondary/Outline**: transparent background, 1px border `border-color`, text `text`, hover border-accent + text-accent.
- Focus visible ring: `ring-2 ring-accent/50 ring-offset-2 ring-offset-background`.

### Container
- Centered content wrapper with responsive horizontal padding (see Spacing & Layout).

### Section
- Semantic `<section>` with `py-20 sm:py-24`, optional `id` for anchor navigation, background `surface` alternation or transparent.

### SectionHeading
- Eyebrow label (optional): `text-sm uppercase tracking-widest text-accent`.
- Title: Space Grotesk, gradient text (`accent` → `accent-violet`) on desktop, solid `text` on mobile.
- Optional subtitle below in `text-muted`.

### ProjectCard
- Surface background, `rounded-xl`, 1px border `border-color`.
- Screenshot area: `aspect-video`, muted placeholder with project initials when no screenshot.
- Title (Space Grotesk 600), description (`text-muted`), technology `SkillBadge` list.
- Links: demo (accent) and repository (text) with external icon.
- Hover: lift (`-translate-y-1`), border-accent/40, `shadow-glow`.

### SkillBadge
- Rounded-full pill: `bg-surface-light/60`, 1px border, `text-sm text-text-muted`.
- Optional level dot: colored by proficiency (beginner muted, intermediate accent, advanced violet).
- Hover: border-accent/50 text-text.

## 5. Motion

- **Scroll reveal**: `useScrollReveal` hook / `Reveal` component — fades + translates content into view on first intersection (IntersectionObserver), respects `prefers-reduced-motion` (no animation).
- **Hover transitions**: 150–200ms ease; transform and color transitions on interactive elements.
- **Glow**: `shadow-glow` (cyan) and `shadow-glow-violet` for hero accents and card hovers.

## 6. Accessibility

- Minimum AA contrast for all text/background pairs.
- Visible focus states on all interactive elements.
- Motion respects `prefers-reduced-motion`.
- Semantic HTML (section, nav, h1-h3 hierarchy).
