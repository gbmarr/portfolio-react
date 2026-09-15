import { Container } from '../components/Container'
import { ProjectCard } from '../components/ProjectCard'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { copy } from '../data/copy'
import { projects } from '../data/projects'

export function Projects() {
  return (
    <Section id="proyectos">
      <Container>
        <SectionHeading
          eyebrow={copy.projects.eyebrow}
          title={copy.projects.title}
          subtitle={copy.projects.subtitle}
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