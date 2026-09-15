import type { FAQ } from './types'

/** Preguntas frecuentes: responden objeciones sin que el visitante tenga que preguntarlas. */
export const faqs: FAQ[] = [
  {
    id: 'tiempos',
    question: '¿Cuánto tarda mi sitio?',
    answer:
      'Una landing page tarda entre 1 y 2 semanas. Un sitio institucional, entre 2 y 4 semanas.',
  },
  {
    id: 'que-necesitas-darme',
    question: '¿Qué necesito darte para empezar?',
    answer:
      'Los textos, fotos y logo de tu negocio si los tenés. Si no los tenés, te ayudo a armarlos o te recomiendo quién puede hacerlo.',
  },
  {
    id: 'dominio-hosting',
    question: '¿El dominio y el hosting están incluidos?',
    answer:
      'Te ayudo a contratarlos y los dejo conectados. El costo del dominio y el hosting es un gasto aparte del desarrollo.',
  },
  {
    id: 'editar-contenido',
    question: '¿Puedo editar el contenido yo después?',
    answer:
      'Sí. Te explico cómo hacer cambios de texto e imágenes y te dejo todo documentado para lo simple.',
  },
  {
    id: 'cambios-futuros',
    question: '¿Qué pasa si necesito cambios más adelante?',
    answer:
      'Te paso un presupuesto para ajustes puntuales o un plan de mantenimiento mensual si querés cambios frecuentes.',
  },
  {
    id: 'pagos',
    question: '¿Cómo son los pagos?',
    answer: '50% al empezar y 50% al entregar el sitio. Por transferencia o Mercado Pago.',
  },
]