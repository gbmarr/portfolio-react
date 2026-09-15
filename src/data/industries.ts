import type { IndustryGroup } from './types'

// Rubros con mejor rendimiento en búsqueda local (los más buscados cerca de
// "mi zona" y con intención de contratar): profesionales liberales, salud,
// oficios a domicilio, comercios de proximidad y educación.
export const industries: IndustryGroup[] = [
  {
    id: 'profesionales',
    label: 'Profesionales y estudios',
    items: [
      'Contadores',
      'Estudios contables',
      'Abogados',
      'Escribanos',
      'Arquitectos',
      'Corredores inmobiliarios',
    ],
  },
  {
    id: 'salud',
    label: 'Salud y bienestar',
    items: [
      'Odontólogos',
      'Psicólogos',
      'Nutricionistas',
      'Kinesiólogos',
      'Veterinarias',
      'Salones de estética',
      'Gimnasios',
    ],
  },
  {
    id: 'oficios',
    label: 'Oficios y reparaciones',
    items: [
      'Electricistas',
      'Gasistas',
      'Plomeros',
      'Pintores',
      'Cerrajeros',
      'Carpinteros',
      'Técnicos en aire acondicionado',
    ],
  },
  {
    id: 'comercios',
    label: 'Comercios y servicios',
    items: [
      'Ferreterías',
      'Farmacias',
      'Restaurantes y cafeterías',
      'Talleres mecánicos',
      'Agencias de seguros',
      'Fotógrafos',
      'Catering y eventos',
    ],
  },
  {
    id: 'educacion',
    label: 'Educación',
    items: [
      'Profesores particulares',
      'Institutos y academias',
      'Escuelas de idiomas',
      'Capacitación profesional',
      'Talleres y cursos',
    ],
  },
]