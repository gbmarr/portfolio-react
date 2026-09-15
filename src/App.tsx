import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Hero } from './sections/Hero'
import { Problem } from './sections/Problem'
import { Services } from './sections/Services'
import { HowItWorks } from './sections/HowItWorks'
import { Cases } from './sections/Cases'
import { AboutShort } from './sections/AboutShort'
import { FAQSection } from './sections/FAQSection'
import { CTAFinal } from './sections/CTAFinal'
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
        <Problem />
        <Services />
        <HowItWorks />
        <Cases />
        <AboutShort />
        <FAQSection />
        <CTAFinal />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App