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
  /** Ciudad/zona donde trabaja, para SEO local. */
  city: string
  email: string
  /** Teléfono en formato de visualización. */
  phone: string
  /** Número para enlaces `wa.me`, en formato internacional sin `+`. */
  whatsappNumber: string
  /** Mensaje predefinido para el enlace de WhatsApp. */
  whatsappMessage: string
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

export interface Service {
  id: string
  name: string
  /** Para quién es (una línea). */
  audience: string
  /** Qué incluye. */
  includes: string[]
  /** Qué NO incluye. */
  excludes: string[]
  /** Plazo estimado. */
  timeline: string
  /** Precio "desde". */
  priceFrom: string
  /** Mensaje de WhatsApp predefinido específico del servicio. */
  whatsappMessage: string
}

export interface CaseStudy {
  id: string
  /** Cliente o "Proyecto propio" (si es caso ficticio declarado). */
  client: string
  /** Rubro del cliente. */
  industry: string
  title: string
  screenshot?: string
  /** Qué necesitaba (1-2 líneas). */
  need: string
  /** Qué hice (1-2 líneas). */
  work: string
  /** Resultado, si existe un dato concreto. */
  result: string
  /** Enlace al sitio en vivo. */
  url?: string
  role?: ProjectRole
}

export interface ProcessStep {
  id: string
  number: number
  title: string
  description: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
}