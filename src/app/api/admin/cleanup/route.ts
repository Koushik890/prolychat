import { NextRequest, NextResponse } from 'next/server'
import { performDatabaseCleanup } from '@/lib/db-cleanup'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  // Basic admin authentication - could be enhanced with more robust auth checks
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    // In a production app, you'd want to check if the user has admin privileges
    // by querying your database or checking a specific role in Clerk/auth provider
    
    // For now, we'll proceed with the cleanup
    const cleanupResult = await performDatabaseCleanup()
    
    if (cleanupResult.success) {
      return NextResponse.json(
        {
          message: 'Database cleanup completed successfully',
          results: cleanupResult.results
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Database cleanup encountered errors',
          error: cleanupResult.results.error
        },
        { status: 500 }
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        message: 'Error during database cleanup',
        error: errorMessage
      },
      { status: 500 }
    )
  }
} 