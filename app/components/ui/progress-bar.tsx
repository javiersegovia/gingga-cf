import { useNavigation } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'
import { cn } from '@/core/utils'
import { Loader2Icon } from 'lucide-react'

export function ProgressBar() {
  const transition = useNavigation()
  const busy = transition.state !== 'idle'
  const delayedPending = useSpinDelay(busy, {
    delay: 600,
    minDuration: 400,
  })
  const ref = useRef<HTMLDivElement>(null)
  const [animationComplete, setAnimationComplete] = useState(true)

  useEffect(() => {
    if (!ref.current) return
    if (delayedPending) setAnimationComplete(false)

    const animationPromises = ref.current
      .getAnimations()
      .map(({ finished }) => finished)

    void Promise.allSettled(animationPromises).then(() => {
      if (!delayedPending) setAnimationComplete(true)
    })
  }, [delayedPending])

  return (
    <div
      role="progressbar"
      aria-hidden={delayedPending ? undefined : true}
      aria-valuetext={delayedPending ? 'Loading' : undefined}
      className="fixed inset-x-0 left-0 top-0 z-50 h-[0.20rem] animate-pulse"
    >
      <div
        ref={ref}
        className={cn(
          'h-full w-0 bg-white duration-500 ease-in-out',
          transition.state === 'idle' &&
            (animationComplete
              ? 'transition-none'
              : 'w-full opacity-0 transition-all'),
          delayedPending && transition.state === 'submitting' && 'w-5/12',
          delayedPending && transition.state === 'loading' && 'w-8/12',
        )}
      />
      {delayedPending && (
        <div className="absolute flex items-center justify-center">
          <Loader2Icon
            className="h-6 w-6 m-1 animate-spin text-foreground"
            aria-hidden
          />
        </div>
      )}
    </div>
  )
}
