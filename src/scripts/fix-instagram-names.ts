import { db } from '../lib/db'
import { fetchInstagramProfileData } from '../lib/instagram-utils'

/**
 * This script updates all Instagram contacts with their real display names
 * It fixes the issue where contact names were set to usernames instead of actual names
 */
async function fixInstagramNames() {
  console.log('Starting Instagram contact names fix script...')
  
  try {
    // Get all Instagram contacts that have usernames but might not have proper names
    const instagramContacts = await db.contact.findMany({
      where: {
        username: { not: '' },
        instagramId: { not: '' }
      }
    })
    
    console.log(`Found ${instagramContacts.length} Instagram contacts to check`)
    
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    // Process each contact
    for (const contact of instagramContacts) {
      try {
        if (!contact.username) {
          console.log(`Skipping contact ${contact.id}: No username available`)
          skippedCount++
          continue
        }
        
        // Check if name matches username or looks like a formatted username
        const usernameBasedName = contact.username
          .replace(/[_\.]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim()
        
        // Only update if the name looks like it might be derived from the username
        const needsUpdate = !contact.name || 
          contact.name === contact.username || 
          contact.name === usernameBasedName
        
        if (!needsUpdate) {
          console.log(`Skipping contact ${contact.username}: Already has proper name: ${contact.name}`)
          skippedCount++
          continue
        }
        
        console.log(`Fetching real name for ${contact.username}...`)
        
        // Fetch the real profile information
        const profileData = await fetchInstagramProfileData(contact.username)
        
        if (!profileData.fullName || 
            profileData.fullName === contact.username || 
            profileData.fullName === contact.name) {
          console.log(`No better name found for ${contact.username}`)
          skippedCount++
          continue
        }
        
        // Update the contact with the real name
        await db.contact.update({
          where: { id: contact.id },
          data: {
            name: profileData.fullName,
            profilePictureUrl: profileData.profilePictureUrl || contact.profilePictureUrl
          }
        })
        
        console.log(`✅ Updated contact ${contact.username} -> ${profileData.fullName}`)
        updatedCount++
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
        
      } catch (error) {
        console.error(`Error processing contact ${contact.username}:`, error)
        errorCount++
      }
    }
    
    console.log('\nInstagram names fix completed:')
    console.log(`- Total contacts checked: ${instagramContacts.length}`)
    console.log(`- Updated with real names: ${updatedCount}`)
    console.log(`- Skipped (already correct): ${skippedCount}`)
    console.log(`- Errors: ${errorCount}`)
    
  } catch (error) {
    console.error('Error running the fix script:', error)
  }
}

// Run the script
fixInstagramNames().catch(console.error)
