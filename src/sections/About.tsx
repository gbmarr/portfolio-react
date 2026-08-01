import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Timeline } from '../components/Timeline'
import { profile } from '../data/profile'
import { experience } from '../data/experience'
import { useLanguage } from '../i18n/LanguageContext'

export function About() {
  const { t } = useLanguage()

  return (
    <Section id="sobre-mi">
      <Container>
        <SectionHeading
          eyebrow={t.about.eyebrow}
          title={t.about.title}
          subtitle={t.about.subtitle}
        />
        <Reveal>
          <p className="mx-auto max-w-3xl text-center text-lg text-text-muted">{profile.bio}</p>
        </Reveal>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <Reveal delay={100}>
            <Timeline title={t.about.experience} items={experience.work} />
          </Reveal>
          <Reveal delay={200}>
            <Timeline title={t.about.education} items={experience.education} />
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
