import { H2, H4, P } from '@/components/ui/typography'
import { HighlightedText } from './hero-section'
import { cn } from '@/core/utils'
import { motion } from 'framer-motion'
import {
  Brain,
  Timer,
  Target,
  Layers,
  GitBranch,
  Sparkles,
  Workflow,
  Gauge,
} from 'lucide-react'
import { Suspense } from 'react'

const BentoGrid = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ',
        className,
      )}
    >
      {children}
    </div>
  )
}

const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        'row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:border-white/[0.2] border border-transparent justify-between flex flex-col space-y-4',
        className,
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans font-bold text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-300 text-xs">
          {description}
        </div>
      </div>
    </div>
  )
}

// Update SkeletonOne to show project analysis
const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  }
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-dot-white/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-xl border border-gray-800 p-2 items-center space-x-2 bg-gray-900"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex-shrink-0" />
        <div className="w-full bg-gray-800 h-4 rounded-full" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-gray-800 p-2 items-center space-x-2 w-3/4 ml-auto bg-gray-900"
      >
        <div className="w-full bg-gray-800 h-4 rounded-full" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex-shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-gray-800 p-2 items-center space-x-2 bg-gray-900"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex-shrink-0" />
        <div className="w-full bg-gray-800 h-4 rounded-full" />
      </motion.div>
    </motion.div>
  )
}

// Update SkeletonTwo to show module generation
const SkeletonTwo = () => {
  const variants = {
    initial: {
      width: 0,
    },
    animate: {
      width: '100%',
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      width: ['0%', '100%'],
      transition: {
        duration: 2,
      },
    },
  }
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-dot-white/[0.2] flex-col space-y-2"
    >
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={`module-${i}`}
            variants={variants}
            style={{
              maxWidth: `${Math.random() * (100 - 40) + 40}%`,
            }}
            className="flex flex-row rounded-xl border border-gray-800 p-2 items-center space-x-2 bg-gray-900 w-full h-4"
          />
        ))}
    </motion.div>
  )
}

// Update SkeletonThree to show complexity analysis
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: '0 50%',
    },
    animate: {
      backgroundPosition: ['0, 50%', '100% 50%', '0 50%'],
    },
  }
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'reverse',
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-dot-white/[0.2] flex-col space-y-2"
      style={{
        background: 'linear-gradient(-45deg, #fcdb5a, #f59e0b, #b45309)',
        backgroundSize: '400% 400%',
      }}
    >
      <motion.div className="h-full w-full rounded-lg" />
    </motion.div>
  )
}

const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  }
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  }
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-dot-white/[0.2] flex-row space-x-2"
    >
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl bg-gray-900 p-4 dark:border-white/[0.1] border border-gray-800 flex flex-col items-center justify-center"
      >
        <div className="rounded-full h-10 w-10 bg-gray-800 flex items-center justify-center">
          <span className="text-yellow-400 text-sm font-medium">3.2</span>
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-gray-300 mt-4">
          Low Complexity
        </p>
        <p className="border border-green-500 bg-green-900/20 text-green-300 text-xs rounded-full px-2 py-0.5 mt-4">
          Low
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-gray-900 p-4 dark:border-white/[0.1] border border-gray-800 flex flex-col items-center justify-center">
        <div className="rounded-full h-10 w-10 bg-gray-800 flex items-center justify-center">
          <span className="text-yellow-400 text-sm font-medium">6.5</span>
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-gray-300 mt-4">
          Medium Complexity
        </p>
        <p className="border border-yellow-500 bg-yellow-900/20 text-yellow-300 text-xs rounded-full px-2 py-0.5 mt-4">
          Standard
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl bg-gray-900 p-4 dark:border-white/[0.1] border border-gray-800 flex flex-col items-center justify-center"
      >
        <div className="rounded-full h-10 w-10 bg-gray-800 flex items-center justify-center">
          <span className="text-yellow-400 text-sm font-medium">8.7</span>
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-gray-300 mt-4">
          High Complexity
        </p>
        <p className="border border-red-500 bg-red-900/20 text-red-300 text-xs rounded-full px-2 py-0.5 mt-4">
          Complex
        </p>
      </motion.div>
    </motion.div>
  )
}

