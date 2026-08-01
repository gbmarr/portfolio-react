import { Container } from '../components/Container'
import { ProjectCard } from '../components/ProjectCard'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { projects } from '../data/projects'
import { useLanguage } from '../i18n/LanguageContext'

export function Projects() {
  const { t } = useLanguage()

  return (
    <Section id="proyectos">
      <Container>
        <SectionHeading
          eyebrow={t.projects.eyebrow}
          title={t.projects.title}
          subtitle={t.projects.subtitle}
        />
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
