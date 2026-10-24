import type { CaseStudy } from './types'

/**
 * Casos de trabajo presentados como mini casos (no como galería).
 *
 * Si un caso no tiene un cliente real, debe declararse explícitamente
 * ("Proyecto propio") en el campo `client`. Nunca inventar clientes.
 */
export const cases: CaseStudy[] = [
  {
    id: 'dranes',
    client: 'Dranes',
    industry: 'Entrenamiento personal',
    title: 'Dranes',
    screenshot: '/images/dranes-cap.png',
    need: 'Un entrenador personal que manejaba planes, historial y progreso de sus clientes en libretas y planillas.',
    work: 'Diseñé y desarrollé el sitio y el MVP: planes de entrenamiento, historial y seguimiento de clientes.',
    result: 'Sitio en producción en dranes.com.ar.',
    url: 'https://dranes.com.ar',
    role: 'own',
  },
  {
    id: 'simplehc',
    client: 'SimpleHC',
    industry: 'Salud',
    title: 'SimpleHC',
    need: 'Un sistema para profesionales de la salud que centralice consultas, turnos, agenda e historias clínicas.',
    work: 'Me integré al equipo para implementar nuevas funcionalidades y resolver issues, bugs, ajustar el funcionamiento e integrar el login con Google.',
    result: 'En producción en simplehc.com.ar.',
    url: 'https://simplehc.com.ar/',
    role: 'collaboration',
  },
  {
    id: 'pasion-mundialista',
    client: 'Proyecto en sociedad',
    industry: 'Deportes y entretenimiento',
    title: 'Pasión Mundialista',
    screenshot: '/images/pasion-cap-1.png',
    need: 'Una app web para la Copa del Mundo 2026 donde los hinchas compitieran acertando los resultados de todos los partidos.',
    work: 'Junto a un equipo de desarrolladores creamos la app completa: sistema de puntajes, login con Google y pagos con Mercado Pago.',
    result: 'Funcionó durante todo el torneo, con login y pagos.',
    role: 'partnership',
  },
]
