import type { SkillCategory } from './types'

export const skills: SkillCategory[] = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React', level: 'intermediate' },
      { name: 'TypeScript', level: 'intermediate' },
      { name: 'Tailwind CSS', level: 'beginner' },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Node.js', level: 'intermediate' },
      { name: 'Express', level: 'intermediate' },
      { name: 'PHP', level: 'intermediate' },
      { name: 'MySQL', level: 'beginner' },
      { name: 'PostgreSQL', level: 'intermediate' },
      { name: 'Prisma', level: 'intermediate' },
    ],
  },
  {
    category: 'Herramientas',
    skills: [
      { name: 'Git', level: 'intermediate' },
      { name: 'npm', level: 'intermediate' },
      { name: 'DataGrip', level: 'beginner' },
      { name: 'VS Code', level: 'intermediate' },
      { name: 'Docker', level: 'beginner' },
      { name: 'GitHub', level: 'intermediate' },
    ],
  },
]
