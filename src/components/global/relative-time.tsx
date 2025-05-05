'use client'

import { useRelativeTime } from '@/hooks/use-relative-time'

interface RelativeTimeProps {
  date: Date | string | unknown
  fallback?: string
  className?: string
}

/**
 * A component that displays a timestamp in relative format and updates automatically
 */
export default function RelativeTime({ date, fallback = 'Never', className }: RelativeTimeProps) {
  const relativeTime = useRelativeTime(date, fallback)
  
  return <span className={className}>{relativeTime}</span>
}
