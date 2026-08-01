import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { profile } from '../data/profile'

export function Hero() {
  return (
    <section id="inicio" className="flex min-h-screen items-center py-20 sm:py-24">
      <Container>
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">Hola, soy</p>
        <h1 className="font-display text-4xl font-bold text-text sm:text-6xl">{profile.name}</h1>
        <p className="mt-2 font-display text-2xl font-medium text-accent sm:text-3xl">{profile.role}</p>
        <p className="mt-6 max-w-2xl text-lg text-text-muted">{profile.bio}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#proyectos">Ver proyectos</Button>
          <Button href="#contacto" variant="secondary">
            Contáctame
          </Button>
        </div>
      </Container>
    </section>
  )
}
