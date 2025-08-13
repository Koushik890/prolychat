'use server'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { findUser } from './queries'
import { createUser, updateSubscription } from './queries'
import { refreshToken } from '@/lib/fetch'
import { updateIntegration } from '../integrations/queries'
import { UserResponse } from '@/types/user'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs)
      return retryOperation(operation, retries - 1, delayMs)
    }
    throw error
  }
}

export const onCurrentUser = async () => {
  try {
    // Enhanced retry logic for OAuth callback scenarios where sessions might be unstable
    const user = await retryOperation(async () => {
      const session = await currentUser()
      if (!session) {
        throw new Error('No user session found')
      }
      return session
    }, MAX_RETRIES, RETRY_DELAY)

    return { status: 200, data: user }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in onCurrentUser after retries:', {
      message: errorMessage,
      maxRetries: MAX_RETRIES,
      retryDelay: RETRY_DELAY,
      timestamp: new Date().toISOString()
    })
    
    // If still no session after retries, return 401
    if (errorMessage.includes('No user session found')) {
      console.warn('No user session found after retries - OAuth callback or session issue')
      return { status: 401 }
    }
    
    return { status: 500 }
  }
}

export const onBoardUser = async () => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401 }
  }

  // Check if we have all required user data
  if (!user.data.firstName || !user.data.lastName || !user.data.emailAddresses?.[0]?.emailAddress) {
    console.error('Missing required user data:', {
      firstName: user.data.firstName,
      lastName: user.data.lastName,
      email: user.data.emailAddresses?.[0]?.emailAddress
    })
    return { status: 400, error: 'Missing required user data' }
  }

  try {
    const created = await createUser(
      user.data.id,
      user.data.firstName,
      user.data.lastName,
      user.data.emailAddresses[0].emailAddress
    )
    
    return { 
      status: 201, 
      data: created 
    }
  } catch (error) {
    console.error('Error in onBoardUser:', error instanceof Error ? error.message : 'Unknown error');
    return { status: 500 }
  }
}

export const onUserInfo = async (): Promise<UserResponse> => {
  try {
    const user = await onCurrentUser()
    if (user.status !== 200 || !user.data) {
      return { status: 401 }
    }

    const profile = await retryOperation(async () => {
      // First try to find the user
      let result = await findUser(user.data.id)
      
      // If user doesn't exist, try to create them
      if (!result) {
        // Only proceed if we have all required user data
        if (user.data.firstName && user.data.lastName && user.data.emailAddresses?.[0]?.emailAddress) {
          try {
            const created = await createUser(
              user.data.id,
              user.data.firstName,
              user.data.lastName,
              user.data.emailAddresses[0].emailAddress
            )
            if (created) {
              // Wait a bit before fetching to ensure consistency
              await delay(50)
              // Fetch the complete user profile after creation
              result = await findUser(user.data.id)
            }
          } catch (createError: any) {
            // If creation fails due to unique constraint, the user might have been created by another request
            // Try to find the user again
            console.warn('User creation failed, retrying findUser:', createError.message)
            await delay(100)
            result = await findUser(user.data.id)
          }
        }
      }
      
      if (!result) {
        throw new Error('User not found after creation attempts')
      }
      return result
    })

    if (profile) {
      return { status: 200, data: profile }
    }

    return { status: 404 }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in onUserInfo:', {
      message: errorMessage,
      timestamp: new Date().toISOString()
    })
    return { status: 500 }
  }
}

// export const onSubscribe = async (session_id: string) => {
//   const user = await onCurrentUser()
//   try {
//     const session = await stripe.checkout.sessions.retrieve(session_id)
//     if (session) {
//       const subscribed = await updateSubscription(user.id, {
//         customerId: session.customer as string,
//         plan: 'PRO',
//       })

//       if (subscribed) return { status: 200 }
//       return { status: 401 }
//     }
//     return { status: 404 }
//   } catch (error) {
//     return { status: 500 }
//   }
// }