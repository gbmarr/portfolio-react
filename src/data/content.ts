import type { Language } from '../i18n/translations'
import { useLanguage } from '../i18n/LanguageContext'
import { profile } from './profile'
import { projects } from './projects'
import { skills } from './skills'
import { experience } from './experience'

// Localized prose for the data layer. Structural data (names, technologies,
// URLs, dates) lives in the data files as the single source of truth; only
// user-visible copy is translated here per language.
export interface LocalizedProfile {
  role: string
  tagline: string
  bio: string
}

export interface LocalizedExperienceItem {
  title: string
  organization: string
  achievements: string[]
}

export interface Content {
  profile: LocalizedProfile
  projects: Record<string, string>
  skillCategories: Record<string, string>
  work: Record<string, LocalizedExperienceItem>
  education: Record<string, LocalizedExperienceItem>
  certifications: Record<string, LocalizedExperienceItem>
}

function toLocalizedItems(items: typeof experience.work): Record<string, LocalizedExperienceItem> {
  return Object.fromEntries(
    items.map((item) => [
      item.id,
      { title: item.title, organization: item.organization, achievements: item.achievements },
    ])
  )
}

export const content: Record<Language, Content> = {
  es: {
    profile: {
      role: profile.role,
      tagline: profile.tagline ?? profile.bio,
      bio: profile.bio,
    },
    projects: Object.fromEntries(projects.map((project) => [project.id, project.description])),
    skillCategories: Object.fromEntries(skills.map((category) => [category.id, category.category])),
    work: toLocalizedItems(experience.work),
    education: toLocalizedItems(experience.education),
    certifications: toLocalizedItems(experience.certifications),
  },
  en: {
    profile: {
      role: 'Junior Fullstack Developer',
      tagline:
        'Self-taught, always learning. I build fullstack web applications for real projects and clients.',
      bio: 'I am a self-taught junior fullstack developer, constantly learning. I had my first contact with programming in 2023, started personal projects in 2024, and since 2026 I have been part of real projects for clients. I enjoy learning new things every day, different types of tasks or technologies, and understanding concepts and architectures. I am looking to grow in a team as a junior developer and also take on freelance projects. I have basic English, with the ability to read technical documentation.',
    },
    projects: {
      'pasion-mundialista':
        'Web app that ran during the 2026 World Cup, where users competed for an Argentina jersey and the official tournament ball through a points system for predicting exact or partial match results. It included Google login and Mercado Pago payment integration.',
      simplehc:
        'Management system for health professionals that centralizes medical consultations, appointment scheduling, agenda, diagnosis export, patient administration and clinical records. I handled issue resolution, functionality adjustments and Google Login integration on an already advanced project.',
      dranes:
        'Management system for personal training businesses, currently in development. It centralizes training plans and client management — history, progress, set planning, sessions and complete plans for different goals — replacing notebooks, spreadsheets and PDFs.',
    },
    skillCategories: {
      frontend: 'Frontend',
      backend: 'Backend',
      tools: 'Tools',
    },
    work: {
      'dranes-mvp': {
        title: 'MVP Development',
        organization: 'Own venture (Dranes)',
        achievements: [
          'Management system for personal training with React, Node.js, Prisma, Supabase and Clerk.',
        ],
      },
      'pasion-mundialista': {
        title: 'Fullstack Developer',
        organization: 'Pasión Mundialista (partnership with a development team)',
        achievements: [
          'Development of the 2026 World Cup prediction web app with PHP, JavaScript, PostgreSQL, Docker and Mercado Pago.',
        ],
      },
      simplehc: {
        title: 'Fullstack Developer',
        organization: 'SimpleHC (development team)',
        achievements: [
          'Collaboration on issue resolution, functionality adjustments and Google Login integration.',
        ],
      },
    },
    education: {
      'tecnicatura-unicen': {
        title: 'University Technician in Information Technology Application Development',
        organization: 'UNICEN',
        achievements: ['In progress.'],
      },
    },
    certifications: {
      'programa-frontend-developer': {
        title: 'Frontend Developer Program',
        organization: 'Oracle Next Education + Alura',
        achievements: [],
      },
      'formacion-front-end-g6': {
        title: 'Front End G6 Training',
        organization: 'Alura',
        achievements: [],
      },
      'formacion-react': {
        title: 'React Training and Explore React with JavaScript',
        organization: 'Alura',
        achievements: [],
      },
      'formacion-sql-mysql': {
        title: 'SQL with MySQL Training',
        organization: 'Alura',
        achievements: [],
      },
      'formacion-logica-js': {
        title: 'Programming Logic with JavaScript Training',
        organization: 'Alura',
        achievements: [],
      },
      'formacion-principiante': {
        title: 'Beginner Programming Training',
        organization: 'Alura',
        achievements: [],
      },
      'formacion-ia-generativa': {
        title: 'Generative AI Training',
        organization: 'Alura',
        achievements: [],
      },
      'formacion-oci': {
        title: 'Oracle Cloud Infrastructure Training',
        organization: 'Alura',
        achievements: [],
      },
      'certificados-csharp': {
        title: 'C# Certificates Levels 2 and 3',
        organization: 'C# Certification',
        achievements: [],
      },
    },
  },
}

export function useContent(): Content {
  const { language } = useLanguage()
  return content[language]
}
