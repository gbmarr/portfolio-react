# React Code Style Guide

This guide defines React-specific coding standards for the project.

## Components

- One component per file, with the file named after the component (e.g., `ProjectCard.tsx`).
- Prefer functional components with hooks over class components.
- Keep components focused on a single responsibility. Extract logic into custom hooks when it grows.
- Use composable, reusable components instead of large monolithic trees.

## Props

- Type all props with TypeScript interfaces (see TypeScript guide).
- Use sensible defaults for optional props.
- Name event handler props with `on` prefix (e.g., `onClick`, `onSubmit`).
- Avoid prop drilling by using composition or context where appropriate.

## State & Hooks

- Use `useState` for local UI state; lift state up only when needed.
- Use `useEffect` sparingly and always declare its dependencies correctly.
- Use `useMemo`/`useCallback` only for genuinely expensive computations or stable references.
- Prefer a single source of truth for data; avoid duplicating derived state.

## Styling (Tailwind CSS)

- Use Tailwind utility classes in JSX; group common patterns into reusable components or `@apply` utilities.
- Keep class strings readable; avoid excessively long inline class lists by extracting sub-components.
- Use CSS variables defined in the theme for brand colors and spacing.

## Accessibility

- Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Provide `alt` text for images and `aria-label` for icon-only buttons.
- Ensure keyboard navigation works for all interactive elements.

## Anti-patterns (Avoid)

- Inline arrow functions in render for expensive handlers when a stable callback is needed.
- Setting state during render.
- Reading/writing DOM directly when React state or refs suffice.
