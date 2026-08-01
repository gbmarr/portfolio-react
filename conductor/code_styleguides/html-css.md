# HTML & CSS Code Style Guide

This guide defines HTML and CSS standards for the project.

## HTML

- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Use one `<h1>` per page; maintain a logical heading hierarchy (`h1` → `h2` → `h3`).
- Provide `alt` text for all meaningful images; empty `alt=""` for decorative images.
- Use `lang` attribute and appropriate meta tags for SEO and accessibility.
- Use `button` for clickable actions; use `a` with `href` for navigation links.
- Indent with 2 spaces; keep markup clean and readable.

## CSS

- This project uses **Tailwind CSS** utility classes; write plain CSS only for global resets, keyframes, and rare custom utilities.
- Use CSS custom properties (variables) for brand colors, spacing, and typography scales.
- Follow a mobile-first approach: base styles for small screens, then `sm:`, `md:`, `lg:` variants.
- Prefer flexbox/grid over floats and absolute positioning for layout.
- Use relative units (`rem`, `%`, `vw/vh`) over fixed pixels where possible for responsive design.
- Group related rules logically; avoid overly specific selectors (`#id`, deep nesting).

## Dark Theme

- Define a dark color palette via CSS variables (background, surface, text, accent).
- Ensure sufficient contrast between text and background (WCAG AA at minimum).
- Use the accent color sparingly for emphasis and interactive elements.

## Anti-patterns (Avoid)

- Inline `style` attributes (use utility classes instead).
- `!important` unless absolutely necessary.
- Over-nesting selectors (Sass/CSS modules) beyond 2-3 levels.
- Large images without lazy loading or responsive `srcset`.
