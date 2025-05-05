import axios from 'axios'

/**
 * Fetches full Instagram user profile data including name, username, and profile picture
 * This combines multiple scraping methods to get the most complete profile information
 */
export async function fetchInstagramProfileData(username: string): Promise<{
  fullName: string | null
  username: string | null
  profilePictureUrl: string | null
}> {
  if (!username) {
    return {
      fullName: null,
      username: null,
      profilePictureUrl: null
    }
  }

  const result = {
    fullName: null as string | null,
    username: username,
    profilePictureUrl: null as string | null
  }

  try {
    // First try: Instagram web API endpoint (most reliable for full profile data)
    try {
      console.log(`Attempting to fetch Instagram profile data for ${username} from web API`)
      const response = await axios.get(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'X-IG-App-ID': '936619743392459' // Public Instagram web app ID
        },
        timeout: 6000
      })
      
      if (response.data?.data?.user) {
        const user = response.data.data.user
        
        // Extract full name
        if (user.full_name) {
          result.fullName = user.full_name
          console.log(`Found full name for ${username}: ${result.fullName}`)
        }
        
        // Extract profile picture
        if (user.profile_pic_url_hd || user.profile_pic_url) {
          result.profilePictureUrl = user.profile_pic_url_hd || user.profile_pic_url
          console.log(`Found profile picture for ${username} via web API`)
        }
        
        if (result.fullName && result.profilePictureUrl) {
          return result // Return early if we got all the data we need
        }
      }
    } catch (error) {
      console.log(`Web API endpoint failed for ${username}, trying alternative method`)
    }
    
    // Second try: Instagram GraphQL API (public endpoint)
    try {
      const response = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        timeout: 6000
      })
      
      if (response.data?.data?.user) {
        const user = response.data.data.user
        
        // Extract full name if we don't have it yet
        if (!result.fullName && user.full_name) {
          result.fullName = user.full_name
          console.log(`Found full name for ${username}: ${result.fullName}`)
        }
        
        // Extract profile picture if we don't have it yet
        if (!result.profilePictureUrl && (user.profile_pic_url_hd || user.profile_pic_url)) {
          result.profilePictureUrl = user.profile_pic_url_hd || user.profile_pic_url
          console.log(`Found profile picture for ${username} via GraphQL API`)
        }
        
        if (result.fullName && result.profilePictureUrl) {
          return result // Return early if we got all the data we need
        }
      }
    } catch (error) {
      console.log(`GraphQL API endpoint failed for ${username}, trying next method`)
    }
    
    // Third try: Public profile endpoint (legacy approach)
    try {
      const response = await axios.get(`https://www.instagram.com/${username}/?__a=1&__d=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        timeout: 6000
      })
      
      if (response.data?.graphql?.user) {
        const user = response.data.graphql.user
        
        // Extract full name if we don't have it yet
        if (!result.fullName && user.full_name) {
          result.fullName = user.full_name
          console.log(`Found full name for ${username}: ${result.fullName}`)
        }
        
        // Extract profile picture if we don't have it yet
        if (!result.profilePictureUrl && (user.profile_pic_url_hd || user.profile_pic_url)) {
          result.profilePictureUrl = user.profile_pic_url_hd || user.profile_pic_url
          console.log(`Found profile picture for ${username} via public profile endpoint`)
        }
        
        if (result.fullName && result.profilePictureUrl) {
          return result // Return early if we got all the data we need
        }
      }
    } catch (error) {
      console.log(`Public profile endpoint failed for ${username}, trying HTML scraping`)
    }
    
    // Fourth try: HTML scraping with optimized JSON extraction
    try {
      const response = await axios.get(`https://www.instagram.com/${username}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 6000
      })
      
      const html = response.data
      
      // NEW: Extract embedded JSON data - most reliable method in 2024
      // Instagram embeds a lot of data in a script tag with id="__NEXT_DATA__"
      const jsonDataMatch = html.match(/<script type="application\/json" data-sjs>(.+?)<\/script>/i) || 
                           html.match(/<script[^>]*>window\._sharedData\s*=\s*(.+?);<\/script>/i) ||
                           html.match(/<script[^>]*>window\.__additionalDataLoaded\([^,]+,(.+?)\);<\/script>/i)
      
      if (jsonDataMatch && jsonDataMatch[1]) {
        try {
          const jsonData = JSON.parse(jsonDataMatch[1])
          
          // Different potential paths to user data in embedded JSON
          const userData = jsonData?.dictionary?.data?.user || 
                          jsonData?.entry_data?.ProfilePage?.[0]?.graphql?.user ||
                          jsonData?.user ||
                          jsonData?.data?.user
          
          if (userData) {
            // Extract full name if we don't have it yet
            if (!result.fullName && userData.full_name) {
              result.fullName = userData.full_name
              console.log(`Found full name from embedded JSON: ${result.fullName}`)
            }
            
            // Extract profile picture if we don't have it yet
            if (!result.profilePictureUrl && (userData.profile_pic_url_hd || userData.profile_pic_url)) {
              result.profilePictureUrl = userData.profile_pic_url_hd || userData.profile_pic_url
              console.log(`Found profile picture via embedded JSON`)
            }
            
            if (result.fullName && result.profilePictureUrl) {
              return result
            }
          }
        } catch (jsonError) {
          console.log(`Error parsing embedded JSON: ${jsonError}`)
        }
      }
      
      // Fallback to regex approach if JSON extraction failed
      if (!result.fullName) {
        // Try to extract full name using regex patterns common in Instagram's HTML
        const fullNamePatterns = [
          /"full_name":"([^"]+)"/,
          /"fullName":"([^"]+)"/,
          /meta property="og:title" content="([^"]+) \(@[\w\.]+\)"/,
          /<title>([^<]+) \(@[\w\.]+\) • Instagram photos and videos<\/title>/,
          /<h1 [^>]*>([^<]+)<\/h1>/ // New pattern for 2024 Instagram HTML structure
        ]
        
        for (const pattern of fullNamePatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            result.fullName = match[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
            console.log(`Found full name via HTML regex: ${result.fullName}`)
            break
          }
        }
      }
      
      // Look for profile picture in the HTML response if we don't have it yet
      if (!result.profilePictureUrl) {
        // Try HD version first
        const profilePicHDRegex = /"profile_pic_url_hd":"([^"]+)"/
        const profilePicHDMatch = html.match(profilePicHDRegex)
        
        if (profilePicHDMatch && profilePicHDMatch[1]) {
          result.profilePictureUrl = profilePicHDMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
          console.log(`Found HD profile picture via HTML regex`)
        } else {
          // Try standard version
          const profilePicRegex = /"profile_pic_url":"([^"]+)"/
          const profilePicMatch = html.match(profilePicRegex)
          
          if (profilePicMatch && profilePicMatch[1]) {
            result.profilePictureUrl = profilePicMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
            console.log(`Found profile picture via HTML regex`)
          }
        }
      }
    } catch (error) {
      console.log(`HTML scraping failed for ${username}`)
    }
    
    // If we still don't have a full name but have a username, create a display name from username
    if (!result.fullName && result.username) {
      // Create a better display name from username than just replacing underscores
      // Split by common separators, capitalize each word, and join with spaces
      result.fullName = result.username
        .replace(/[_\.]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim()
      
      console.log(`Generated display name from username: ${result.fullName}`)
    }
    
    return result
  } catch (error) {
    console.error(`Error fetching Instagram profile data for ${username}:`, error)
    return result
  }
}

/**
 * Fetches an Instagram user's profile picture by username
 * This uses Instagram's public endpoints that don't require authentication
 */
export async function fetchInstagramProfilePicture(username: string): Promise<string | null> {
  if (!username) return null

  try {
    // Use the new comprehensive method and extract just the profile picture
    const profileData = await fetchInstagramProfileData(username)
    return profileData.profilePictureUrl ?? null
  } catch (error) {
    console.error(`Error fetching Instagram profile picture for ${username}:`, error)
    return null
  }
}