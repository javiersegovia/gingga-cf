import { motion } from 'framer-motion'
import { cn } from '@/core/utils'

interface ProjectModuleSkeletonProps {
  className?: string
}

export function ProjectModuleSkeleton({
  className,
}: ProjectModuleSkeletonProps) {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full items-center">
        <div className="relative z-auto grow h-full rounded-2xl bg-gray-950 p-4 shadow-[0px_1px_0px_0px_hsla(0,0%,100%,.03)_inset,0px_0px_0px_1px_hsla(0,0%,100%,.03)_inset,0px_0px_0px_1px_rgba(0,0,0,.1),0px_2px_2px_0px_rgba(0,0,0,.1),0px_4px_4px_0px_rgba(0,0,0,.1),0px_8px_8px_0px_rgba(0,0,0,.1)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gray-800 animate-pulse" />
                <div className="h-4 w-4 bg-gray-800 animate-pulse" />
              </div>
              <div className="h-6 w-48 bg-gray-800 rounded animate-pulse" />
            </div>

            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-800 rounded-xl animate-pulse" />
              <div className="h-8 w-16 bg-gray-800 rounded-xl animate-pulse" />
              <div className="h-8 w-16 bg-gray-800 rounded-xl animate-pulse" />
            </div>

            <div className="h-16 w-full bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-24 w-full bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
