import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'
import { Contact } from './sections/Contact'
import { copy } from './data/copy'
import { applySeoMeta } from './utils/seo'

function App() {
  useEffect(() => {
    applySeoMeta(copy.seo)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App