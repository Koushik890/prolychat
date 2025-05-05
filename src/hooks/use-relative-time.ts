'use client'

import { useState, useEffect } from 'react'
import { formatRelativeTime } from '@/lib/utils'

/**
 * A hook that provides dynamically updating relative time strings
 * Updates automatically based on the age of the timestamp
 * 
 * @param date The date to display in relative format
 * @param fallback Optional fallback text if date is invalid
 * @returns A string representing the relative time that updates automatically
 */
export function useRelativeTime(date: Date | string | unknown, fallback: string = 'Never'): string {
  const [relativeTime, setRelativeTime] = useState<string>(formatRelativeTime(date, fallback))

  useEffect(() => {
    if (!date) return
    
    // Initial formatting
    setRelativeTime(formatRelativeTime(date, fallback))
    
    // Set appropriate update interval based on age
    const calculateInterval = () => {
      if (!date) return 60000 // Default to 1 minute
      
      try {
        const dateObj = date instanceof Date ? date : new Date(date as string)
        if (isNaN(dateObj.getTime())) return 60000 // Invalid date, default to 1 minute
        
        const now = new Date()
        const diffInMs = now.getTime() - dateObj.getTime()
        const diffInSecs = Math.floor(diffInMs / 1000)
        
        // More frequent updates for recent items
        if (diffInSecs < 60) return 1000 // 1 second updates for "just now" and "X seconds ago"
        if (diffInSecs < 3600) return 30000 // 30 second updates for "X minutes ago"
        if (diffInSecs < 86400) return 300000 // 5 minute updates for "X hours ago"
        return 3600000 // 1 hour updates for "X days ago"
      } catch (error) {
        console.error('Error calculating update interval:', error)
        return 60000 // Default to 1 minute on error
      }
    }
    
    // Set up the interval timer with dynamic frequency
    let intervalId = setInterval(() => {
      setRelativeTime(formatRelativeTime(date, fallback))
    }, calculateInterval())
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [date, fallback])
  
  return relativeTime
}
