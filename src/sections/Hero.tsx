import { Mockup } from '../components/Mockup'
import { Button } from '../components/Button'
import { WhatsAppButton } from '../components/WhatsAppButton'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { copy } from '../data/copy'

// Prueba visual: capturas reales de un trabajo hecho.
const heroShots = [
  { src: '/images/pasion-cap-1.png', label: 'Captura de Pasión Mundialista' },
  { src: '/images/pasion-cap-2.png', label: 'Captura de Pasión Mundialista' },
]

export function Hero() {
  return (
    <Section id="inicio" className="flex items-center overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight text-text sm:text-5xl xl:text-6xl">
              {copy.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
              {copy.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <WhatsAppButton label={copy.hero.ctaPrimary} />
              <Button href="#trabajos" variant="secondary">
                {copy.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center gap-6" aria-hidden="true">
            <div className="hidden w-1/2 sm:block">
              <Mockup src={heroShots[0].src} alt={heroShots[0].label} />
            </div>
            <div className="w-1/2 sm:w-1/3">
              <Mockup src={heroShots[1].src} alt={heroShots[1].label} variant="phone" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}