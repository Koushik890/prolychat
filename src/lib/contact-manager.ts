import { db } from './db'
import { fetchInstagramProfileData } from './instagram-utils'

interface AddContactParams {
  userId: string;
  instagramId: string;  // Instagram account ID
  name: string;         // Instagram display name (or username as fallback)
  username?: string;    // Instagram username
  profilePictureUrl?: string; // Instagram profile picture URL
  status?: string;      // Optional status, defaults to 'Subscribed'
}

/**
 * Adds an Instagram account to the contacts table if it doesn't already exist
 * Now fetches real display name from Instagram when possible
 */
export async function addContactFromAutomation({
  userId,
  instagramId,
  name,
  username,
  profilePictureUrl,
  status = 'Subscribed'
}: AddContactParams): Promise<{ success: boolean; message: string; contact?: any }> {
  try {
    console.log('Adding contact:', { userId, instagramId, name, username, profilePictureUrl, status });
    
    // Basic validation - just ensure userId is a non-empty string
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId:', userId);
      return {
        success: false,
        message: `Invalid userId: ${userId}`
      };
    }
    
    // Get real Instagram display name if username is available
    let displayName = name;
    let profilePicUrl = profilePictureUrl;
    
    if (username) {
      try {
        console.log(`Fetching real Instagram profile data for ${username}`);
        const profileData = await fetchInstagramProfileData(username);
        
        if (profileData.fullName) {
          displayName = profileData.fullName;
          console.log(`Found real name: ${displayName} for ${username}`);
        }
        
        if (profileData.profilePictureUrl && !profilePicUrl) {
          profilePicUrl = profileData.profilePictureUrl;
        }
      } catch (profileError) {
        console.warn(`Could not fetch Instagram profile data for ${username}:`, profileError);
        // Continue with the process using the fallback name
      }
    }

    // Check if contact already exists
    try {
      const existingContact = await db.contact.findFirst({
        where: {
          userId,
          instagramId,
        } as any,
      });

      if (existingContact) {
        console.log('Contact already exists:', existingContact);
        
        // Update the name if we have a better one now
        if (displayName && displayName !== existingContact.name && displayName !== username) {
          const updatedContact = await db.contact.update({
            where: { id: existingContact.id },
            data: { 
              name: displayName,
              profilePictureUrl: profilePicUrl || existingContact.profilePictureUrl
            }
          });
          
          console.log('Updated existing contact with better name:', updatedContact);
          return {
            success: true,
            message: 'Contact already exists and was updated with better name',
            contact: updatedContact
          };
        }
        
        return {
          success: true,
          message: 'Contact already exists',
          contact: existingContact
        };
      }
    } catch (findError) {
      console.error('Error checking for existing contact:', findError);
      // Continue to creating the contact
    }

    // Create new contact with the real name when available
    try {
      const contact = await db.contact.create({
        data: {
          userId,
          instagramId,
          name: displayName, // Using real name if available
          username,
          profilePictureUrl: profilePicUrl,
          status: status as any,
        } as any,
      });

      console.log('Contact created successfully:', contact);
      return {
        success: true,
        message: 'Contact created successfully',
        contact
      };
    } catch (createError) {
      console.error('Error creating contact:', createError);
      return {
        success: false,
        message: `Error creating contact: ${createError instanceof Error ? createError.message : String(createError)}`
      };
    }
  } catch (error) {
    console.error('Error in addContactFromAutomation:', error);
    return {
      success: false,
      message: `Error adding contact: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}