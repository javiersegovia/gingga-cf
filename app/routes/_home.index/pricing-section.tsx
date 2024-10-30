import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/core/utils'
import { CheckIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { HighlightedText } from './hero-section'
import { H2, H3, P } from '@/components/ui/typography'

function MonthlyPrice({
  price,
  className,
}: {
  price: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <p className="text-4xl font-bold text-white mb-2 text-inherit">
        ${price}
      </p>
      <p className="inline-block text-gray-200">/ MONTH</p>
    </div>
  )
}

// const prices = {
//   core: {
//     monthly: 3900,
//     threeMonths: 1950,
//   },
//   advanced: {
//     monthly: 7900,
//     threeMonths: 3950,
//   },
// }

const DISCOUNT = 0.5
const CORE_PRICE = 3900
const ADVANCED_PRICE = 7900

function getDiscountedPrice(price: number) {
  return price * DISCOUNT
}

export function PricingSection() {
  const [isThreeMonthsPlan, setIsThreeMonthsPlan] = useState(false)
  const corePrice = isThreeMonthsPlan
    ? getDiscountedPrice(CORE_PRICE)
    : CORE_PRICE
  const advancedPrice = isThreeMonthsPlan
    ? getDiscountedPrice(ADVANCED_PRICE)
    : ADVANCED_PRICE

  return (
    <section className="px-4 relative">
      <div className="max-w-6xl py-20 mx-auto relative z-10">
        <H2 className="font-bold text-center text-white mb-4">
          <HighlightedText>Affordable</HighlightedText> pricing
        </H2>

        <p className="text-xl text-gray-200 text-center mb-12 max-w-2xl mx-auto">
          Get a senior-level expertise team of professionals
          <br />
          to develop your project.
        </p>

        <Card className="bg-gray-900 border-gray-800 p-6 mb-8 flex flex-col rounded-3xl items-center space-y-4">
          <div className="flex gap-2 items-center">
            <Switch
              checked={isThreeMonthsPlan}
              onCheckedChange={setIsThreeMonthsPlan}
            />
            <P className="font-medium inline-block text-gray-200">
              Three-months plan
            </P>
          </div>

          <P className="text-gray-300">
            We are offering <span className="font-bold">50% off</span> for this
            option. We value long-term partnerships and this is a start.
          </P>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <Card className="flex flex-col md:col-span-5 border border-gray-700 bg-gray-800 rounded-3xl p-8">
            <CardHeader>
              <H3 className="text-white">CORE</H3>
              <CardDescription className="text-gray-200 mb-6 text-lg">
                Perfect for starters
              </CardDescription>
            </CardHeader>

            <CardContent>
              <MonthlyPrice price={corePrice} />
              <p className="text-green-500 mb-6">Spots available</p>
              <ul className="space-y-4 mb-8">
                {[
                  { text: 'Essential software features' },
                  { text: 'Technical support' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start text-white">
                    <CheckIcon className="w-5 h-5 mr-2 text-blue-500 mt-1 flex-shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                size="xl"
                className="w-auto mt-auto mx-auto bg-gray-900 text-white hover:bg-gray-800"
              >
                Start new project
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-7 border border-gray-700 bg-gray-950 text-white rounded-3xl p-8">
            <CardHeader>
              <H3 className="text-yellow-400">ADVANCED</H3>

              <P className="text-background-foreground text-lg">
                Develop your product twice as fast
              </P>
            </CardHeader>

            <CardContent>
              <MonthlyPrice price={advancedPrice} className="text-white" />
              <p className="text-red-500 mb-6">No spots available</p>
              <ul className="flex flex-col space-y-2 mb-8">
                {[
                  { text: 'Comprehensive software features' },
                  { text: 'Technical support' },
                  { text: 'AI-powered products' },
                  { text: 'Advanced project management dashboard' },
                  { text: 'Monitoring tools' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start">
                    <CheckIcon className="w-5 h-5 mr-2 text-blue-500 mt-1 flex-shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                size="xl"
                className="w-auto mx-auto bg-blue-600 text-white hover:bg-blue-700"
              >
                Schedule a free consultation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
