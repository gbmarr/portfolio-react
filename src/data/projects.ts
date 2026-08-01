import type { Project } from './types'

export const projects: Project[] = [
  {
    id: 'proyecto-uno',
    name: 'Nombre del Proyecto',
    description:
      'Describe el problema que resolviste, el enfoque que seguiste y el resultado obtenido.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    demoUrl: 'https://demo.example.com',
    repoUrl: 'https://github.com/tuusuario/proyecto-uno',
    screenshot: '/assets/projects/proyecto-uno.png',
  },
  {
    id: 'proyecto-dos',
    name: 'Nombre del Proyecto 2',
    description:
      'Describe el problema que resolviste, el enfoque que seguiste y el resultado obtenido.',
    technologies: ['Node.js', 'Express', 'PostgreSQL'],
    demoUrl: 'https://demo.example.com',
    repoUrl: 'https://github.com/tuusuario/proyecto-dos',
  },
  {
    id: 'proyecto-tres',
    name: 'Nombre del Proyecto 3',
    description:
      'Describe el problema que resolviste, el enfoque que seguiste y el resultado obtenido.',
    technologies: ['Vue', 'Pinia', 'Firebase'],
    repoUrl: 'https://github.com/tuusuario/proyecto-tres',
  },
]
