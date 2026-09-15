// Fuente única de texto del sitio (solo español).
// El copy debe coincidir exactamente con los contratos que firma el cliente.

export const copy = {
  nav: {
    main: 'Navegación principal',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    home: 'Inicio',
    services: 'Servicios',
    cases: 'Trabajos',
    contact: 'Contacto',
  },
  hero: {
    title: 'Sitios web para negocios que necesitan verse profesionales',
    subtitle:
      'Landing pages y sitios institucionales, listos en semanas y con precio claro. Hablamos en tu idioma, sin vueltas técnicas.',
    ctaPrimary: 'Pedí tu presupuesto',
    ctaSecondary: 'Ver trabajos',
  },
  problem: {
    title: '¿Te suena esto?',
    text: 'Si tu negocio no tiene sitio, o el que tiene no se ve bien en el celular, estás perdiendo clientes que te buscan por internet. Y si dependés de alguien más para cada cambio, el sitio se convierte en un problema en vez de una solución.',
  },
  services: {
    eyebrow: 'Servicios',
    title: 'Qué necesitás hoy',
    subtitle: 'Dos opciones claras, sin sorpresas.',
    includesLabel: 'Incluye',
    excludesLabel: 'No incluye',
    timelineLabel: 'Plazo',
    priceFromLabel: 'Desde',
    ctaLabel: 'Pedir presupuesto',
    unsureText: '¿No sabés cuál necesitás? Escribime y te lo digo sin vueltas.',
  },
  benefits: {
    eyebrow: 'Por qué un sitio web',
    title: 'Lo que un sitio web hace por tu negocio',
    subtitle:
      'No es solo "tener presencia": es la forma en que los clientes te encuentran, te eligen y confían en vos.',
  },
  industries: {
    eyebrow: '¿Es para tu rubro?',
    title: 'Estos rubros ya consiguen clientes por internet',
    subtitle: 'Si el tuyo está acá, hoy mismo alguien te está buscando.',
  },
  process: {
    eyebrow: 'Cómo trabajo',
    title: 'Simple, y vos no tenés que hacer nada raro',
    subtitle: 'Cuatro pasos, y en el medio te muestro cómo va tu sitio.',
  },
  cases: {
    eyebrow: 'Trabajos',
    title: 'Casos reales, con contexto',
    subtitle: 'No capturas sueltas: qué necesitaba cada cliente y qué resolvimos.',
    visitSite: 'Ver el sitio',
    needLabel: 'Qué necesitaba',
    workLabel: 'Qué hice',
    resultLabel: 'Resultado',
    honestyNote:
      'Los proyectos personales están declarados como tales. No invento clientes ni resultados: lo que ves es trabajo real, con su contexto.',
    roles: {
      own: 'Proyecto propio',
      partnership: 'Proyecto en sociedad',
      collaboration: 'Colaboración en equipo',
    },
  },
  about: {
    eyebrow: 'Sobre mí',
    title: 'Tu sitio lo hace una persona, no una agencia',
    text: 'Soy Gabriel Marrero, desarrollador web. Trabajo directo con vos: me contás qué necesitás, te digo qué te conviene y te dejo el sitio funcionando con explicaciones claras. Trato directo, precios claros y un solo interlocutor del principio al final.',
    photoAlt: 'Foto de Gabriel Marrero',
  },
  faq: {
    eyebrow: 'Preguntas frecuentes',
    title: 'Lo que todos preguntan antes de encargar un sitio',
    subtitle: 'Si te queda otra duda, escribime y te respondo dentro de las 24 horas.',
  },
  cta: {
    title: '¿Listo para tener un sitio que trabaje por tu negocio?',
    subtitle: 'Pedime presupuesto hoy y te respondo dentro de las 24 horas.',
    button: 'Pedí tu presupuesto',
  },
  contact: {
    eyebrow: 'Contacto',
    title: 'Escribime y arrancamos',
    subtitle: 'Contame qué necesitás y te respondo dentro de las 24 horas.',
    responseTime: 'Te respondo dentro de las 24 horas.',
    whatsappLabel: 'Escribime por WhatsApp',
    form: {
      name: 'Tu nombre',
      email: 'Tu email o WhatsApp',
      message: 'Contame qué necesitás',
      submit: 'Enviar',
      sending: 'Enviando…',
      success: '¡Gracias! Te respondo dentro de las 24 horas.',
      error:
        'Algo salió mal al enviar. Escribime por WhatsApp y lo resolvemos al toque.',
    },
    // [en uso] enlace mailto en la sección Contacto
    sendEmail: 'Enviar email',
  },
  footer: {
    tagline: 'Sitios web para negocios. Hechos por Gabriel Marrero.',
    rights: 'Todos los derechos reservados.',
  },
  seo: {
    title: 'Gabriel Marrero | Sitios web para negocios en Argentina',
    description:
      'Landing pages y sitios institucionales para PyMEs y emprendedores. Diseño a medida, precio claro y listo en semanas. Pedí tu presupuesto.',
    locale: 'es_AR',
    ogImage: 'https://portfolio-blond-beta-46.vercel.app/images/pasion-cap-1.png',
    siteName: 'Gabriel Marrero - Desarrollador Web',
  },
} as const