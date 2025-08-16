'use client'

import { cn } from '@/lib/utils'

interface EnhancedTextProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'title' | 'subtitle'
  gradient?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  children: React.ReactNode
}

export function EnhancedText({
  variant = 'h1',
  gradient = false,
  as: Component = 'h1',
  className,
  children,
  ...props
}: EnhancedTextProps) {
  const baseStyles = {
    h1: 'text-4xl font-bold tracking-tight sm:text-5xl',
    h2: 'text-3xl font-semibold tracking-tight leading-relaxed',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-xl font-semibold tracking-tight',
    title: 'text-lg font-medium leading-7',
    subtitle: 'text-base font-normal leading-7'
  }

  const gradientStyles = gradient
    ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent'
    : ''

  return (
    <Component
      className={cn(
        'font-hubot',
        baseStyles[variant],
        gradientStyles,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
