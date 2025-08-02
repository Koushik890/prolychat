"use server"

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'
import { ApiResponse, UserProfile } from '@/types/user'
import { manuallyConnectInstagram } from './manual-connect'

export { manuallyConnectInstagram }

export const onOauthInstagram = async (strategy: 'INSTAGRAM' | 'CRM') => {
    console.log('🔗 onOauthInstagram called with strategy:', strategy);
    
    if (strategy === 'INSTAGRAM') {
        const oauthUrl = process.env.INSTAGRAM_EMBEDDED_OAUTH_URL;
        console.log('🔑 Instagram OAuth URL configured:', !!oauthUrl);
        console.log('🌐 OAuth URL:', oauthUrl);
        
        if (!oauthUrl) {
            console.error('❌ Instagram OAuth URL is not configured');
            throw new Error('Instagram OAuth URL is not configured');
        }
        
        console.log('📍 Redirecting to Instagram OAuth...');
        return redirect(oauthUrl);
    }
}

export const onIntegrate = async (code: string): Promise<ApiResponse<UserProfile>> => {
    const user = await onCurrentUser()
    if (user.status !== 200 || !user.data) {
      return { status: 401, data: undefined, error: 'Unauthorized' }
    }
  
    try {
      const integration = await getIntegration(user.data.id)
  
      if (integration && integration.integrations.length === 0) {
        // Generate tokens from authorization code
        const token = await generateTokens(code)
        console.log('Token exchange successful')
  
        if (token?.access_token) {
          // Validate the token and get Instagram user ID
          const insta_id = await axios.get(
            `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token.access_token}`,
            { timeout: 10000 }
          )

          if (!insta_id.data?.user_id) {
            console.error('Failed to get Instagram user ID')
            return { status: 400, error: 'Failed to validate Instagram account' }
          }
  
          // Calculate proper expiration date
          const expiresIn = token.expires_in || 5184000 // Default 60 days if not provided
          const expire_date = new Date()
          expire_date.setSeconds(expire_date.getSeconds() + expiresIn)
          
          console.log('Creating integration with validated token', {
            userId: user.data.id,
            instagramId: insta_id.data.user_id,
            expiresAt: expire_date
          })

          const create = await createIntegration(
            user.data.id,
            token.access_token,
            expire_date,
            insta_id.data.user_id
          )
          return { status: 200, data: create }
        }
        console.error('Token generation failed - no access token received')
        return { status: 400, error: 'Failed to obtain access token' }
      }
      
      console.log('User already has integration or user not found')
      return { status: 409, error: 'Instagram integration already exists' }
    } catch (error) {
      console.error('Error in onIntegrate:', error)
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const message = error.response?.data?.error?.message || error.message
        
        if (status === 401) {
          return { status: 401, error: 'Instagram authentication failed' }
        } else if (status === 400) {
          return { status: 400, error: 'Invalid authorization code or configuration' }
        } else if (status === 429) {
          return { status: 429, error: 'Rate limit exceeded, please try again later' }
        }
        
        return { status: 500, error: `Instagram API error: ${message}` }
      }
      
      return { status: 500, error: 'Internal server error during integration' }
    }
  }
