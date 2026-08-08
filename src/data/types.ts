// Data model types for the portfolio content.
// Follows the TypeScript code style guide: no `any`, PascalCase interfaces, camelCase fields.

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface SocialLink {
  github: string
  linkedin: string
  others?: { label: string; url: string }[]
}

export interface Profile {
  name: string
  role: string
  bio: string
  photo?: string
  location: string
  email: string
  socialLinks: SocialLink
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  demoUrl?: string
  repoUrl?: string
  screenshot?: string
}

export interface Skill {
  name: string
  level: SkillLevel
}

export interface SkillCategory {
  category: string
  skills: Skill[]
}

export interface ExperienceItem {
  title: string
  organization: string
  startDate?: string
  endDate?: string
  achievements: string[]
}

export interface Experience {
  work: ExperienceItem[]
  education: ExperienceItem[]
  certifications: ExperienceItem[]
}
