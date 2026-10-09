import type { EstimateTierId } from './estimate'

export type BriefFieldKind = 'text' | 'color' | 'url' | 'longtext' | 'yesno' | 'chips' | 'select'

export interface BriefField {
  /** Id único dentro del template. */
  id: string
  label: string
  hint?: string
  kind: BriefFieldKind
  required: boolean
  /** Opciones para los kinds 'chips' y 'select'. */
  options?: string[]
}

export interface BriefSection {
  id: string
  title: string
  fields: BriefField[]
}

export interface BriefTemplate {
  serviceType: EstimateTierId
  sections: BriefSection[]
  /** Secciones condicionales por extra (keyed por id de estimateExtras). */
  extraSections: Partial<Record<string, BriefSection>>
}

const objetivoOptions = [
  'Conseguir más clientes',
  'Mostrar mis servicios',
  'Vender online',
  'Recibir consultas',
  'Generar confianza',
  'Posicionar mi marca',
]

const ctaOptions = [
  'Escribir por WhatsApp',
  'Llamar',
  'Completar formulario',
  'Comprar',
  'Pedir turno',
  'Reservar',
  'Suscribirse',
  'Ver el catálogo',
]

const tipografiaOptions = [
  'Inter',
  'Montserrat',
  'Poppins',
  'Roboto',
  'Lato',
  'Raleway',
  'Playfair Display',
  'Oswald',
  'Nunito',
  'Merriweather',
]

const idiomasOptions = [
  'Español',
  'Inglés',
  'Portugués',
  'Francés',
  'Italiano',
  'Alemán',
]

const linksExternosSection: BriefSection = {
  id: 'archivos',
  title: 'Archivos y links',
  fields: [
    {
      id: 'links_externos',
      label: 'Links de Drive/Dropbox',
      hint: 'Pegá acá links a imágenes, documentos o todo lo que quieras que veamos.',
      kind: 'longtext',
      required: false,
    },
  ],
}

const landingSections: BriefSection[] = [
  {
    id: 'negocio',
    title: 'Datos del negocio',
    fields: [
      { id: 'nombre', label: 'Nombre del negocio o marca', kind: 'text', required: true },
      { id: 'sector', label: '¿A qué se dedica?', kind: 'text', required: true },
      {
        id: 'descripcion_corta',
        label: 'Descripción breve de lo que hacés',
        hint: 'La usamos para el texto principal de la página.',
        kind: 'longtext',
        required: true,
      },
    ],
  },
  {
    id: 'objetivo',
    title: 'Objetivo y CTA principal',
    fields: [
      {
        id: 'objetivo',
        label: '¿Qué querés lograr con esta página?',
        hint: 'Elegí las que apliquen o agregá la tuya.',
        kind: 'chips',
        options: objetivoOptions,
        required: true,
      },
      {
        id: 'cta_principal',
        label: 'Acción principal que buscás del visitante',
        hint: 'Elegí las que apliquen o agregá la tuya.',
        kind: 'chips',
        options: ctaOptions,
        required: true,
      },
    ],
  },
  {
    id: 'identidad',
    title: 'Identidad de marca',
    fields: [
      { id: 'color_principal', label: 'Color principal', hint: 'Cargá el color de tu marca.', kind: 'color', required: true },
      { id: 'color_secundario', label: 'Color secundario', kind: 'color', required: false },
      {
        id: 'tipografia',
        label: 'Tipografía preferida',
        hint: 'Elegí una o "Otra". Si no sabés, la elegimos nosotros.',
        kind: 'select',
        options: tipografiaOptions,
        required: false,
      },
      { id: 'tiene_logo', label: '¿Ya tenés logo?', kind: 'yesno', required: false },
      {
        id: 'logo_link',
        label: 'Logo (link de Drive/Dropbox)',
        hint: 'Subí el archivo a Drive/Dropbox y pegá acá el link.',
        kind: 'url',
        required: false,
      },
      {
        id: 'fotos',
        label: 'Fotos de tu negocio (link de Drive/Dropbox)',
        kind: 'url',
        required: false,
      },
    ],
  },
  {
    id: 'referencias',
    title: 'Referencias',
    fields: [
      {
        id: 'referencias',
        label: 'Páginas o estilos que te gusten',
        hint: 'Pegá links o describí qué te gusta de cada uno.',
        kind: 'longtext',
        required: false,
      },
    ],
  },
]

