import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// Function to get the UUID for a Clerk user ID
async function getUuidForClerkUser(clerkUserId: string) {
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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getUuidForClerkUser(clerkUserId)
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const contactId = params.id
    
    // Parse request body
    const body = await req.json()
    const { status, pauseDuration, isPausedForever, pauseEndTime } = body

    // Verify the contact belongs to the user
    const existingContact = await db.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Update the contact
    const updatedContact = await db.contact.update({
      where: { id: contactId },
      data: { 
        status,
        pauseDuration,
        isPausedForever,
        pauseEndTime: pauseEndTime ? new Date(pauseEndTime) : null,
      }
    })

    return NextResponse.json({ 
      message: 'Contact updated successfully', 
      contact: updatedContact 
    })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getUuidForClerkUser(clerkUserId)
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const contactId = params.id
    
    // Verify the contact belongs to the user
    const contact = await db.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
  }
} 