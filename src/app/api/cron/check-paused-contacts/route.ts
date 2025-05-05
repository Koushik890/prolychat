import { NextResponse } from 'next/server'
import { checkPausedContacts } from '@/lib/jobs/check-paused-contacts'

/**
 * API endpoint to check for contacts with expired pause durations
 * This can be called by a cron job or scheduler (e.g., Vercel Cron)
 * Recommended schedule: Every 5-15 minutes
 */
export async function GET() {
  try {
    // Check for authentication or secret key here if needed
    // For now, we'll skip this since it's a simple demo

    // Run the job to check paused contacts
    const result = await checkPausedContacts()
    
    return NextResponse.json({
      success: true,
      message: `Successfully resumed automations for ${result.updated} contacts with expired pause durations`,
      ...result
    })
  } catch (error) {
    console.error('Error running paused contacts check:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking paused contacts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 