const institucionalSections: BriefSection[] = [
  ...landingSections,
  {
    id: 'secciones',
    title: 'Secciones del sitio',
    fields: [
      {
        id: 'secciones_deseadas',
        label: '¿Qué secciones querés y qué va en cada una?',
        hint: 'Ej: Inicio, Servicios, Nosotros, Contacto.',
        kind: 'longtext',
        required: true,
      },
    ],
  },
  {
    id: 'historia',
    title: 'Historia y equipo',
    fields: [
      {
        id: 'historia',
        label: 'Contanos sobre tu historia o por qué existe la empresa',
        kind: 'longtext',
        required: false,
      },
      {
        id: 'equipo',
        label: '¿Quiénes integran el equipo o las áreas?',
        hint: 'Los usamos para la sección nosotros.',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'contacto',
    title: 'Datos de contacto',
    fields: [
      { id: 'email_contacto', label: 'Email de contacto', kind: 'text', required: true },
      { id: 'telefono', label: 'Teléfono / WhatsApp', kind: 'text', required: true },
      {
        id: 'direccion',
        label: 'Dirección (si la querés publicar)',
        kind: 'text',
        required: false,
      },
    ],
  },
]

const medidaSections: BriefSection[] = [
  ...institucionalSections,
  {
    id: 'proceso',
    title: 'Proceso de negocio y venta',
    fields: [
      {
        id: 'proceso_venta',
        label: '¿Cómo es tu proceso de venta hoy?',
        hint: 'Ej: presupuesto → seña → entrega.',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'flujo_especial',
        label: 'Pasos especiales que el sistema deba contemplar',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'catalogo',
    title: 'Catálogo',
    fields: [
      {
        id: 'cantidad_items',
        label: '¿Cuántos productos o servicios vas a publicar?',
        hint: 'Número aproximado.',
        kind: 'text',
        required: true,
      },
      { id: 'tiene_precios', label: '¿Ya tenés precios definidos?', kind: 'yesno', required: false },
      {
        id: 'precios_detalle',
        label: '¿Dónde están los precios y descripciones?',
        hint: 'Link a Drive/Dropbox o texto.',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'cobro',
    title: 'Cobro',
    fields: [
      {
        id: 'cuenta_cobro',
        label: 'Cuenta de Mercado Pago u otro medio de cobro',
        kind: 'text',
        required: true,
      },
      { id: 'necesita_envios', label: '¿Necesitás gestionar envíos?', kind: 'yesno', required: false },
      {
        id: 'envios_detalle',
        label: 'Detalle de envíos (zonas, costos, formas)',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'usuarios',
    title: 'Usuarios y roles (si es app)',
    fields: [
      {
        id: 'roles',
        label: '¿Qué tipos de usuarios va a tener el sistema?',
        hint: 'Ej: admin, cliente, vendedor.',
        kind: 'longtext',
        required: false,
      },
      {
        id: 'permisos',
        label: '¿Qué puede hacer cada uno?',
        kind: 'longtext',
        required: false,
      },
    ],
  },
]

const extraSections: Record<string, BriefSection> = {
  blog: {
    id: 'blog_contenido',
    title: 'Contenidos del blog',
    fields: [
      {
        id: 'blog_contenidos',
        label: '¿Vas a proveer los contenidos o los redactamos?',
        kind: 'yesno',
        required: true,
      },
      {
        id: 'blog_temas',
        label: 'Temas o categorías que querés cubrir',
        kind: 'longtext',
        required: false,
      },
      {
        id: 'blog_actualiza',
        label: '¿Quién va a actualizar el blog?',
        kind: 'text',
        required: false,
      },
    ],
  },
  integraciones: {
    id: 'integraciones',
    title: 'Integraciones',
    fields: [
      {
        id: 'sistemas',
        label: '¿Qué sistemas necesitás conectar?',
        hint: 'Mercado Pago, CRM, Google Sheets, etc.',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'api_keys',
        label: '¿Ya tenés cuentas o API keys de esos servicios?',
        kind: 'yesno',
        required: false,
      },
    ],
  },
  multidioma: {
    id: 'multidioma',
    title: 'Sitio en 2 idiomas',
    fields: [
      {
        id: 'idiomas',
        label: '¿Qué idiomas?',
        hint: 'Elegí los que apliquen o agregá el tuyo.',
        kind: 'chips',
        options: idiomasOptions,
        required: true,
      },
      {
        id: 'traducciones_provistas',
        label: '¿Las traducciones las proveés vos?',
        kind: 'yesno',
        required: false,
      },
    ],
  },
  logo: {
    id: 'logo_extra',
    title: 'Logo e identidad',
    fields: [
      {
        id: 'logo_existente',
        label: '¿Ya tenés el logo?',
        kind: 'yesno',
        required: true,
      },
      {
        id: 'logo_archivo',
        label: 'Logo (link de Drive/Dropbox)',
        kind: 'url',
        required: false,
      },
      {
        id: 'marca_descripcion',
        label: 'Si no tenés logo: describí tu marca, rubro y estilo',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  copy: {
    id: 'copy_textos',
    title: 'Textos del sitio',
    fields: [
      {
        id: 'textos_provistos',
        label: '¿Ya tenés los textos escritos?',
        kind: 'yesno',
        required: true,
      },
      {
        id: 'textos_link',
        label: 'Textos (link de Drive/Dropbox)',
        kind: 'url',
        required: false,
      },
      {
        id: 'tono',
        label: '¿Cómo querés que suene?',
        hint: 'Formal, cercano, técnico…',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  ecommerce: {
    id: 'tienda',
    title: 'Tienda online',
    fields: [
      {
        id: 'catalogo_tienda',
        label: '¿Cuántos productos? ¿De dónde salen?',
        hint: 'Link a Drive/Dropbox o descripción.',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'medios_pago',
        label: '¿Qué medios de pago?',
        hint: 'Mercado Pago, transferencia…',
        kind: 'text',
        required: true,
      },
      {
        id: 'envios_tienda',
        label: 'Costos y zonas de envío',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  seo: {
    id: 'seo_extra',
    title: 'SEO y analytics',
    fields: [
      {
        id: 'dominio',
        label: '¿Ya tenés dominio? ¿Cuál?',
        kind: 'text',
        required: false,
      },
      {
        id: 'cuenta_google',
        label: '¿Tenés cuenta de Google (Search Console o Analytics)?',
        kind: 'yesno',
        required: false,
      },
      {
        id: 'palabras_clave',
        label: '¿Qué búsquedas o palabras clave te interesan?',
        kind: 'longtext',
        required: false,
      },
    ],
  },
}

/** Templates de brief por tipo de servicio (tiers del estimador). */
export const briefTemplates: Record<EstimateTierId, BriefTemplate> = {
  landing: {
    serviceType: 'landing',
    sections: [...landingSections, linksExternosSection],
    extraSections,
  },
  institucional: {
    serviceType: 'institucional',
    sections: [...institucionalSections, linksExternosSection],
    extraSections,
  },
  medida: {
    serviceType: 'medida',
    sections: [...medidaSections, linksExternosSection],
    extraSections,
  },
}

/** Template de brief para un tipo de servicio. */
export function getBriefTemplate(serviceType: EstimateTierId): BriefTemplate {
  return briefTemplates[serviceType]
}

/** Secciones de extras presentes en un brief según los ids seleccionados. */
export function getExtraSections(template: BriefTemplate, extraIds: string[]): BriefSection[] {
  return extraIds.flatMap((id) => (template.extraSections[id] ? [template.extraSections[id]] : []))
}

/** Campos obligatorios visibles en un brief (servicio + extras seleccionados). */
export function getRequiredFields(template: BriefTemplate, extraIds: string[]): BriefField[] {
  const sections = [...template.sections, ...getExtraSections(template, extraIds)]
  return sections.flatMap((section) => section.fields.filter((field) => field.required))
}

/** Considera respondido un campo de texto con contenido o un array con al menos un valor. */
export function hasAnswer(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => item.trim().length > 0)
  }
  return typeof value === 'string' && value.trim().length > 0
}

/** Estado auto-calculado: completado si todos los obligatorios tienen respuesta. */
export function computeBriefStatus(
  template: BriefTemplate,
  extraIds: string[],
  answers: Record<string, string | string[]>,
): 'pendiente' | 'completado' {
  const allAnswered = getRequiredFields(template, extraIds).every((field) =>
    hasAnswer(answers[field.id]),
  )
  return allAnswered ? 'completado' : 'pendiente'
}