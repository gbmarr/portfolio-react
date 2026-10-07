import type { PaymentKind, PaymentStatus, ProjectStatus, ProjectType, StageStatus } from '../lib/types'

/** Textos en español de los paneles (admin y cliente). */
export const panelCopy = {
  login: {
    title: 'Iniciar sesión',
    subtitle: 'Accedé para ver el estado de tus proyectos.',
    email: 'Email',
    password: 'Contraseña',
    submit: 'Entrar',
    magicLink: 'Enviarme un enlace mágico',
    sending: 'Enviando…',
    magicSent: 'Listo. Revisá tu email: te enviamos un enlace de acceso.',
    invalidCredentials: 'Credenciales inválidas. Verificá el email y la contraseña.',
    notConfigured: 'El panel todavía no está configurado en este entorno.',
    backToSite: 'Volver al sitio',
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
    payments: 'Pagos',
    noPayments: 'Todavía no hay pagos cargados.',
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
    paidLabel: 'cobrado',
    pendingLabel: 'pendiente',
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
  payment: {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    vencido: 'Vencido',
  } satisfies Record<PaymentStatus, string>,
  paymentKind: {
    senal: 'Seña',
    saldo: 'Saldo',
    extra: 'Extra',
  } satisfies Record<PaymentKind, string>,
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
  payment: {
    pendiente: 'neutral',
    pagado: 'done',
    vencido: 'danger',
  } satisfies Record<PaymentStatus, BadgeTone>,
} as const
