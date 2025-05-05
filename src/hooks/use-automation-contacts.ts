import { useCallback } from 'react'
import { addContactFromAutomation } from '@/lib/contact-manager'

/**
 * Hook to add Instagram account to contacts after automation completes
 */
export function useAutomationContacts() {
  /**
   * Adds an Instagram account to contacts after automation completes
   * @param userId - User ID
   * @param instagramHandle - Instagram username
   * @param instagramId - Instagram account ID
   */
  const addContactAfterAutomation = useCallback(async (
    userId: string,
    instagramHandle: string,
    instagramId: string
  ) => {
    try {
      const result = await addContactFromAutomation({
        userId,
        instagramId,
        name: instagramHandle,
        status: 'Subscribed'
      })
      
      console.log('Contact addition result:', result)
      return result
    } catch (error) {
      console.error('Error adding contact after automation:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, [])

  return {
    addContactAfterAutomation
  }
} 