const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  }
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-dot-white/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-xl border border-gray-800 p-2 items-start justify-end space-x-2 w-3/4 ml-auto bg-gray-900"
      >
        <p className="text-xs text-gray-300">Add a newsletter to my project</p>
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex-shrink-0" />
      </motion.div>

      <motion.div
        variants={variants}
        className="flex flex-row rounded-xl border border-gray-800 p-2 items-start space-x-2 bg-gray-900"
      >
        <div className="rounded-full h-6 min-w-6 bg-pink-600 flex items-center justify-center">
          {/* <span className="text-yellow-400 text-xs">1</span> */}
        </div>
        <p className="text-xs text-gray-300">
          Analyzing project requirements and generating initial module
          structure...
        </p>
      </motion.div>
    </motion.div>
  )
}

const items = [
  {
    title: 'Project Analysis',
    description: (
      <span className="text-sm text-gray-300">
        Our AI analyzes your project requirements and automatically generates a
        comprehensive development roadmap.
      </span>
    ),
    header: <SkeletonOne />,
    className: 'md:col-span-2',
    icon: <Target className="h-4 w-4 text-yellow-400" />,
  },
  {
    title: 'Smart Modules',
    description: (
      <span className="text-sm text-gray-300">
        Intelligent breakdown of your project into optimized, manageable
        modules.
      </span>
    ),
    header: <SkeletonTwo />,
    className: 'md:col-span-1',
    icon: <GitBranch className="h-4 w-4 text-yellow-400" />,
  },
  {
    title: 'AI Task Generation',
    description: (
      <span className="text-sm text-gray-300">
        Automatically generate detailed tasks with complexity scoring and time
        estimates.
      </span>
    ),
    header: <SkeletonThree />,
    className: 'md:col-span-1',
    icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
  },
  {
    title: 'Complexity Analysis',
    description: (
      <span className="text-sm text-gray-300">
        Advanced metrics to assess and optimize your project&apos;s complexity
        and timeline.
      </span>
    ),
    header: <SkeletonFour />,
    className: 'md:col-span-1',
    icon: <Gauge className="h-4 w-4 text-yellow-400" />,
  },
  {
    title: 'Development Workflow',
    description: (
      <span className="text-sm text-gray-300">
        Streamlined development process with AI-powered progress tracking and
        optimization.
      </span>
    ),
    header: <SkeletonFive />,
    className: 'md:col-span-1',
    icon: <Workflow className="h-4 w-4 text-yellow-400" />,
  },
]

export function BentoGridDemo() {
  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem] mt-16">
      {items.map((item) => (
        <BentoGridItem
          key={`bento-${item.title}`}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn(
            '[&>p:text-lg] bg-gray-900 border-gray-800',
            item.className,
          )}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  )
}

const features = [
  {
    title: 'AI-Powered Planning',
    description:
      'Transform your ideas into structured project plans within minutes, not weeks.',
    icon: <Brain className="w-5 h-5 text-yellow-400" />,
  },
  {
    title: 'Smart Estimation',
    description:
      'Get accurate time and resource estimates backed by AI analysis.',
    icon: <Timer className="w-5 h-5 text-yellow-400" />,
  },
  {
    title: 'Modular Architecture',
    description:
      'Break down complex projects into manageable, efficient modules.',
    icon: <Layers className="w-5 h-5 text-yellow-400" />,
  },
]

export function FeaturesSection() {
  return (
    <section className="container max-w-4xl mx-auto py-20 relative z-10">
      <H2 className="mb-8 leading-normal text-center font-medium text-gray-100">
        Streamline your
        <br />
        <HighlightedText>project kickstart</HighlightedText>
      </H2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              {feature.icon}
              <H4 className="text-gray-200">{feature.title}</H4>
            </div>
            <P className="text-gray-300">{feature.description}</P>
          </div>
        ))}
      </div>

      <Suspense>
        <BentoGridDemo />
      </Suspense>
    </section>
  )
}
