import type { IndustryGroup } from './types'

// Rubros con mejor rendimiento en búsqueda local (los más buscados cerca de
// "mi zona" y con intención de contratar): profesionales liberales, salud,
// oficios a domicilio, comercios de proximidad y educación.
// Cada rubro incluye un beneficio particular (para el tooltip del chip) en
// el tono del sitio: segunda persona, concreto, sin promesas vacías.
export const industries: IndustryGroup[] = [
  {
    id: 'profesionales',
    label: 'Profesionales y estudios',
    items: [
      {
        name: 'Contadores',
        benefit:
          'Antes de pedir turno, tus clientes buscan si tu estudio existe en Google. Un sitio te hace existir las 24 horas.',
      },
      {
        name: 'Estudios contables',
        benefit:
          'La confianza se construye antes de la primera reunión: un sitio prolijo te posiciona como el estudio serio de la zona.',
      },
      {
        name: 'Abogados',
        benefit:
          'Quien necesita un abogado busca señales de seriedad en internet antes de llamar. Tu sitio es la primera audiencia.',
      },
      {
        name: 'Escribanos',
        benefit:
          'Las personas comparan escribanías por cercanía y confianza: aparecer primero en la búsqueda local gana la consulta.',
      },
      {
        name: 'Arquitectos',
        benefit:
          'Tu trabajo se elige por el portfolio: mostrarlo online convierte tu mejor obra en tu mejor vendedor.',
      },
      {
        name: 'Corredores inmobiliarios',
        benefit:
          'Cada propiedad en venta necesita visibilidad inmediata: un sitio propio te despega de la cartelera.',
      },
    ],
  },
  {
    id: 'salud',
    label: 'Salud y bienestar',
    items: [
      {
        name: 'Odontólogos',
        benefit:
          'La gente busca al dentista que ya ve como profesional en internet; el sitio trabaja de agenda abierta.',
      },
      {
        name: 'Psicólogos',
        benefit:
          'Elegir un psicólogo es elegir confianza: tu sitio explica cómo trabajás y quien te busca ya llega decidido.',
      },
      {
        name: 'Nutricionistas',
        benefit:
          'Plan, precios y turnos online evitan diez mensajes repetidos por semana y llenan tu agenda.',
      },
      {
        name: 'Kinesiólogos',
        benefit:
          'Un paciente con dolor busca ayuda cerca, hoy: aparecer en el mapa local te suma pacientes nuevos.',
      },
      {
        name: 'Veterinarias',
        benefit:
          'Una emergencia con la mascota no espera: quien te encuentra rápido en Google te convierte en su veterinaria.',
      },
      {
        name: 'Salones de estética',
        benefit:
          'Tu Instagram tiene fotos, pero un sitio te suma precios, turnos y dirección: la decisión de reservar arranca ahí.',
      },
      {
        name: 'Gimnasios',
        benefit:
          'El 89% consulta horarios, precios y opiniones antes de anotarse: si tu sede aparece, la visita ya viene convencida.',
      },
    ],
  },
  {
    id: 'oficios',
    label: 'Oficios y reparaciones',
    items: [
      {
        name: 'Electricistas',
        benefit:
          'Una urgencia eléctrica se googlea de noche: "electricista cerca de mí" y gana el que aparece primero.',
      },
      {
        name: 'Gasistas',
        benefit:
          'La habilitación y la seriedad se verifican online: un sitio con tus trabajos convierte la duda en llamada.',
      },
      {
        name: 'Plomeros',
        benefit:
          'Una pérdida se resuelve con el plomero que aparece en Google a las 9 de la noche: esa llamada se gana online.',
      },
      {
        name: 'Pintores',
        benefit:
          'Presupuestás con fotos de trabajos reales: un sitio te evita el "¿me podés mostrar algo hecho?".',
      },
      {
        name: 'Cerrajeros',
        benefit:
          'En una emergencia nadie tiene tiempo de comparar: el cerrajero que aparece primero en la zona se queda con el trabajo.',
      },
      {
        name: 'Carpinteros',
        benefit:
          'Tu catálogo de muebles y trabajos a medida vende solo: quien lo ve online llega con el pedido casi definido.',
      },
      {
        name: 'Técnicos en aire acondicionado',
        benefit:
          'Antes de la ola de calor todo el mundo busca instalación y mantenimiento: aparecer en el momento justo te llena la agenda.',
      },
    ],
  },
  {
    id: 'comercios',
    label: 'Comercios y servicios',
    items: [
      {
        name: 'Ferreterías',
        benefit:
          'El 76% que busca "ferretería cerca" visita el negocio en 24 horas: un sitio te suma a esa lista.',
      },
      {
        name: 'Farmacias',
        benefit:
          'Horarios, turnos, guardia: la gente necesita respuestas rápidas y tu sitio se las da aunque estés cerrado.',
      },
      {
        name: 'Restaurantes y cafeterías',
        benefit:
          'El 89% mira el menú y el horario online antes de elegir dónde comer: si no estás, no existís en esa decisión.',
      },
      {
        name: 'Talleres mecánicos',
        benefit:
          'Un auto descompuesto se busca con el celular: el taller que aparece primero recibe la llamada.',
      },
      {
        name: 'Agencias de seguros',
        benefit:
          'Comparar seguros empieza en internet: un sitio con tus coberturas te posiciona antes de la cotización.',
      },
      {
        name: 'Fotógrafos',
        benefit:
          'Tu trabajo habla por vos: un sitio con tu portfolio convierte un "¿a qué te dedicás?" en "¿tenés fecha libre?".',
      },
      {
        name: 'Catering y eventos',
        benefit:
          'La elección del catering se decide con fotos y menú: mostrar tu carta online te mete en la preselección.',
      },
    ],
  },
  {
    id: 'educacion',
    label: 'Educación',
    items: [
      {
        name: 'Profesores particulares',
        benefit:
          'Los padres buscan referencias y disponibilidad antes de escribir: tu sitio responde cuando vos no podés.',
      },
      {
        name: 'Institutos y academias',
        benefit:
          'Quien busca un curso compara opciones online: tu oferta clara y tus resultados cierran el formulario.',
      },
      {
        name: 'Escuelas de idiomas',
        benefit:
          'Niveles, horarios y costos: la información online decide la inscripción antes que la visita.',
      },
      {
        name: 'Capacitación profesional',
        benefit:
          'Los profesionales eligen cursos por reputación: un sitio con testimonios genera la confianza que falta en el CV.',
      },
      {
        name: 'Talleres y cursos',
        benefit:
          'Un taller vacío se llena con inscripción online: mostrá cronograma y cupos y el alumno se anota solo.',
      },
    ],
  },
]