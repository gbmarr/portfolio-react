import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Timeline } from '../components/Timeline'
import { useContent } from '../data/content'
import { experience } from '../data/experience'
import { useLanguage } from '../i18n/LanguageContext'

export function About() {
  const { t } = useLanguage()
  const localized = useContent()

  const workItems = experience.work.map((item) => ({ ...item, ...localized.work[item.id] }))
  const educationItems = experience.education.map((item) => ({
    ...item,
    ...localized.education[item.id],
  }))
  const certificationItems = experience.certifications.map((item) => ({
    ...item,
    ...localized.certifications[item.id],
  }))

  return (
    <Section id="sobre-mi">
      <Container>
        <SectionHeading
          eyebrow={t.about.eyebrow}
          title={t.about.title}
          subtitle={t.about.subtitle}
        />
        <Reveal>
          <p className="mx-auto max-w-3xl text-center text-lg text-text-muted">
            {localized.profile.bio}
          </p>
        </Reveal>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <Reveal delay={100}>
            <Timeline title={t.about.experience} items={workItems} />
          </Reveal>
          <Reveal delay={200}>
            <Timeline title={t.about.education} items={educationItems} />
          </Reveal>
        </div>
        <Reveal delay={300}>
          <Timeline title={t.about.certifications} items={certificationItems} className="mt-12" />
        </Reveal>
      </Container>
    </Section>
  )
}
