# portfolio-design DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui, **curado manualmente contra los tokens reales de `src/index.css` (`@theme`)**.
> Frameworks: Tailwind CSS 4.3.3 + React 19.2.8
> Colors: 8 tokens @theme · Fonts: Inter + Space Grotesk · Components: 70
> Icon library: not detected · State: not detected
> Primary theme: dark · Dark mode toggle: no · Motion: subtle

---

## 1. Visual Theme & Atmosphere

This is a **dark-themed** interface with a flat, cool industrial visual language. Elevation is achieved through color/border shifts **plus glow shadows** (`shadow-glow`, `shadow-glow-violet`). Typography pairs **Space Grotesk** (display/headings) with **Inter** (body/UI). Spacing follows a **4px base grid** (compact density), with scale: 2, 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128px. The accent color **#22d3ee** anchors interactive elements (buttons, links, focus rings); **#8b5cf6** is the secondary accent. Motion is subtle — smooth transitions (150-300ms) ease state changes without drawing attention.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| background | `#0f172a` | background | Page background, darkest surface |
| surface | `#1e293b` | surface | Card and panel backgrounds |
| surface-light | `#334155` | surface | Elevated surfaces, chips, details |
| border | `#334155` | border | Borders (same value as surface-light) |
| text | `#f8fafc` | text-primary | Headings and body text |
| text-muted | `#94a3b8` | text-muted | Captions, placeholders, secondary info |
| accent | `#22d3ee` | accent | CTAs, links, focus rings, active states |
| accent-violet | `#8b5cf6` | accent | Secondary accent |

### CSS Variable Tokens (fuente única: `src/index.css` `@theme`)

```css
--color-background: #0f172a;
--color-surface: #1e293b;
--color-surface-light: #334155;
--color-border: #334155;
--color-text: #f8fafc;
--color-text-muted: #94a3b8;
--color-accent: #22d3ee;
--color-accent-violet: #8b5cf6;
--font-sans: 'Inter';
--font-display: 'Space Grotesk';
--shadow-glow: ...;
--shadow-glow-violet: ...;
```


---

## 3. Typography Rules

**Font Stack:**
- **Space Grotesk** — Heading 1, Heading 2, Heading 3 (display)
- **Inter** — Body, Caption
- **monospace system** — Code

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | Space Grotesk | 48px / 3rem | 700 |
| Heading 2 | Space Grotesk | 32px / 2rem | 600 |
| Heading 3 | Space Grotesk | 24px / 1.5rem | 600 |
| Body | Inter | 16px / 1rem | 400 |
| Caption | Inter | 12px / 0.75rem | 400 |
| Code | monospace system | 14px | 400 |

**Typographic Rules:**
- Use **Space Grotesk** (`font-display`) for headings and **Inter** (`font-sans`) for body — never add another font family
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

### Layout (15)

**BenefitCard** — `src/components/BenefitCard.tsx`
- Props: `benefit`
- Key Styles: `rounded-xl`, `bg-surface`, `gap-4`, `text-lg`, `font-display`, `hover:-translate-y-1`
- Animation: tw-transitions: transition-all, duration-200, hover-transforms

```tsx
<svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
```

**CaseCard** — `src/components/CaseCard.tsx`
- Props: `caseStudy`
- Key Styles: `rounded-xl`, `border-accent/40`, `bg-surface`, `gap-5`, `text-xl`, `font-display`, `hover:-translate-y-1`
- Animation: tw-transitions: transition-all, duration-200, hover-transforms

```tsx
<article className="flex h-full flex-col gap-5 rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow sm:p-8">
      <Mockup
        src={caseStudy.screenshot}
        alt={`Captura de ${caseStudy.title}`}
        initials={getInitials(caseStudy.title
```

**Container.test** — `src/components/Container.test.tsx`

**Container** — `src/components/Container.tsx`
- Props: `children`, `className`
- Key Styles: `mx-auto`

```tsx
<div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 ${className}`} {...rest}>
      {children}
    </div>
