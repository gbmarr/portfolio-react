import type { ProcessStep } from './types'

/** Pasos del proceso de trabajo. Responden "¿qué tengo que hacer yo?". */
export const processSteps: ProcessStep[] = [
  {
    id: 'charla',
    number: 1,
    title: 'Contame qué necesitás',
    description:
      'Una charla de 30 minutos por WhatsApp o videollamada. Me contás qué hacés, a quién le vendés y qué querés lograr.',
  },
  {
    id: 'presupuesto',
    number: 2,
    title: 'Te paso un presupuesto cerrado',
    description:
      'En 48 h tenés precio fijo, plazo y alcance. Si te sirve, reservás el cupo con el 50%.',
  },
  {
    id: 'diseno',
    number: 3,
    title: 'Diseño y desarrollo',
    description: 'Te muestro avances en tu panel y hacemos revisiones en el medio.',
  },
  {
    id: 'publicacion',
    number: 4,
    title: 'Publicamos y te explico',
    description: 'Lo publicamos en tu dominio y te enseño a editar textos y fotos.',
  },
]
