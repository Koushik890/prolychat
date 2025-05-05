import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { fetchInstagramProfileData } from '@/lib/instagram-utils';

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
    });
    
    return user?.id;
  } catch (error) {
    console.error('Error fetching UUID for Clerk user:', error);
    return null;
  }
}

export async function GET(req: Request) {
  const authResult = await auth();
  console.log('Auth result:', authResult);
  const { userId: clerkUserId } = authResult;
  
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Clerk User ID:', clerkUserId);
  
  try {
    // First, get the internal UUID for this clerk user
    const userId = await getUuidForClerkUser(clerkUserId);
    console.log('Internal UUID for clerk user:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const contacts = await db.contact.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        userId: true,
        instagramId: true,
        name: true,
        username: true,
        profilePictureUrl: true,
        status: true,
        subscribed: true,
        pauseDuration: true,
        isPausedForever: true,
        pauseEndTime: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUuidForClerkUser(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    let { name, instagramId, username = '', status = 'Subscribed' } = body;

    if (!instagramId) {
      return NextResponse.json(
        { error: 'Instagram ID is required' },
        { status: 400 }
      );
    }

    // If username is provided, fetch real name and profile pic from Instagram
    let profilePictureUrl = body.profilePictureUrl || null;
    let displayName = name;

    if (username) {
      try {
        console.log(`Fetching Instagram profile data for ${username}`);
        const profileData = await fetchInstagramProfileData(username);
        
        if (profileData.fullName) {
          displayName = profileData.fullName;
          console.log(`Found real name: ${displayName} for ${username}`);
        }
        
        if (profileData.profilePictureUrl && !profilePictureUrl) {
          profilePictureUrl = profileData.profilePictureUrl;
        }
      } catch (profileError) {
        console.warn(`Could not fetch Instagram profile data for ${username}:`, profileError);
        // Continue with original name
      }
    }

    // Run migration to ensure the schema is up to date
    await db.$executeRaw`SELECT 1 FROM "Contact" LIMIT 1`;

    // Check if contact already exists
    const existingContact = await db.contact.findFirst({
      where: {
        userId,
        instagramId: instagramId,
      } as any,
    });

    if (existingContact) {
      // Update with better information if we have it
      if (displayName && displayName !== existingContact.name && displayName !== username) {
        const updatedContact = await db.contact.update({
          where: { id: existingContact.id },
          data: { 
            name: displayName,
            profilePictureUrl: profilePictureUrl || existingContact.profilePictureUrl,
            username: username || existingContact.username
          }
        });
        
        return NextResponse.json({ 
          message: 'Contact updated with improved profile data', 
          contact: updatedContact 
        });
      }
      
      return NextResponse.json({ 
        message: 'Contact already exists', 
        contact: existingContact 
      });
    }

    // Create new contact with the real name from Instagram
    const contact = await db.contact.create({
      data: {
        userId,
        instagramId,
        name: displayName, // Using the fetched real name
        username, // Store username separately
        profilePictureUrl,
        status,
      } as any,
    });

    return NextResponse.json({ 
      message: 'Contact created successfully', 
      contact 
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}