import { Contact } from '@/types/contact'

/**
 * Checks if a contact is currently paused
 */
export function isContactPaused(contact: any): boolean {
  // Check if contact has pause status
  if (contact?.status !== 'Paused') {
    return false
  }
  
  // If paused forever, it's definitely paused
  if (contact?.isPausedForever) {
    return true
  }
  
  // Check if there's a pause end time and if it's in the future
  if (contact?.pauseEndTime) {
    const pauseEndTime = new Date(contact.pauseEndTime)
    const now = new Date()
    return pauseEndTime > now
  }
  
  // Default to false if no pause conditions are met
  return false
}

/**
 * Checks if a contact is currently reported
 */
export function isContactReported(contact: any): boolean {
  // Check if contact has Report status
  return contact?.status === 'Report'
}

/**
 * Gets the remaining time for a paused contact in human-readable format
 */
export function getPauseTimeRemaining(contact: any): string {
  if (!isContactPaused(contact) || contact?.isPausedForever) {
    return ''
  }
  
  if (!contact?.pauseEndTime) {
    return ''
  }
  
  const pauseEndTime = new Date(contact.pauseEndTime)
  const now = new Date()
  const diff = pauseEndTime.getTime() - now.getTime()
  
  if (diff <= 0) {
    return 'Time expired'
  }
  
  // Calculate hours, minutes, seconds
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
} 