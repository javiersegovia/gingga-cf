import { useTimelineQuery } from '@/queries/use-project-query'
import { useScroll, useTransform, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Skeleton } from './skeleton'
import { PackageIcon } from 'lucide-react'
import { P } from './typography'

const getOrdinalMonth = (num: number): string => {
  const ordinals = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth',
    'Eleventh',
    'Twelfth',
  ]
  return ordinals[num - 1] || `${num}th`
}

const TimelineSkeleton = () => {
  return (
    <div className="w-full bg-white dark:bg-neutral-950 md:px-10">
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <Skeleton className="h-8 w-96 mb-4" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="max-w-7xl mx-auto pb-20">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-start pt-10 md:pt-40 md:gap-10">
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const Timeline = ({ projectId }: { projectId: string }) => {
  const { data: timelineData, isLoading } = useTimelineQuery(projectId)

  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref])

  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ['start 2%', 'end 90%'],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  if (isLoading) return <TimelineSkeleton />
  if (!timelineData?.timeline) return null

  const data = timelineData.timeline.timelineItems.map((item) => ({
    title: `${getOrdinalMonth(item.monthNumber)} Month`,
    content: (
      <div className="prose prose-neutral dark:prose-invert">
        <h3 className="text-3xl text-gray-100 font-medium mb-8">
          {item.title}
        </h3>
        <p className="text-gray-300 text-justify">{item.summary}</p>
        {item.timelineItemToProjectModules.length > 0 && (
          <>
            <h4 className="text-gray-200 mt-8 mb-4">Modules in this phase:</h4>
            <ul className="space-y-2">
              {item.timelineItemToProjectModules.map((relation) => (
                <li
                  key={relation.projectModule.id}
                  className="bg-gray-900 p-2 border border-gray-800 rounded-xl"
                >
                  <div className="flex items-center mr-auto gap-2">
                    <div className="p-2 border border-gray-700 rounded-xl">
                      <PackageIcon className="text-pink-500 w-4 h-4" />
                    </div>

                    <P className="text-white">{relation.projectModule.name}</P>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    ),
  }))

  return (
    <div
      className="w-full relative md:px-10 flex-1 overflow-y-auto flex flex-col custom-scrollbar overflow-hidden"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-5xl text-center mb-8 font-medium bg-gradient-to-r from-yellow-400 to-lime-400 from-30% to-100% bg-clip-text text-transparent">
          We've got a plan
        </h2>
        <p className="text-gray-300 text-sm md:text-base text-justify max-w-2xl mx-auto">
          {timelineData.timeline.summary}
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pt-0 pb-20">
        <h2 className="text-lg md:text-5xl text-center font-medium bg-gradient-to-r from-yellow-400 to-lime-400 from-30% to-100% bg-clip-text text-transparent">
          Timeline
        </h2>

        {data.map((item) => (
          <div key={item.title} className="flex justify-start pt-20 md:gap-10">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-gray-700 border border-gray-600 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-3xl font-medium text-yellow-400/80">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-medium text-gray-200">
                {item.title}
              </h3>

              <div className="">{item.content}</div>
            </div>
          </div>
        ))}
        <div
          style={{
            height: `${height}px`,
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-gray-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[4px] bg-gradient-to-t from-yellow-400 via-lime-700 to-transparent from-[0%] via-[60%] rounded-full"
          />
        </div>
      </div>
    </div>
  )
}
