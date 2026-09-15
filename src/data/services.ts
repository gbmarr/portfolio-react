import type { Service } from './types'
import { profile } from './profile'

/**
 * Servicios ofrecidos.
 * El contenido de esta sección debe coincidir exactamente con los contratos
 * que firma el cliente.
 *
 * TODO: los precios son placeholders. Reemplazar cuando el usuario provea los
 * rangos reales ("desde $X").
 */
export const services: Service[] = [
  {
    id: 'landing',
    name: 'Landing page',
    audience:
      'Ideal para un comercio o emprendimiento que necesita presencia online rápida: una campaña, un producto o un evento puntual.',
    includes: [
      'Diseño personalizado, a tu medida',
      'Se ve perfecta en el celular',
      'Formulario de contacto',
      'SEO básico para que te encuentren',
      'Publicación y conexión de tu dominio',
      'Carga rápida',
    ],
    excludes: ['Redacción de textos', 'Fotografía profesional', 'Diseño de logo'],
    timeline: '1 a 2 semanas',
    priceFrom: 'USD 250',
    whatsappMessage:
      'Hola Gabriel, vi tu web y me gustaría pedir un presupuesto para una landing page.',
  },
  {
    id: 'institucional',
    name: 'Sitio institucional',
    audience:
      'Ideal para un negocio o estudio que quiere un sitio permanente con varias secciones: servicios, sobre nosotros, contacto.',
    includes: [
      'Diseño personalizado, a tu medida',
      'Hasta 5 secciones',
      'Se ve perfecto en el celular',
      'Formulario de contacto',
      'SEO básico para que te encuentren',
      'Publicación y conexión de tu dominio',
      'Te explico cómo editar el contenido vos mismo',
    ],
    excludes: ['Redacción de textos', 'Fotografía profesional', 'Diseño de logo'],
    timeline: '2 a 4 semanas',
    priceFrom: 'USD 450',
    whatsappMessage:
      'Hola Gabriel, vi tu web y me gustaría pedir un presupuesto para un sitio institucional.',
  },
]

export function buildWhatsAppUrl(serviceId?: string): string {
  const service = serviceId ? services.find((s) => s.id === serviceId) : undefined
  const message = service?.whatsappMessage ?? profile.whatsappMessage
  return `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(message)}`
}