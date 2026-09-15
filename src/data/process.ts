import type { ProcessStep } from './types'

/** Pasos del proceso de trabajo. Responden "¿qué tengo que hacer yo?". */
export const processSteps: ProcessStep[] = [
  {
    id: 'charla',
    number: 1,
    title: 'Contame qué necesitás',
    description: 'Hablamos por WhatsApp o email y en pocos minutos tengo claro qué te conviene.',
  },
  {
    id: 'presupuesto',
    number: 2,
    title: 'Te paso un presupuesto cerrado',
    description: 'Precio fijo y plazo definido. Si te sirve, arrancamos. Sin sorpresas.',
  },
  {
    id: 'diseno',
    number: 3,
    title: 'Diseño y desarrollo',
    description: 'Hago tu sitio y te muestro avances con revisiones en el medio.',
  },
  {
    id: 'publicacion',
    number: 4,
    title: 'Publicamos y te explico',
    description: 'Lo publicamos en tu dominio y te enseñó a editar el contenido vos mismo.',
  },
]