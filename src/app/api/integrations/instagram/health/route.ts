import { NextRequest, NextResponse } from 'next/server'
import { onCurrentUser } from '@/actions/user'
import { getIntegration } from '@/actions/integrations/queries'
import { getTokenHealth, validateInstagramConfig } from '@/lib/auth-validation'

/**
 * GET /api/integrations/instagram/health
 * 
 * Returns the health status of the user's Instagram integration
 * Includes token validation, expiration status, and configuration check
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated with enhanced error details
    const user = await onCurrentUser()
    if (user.status !== 200 || !user.data) {
      console.warn('Instagram health check failed - user authentication issue:', {
        status: user.status,
        hasData: !!user.data,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      })
      
      return NextResponse.json(
        { 
          error: 'Session expired or unavailable',
          message: 'Please refresh the page and try again',
          code: 'SESSION_UNAVAILABLE',
          retry: true
        },
        { status: 401 }
      )
    }

    // Validate Instagram configuration
    const config = validateInstagramConfig()
    if (!config.isValid) {
      return NextResponse.json(
        { 
          error: 'Instagram configuration incomplete',
          missing: config.missing,
          status: 'misconfigured'
        },
        { status: 500 }
      )
    }

    // Get user's Instagram integration
    const integration = await getIntegration(user.data.id)
    
    if (!integration || integration.integrations.length === 0) {
      return NextResponse.json(
        {
          status: 'not_connected',
          message: 'No Instagram integration found',
          connected: false
        },
        { status: 200 }
      )
    }

    const instagramIntegration = integration.integrations[0]
    
    // Check token health
    const tokenHealth = await getTokenHealth(
      instagramIntegration.token,
      instagramIntegration.expiresAt
    )

    // Prepare response data
    const healthData = {
      connected: true,
      status: tokenHealth.status,
      message: tokenHealth.message,
      needsRefresh: tokenHealth.needsRefresh,
      daysUntilExpiration: tokenHealth.daysUntilExpiration,
      integration: {
        id: instagramIntegration.id,
        createdAt: new Date(instagramIntegration.expiresAt || 0).getTime() - (60 * 24 * 60 * 60 * 1000), // Estimated creation time
        expiresAt: instagramIntegration.expiresAt,
        hasInstagramId: !!instagramIntegration.id
      },
      lastChecked: new Date().toISOString()
    }

    // Set appropriate HTTP status based on health
    let httpStatus = 200
    if (tokenHealth.status === 'expired' || tokenHealth.status === 'invalid') {
      httpStatus = 400
    } else if (tokenHealth.status === 'warning') {
      httpStatus = 200 // Still OK but needs attention
    }

    return NextResponse.json(healthData, { status: httpStatus })

  } catch (error) {
    console.error('Error checking Instagram integration health:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations/instagram/health/refresh
 * 
 * Attempts to refresh the Instagram token if needed
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await onCurrentUser()
    if (user.status !== 200 || !user.data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Instagram integration
    const integration = await getIntegration(user.data.id)
    
    if (!integration || integration.integrations.length === 0) {
      return NextResponse.json(
        { error: 'No Instagram integration found' },
        { status: 404 }
      )
    }

    const instagramIntegration = integration.integrations[0]
    
    // Import refresh function dynamically to avoid circular dependencies
    const { refreshTokenIfNeeded } = await import('@/lib/auth-validation')
    
    // Attempt token refresh
    const refreshResult = await refreshTokenIfNeeded(
      instagramIntegration.id,
      instagramIntegration.token,
      instagramIntegration.expiresAt
    )

    if (refreshResult.success) {
      // Get updated token health
      const tokenHealth = await getTokenHealth(
        refreshResult.newToken || instagramIntegration.token,
        instagramIntegration.expiresAt
      )

      return NextResponse.json(
        {
          success: true,
          refreshed: refreshResult.newToken !== instagramIntegration.token,
          status: tokenHealth.status,
          message: tokenHealth.message,
          daysUntilExpiration: tokenHealth.daysUntilExpiration
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: refreshResult.error,
          needsReconnection: true
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error refreshing Instagram token:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 