import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Timeline } from '../components/Timeline'
import { profile } from '../data/profile'
import { experience } from '../data/experience'

export function About() {
  return (
    <Section id="sobre-mi">
      <Container>
        <SectionHeading
          eyebrow="Sobre mí"
          title="Mi trayectoria"
          subtitle="Mi perfil, experiencia y formación"
        />
        <Reveal>
          <p className="mx-auto max-w-3xl text-center text-lg text-text-muted">{profile.bio}</p>
        </Reveal>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <Reveal delay={100}>
            <Timeline title="Experiencia" items={experience.work} />
          </Reveal>
          <Reveal delay={200}>
            <Timeline title="Educación" items={experience.education} />
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
