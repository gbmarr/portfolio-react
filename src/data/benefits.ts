import type { Benefit } from './types'

// Beneficios de tener un sitio web para el cliente. Copy en segunda persona,
// frases cortas y sin promesas vacías (ver spec: tono del sitio).
export const benefits: Benefit[] = [
  {
    id: 'encontran',
    icon: 'search',
    title: 'Te encuentran cuando te buscan',
    description:
      'Casi la mitad de las búsquedas en Google son de servicios cerca: si tenés sitio, el cliente que te busca llega a tu puerta.',
  },
  {
    id: 'horas',
    icon: 'clock',
    title: 'Trabaja las 24 horas',
    description:
      'Tu sitio no cierra, no se toma feriados y sigue presentando tu negocio mientras vos dormís o trabajás.',
  },
  {
    id: 'confianza',
    icon: 'shield',
    title: 'Transmitís confianza',
    description:
      'Un sitio prolijo te hace lucir serio y profesional, y te diferencia de los que todavía no tienen.',
  },
  {
    id: 'trabajo',
    icon: 'briefcase',
    title: 'Mostrás tu trabajo',
    description:
      'Portfolio, clientes y resultados: el que duda, mira lo que hiciste y decide más rápido.',
  },
  {
    id: 'consultas',
    icon: 'chat',
    title: 'Respondés menos consultas repetidas',
    description:
      'Horarios, zona y cómo trabajás los explica el sitio. Vos te dedicás a lo que sabe tu rubro.',
  },
  {
    id: 'competencia',
    icon: 'users',
    title: 'No perdés con tu competencia',
    description:
      'Si tu competidor tiene web y vos no, el cliente elige mirar lo que está a un clic.',
  },
]