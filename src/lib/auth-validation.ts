import prisma from '@/lib/prisma'

/**
 * Token health status types
 */
export type TokenHealthStatus = 'healthy' | 'warning' | 'expired' | 'invalid'

export interface TokenHealth {
  status: TokenHealthStatus
  message: string
  needsRefresh: boolean
  daysUntilExpiration: number | null
}

export interface InstagramConfig {
  isValid: boolean
  missing: string[]
}

export interface RefreshResult {
  success: boolean
  newToken?: string
  error?: string
}

/**
 * Validates Instagram access token health and expiration status
 */
export async function getTokenHealth(token: string, expiresAt: Date | null): Promise<TokenHealth> {
  if (!token) {
    return {
      status: 'invalid',
      message: 'No access token found',
      needsRefresh: false,
      daysUntilExpiration: null
    }
  }

  if (!expiresAt) {
    return {
      status: 'warning',
      message: 'Token expiration date unknown',
      needsRefresh: true,
      daysUntilExpiration: null
    }
  }

  const now = new Date()
  const expiration = new Date(expiresAt)
  const daysUntilExpiration = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration <= 0) {
    return {
      status: 'expired',
      message: 'Access token has expired',
      needsRefresh: true,
      daysUntilExpiration
    }
  }

  if (daysUntilExpiration <= 7) {
    return {
      status: 'warning',
      message: `Token expires in ${daysUntilExpiration} day(s)`,
      needsRefresh: true,
      daysUntilExpiration
    }
  }

  return {
    status: 'healthy',
    message: `Token valid for ${daysUntilExpiration} more days`,
    needsRefresh: false,
    daysUntilExpiration
  }
}

/**
 * Validates Instagram configuration environment variables
 */
export function validateInstagramConfig(): InstagramConfig {
  const required = [
    'INSTAGRAM_CLIENT_ID',
    'INSTAGRAM_CLIENT_SECRET',
    'INSTAGRAM_REDIRECT_URI'
  ]

  const missing = required.filter(key => !process.env[key])

  return {
    isValid: missing.length === 0,
    missing
  }
}

/**
 * Refreshes Instagram token if needed (near expiration)
 */
export async function refreshTokenIfNeeded(
  integrationId: string,
  currentToken: string,
  expiresAt: Date | null
): Promise<RefreshResult> {
  try {
    const tokenHealth = await getTokenHealth(currentToken, expiresAt)

    // Only refresh if token needs refresh
    if (!tokenHealth.needsRefresh) {
      return {
        success: true,
        newToken: currentToken
      }
    }

    // Attempt to refresh token via Instagram API
    const refreshUrl = 'https://graph.instagram.com/refresh_access_token'
    const response = await fetch(`${refreshUrl}?grant_type=ig_refresh_token&access_token=${currentToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || 'Failed to refresh token'
      }
    }

    const data = await response.json()
    const newToken = data.access_token
    const expiresIn = data.expires_in

    if (!newToken) {
      return {
        success: false,
        error: 'No access token returned from refresh'
      }
    }

    // Calculate new expiration date (typically 60 days from now)
    const newExpiresAt = new Date()
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + (expiresIn || 60 * 24 * 60 * 60))

    // Update token in database
    await prisma.integrations.update({
      where: { id: integrationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt
      }
    })

    return {
      success: true,
      newToken
    }

  } catch (error) {
    console.error('Error refreshing Instagram token:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during token refresh'
    }
  }
}

/**
 * Validates Instagram access token by making a test API call
 */
export async function validateInstagramToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${token}`)
    return response.ok
  } catch (error) {
    console.error('Error validating Instagram token:', error)
    return false
  }
} 