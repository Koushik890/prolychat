import axios from 'axios'
import { updateIntegration } from '@/actions/integrations/queries'

/**
 * Validates an Instagram access token by making a test API call
 */
export async function validateInstagramToken(token: string): Promise<{
  isValid: boolean
  userId?: string
  error?: string
}> {
  try {
    if (!token || token.trim() === '') {
      return { isValid: false, error: 'Token is empty' }
    }

    // Test the token by fetching user info
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token}`,
      { timeout: 10000 }
    )

    if (response.data?.user_id) {
      return { 
        isValid: true, 
        userId: response.data.user_id 
      }
    }

    return { isValid: false, error: 'Invalid token response' }
  } catch (error) {
    console.error('Token validation failed:', error)
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message = error.response?.data?.error?.message || error.message
      
      if (status === 401) {
        return { isValid: false, error: 'Token expired or invalid' }
      } else if (status === 400) {
        return { isValid: false, error: 'Invalid token format' }
      } else if (status === 429) {
        return { isValid: false, error: 'Rate limit exceeded' }
      }
      
      return { isValid: false, error: `API error: ${message}` }
    }
    
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Checks if a token is close to expiration (within 7 days)
 */
export function isTokenNearExpiration(expiresAt: Date | null): boolean {
  if (!expiresAt) return true
  
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return expiresAt <= sevenDaysFromNow
}

/**
 * Refreshes an Instagram token if it's valid but near expiration
 */
export async function refreshTokenIfNeeded(
  integrationId: string,
  currentToken: string,
  expiresAt: Date | null
): Promise<{
  success: boolean
  newToken?: string
  error?: string
}> {
  try {
    // First check if token needs refreshing
    if (!isTokenNearExpiration(expiresAt)) {
      return { success: true, newToken: currentToken }
    }

    console.log('Token is near expiration, attempting refresh...')

    // Validate current token first
    const validation = await validateInstagramToken(currentToken)
    if (!validation.isValid) {
      return { success: false, error: 'Current token is invalid, cannot refresh' }
    }

    // Attempt to refresh the token
    const refreshResponse = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`,
      { timeout: 10000 }
    )

    if (refreshResponse.data?.access_token) {
      const newToken = refreshResponse.data.access_token
      const expiresIn = refreshResponse.data.expires_in || 5184000 // Default 60 days

      // Calculate new expiration date
      const newExpiresAt = new Date()
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expiresIn)

      // Update token in database
      await updateIntegration(newToken, newExpiresAt, integrationId)
      
      console.log('Token refreshed successfully')
      return { success: true, newToken }
    }

    return { success: false, error: 'Failed to refresh token' }
  } catch (error) {
    console.error('Token refresh failed:', error)
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message
      return { success: false, error: `Refresh failed: ${message}` }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown refresh error' 
    }
  }
}

/**
 * Validates required environment variables for Instagram integration
 */
export function validateInstagramConfig(): {
  isValid: boolean
  missing: string[]
} {
  const required = [
    'INSTAGRAM_BASE_URL',
    'INSTAGRAM_CLIENT_ID',
    'INSTAGRAM_CLIENT_SECRET',
    'INSTAGRAM_TOKEN_URL',
    'INSTAGRAM_EMBEDDED_OAUTH_URL'
  ]

  const missing = required.filter(key => !process.env[key])
  
  return {
    isValid: missing.length === 0,
    missing
  }
}

/**
 * Creates a secure token storage object with encryption metadata
 */
export function createSecureTokenData(token: string, instagramId: string) {
  return {
    token,
    instagramId,
    createdAt: new Date(),
    source: 'oauth', // Track how the token was obtained
    validated: false // Will be set to true after validation
  }
}

/**
 * Checks token health and returns detailed status
 */
export async function getTokenHealth(
  token: string,
  expiresAt: Date | null
): Promise<{
  status: 'healthy' | 'warning' | 'expired' | 'invalid'
  message: string
  needsRefresh: boolean
  daysUntilExpiration?: number
}> {
  try {
    // Check expiration first
    if (expiresAt) {
      const now = new Date()
      const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (expiresAt <= now) {
        return {
          status: 'expired',
          message: 'Token has expired',
          needsRefresh: true,
          daysUntilExpiration: 0
        }
      }
      
      if (daysUntilExpiration <= 7) {
        const validation = await validateInstagramToken(token)
        return {
          status: validation.isValid ? 'warning' : 'invalid',
          message: validation.isValid 
            ? `Token expires in ${daysUntilExpiration} days` 
            : validation.error || 'Token validation failed',
          needsRefresh: true,
          daysUntilExpiration
        }
      }
      
      // Test token validity for healthy tokens
      const validation = await validateInstagramToken(token)
      return {
        status: validation.isValid ? 'healthy' : 'invalid',
        message: validation.isValid 
          ? `Token is healthy, expires in ${daysUntilExpiration} days`
          : validation.error || 'Token validation failed',
        needsRefresh: !validation.isValid,
        daysUntilExpiration
      }
    } else {
      // No expiration date, validate the token
      const validation = await validateInstagramToken(token)
      return {
        status: validation.isValid ? 'warning' : 'invalid',
        message: validation.isValid 
          ? 'Token is valid but has no expiration date'
          : validation.error || 'Token validation failed',
        needsRefresh: !validation.isValid
      }
    }
  } catch (error) {
    return {
      status: 'invalid',
      message: error instanceof Error ? error.message : 'Unknown error during health check',
      needsRefresh: true
    }
  }
} 