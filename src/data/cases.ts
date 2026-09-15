import type { CaseStudy } from './types'

/**
 * Casos de trabajo presentados como mini casos (no como galería).
 *
 * Si un caso no tiene un cliente real, debe declararse explícitamente
 * ("Proyecto propio") en el campo `client`. Nunca inventar clientes.
 */
export const cases: CaseStudy[] = [
  {
    id: 'pasion-mundialista',
    client: 'Proyecto en sociedad',
    industry: 'Deportes y entretenimiento',
    title: 'Pasión Mundialista',
    screenshot: '/images/pasion-cap-1.png',
    need: 'Una app web para la Copa del Mundo 2026 donde los hinchas compitieran acertando los resultados de todos los partidos.',
    work: 'Junto a un equipo de desarrolladores creamos la app completa: sistema de puntajes, login con Google y pagos con Mercado Pago.',
    result: 'La app funcionó de forma estable durante todo el torneo.',
    role: 'partnership',
  },
  {
    id: 'simplehc',
    client: 'SimpleHC',
    industry: 'Salud',
    title: 'SimpleHC',
    need: 'Un sistema para profesionales de la salud que centralice consultas, turnos, agenda e historias clínicas.',
    work: 'Me integré al equipo para implementar nuevas funcionalidades y resolver issues, bugs, ajustar el funcionamiento e integrar el login con Google.',
    result: 'Sistema estable y en uso por el equipo de desarrollo.',
    url: 'https://simplehc.com.ar/',
    role: 'collaboration',
  },
  {
    id: 'dranes',
    client: 'Proyecto propio',
    industry: 'Fitness y entrenamiento personal',
    title: 'Dranes',
    need: 'Reemplazar las libretas y planillas con las que un personal trainer manejaba los planes y el progreso de sus clientes.',
    work: 'Diseñé y estoy desarrollando el MVP: planes de entrenamiento, historial y progreso de clientes.',
    result: 'En desarrollo activo.',
    role: 'own',
  },
]