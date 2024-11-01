import { Navbar } from '@/components/navbar'
import { FAQSection } from './faq-section'
import { FeaturesSection } from './features-section'
import { HeroSection } from './hero-section'
// import { MethodologySection } from './methodology-section'
import { PricingSection } from './pricing-section'

import { Spacer } from '@/components/ui/spacer'
import type { MetaFunction } from '@remix-run/cloudflare'
import { EstimateProjectSection } from './estimate-section'
import { Particles } from '@/components/ui/particles'
import { Suspense } from 'react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Gingga — Software teams to support your business' },
    { name: 'description', content: 'Software agency' },
  ]
}

// Generate a basic default export function component for this file
export default function Home() {
  return (
    <div className="bg-black relative min-h-screen min-w-screen">
      <Particles
        className="inset-0 fixed min-h-screen min-w-screen"
        quantity={400}
        ease={20}
        color="#ffffff"
        refresh
      />

      <Navbar />
      <HeroSection />
      {/* <MethodologySection /> */}
      <Spacer size="4xs" />
      <FeaturesSection />
      <Spacer size="xs" />
      <PricingSection />
      <EstimateProjectSection />
      <FAQSection />
    </div>
  )
}
