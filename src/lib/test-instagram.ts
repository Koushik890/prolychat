import { fetchInstagramProfileData, fetchInstagramProfilePicture } from './instagram-utils'

async function testInstagramFetching() {
  try {
    // Test multiple Instagram accounts including the problematic one
    const testAccounts = ['instagram', 'staceysweetlove']
    
    for (const username of testAccounts) {
      console.log(`\n\n========== Testing profile for "${username}" ==========`)
      
      console.log(`Fetching profile data...`)
      const profileData = await fetchInstagramProfileData(username)
      
      console.log('\nProfile Data Results:')
      console.log('--------------------')
      console.log(`Full Name: ${profileData.fullName}`)
      console.log(`Username: ${profileData.username}`)
      console.log(`Profile Picture URL: ${profileData.profilePictureUrl?.substring(0, 80)}...`)
    }
    
    console.log('\n\nTest completed successfully!')
  } catch (error) {
    console.error('Test failed with error:', error)
  }
}

// Run the test
testInstagramFetching()
