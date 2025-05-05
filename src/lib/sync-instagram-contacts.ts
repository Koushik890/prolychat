import { db } from './db'
import { fetchInstagramProfileData } from './instagram-utils'

interface SyncStats {
  total: number
  updated: number
  failed: number
  skipped: number
}

/**
 * Syncs all Instagram contacts with their latest profile data from Instagram
 * This helps ensure that names and profile pictures are up-to-date
 * @param userId Optional user ID to filter contacts
 * @returns Statistics about the synchronization process
 */
export async function syncInstagramContacts(userId?: string): Promise<SyncStats> {
  const stats: SyncStats = {
    total: 0,
    updated: 0,
    failed: 0,
    skipped: 0
  }
  
  try {
    console.log('Starting Instagram contacts sync process...')
    
    // Query for all Instagram contacts (or filtered by userId if provided)
    const whereClause = userId ? { userId } : {}
    
    const instagramContacts = await db.contact.findMany({
      where: {
        ...whereClause,
        // Only include contacts with Instagram IDs and usernames
        instagramId: { not: '' },
        username: { not: '' }
      }
    })
    
    stats.total = instagramContacts.length
    console.log(`Found ${stats.total} Instagram contacts to sync`)
    
    // Process each contact
    for (const contact of instagramContacts) {
      try {
        if (!contact.username) {
          stats.skipped++
          console.log(`Skipping contact: ${contact.id} (no username)`)
          continue
        }
        
        // Always attempt to fetch real profile data for all Instagram contacts
        console.log(`Syncing profile for: ${contact.username}`)
        
        // Fetch latest profile data from Instagram
        const profileData = await fetchInstagramProfileData(contact.username)
        
        // Only update if we got data and have proper full name (not just username)
        if (profileData.fullName && 
            profileData.fullName !== contact.username) {
          
          // Update the contact record
          await db.contact.update({
            where: { id: contact.id },
            data: {
              name: profileData.fullName,
              profilePictureUrl: profileData.profilePictureUrl || contact.profilePictureUrl
            }
          })
          
          stats.updated++
          console.log(`Updated contact: ${contact.username} -> ${profileData.fullName}`)
        } else {
          stats.skipped++
          console.log(`No real name found for ${contact.username}, skipping update`)
        }
      } catch (contactError) {
        stats.failed++
        console.error(`Error syncing contact ${contact.username}:`, contactError)
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    console.log('Instagram contacts sync completed:', stats)
    return stats
    
  } catch (error) {
    console.error('Failed to sync Instagram contacts:', error)
    throw error
  }
}

/**
 * Syncs a single Instagram contact by username
 */
export async function syncSingleInstagramContact(contactId: string): Promise<boolean> {
  try {
    const contact = await db.contact.findUnique({
      where: { id: contactId }
    })
    
    if (!contact || !contact.username) {
      console.error(`Contact not found or missing username: ${contactId}`)
      return false
    }
    
    console.log(`Syncing single contact: ${contact.username}`)
    
    // Fetch latest profile data
    const profileData = await fetchInstagramProfileData(contact.username)
    
    if (profileData.fullName) {
      // Update the contact record
      await db.contact.update({
        where: { id: contactId },
        data: {
          name: profileData.fullName,
          profilePictureUrl: profileData.profilePictureUrl || contact.profilePictureUrl
        }
      })
      
      console.log(`Updated contact: ${contact.username} -> ${profileData.fullName}`)
      return true
    } else {
      console.log(`No real name found for ${contact.username}`)
      return false
    }
    
  } catch (error) {
    console.error(`Failed to sync contact ${contactId}:`, error)
    return false
  }
}
