import type { Project } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'
import { Reveal } from './Reveal'
import { SkillBadge } from './SkillBadge'

interface ProjectCardProps {
  project: Project
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useLanguage()

  return (
    <Reveal>
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow">
        <div className="flex aspect-video items-center justify-center border-b border-border bg-surface-light/40">
          {project.screenshot ? (
            <img
              src={project.screenshot}
              alt={`${t.projects.screenshot} ${project.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-3xl font-semibold text-text-muted">
              {getInitials(project.name)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold text-text">{project.name}</h3>
          <p className="text-text-muted">{project.description}</p>

          <ul className="flex flex-wrap gap-2" aria-label={t.projects.technologies}>
            {project.technologies.map((tech) => (
              <li key={tech}>
                <SkillBadge name={tech} />
              </li>
            ))}
          </ul>

          <div className="mt-auto flex gap-4 pt-2">
            {project.demoUrl ? (
              <a href={project.demoUrl} className="text-sm font-medium text-accent hover:underline">
                {t.projects.demo} ↗
              </a>
            ) : null}
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                className="text-sm font-medium text-text hover:text-accent hover:underline"
              >
                {t.projects.code} ↗
              </a>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  )
}
