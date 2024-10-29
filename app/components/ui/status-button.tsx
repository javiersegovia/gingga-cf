import { cn, useIsPending } from '@/core/misc'
import { useFormMetadata } from '@conform-to/react'
import { CheckIcon, UpdateIcon } from '@radix-ui/react-icons'
import { TriangleAlert } from 'lucide-react'
import * as React from 'react'
import { useSpinDelay } from 'spin-delay'
import { Button } from './button'
import type { ButtonProps } from './button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

export const StatusButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    status: 'pending' | 'success' | 'error' | 'idle'
    message?: string | null
    spinDelay?: Parameters<typeof useSpinDelay>[1]
    spinIcon?: React.ReactNode
  }
>(
  (
    { message, status, className, children, spinDelay, spinIcon, ...props },
    ref,
  ) => {
    const delayedPending = useSpinDelay(status === 'pending', {
      delay: 400,
      minDuration: 300,
      ...spinDelay,
    })
    const companion = {
      pending: delayedPending ? (
        <div
          role="status"
          className="inline-flex h-6 w-6 items-center justify-center"
        >
          {spinIcon ?? <UpdateIcon className="animate-spin" />}
        </div>
      ) : null,
      success: (
        <div
          role="status"
          className="inline-flex h-6 w-6 items-center justify-center"
        >
          <CheckIcon />
        </div>
      ),
      error: (
        <div
          role="status"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full"
        >
          <TriangleAlert className="text-destructive" />
        </div>
      ),
      idle: null,
    }[status]

    return (
      <Button
        ref={ref}
        className={cn('flex justify-center gap-4', className)}
        {...props}
      >
        <div>{children}</div>
        {message ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{companion}</TooltipTrigger>
              <TooltipContent>{message}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          companion
        )}
      </Button>
    )
  },
)
StatusButton.displayName = 'Button'

export function FormStatusButton({
  children,
  formId,
  ...props
}: ButtonProps & { formId?: string }) {
  const isPending = useIsPending()
  const form = useFormMetadata(formId)

  return (
    <StatusButton
      variant="outline"
      status={isPending ? 'pending' : (form.status ?? 'idle')}
      disabled={isPending}
      {...props}
    >
      {children}
    </StatusButton>
  )
}
