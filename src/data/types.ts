// Data model types for the site content.
// Follows the TypeScript code style guide: no `any`, PascalCase interfaces, camelCase fields.

export interface SocialLink {
  github: string
  linkedin: string
  others?: { label: string; url: string }[]
}

export interface Profile {
  name: string
  role: string
  bio: string
  tagline?: string
  photo?: string
  location: string
  email: string
  socialLinks: SocialLink
}

export type ProjectRole = 'own' | 'partnership' | 'collaboration'

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  role?: ProjectRole
  demoUrl?: string
  repoUrl?: string
  screenshot?: string
}