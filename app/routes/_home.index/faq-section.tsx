import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { H2, H3 } from '@/components/ui/typography'
import { Avatar } from '@radix-ui/react-avatar'
// Add these imports
import { PersonIcon, RocketIcon } from '@radix-ui/react-icons'

const faqItems = [
  {
    question: "Why shouldn't I just hire a full-time developer?",
    answer:
      'Hiring a full-time developer can be costly and time-consuming. Our team provides flexible, expert-level service without the long-term commitment and overhead costs associated with a full-time hire.',
  },
  {
    question: 'What kind of deliverables can I expect?',
    answer:
      'You can expect high-quality, fully-functional software that meets your specific needs. This includes source code, documentation, and regular progress reports throughout the development process.',
  },
  {
    question: 'Why should I consider the ADVANCED package?',
    answer:
      'We will invest more resources into your project. The ADVANCED package offers faster development, more frequent meetings, and additional features like AI-powered products and advanced project management tools.',
  },
]

export function FAQSection() {
  return (
    <section className="bg-black pt-32 pb-48 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:space-x-8 justify-center items-start">
          <Card className="bg-transparent text-white border-none p-6 w-full md:w-[500px]">
            <H2 className="mb-12">Some questions you might have</H2>

            <Accordion type="single" collapsible className="w-full space-y-6">
              {faqItems.map((item, index) => (
                <AccordionItem
                  value={`item-${index}`}
                  key={index}
                  className="overflow-hidden"
                >
                  <AccordionTrigger className="text-left text-xl p-4 whitespace-normal">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-lg p-4 whitespace-normal">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="max-w-md">
            <div className="bg-transparent border-none rounded-3xl p-8 flex flex-col justify-center items-center">
              <div className="flex -space-x-4 mb-6">
                <Avatar>
                  <AvatarFallback className="bg-slate-300 flex p-5 items-center justify-center">
                    <PersonIcon className="w-8 h-8 text-slate-600" />
                  </AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-slate-50 flex p-5 items-center justify-center">
                    <RocketIcon className="w-8 h-8 text-slate-600" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <H3 className="text-2xl text-background font-bold mb-6">
                We&apos;re ready to build.
              </H3>
              <Button
                size="xl"
                className="w-auto mb-4 bg-blue-600 text-white hover:bg-blue-700"
              >
                Meet our founders
              </Button>
              <p className="text-white">
                Contact at{' '}
                <a
                  href="mailto:hello@gingga.com"
                  className="text-blue-400 font-medium hover:underline"
                >
                  hello@gingga.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
