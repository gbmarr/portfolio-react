import type { ProjectStatus, ProjectType, StageStatus } from '../lib/types'

/** Textos en español de los paneles (admin y cliente). */
export const panelCopy = {
  login: {
    title: 'Accedé con tu email',
    subtitle: 'Te enviamos un enlace mágico para ver el estado de tus proyectos.',
    email: 'Email',
    magicLink: 'Enviarme un enlace mágico',
    sending: 'Enviando…',
    emailRequired: 'Ingresá tu email para enviarte el enlace.',
    magicSent: 'Listo. Revisá tu email: te enviamos un enlace de acceso.',
    notConfigured: 'El panel todavía no está configurado en este entorno.',
    backToSite: 'Volver al sitio',
  },
  adminLogin: {
    title: 'Acceso de gestión',
    subtitle: 'Ingresá con tu cuenta de administrador.',
    email: 'Email',
    password: 'Contraseña',
    submit: 'Entrar',
    sending: 'Enviando…',
    passkey: 'Entrar con passkey',
    passkeyError: 'No se pudo iniciar con passkey. Probá de nuevo o usá email y contraseña.',
    invalidCredentials: 'Credenciales inválidas. Verificá el email y la contraseña.',
    notConfigured: 'El panel todavía no está configurado en este entorno.',
    backToSite: 'Volver al sitio',
  },
  security: {
    nav: 'Seguridad',
    title: 'Seguridad',
    intro:
      'Gestioná tus claves de acceso (passkeys): entrás con la biometría de tu dispositivo sin escribir la contraseña.',
    howItWorks: 'Usá Windows Hello, Face ID o Touch ID al entrar desde el acceso de gestión.',
    register: 'Registrar passkey',
    registering: 'Registrando…',
    registered: 'Passkey registrada.',
    registerError: 'No se pudo registrar la passkey.',
    listTitle: 'Tus claves de acceso',
    listEmpty: 'Todavía no tenés passkeys registradas.',
    registeredOn: 'Registrada el',
    delete: 'Eliminar',
    deleting: 'Eliminando…',
    deleted: 'Passkey eliminada.',
    deleteError: 'No se pudo eliminar la passkey.',
  },
  loading: 'Cargando…',
  error: {
    generic: 'Algo salió mal. Probá de nuevo en unos minutos.',
  },
  nav: {
    dashboard: 'Resumen',
    projects: 'Proyectos',
    clients: 'Clientes',
    messages: 'Mensajes',
    myProjects: 'Mis proyectos',
    backToSite: 'Ver sitio',
    signOut: 'Salir',
  },
  client: {
    brand: 'Mi proyecto',
    projectsTitle: 'Mis proyectos',
    projectsIntro: 'Estos son los proyectos que tenemos en marcha con vos.',
    emptyProjects: 'Todavía no tenés proyectos cargados.',
    progress: (done: number, total: number): string => `${done} de ${total} etapas completadas`,
    backLink: '← Mis proyectos',
    notFound: 'No encontramos este proyecto.',
    timeline: 'Avances',
    timelineEmpty: 'Todavía no hay avances para mostrar.',
    statusLabel: 'Estado',
    deadline: 'Entrega estimada',
    stageReview: 'Esta etapa está en revisión. Aprobala o contanos qué ajustar.',
    approve: 'Aprobar',
    reject: 'Rechazar',
    commentPlaceholder: 'Comentario (opcional)',
    sendDecision: 'Enviar decisión',
    deciding: 'Enviando…',
    cancel: 'Cancelar',
    decisionSent: 'Decisión enviada.',
    youApproved: 'Aprobaste esta etapa',
    youRejected: 'Rechazaste esta etapa',
    decisionError: 'No se pudo enviar la decisión.',
    brief: {
      title: '¿Qué vamos a necesitar?',
      intro:
        'Completá estos datos para arrancar sin idas y vueltas. Podés guardar y seguir después.',
      progress: (done: number, total: number): string =>
        `${done} de ${total} campos obligatorios completados`,
      save: 'Guardar',
      saving: 'Guardando…',
      saved: 'Guardamos tus respuestas.',
      saveError: 'No se pudieron guardar tus respuestas.',
      statusCompleted: 'Completado',
      statusPending: 'Pendiente',
      yesnoPlaceholder: 'Elegí…',
      yesnoYes: 'Sí',
      yesnoNo: 'No',
    },
  },
} as const

export type BadgeTone = 'neutral' | 'progress' | 'review' | 'done' | 'blocked' | 'danger'

export const statusLabels = {
  project: {
    lead: 'Lead',
    en_progreso: 'En progreso',
    pausado: 'Pausado',
    completado: 'Completado',
    cancelado: 'Cancelado',
  } satisfies Record<ProjectStatus, string>,
  stage: {
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
    revision: 'En revisión',
    completada: 'Completada',
    bloqueada: 'Bloqueada',
  } satisfies Record<StageStatus, string>,
  type: {
    web: 'Sitio web',
    landing: 'Landing',
    app: 'App',
    diseno: 'Diseño',
    mantenimiento: 'Mantenimiento',
    otro: 'Otro',
  } satisfies Record<ProjectType, string>,
} as const

export const statusTones = {
  project: {
    lead: 'neutral',
    en_progreso: 'progress',
    pausado: 'blocked',
    completado: 'done',
    cancelado: 'danger',
  } satisfies Record<ProjectStatus, BadgeTone>,
  stage: {
    pendiente: 'neutral',
    en_progreso: 'progress',
    revision: 'review',
    completada: 'done',
    bloqueada: 'blocked',
  } satisfies Record<StageStatus, BadgeTone>,
} as const