```

**FAQ** — `src/components/FAQ.tsx`
- Props: `items`
- Key Styles: `rounded-xl`, `bg-surface`, `space-y-4`, `text-lg`, `font-display`, `cursor-pointer`
- Animation: tw-transitions: transition-colors, transition-transform, duration-200

```tsx
<div className="space-y-4">
      {items.map((item
```

**Footer.test** — `src/components/Footer.test.tsx`

**Footer** — `src/components/Footer.tsx`
- Key Styles: `py-8`, `text-sm`, `hover:text-accent`
- Animation: tw-transitions: transition-colors

```tsx
<footer className="border-t border-border py-8">
      <Container>
        <p className="text-center text-sm text-text-muted">{copy.footer.tagline}</p>
        <p className="mt-2 text-center">
          {/* Ancla simple (sin Link
```

**ProcessSteps** — `src/components/ProcessSteps.tsx`
- Props: `steps`
- Key Styles: `rounded-xl`, `bg-surface`, `gap-6`, `text-4xl`, `font-display`

```tsx
<ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step
```

*...and 7 more layout components.*

### Navigation (16)

**Button.test** — `src/components/Button.test.tsx`
- Key Styles: `mt-4`

**CaseCard.test** — `src/components/CaseCard.test.tsx`

**Navbar.test** — `src/components/Navbar.test.tsx`

**Navbar** — `src/components/Navbar.tsx`
- Key Styles: `rounded-md`, `bg-background/80`, `gap-8`, `text-lg`, `font-display`, `backdrop-blur`, `hover:text-accent`
- Animation: tw-transitions: transition-colors
- State: useState

```tsx
<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label={copy.nav.main}>
          <a
            href="#inicio"
            className="font-display text-lg font-semibold text-text hover:text-accent"
          >
            {profile.name}
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item
```

**WhatsAppButton.test** — `src/components/WhatsAppButton.test.tsx`

**AdminDashboard** — `src/pages/admin/AdminDashboard.tsx`
- Props: `loading`, `error`, `kpis`, `briefs`
- Key Styles: `rounded-xl`, `border-red-400/40`, `bg-background/60`, `p-5`, `text-sm`, `font-display`, `hover:border-accent`
- Animation: tw-animate-pulse, tw-transitions: transition-colors
- State: useState

```tsx
<div data-testid={`stat-${label}`} className="rounded-xl border border-border bg-background/60 p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-semibold ${danger ? 'text-red-300' : 'text-text'}`}
      >
        {value}
      </p>
    </div>
```

**AdminLayout** — `src/pages/admin/AdminLayout.tsx`
- Key Styles: `bg-background`, `mx-auto`, `text-sm`, `font-display`, `backdrop-blur`, `hover:text-accent`
- Animation: tw-transitions: transition-colors

```tsx
<div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-text-muted">
              Gestión
            </span>
            <nav className="flex items-center gap-4" aria-label="Panel admin">
              {navItems.map((item
```

**ClientsPage.test** — `src/pages/admin/ClientsPage.test.tsx`
- Props: `listClients`, `useAuth`

```tsx
{
  listClients: vi.fn(
```

*...and 8 more navigation components.*

### Data Display (4)

**Badge.test** — `src/components/ui/Badge.test.tsx`

**Badge** — `src/components/ui/Badge.tsx`
- Props: `children`, `tone`
- Key Styles: `rounded-full`, `px-2.5`, `text-xs`, `font-medium`

```tsx
<span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
```

**ClientsPage** — `src/pages/admin/ClientsPage.tsx`
- Props: `loading`, `error`, `clients`
- Key Styles: `rounded-lg`, `border-red-400/40`, `bg-red-400/10`, `space-y-6`, `text-2xl`, `font-display`, `hover:bg-background/40`
- Animation: tw-animate-pulse, tw-transitions: transition-colors
- State: useState

**ProjectsListPage** — `src/pages/admin/ProjectsListPage.tsx`
- Props: `loading`, `error`, `projects`
- Key Styles: `rounded-full`, `border-red-400/40`, `bg-accent`, `space-y-6`, `text-2xl`, `font-display`, `hover:bg-accent/90`
- Animation: tw-animate-pulse, tw-transitions: transition-colors
- State: useState

### Data Input (13)

**ContactForm.test** — `src/components/ContactForm.test.tsx`
- Props: `fetchMock`, `turnstileOnChange`

```tsx
{
  fetchMock: vi.fn(
```

**ContactForm** — `src/components/ContactForm.tsx`
- Variants: `idle`, `sending`, `success`, `error`
- Props: `onSubmit`, `data`
- Key Styles: `rounded-lg`, `border-accent/40`, `bg-accent/10`, `space-y-5`, `text-sm`, `font-medium`, `opacity-0`
- State: useState, useRef

```tsx
<form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot anti-spam: un bot que lo completa recibe éxito falso. */}
      <input
        type="text"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div>
```

**FormField.test** — `src/components/ui/FormField.test.tsx`

**FormField** — `src/components/ui/FormField.tsx`
- Props: `id`, `label`, `value`, `onValueChange`
- Key Styles: `mb-1.5`, `text-sm`, `font-medium`

```tsx
<div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event
```

**SelectField.test** — `src/components/ui/SelectField.test.tsx`

**SelectField** — `src/components/ui/SelectField.tsx`
- Props: `id`, `label`, `value`, `onValueChange`, `options`, `hideLabel`
- Key Styles: `mb-1.5`, `text-sm`, `font-medium`

```tsx
<div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-sm font-medium text-text ${hideLabel ? 'sr-only' : ''}`}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event
```

**TextAreaField.test** — `src/components/ui/TextAreaField.test.tsx`

**TextAreaField** — `src/components/ui/TextAreaField.tsx`
- Props: `id`, `label`, `value`, `onValueChange`, `hideLabel`
- Key Styles: `mb-1.5`, `text-sm`, `font-medium`

```tsx
<div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-sm font-medium text-text ${hideLabel ? 'sr-only' : ''}`}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event
```

*...and 5 more data input components.*

### Other (22)

**BenefitCard.test** — `src/components/BenefitCard.test.tsx`

**Button** — `src/components/Button.tsx`
- Variants: `primary`, `button`, `submit`, `secondary`, `reset`
- Props: `children`, `variant`, `href`, `type`, `className`, `disabled`, `onClick`
- Animation: tw-transitions: transition-colors, duration-200

```tsx
<a href={href} className={classes}>
        {children}
      </a>
```

**FAQ.test** — `src/components/FAQ.test.tsx`

**HeroMockup.test** — `src/components/HeroMockup.test.tsx`

**HeroMockup** — `src/components/HeroMockup.tsx`
- Variants: `phone`, `desktop`
- Props: `variant`
- Key Styles: `rounded-full`, `bg-surface-light`, `mx-auto`

```tsx
<div
      className={
        isPhone
          ? 'relative mx-auto w-full max-w-[190px] rounded-[2rem] border-4 border-border bg-background p-2 shadow-glow'
          : 'relative overflow-hidden rounded-xl border border-border bg-background shadow-glow'
      }
    >
      {isPhone && (
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-surface-light" aria-hidden="true" />
```

**IndustryChip.test** — `src/components/IndustryChip.test.tsx`
- Props: `computeTooltipPlacement`, `left`, `arrowLeft`

```tsx
{
  computeTooltipPlacement: vi.fn((
```

**IndustryChip** — `src/components/IndustryChip.tsx`
- Props: `item`
- Key Styles: `rounded-full`, `bg-surface`, `px-3`, `text-sm`, `shadow-glow`, `hover:border-accent/40`
- Animation: tw-transitions: transition-colors, transition-opacity, duration-150
- State: useState, useRef

**Mockup.test** — `src/components/Mockup.test.tsx`

*...and 14 more other components.*



---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 2, 4, 8, 10, 12, 20, 48, 120
- **Border radius:** 3px, 4px, 6px, 8px, 12px, 16px
- **Max content width:** 100%
- **Grid usage:** `grid-cols-2`, `col-span-2`
- **Container:** Tailwind `container` class with responsive padding

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

El diseño usa **glow shadows** (no sombras duras): `shadow-glow` (ciano) y `shadow-glow-violet` (violeta) definidos en `@theme`. Combinan elevation por color/bordes con un glow sutil en hovers y mockups.

**Elevation Strategy:**
| Level | Technique | Use |
|---|---|---|
| 0 — Base | `bg-background` | Page background |
| 1 — Raised | `bg-surface` + `border-border` | Cards, panels |
| 2 — Floating | `bg-surface-light` + glow sutil | Chips, mockups, callouts |
| Hover | `hover:shadow-glow` / `hover:border-accent/40` | Cards, links interactivos |


---

## 7. Animation & Motion

This project uses **subtle motion**. Transitions smooth state changes without demanding attention.

### CSS Animations

- `@keyframes animate-pulse`

### Animated Components

- **BenefitCard**: tw-transitions: transition-all, duration-200, hover-transforms
- **Button**: tw-transitions: transition-colors, duration-200
- **CaseCard**: tw-transitions: transition-all, duration-200, hover-transforms
- **FAQ**: tw-transitions: transition-colors, transition-transform, duration-200
- **Footer**: tw-transitions: transition-colors

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use `#22d3ee` (`text-accent`/`bg-accent`) for interactive elements (buttons, links, focus rings)
- Use `#0f172a` (`bg-background`) as the primary page background, `#1e293b` (`bg-surface`) for cards
- Use **Space Grotesk** (`font-display`) for headings and **Inter** (`font-sans`) for body
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use `shadow-glow` / `shadow-glow-violet` for elevation accents — no hard shadows, no gradients
- Use border-radius from the scale: `rounded-lg`, `rounded-xl`, `rounded-full`
- Reuse existing components from Section 4 before creating new ones

### Don'ts

- Don't introduce colors outside the token palette — extend `src/index.css` `@theme` first
- Don't mix font families — Inter + Space Grotesk only
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't add hard box-shadows (`shadow-md/lg`) — use the glow variants
- Don't use gradients — the design uses solid colors only
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't duplicate component patterns — check Section 4 first

### Anti-Patterns (detected from codebase)

- No gradient backgrounds
- No zebra striping on tables/lists
- No hard/drop shadows outside the glow tokens


---

## 9. Responsive Behavior

No breakpoints detected. Consider adding responsive breakpoints to the design system.

---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Container: max-w-5xl, mx-auto
Card: bg-surface, border-border, rounded-xl
Padding: p-6
Hover: -translate-y-1, border-accent/40, shadow-glow
```

### Build a Button

```
Primary: bg-accent, text-background (o text según variante), rounded-lg
Ghost: bg transparent, border var(--border)
Padding: 8px 12px
Radius: 8px
Hover: opacidad 0.9 o hover:bg-accent/90
Focus: ring con #22d3ee
```

### Build a Page Layout

```
Background: #0f172a (bg-background)
Max-width: 100%, centered (Container max-w-5xl)
Grid: 4px base
Responsive: sm: / lg: breakpoints
```

### Build a Stats Card

```
Surface: #1e293b (bg-surface)
Label: #94a3b8 (text-text-muted, 12px, uppercase, tracking-wider)
Value: #f8fafc (text-text, font-display, 24-32px, semibold)
Danger state: text-red-300 (solo para KPIs negativos)
```

### Build a Form

```
Input bg: bg-surface, border-border, rounded-lg
Focus: border-color #22d3ee
Label: text-text, text-sm, font-medium, mb-1.5
Spacing: space-y-5 entre campos
Radius: 8px
```

### General Component

```
1. Read references/DESIGN.md Sections 2-6 for tokens
2. Colors: only from the @theme token palette
3. Font: font-display (Space Grotesk) / font-sans (Inter), type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4 / reutilizar src/components
6. Elevation: shadow-glow en hovers/mockups, sin sombras duras
```
