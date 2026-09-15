// Copia del sitio en español (único idioma).
// Estado transitorio: conserva los textos del portfolio original que las
// secciones restantes necesitan. En la Fase 2 se reescribirá con el copy
// definitivo del sitio de servicios.

export const copy = {
  nav: {
    main: 'Navegación principal',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    projects: 'Proyectos',
    contact: 'Contacto',
  },
  hero: {
    greeting: 'Hola, soy',
    viewProjects: 'Ver proyectos',
    contactMe: 'Contáctame',
    photo: 'Foto de perfil',
  },
  projects: {
    eyebrow: 'Proyectos',
    title: 'Algunos de mis proyectos',
    subtitle: 'Una muestra de mi trabajo',
    demo: 'Demo',
    code: 'Código',
    screenshot: 'Captura de',
    technologies: 'Tecnologías',
    roles: {
      own: 'Proyecto propio',
      partnership: 'Proyecto en sociedad',
      collaboration: 'Colaboración en equipo',
    },
  },
  contact: {
    eyebrow: 'Contacto',
    title: '¿Hablamos?',
    subtitle: 'Si tienes una oportunidad o proyecto en mente, escríbeme.',
    sendEmail: 'Enviar email',
  },
  seo: {
    title: 'Gabriel Marrero | Desarrollador Fullstack Junior',
    description:
      'Portfolio de Gabriel Marrero, desarrollador fullstack junior. Proyectos, habilidades y experiencia.',
    locale: 'es_ES',
  },
} as const