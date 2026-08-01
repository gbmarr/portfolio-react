import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { SkillBadge } from '../components/SkillBadge'
import { skills } from '../data/skills'
import { useLanguage } from '../i18n/LanguageContext'

export function Skills() {
  const { t } = useLanguage()

  return (
    <Section id="habilidades">
      <Container>
        <SectionHeading eyebrow={t.skills.eyebrow} title={t.skills.title} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((category) => (
            <Reveal key={category.category}>
              <div className="h-full rounded-xl border border-border bg-surface p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-text">
                  {category.category}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <li key={skill.name}>
                      <SkillBadge name={skill.name} level={skill.level} />
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
