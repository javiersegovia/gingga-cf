import { Button } from '@/components/ui/button'
import { Spacer } from '@/components/ui/spacer'
import { cn } from '@/core/utils'
import { GinggaCTA } from './estimate-section'
import { Cover } from '@/components/ui/cover'
import { P } from '@/components/ui/typography'

export function HighlightedText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-300 to-lime-700 from-40% via-60% to-100%',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function HeroSection() {
  return (
    <section className="text-center mt-24 py-28 px-4 text-gray-200">
      {/* <Text variant="h1" className="leading-normal mb-4 text-white">
        Accelerating software <br />
        From concept to production
      </Text> */}

      <div>
        <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-300 to-lime-700 from-40% via-60% to-100%">
          <Cover>Accelerating software</Cover> <br />
          from day zero to launch
        </h1>
      </div>

      <Spacer size="4xs" />

      <P className="text-xl text-gray-200 mb-8">
        We are an{' '}
        <span className="text-gray-100 font-medium">experienced team</span> of
        developers, and we are founders too.
        <br />
        We build with purpose, validate with data, and adapt with market
        feedback.
      </P>

      <Spacer size="4xs" />

      <div className="flex justify-center space-x-4 mb-16">
        <GinggaCTA />

        <Button
          size="2xl"
          variant="ghost"
          className="from-white to-slate-400 hover:text-white hover:border-gray-800 text-transparent bg-clip-text bg-gradient-to-b animate-gradient"
        >
          Get in touch
        </Button>
      </div>
    </section>
  )
}
