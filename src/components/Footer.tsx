import { Container } from './Container'
import { copy } from '../data/copy'
import { profile } from '../data/profile'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-8">
      <Container>
        <p className="text-center text-sm text-text-muted">{copy.footer.tagline}</p>
        <p className="text-center text-xs text-text-muted/70">
          © {year} {profile.name}. {copy.footer.rights}
        </p>
      </Container>
    </footer>
  )
}