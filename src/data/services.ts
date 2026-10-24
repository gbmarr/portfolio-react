import type { Service } from './types'
import { profile } from './profile'

/**
 * Servicios ofrecidos.
 * El contenido de esta sección debe coincidir exactamente con los contratos
 * que firma el cliente.
 */
export const services: Service[] = [
  {
    id: 'landing',
    name: 'Sitio de una página',
    audience:
      'Para una urgencia, una campaña o un servicio puntual. Ideal si necesitás estar online ya y que el teléfono suene.',
    includes: [
      'Una página enfocada en que te contacten',
      'Botón de llamada y WhatsApp a la vista',
      'Servicios, zona de cobertura y horarios',
      'Formulario y mapa',
      'SEO local básico',
      'Publicado en tu dominio y andando en el celular',
    ],
    requires: [
      'Una charla de 30 minutos',
      'Tus textos base (o los armamos juntos)',
      'Fotos reales de tu trabajo (o coordinamos)',
      'Logo (o te ayudo a definir uno)',
    ],
    timeline: '1 a 2 semanas',
    whatsappMessage:
      'Hola Gabriel, vi tu web y me gustaría pedir un presupuesto para un sitio de una página.',
  },
  {
    id: 'institucional',
    name: 'Sitio profesional completo',
    audience:
      'Para un estudio o un oficio que quiere un sitio permanente: servicios, sobre vos, trabajos y contacto.',
    includes: [
      'Hasta 8 secciones (servicios, sobre mí/el estudio, trabajos, preguntas frecuentes, contacto)',
      'Textos y estructura pensados para tu rubro',
      'SEO local básico',
      'Panel para editar el contenido vos mismo',
      'Publicado en tu dominio',
    ],
    requires: [
      'Una charla de 30 minutos',
      'Tus textos base (o los armamos juntos)',
      'Fotos reales de tu trabajo (o coordinamos)',
      'Logo (o te ayudo a definir uno)',
    ],
    timeline: '2 a 4 semanas',
    whatsappMessage:
      'Hola Gabriel, vi tu web y me gustaría pedir un presupuesto para un sitio profesional completo.',
  },
]

export function buildWhatsAppUrl(serviceId?: string): string {
  const service = serviceId ? services.find((s) => s.id === serviceId) : undefined
  const message = service?.whatsappMessage ?? profile.whatsappMessage
  return `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(message)}`
}
