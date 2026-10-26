import type { IndustryGroup } from './types'

// Dos grupos con el mismo mecanismo de compra: alguien busca en su zona y
// termina llamando. Cada rubro tiene un beneficio particular para el tooltip.
export const industries: IndustryGroup[] = [
  {
    id: 'estudios',
    label: 'Estudios profesionales',
    items: [
      {
        name: 'Contadores',
        benefit:
          'Especialidad, honorarios orientativos y cómo pedir una consulta, en una sola página.',
      },
      {
        name: 'Abogados',
        benefit: 'En qué casos trabajás, cómo es la primera consulta y cómo contactarte.',
      },
      {
        name: 'Escribanos',
        benefit: 'Requisitos, turnos y ubicación claros para que la consulta llegue a una cita.',
      },
      {
        name: 'Arquitectos',
        benefit: 'Diseño, planos y permisos en una página.',
      },
      {
        name: 'Ingenieros',
        benefit: 'Consultoría técnica y proyectos.',
      },
      {
        name: 'Médicos',
        benefit: 'Especialidades, horarios y contacto.',
      },
      {
        name: 'Consultores',
        benefit: 'Servicio, metodología y primera reunión.',
      },
      {
        name: 'Diseñadores',
        benefit: 'Portafolio, presupuestos y contacto.',
      },
      {
        name: 'Psicólogos',
        benefit: 'Atención, disponibilidad y consulta.',
      },
    ],
  },
  {
    id: 'oficios',
    label: 'Oficios a domicilio',
    items: [
      {
        name: 'Electricistas',
        benefit:
          'Zona, urgencias y trabajos reales: lo que mira alguien que necesita resolver hoy.',
      },
      {
        name: 'Plomeros',
        benefit: 'Cobertura, disponibilidad y un botón de llamada que funciona en el celular.',
      },
      {
        name: 'Gasistas',
        benefit: 'Matrícula, servicios y urgencias a la vista para que confíen antes de escribir.',
      },
      {
        name: 'Pintores',
        benefit: 'Cobertura, tipo de trabajo y llamado.',
      },
      {
        name: 'Mudanzas',
        benefit: 'Distancia, disponibilidad y presupuesto.',
      },
      {
        name: 'Cerrajeros',
        benefit: 'Zona, urgencias y servicio.',
      },
      {
        name: 'Tecnología',
        benefit: 'Reparación, domicilio y horario.',
      },
      {
        name: 'Jardinería',
        benefit: 'Servicios, zona y presupuesto.',
      },
      {
        name: 'Limpieza',
        benefit: 'Tipo de servicio, frecuencia y contacto.',
      },
    ],
  },
]
