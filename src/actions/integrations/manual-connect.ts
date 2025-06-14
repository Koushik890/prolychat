'use server'

import { client } from '@/lib/prisma'
import { onCurrentUser } from '../user'
import { ApiResponse, UserProfile } from '@/types/user'

/**
 * Manually connect Instagram account using pre-existing token and ID
 * This is useful when the OAuth flow fails but we already have valid credentials
 */
export const manuallyConnectInstagram = async (
  token: string,
  instagramId: string
): Promise<ApiResponse<UserProfile>> => {
  try {
    // Get current authenticated user
    const user = await onCurrentUser()
    if (user.status !== 200 || !user.data) {
      return { status: 401, error: 'Unauthorized' }
    }

    // Set expiration date for token (60 days from now)
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() + 60)

    // Create or update integration
    const updatedUser = await client.user.update({
      where: {
        clerkId: user.data.id,
      },
      data: {
        integrations: {
          create: {
            token,
            expiresAt: expireDate,
            instagramId,
            name: 'INSTAGRAM',
          },
        },
      },
      include: {
        subscription: true,
        integrations: {
          where: {
            name: 'INSTAGRAM',
          },
        },
      },
    })

    console.log('Successfully connected Instagram manually', {
      userId: user.data.id,
      instagramId
    })

    return { status: 200, data: updatedUser }
  } catch (error) {
    console.error('Error manually connecting Instagram:', error)
    return { status: 500, error: 'Internal server error' }
  }
} 