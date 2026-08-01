import type { SkillCategory } from './types'

export const skills: SkillCategory[] = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React', level: 'intermediate' },
      { name: 'TypeScript', level: 'intermediate' },
      { name: 'Tailwind CSS', level: 'intermediate' },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Node.js', level: 'beginner' },
      { name: 'Express', level: 'beginner' },
    ],
  },
  {
    category: 'Herramientas',
    skills: [
      { name: 'Git', level: 'intermediate' },
      { name: 'npm', level: 'intermediate' },
    ],
  },
]
