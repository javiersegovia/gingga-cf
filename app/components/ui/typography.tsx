import { cn } from '@/core/utils'
import type { PropsWithChildren } from 'react'

interface TypographyProps extends PropsWithChildren {
  className?: string
}

const HEADING_FONT_FAMILY = 'font-title' as const

export function H1({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        HEADING_FONT_FAMILY,
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        'scroll-m-20 text-3xl lg:text-4xl font-medium tracking-tight first:mt-0',
        className,
        HEADING_FONT_FAMILY,
      )}
    >
      {children}
    </h2>
  )
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className,
        HEADING_FONT_FAMILY,
      )}
    >
      {children}
    </h3>
  )
}

export function H4({ children, className }: TypographyProps) {
  return (
    <h4
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className,
        HEADING_FONT_FAMILY,
      )}
    >
      {children}
    </h4>
  )
}

export function P({ children, className }: TypographyProps) {
  return <p className={cn('leading-7', className)}>{children}</p>
}

export function Blockquote({ children, className }: TypographyProps) {
  return (
    <blockquote className={cn('mt-6 pl-6 italic', className)}>
      {children}
    </blockquote>
  )
}

export function Code({ children, className }: TypographyProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className,
      )}
    >
      {children}
    </code>
  )
}

export function Lead({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-xl text-muted-foreground', className)}>{children}</p>
  )
}

export function Large({ children, className }: TypographyProps) {
  return (
    <div className={cn('text-lg font-semibold', className)}>{children}</div>
  )
}

export function Small({ children, className }: TypographyProps) {
  return (
    <div className={cn('text-sm font-medium leading-none', className)}>
      {children}
    </div>
  )
}

export function Muted({ children, className }: TypographyProps) {
  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </div>
  )
}
