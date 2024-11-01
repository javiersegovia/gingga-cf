import { Card } from '@/components/ui/card'
import { Spacer } from '@/components/ui/spacer'
import { useState } from 'react'
import { HighlightedText } from './hero-section'
import { H2, P } from '@/components/ui/typography'

const steps = [
  {
    name: 'Plan',
    color: 'text-green-500',
    description: [
      'We start by understanding your business goals and target audience.',
      "Together, we'll create a clear roadmap that outlines the scope of your project, key milestones, and expected timeline.",
    ],
  },
  {
    name: 'Develop',
    color: 'text-blue-500',
    description: [
      'Our experienced team begins development, following best practices and industry standards.',
      'We maintain constant communication, providing regular updates on progress and addressing any concerns promptly.',
    ],
  },
  {
    name: 'Ship',
    color: 'text-purple-500',
    description: [
      'We prepare for a smooth deployment, ensuring all systems are thoroughly tested and optimized.',
      'Our team assists with the launch process, providing support to ensure a successful release of your product.',
    ],
  },
  {
    name: 'Iterate',
    color: 'text-orange-500',
    description: [
      'Post-launch, we closely monitor performance and gather user feedback.',
      'We implement improvements and optimizations to enhance user experience and achieve your business objectives.',
    ],
  },
]

export function MethodologySection() {
  const [activeStep, setActiveStep] = useState(steps[0] as (typeof steps)[0])

  return (
    <section className="py-20 container mx-auto">
      <div className="max-w-4xl mx-auto">
        <H2 className="mb-8 leading-normal">
          Ship faster,
          <br />
          <HighlightedText className="bg-green-200 text-green-500">
            succeed
          </HighlightedText>{' '}
          faster
        </H2>
        {/* 
        <h2 className="text-4xl font-bold text-center mb-4">Our process</h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          We iterate on your product and improve it within development cycles.
        </p> */}

        <div className="text-lg space-y-2">
          <P>We believe that shipping fast can make a difference.</P>

          <P>
            Our goal is to ship your product as soon as possible, with a solid
            technical foundation that will scale as you grow.
          </P>
        </div>

        <Spacer size="2xs" />

        <Card className="bg-white rounded-3xl p-8">
          <div className="flex">
            <div className="w-1/2">
              <ul className="space-y-4">
                {steps.map((step) => (
                  <li
                    key={step.name}
                    className={`cursor-pointer ${activeStep?.name === step.name ? step.color : 'text-gray-400'}`}
                    onClick={() => setActiveStep(step)}
                  >
                    <span className="text-2xl font-semibold">{step.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-1/2 flex justify-center items-center">
              <div className={activeStep?.color}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-16 h-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {activeStep.description.map((paragraph, index) => (
              <p key={index} className="text-gray-600">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
