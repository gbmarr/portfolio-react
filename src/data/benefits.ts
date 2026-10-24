import type { Benefit } from './types'

// Razones para elegirme a mí, no para "tener un sitio web".
// Copy en segunda persona, frases cortas y sin promesas vacías.
export const benefits: Benefit[] = [
  {
    id: 'directo',
    icon: 'chat',
    title: 'Hablás conmigo, no con un vendedor',
    description:
      'Del primer mensaje a la publicación, tu interlocutor soy yo. Sin intermediarios que traduzcan lo que pediste.',
  },
  {
    id: 'presupuesto',
    icon: 'clock',
    title: 'Presupuesto cerrado en 48 h',
    description:
      'Después de la charla tenés precio, plazo y alcance por escrito. Si algo cambia, lo hablamos antes, no después.',
  },
  {
    id: 'panel',
    icon: 'briefcase',
    title: 'Ves el avance en tu panel',
    description:
      'Brief, etapas y avances en un panel privado. No tenés que preguntar cómo va por WhatsApp.',
  },
  {
    id: 'autonomia',
    icon: 'users',
    title: 'Te enseño a editarlo',
    description:
      'Al publicar te explico cómo cambiar textos y fotos. El sitio queda en tus manos, no en las mías.',
  },
  {
    id: 'ajustes',
    icon: 'shield',
    title: 'Ajustes hasta publicar',
    description:
      'Revisamos juntos y ajustamos lo acordado hasta que el sitio quede publicado. Sin sorpresas de último momento.',
  },
]
