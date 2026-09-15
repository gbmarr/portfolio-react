import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Hero } from './sections/Hero'
import { Problem } from './sections/Problem'
import { ServicesPreview } from './sections/ServicesPreview'
import { HowItWorks } from './sections/HowItWorks'
import { FeaturedCases } from './sections/FeaturedCases'
import { ServicesDetail } from './sections/ServicesDetail'
import { CasesDetail } from './sections/CasesDetail'
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
        <ServicesPreview />
        <HowItWorks />
        <FeaturedCases />
        <ServicesDetail />
        <CasesDetail />
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