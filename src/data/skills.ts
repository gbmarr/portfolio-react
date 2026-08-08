import type { SkillCategory } from './types'

export const skills: SkillCategory[] = [
  {
    id: 'frontend',
    category: 'Frontend',
    skills: [
      { name: 'HTML', level: 'intermediate' },
      { name: 'CSS', level: 'intermediate' },
      { name: 'Bootstrap', level: 'beginner' },
      { name: 'React', level: 'intermediate' },
      { name: 'TypeScript', level: 'intermediate' },
      { name: 'Next.js', level: 'beginner' },
      { name: 'Tailwind CSS', level: 'beginner' },
    ],
  },
  {
    id: 'backend',
    category: 'Backend',
    skills: [
      { name: 'Node.js', level: 'intermediate' },
      { name: 'Express', level: 'intermediate' },
      { name: 'PHP', level: 'intermediate' },
      { name: 'Java', level: 'beginner' },
      { name: 'C#', level: 'beginner' },
      { name: 'MySQL', level: 'beginner' },
      { name: 'SQL Server', level: 'beginner' },
      { name: 'PostgreSQL', level: 'intermediate' },
      { name: 'Prisma', level: 'intermediate' },
    ],
  },
  {
    id: 'tools',
    category: 'Herramientas',
    skills: [
      { name: 'Git', level: 'intermediate' },
      { name: 'npm', level: 'intermediate' },
      { name: 'DataGrip', level: 'beginner' },
      { name: 'DBeaver', level: 'beginner' },
      { name: 'VS Code', level: 'intermediate' },
      { name: 'Docker', level: 'beginner' },
      { name: 'GitHub', level: 'intermediate' },
    ],
  },
]
