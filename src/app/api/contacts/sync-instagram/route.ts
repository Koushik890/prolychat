import { syncInstagramContacts, syncSingleInstagramContact } from '@/lib/sync-instagram-contacts'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Function to get the UUID for a Clerk user ID
async function getUuidForClerkUser(clerkUserId: string) {
  // Query the User table to find the internal UUID that matches the Clerk ID
  try {
    const user = await db.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
      },
    })
    
    return user?.id
  } catch (error) {
    console.error('Error fetching UUID for Clerk user:', error)
    return null
  }
}

/**
 * POST: Sync all Instagram contacts for a user to fetch their real names
 */
export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user from Clerk
    const authResult = await auth()
    const { userId: clerkUserId } = authResult
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get internal UUID for this Clerk user
    const userId = await getUuidForClerkUser(clerkUserId)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse request - may include filter options
    const requestData = await request.json().catch(() => ({}))
    
    // Allow syncing a single contact by ID
    if (requestData.contactId) {
      const success = await syncSingleInstagramContact(requestData.contactId)
      
      return NextResponse.json({
        success,
        message: success 
          ? 'Contact synced successfully' 
          : 'Failed to sync contact or no data to update'
      })
    }
    
    // Start sync process for all contacts of this user
    const stats = await syncInstagramContacts(userId)
    
    return NextResponse.json({
      success: true,
      message: `Synced ${stats.updated} Instagram contacts successfully`,
      stats
    })
    
  } catch (error) {
    console.error('Error syncing Instagram contacts:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync Instagram contacts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
