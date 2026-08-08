import type { Project } from './types'

export const projects: Project[] = [
  {
    id: 'pasion-mundialista',
    name: 'Pasión Mundialista',
    description:
      'App web que funcionó durante la Copa del Mundo 2026, donde los usuarios competían por una camiseta de Argentina y la pelota oficial del torneo mediante un sistema de puntajes por aciertos de resultados exactos o parciales de todos los partidos. Incluía login con Google e integración de pagos con Mercado Pago.',
    technologies: [
      'PHP',
      'PHTML',
      'CSS',
      'JavaScript',
      'PostgreSQL',
      'Google Cloud',
      'Mercado Pago',
      'Docker',
      'FTP FileZilla',
    ],
    role: 'partnership',
    screenshot: '/images/pasion-cap-1.png',
  },
  {
    id: 'simplehc',
    name: 'SimpleHC',
    description:
      'Sistema de gestión para profesionales de la salud que centraliza consultas médicas, gestión de turnos, agenda, exportación de diagnósticos, administración de pacientes e historias clínicas. Me encargué de la resolución de issues, ajustes de funcionamiento e integración de Google Login sobre un proyecto ya avanzado.',
    technologies: ['PHP', 'PHTML', 'CSS', 'JavaScript', 'PostgreSQL', 'Docker'],
    role: 'collaboration',
    demoUrl: 'https://simplehc.com.ar/',
  },
  {
    id: 'dranes',
    name: 'Dranes',
    description:
      'Sistema de gestión para emprendimientos de personal training, actualmente en desarrollo. Centraliza los planes de entrenamiento y la gestión de clientes — historial, progresos, planificación de series, sesiones y planes completos para distintos objetivos — reemplazando libretas, planillas y PDFs.',
    technologies: [
      'TypeScript',
      'React',
      'Node.js',
      'Prisma',
      'Supabase',
      'Clerk',
      'Tailwind CSS',
      'TanStack Query',
    ],
    role: 'own',
  },
]
