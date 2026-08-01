# Track: Build the initial portfolio website

## Overview

Create the initial version of the personal portfolio website for a Junior Fullstack Developer. The site is a static, bilingual (Spanish/English) React + TypeScript application with a dark, modern visual style. It showcases the developer's projects, skills, and experience, and provides easy ways for recruiters and potential clients to get in touch.

## Context

- **Product:** Junior Fullstack Developer Portfolio (see `conductor/product.md`).
- **Guidelines:** Dark & modern branding, friendly prose, mobile-first, simplicity & clarity (see `conductor/product-guidelines.md`).
- **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS. Static site. Hosted on Vercel/Netlify (see `conductor/tech-stack.md`).

## Content Questionnaire (pre-implementation)

Before implementing, the developer MUST answer a questionnaire to collect the real content for the portfolio. The questionnaire covers:

1. **Personal info:** Full name, role/title, short bio, photo/avatar, location, email.
2. **Social links:** GitHub, LinkedIn, and any other relevant profiles.
3. **Projects:** For each project — name, description (problem → approach → result), technologies, live demo URL, repository URL, and a screenshot image.
4. **Skills:** Technical skills grouped by category (languages, frameworks, tools) with proficiency levels.
5. **Experience & education:** Work experience, education, and certifications.
6. **Visual preferences:** Selection among the proposed visual styles (see below).

## Visual Style Proposals

Three visual directions are proposed. The developer selects one during the content questionnaire phase; the recommended option is **A**.

### Option A — "Dark & Modern" (Recommended)

- Dark charcoal background (`#0f172a`-style) with a vibrant accent (cyan/violet).
- Glassmorphism cards, subtle glow, and soft shadows.
- Large bold headings with a modern sans-serif stack (e.g., Inter/Space Grotesk).
- Animated scroll-reveal effects.

### Option B — "Minimal Light"

- Clean white/off-white background with one accent color.
- Generous whitespace, thin borders, refined typography.
- Subtle hover effects only; no heavy animation.

### Option C — "Bold Gradient"

- Dark base with bold gradient accents (purple → pink → orange).
- Gradient text for headings, strong geometric shapes.
- Energetic animations and hover transforms.

## Functional Requirements

- **FR-1 Hero:** A hero section with the developer's name, role, and a clear call to action (e.g., "View Projects", "Contact Me").
- **FR-2 About & Experience:** A section with a short bio, work experience, education, and certifications.
- **FR-3 Skills:** A section visualizing technical skills grouped by category with proficiency levels.
- **FR-4 Projects showcase:** Project cards with screenshot, description, tech stack tags, and links to the live demo and repository.
- **FR-5 Contact:** A contact section with email, GitHub, LinkedIn links (and optionally a contact form stub).
- **FR-6 Navigation:** A sticky navigation bar with smooth scrolling to sections.
- **FR-7 Bilingual:** Spanish/English content with a language toggle (default based on browser language).
- **FR-8 Animations:** Smooth scroll-reveal animations and hover effects.
- **FR-9 Config-driven content:** All content is stored in typed configuration/data files so it is easy to update.
- **FR-10 SEO:** Semantic HTML, meta description, Open Graph tags, and a clear heading hierarchy.

## Non-Functional Requirements

- **NFR-1:** Written in TypeScript with strict mode; follows the project code style guides.
- **NFR-2:** Fully responsive, mobile-first design.
- **NFR-3:** Fast-loading and performant (Lighthouse performance target 90+).
- **NFR-4:** SEO friendly with proper meta tags.
- **NFR-5:** Deployable to Vercel/Netlify with one click.

## Acceptance Criteria

- [ ] The site loads and renders all core sections (Hero, About, Skills, Projects, Contact).
- [ ] Navigation scrolls smoothly to each section; navbar is sticky.
- [ ] Projects show screenshot, description, tech stack, and working repo/demo links.
- [ ] Content is available in Spanish and English with a working language toggle.
- [ ] The site is fully responsive (mobile, tablet, desktop).
- [ ] TypeScript strict mode compiles without errors; lint and format pass.
- [ ] Test suite passes with coverage >80%.
- [ ] The site is deployed and publicly accessible.

## Out of Scope

- Blog/CMS functionality.
- Backend services or database.
- Authentication or admin dashboard.
- Contact form backend integration (a form service can be added later).
