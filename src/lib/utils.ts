import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getMonth = (month: number) => {
  const months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  if (month < 1 || month > 12) {
    return 'Invalid month number. Please enter a number between 1 and 12.'
  }

  return months[month - 1]
}

export const duplicateValidation = (arr: string[], el: string) => {
  if (!arr.find((t) => t === el)) {
    arr.push(el)
    return arr
  } else {
    arr = arr.filter((t) => t !== el)
    return arr
  }
}

/**
 * Safely formats a date as a localized string, handling potential invalid dates
 * @param date - Date object, string, or any data that might be a date
 * @param fallback - Optional fallback string if date is invalid (defaults to 'Never')
 * @returns Formatted date string or fallback value
 */
export function formatDate(date: Date | string | unknown, fallback: string = 'Never'): string {
  if (!date) return fallback;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date as string);
    // Check if date is valid
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString();
    }
    return fallback;
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Format a date as a relative time string (e.g., "2 minutes ago", "5 hours ago", "3 days ago")
 * Falls back to standard date format for dates older than 30 days
 */
export function formatRelativeTime(date: Date | string | unknown, fallback: string = 'Never'): string {
  if (!date) return fallback;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date as string);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Use relative time for recent dates
    if (diffInSecs < 60) {
      return diffInSecs <= 5 ? 'just now' : `${diffInSecs} seconds ago`;
    } else if (diffInMins < 60) {
      return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      // Fall back to standard date for older dates
      return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return fallback;
  }
}