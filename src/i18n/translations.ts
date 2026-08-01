export type Language = 'es' | 'en'

export interface Translation {
  nav: {
    main: string
    language: string
    openMenu: string
    closeMenu: string
    about: string
    skills: string
    projects: string
    contact: string
  }
  hero: {
    greeting: string
    viewProjects: string
    contactMe: string
  }
  about: {
    eyebrow: string
    title: string
    subtitle: string
    experience: string
    education: string
    present: string
  }
  skills: {
    eyebrow: string
    title: string
  }
  projects: {
    eyebrow: string
    title: string
    subtitle: string
    demo: string
    code: string
    screenshot: string
    technologies: string
  }
  contact: {
    eyebrow: string
    title: string
    subtitle: string
    sendEmail: string
  }
  skillLevels: {
    beginner: string
    intermediate: string
    advanced: string
  }
  seo: {
    title: string
    description: string
  }
}

export const translations: Record<Language, Translation> = {
  es: {
    nav: {
      main: 'Navegación principal',
      language: 'Cambiar idioma',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      about: 'Sobre mí',
      skills: 'Habilidades',
      projects: 'Proyectos',
      contact: 'Contacto',
    },
    hero: {
      greeting: 'Hola, soy',
      viewProjects: 'Ver proyectos',
      contactMe: 'Contáctame',
    },
    about: {
      eyebrow: 'Sobre mí',
      title: 'Mi trayectoria',
      subtitle: 'Mi perfil, experiencia y formación',
      experience: 'Experiencia',
      education: 'Educación',
      present: 'Presente',
    },
    skills: {
      eyebrow: 'Habilidades',
      title: 'Tecnologías y herramientas',
    },
    projects: {
      eyebrow: 'Proyectos',
      title: 'Algunos de mis proyectos',
      subtitle: 'Una muestra de mi trabajo',
      demo: 'Demo',
      code: 'Código',
      screenshot: 'Captura de',
      technologies: 'Tecnologías',
    },
    contact: {
      eyebrow: 'Contacto',
      title: '¿Hablamos?',
      subtitle: 'Si tienes una oportunidad o proyecto en mente, escríbeme.',
      sendEmail: 'Enviar email',
    },
    skillLevels: {
      beginner: 'Nivel principiante',
      intermediate: 'Nivel intermedio',
      advanced: 'Nivel avanzado',
    },
    seo: {
      title: 'Gabriel Marrero | Desarrollador Fullstack Junior',
      description:
        'Portfolio de Gabriel Marrero, desarrollador fullstack junior. Proyectos, habilidades y experiencia.',
    },
  },
  en: {
    nav: {
      main: 'Main navigation',
      language: 'Change language',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      contact: 'Contact',
    },
    hero: {
      greeting: "Hi, I'm",
      viewProjects: 'View projects',
      contactMe: 'Contact me',
    },
    about: {
      eyebrow: 'About me',
      title: 'My journey',
      subtitle: 'My profile, experience and education',
      experience: 'Experience',
      education: 'Education',
      present: 'Present',
    },
    skills: {
      eyebrow: 'Skills',
      title: 'Technologies and tools',
    },
    projects: {
      eyebrow: 'Projects',
      title: 'Some of my projects',
      subtitle: 'A sample of my work',
      demo: 'Demo',
      code: 'Code',
      screenshot: 'Screenshot of',
      technologies: 'Technologies',
    },
    contact: {
      eyebrow: 'Contact',
      title: "Let's talk?",
      subtitle: 'If you have an opportunity or a project in mind, write to me.',
      sendEmail: 'Send email',
    },
    skillLevels: {
      beginner: 'Beginner level',
      intermediate: 'Intermediate level',
      advanced: 'Advanced level',
    },
    seo: {
      title: 'Gabriel Marrero | Junior Fullstack Developer',
      description:
        'Portfolio of Gabriel Marrero, junior fullstack developer. Projects, skills and experience.',
    },
  },
}
