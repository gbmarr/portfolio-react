import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { profile } from '../data/profile'
import { useLanguage } from '../i18n/LanguageContext'

export function Contact() {
  const { email, socialLinks } = profile
  const { t } = useLanguage()

  return (
    <Section id="contacto">
      <Container>
        <SectionHeading
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          subtitle={t.contact.subtitle}
        />
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href={`mailto:${email}`}>{t.contact.sendEmail}</Button>
          <Button href={socialLinks.github} variant="secondary">
            GitHub
          </Button>
          <Button href={socialLinks.linkedin} variant="secondary">
            LinkedIn
          </Button>
          {socialLinks.others?.map((other) => (
            <Button key={other.url} href={other.url} variant="secondary">
              {other.label}
            </Button>
          ))}
        </div>
      </Container>
    </Section>
  )
}
