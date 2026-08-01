import { Container } from './Container'
import { profile } from '../data/profile'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-8">
      <Container>
        <p className="text-center text-sm text-text-muted">
          © {year} {profile.name}
        </p>
      </Container>
    </footer>
  )
}
