import { Button } from '@/components/ui/button'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import { Spacer } from '@/components/ui/spacer'
import { Link } from '@remix-run/react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { HighlightedText } from './hero-section'
import { H2, P } from '@/components/ui/typography'

export function GinggaCTA() {
  return (
    <Link to="/ai">
      <Button
        variant="outline"
        size="2xl"
        className="from-white to-slate-400 hover:text-white hover:border-gray-800 text-transparent bg-clip-text bg-gradient-to-b animate-gradient"
      >
        <img
          src="/assets/img/logo/logo-iso-dark.svg"
          alt="GINGGA"
          width={47}
          className="object-contain"
        />
        <div className="mx-4 h-8 w-px bg-gray-800" />{' '}
        <span className="">Create project with AI</span>
      </Button>
    </Link>
  )
}

export function EstimateProjectSection() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [controls, isInView])

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section
      ref={ref}
      className="bg-black py-20 md:py-44 overflow-hidden relative"
    >
      <FlickeringGrid
        squareSize={4}
        gridGap={6}
        flickerChance={0.02}
        color="rgb(255, 255, 255)"
        maxOpacity={0.1}
      />
      <motion.div
        className="flex flex-col space-y-8 mx-auto max-w-6xl w-full justify-center text-center items-center px-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div variants={itemVariants}>
          <H2 className="mb-8 leading-normal text-white text-3xl md:text-4xl lg:text-5xl">
            <HighlightedText className="bg-slate-200 bg-gradient-to-tl from-slate-50 to-slate-300 text-red-600">
              AI
            </HighlightedText>{' '}
            Accelerator
          </H2>
        </motion.div>
        <motion.div variants={itemVariants}>
          <P className="text-white text-lg max-w-2xl">
            Describe your product idea and receive an analysis of the project
            structure, development milestones, time and cost.
            <br />
            <br />
            Move faster, ship faster.
          </P>
        </motion.div>

        <Spacer size="2xs" />

        <motion.div variants={itemVariants}>
          <GinggaCTA />
        </motion.div>
      </motion.div>
    </section>
  )
}
