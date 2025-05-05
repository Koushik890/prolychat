import { db } from '@/lib/db'

/**
 * Checks for contacts whose pause duration has ended and updates their status
 * to 'Subscribed'. This job should be run periodically (e.g., every 5-15 minutes)
 * to ensure paused contacts automatically resume when their pause period ends.
 */
export async function checkPausedContacts(): Promise<{ updated: number; errors: number }> {
  console.log('[JOB] Checking for paused contacts with expired durations')
  
  const now = new Date()
  let updatedCount = 0
  let errorCount = 0
  
  try {
    // Find all paused contacts with an end time in the past
    const expiredPauses = await db.contact.findMany({
      where: {
        status: 'Paused',
        isPausedForever: false,
        // Only get contacts where pause has ended
        pauseEndTime: {
          lt: now,
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        pauseEndTime: true
      }
    })
    
    console.log(`[JOB] Found ${expiredPauses.length} contacts with expired pause durations`)
    
    // Update each contact in a loop to handle potential failures individually
    for (const contact of expiredPauses) {
      try {
        await db.contact.update({
          where: { id: contact.id },
          data: {
            status: 'Subscribed',
            pauseDuration: null,
            pauseEndTime: null
          }
        })
        
        console.log(`[JOB] Resumed automations for contact: ${contact.name} (ID: ${contact.id})`)
        updatedCount++
      } catch (error) {
        console.error(`[JOB] Error updating contact ${contact.id}:`, error)
        errorCount++
      }
    }
    
    console.log(`[JOB] Successfully resumed automations for ${updatedCount} contacts`)
    return { updated: updatedCount, errors: errorCount }
  } catch (error) {
    console.error('[JOB] Error checking paused contacts:', error)
    return { updated: 0, errors: 1 }
  }
} 