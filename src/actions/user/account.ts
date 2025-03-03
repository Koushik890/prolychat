'use server'

import { z } from 'zod'
import { client } from '@/lib/prisma'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { findUser } from './queries'
import { ApiResponse } from '@/types/user'

const userNameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
})

export type UserNameUpdateData = z.infer<typeof userNameSchema>

export type FormState = {
  status: 'success' | 'error' | 'idle'
  message?: string
}

export async function getUserData() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return { status: 401, error: 'Not authenticated' }
    }

    const user = await findUser(clerkUser.id)
    if (!user) {
      return { status: 404, error: 'User not found' }
    }

    return {
      status: 200,
      data: {
        id: user.id,
        firstName: user.firstname || '',
        lastName: user.lastname || '',
        email: user.email || '',
        clerkId: user.clerkId
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return { status: 500, error: 'Failed to fetch user data' }
  }
}

export async function updateUserName(formData: UserNameUpdateData): Promise<FormState> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return { status: 'error', message: 'Not authenticated' }
    }

    const validatedData = userNameSchema.parse(formData)

    // Update user in our database
    await client.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        firstname: validatedData.firstName,
        lastname: validatedData.lastName
      }
    })

    // Update Clerk profile using the SDK
    try {
      // Using Clerk Backend SDK
      const clerk = await clerkClient()
      await clerk.users.updateUser(clerkUser.id, {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      })
    } catch (clerkError) {
      console.error('Failed to update Clerk user data:', clerkError)
      // We'll continue even if Clerk update fails
    }

    return { status: 'success', message: 'Name updated successfully' }
  } catch (error) {
    console.error('Error updating user name:', error)
    if (error instanceof z.ZodError) {
      return { status: 'error', message: error.errors[0].message }
    }
    return { status: 'error', message: 'Failed to update name' }
  }
}

export async function updateUserEmail(email: string): Promise<FormState> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return { status: 'error', message: 'Not authenticated' }
    }

    // Update user email in our database to match Clerk's primary email
    try {
      await client.user.update({
        where: { clerkId: clerkUser.id },
        data: { email }
      })
      
      console.log('Database user email updated to:', email)
    } catch (dbError) {
      console.error('Failed to update email in database:', dbError)
      // We'll continue even if database update fails, but log the error
    }

    return { 
      status: 'success', 
      message: 'Email updated successfully.' 
    }
  } catch (error) {
    console.error('Error updating user email:', error)
    return { status: 'error', message: 'Failed to update email' }
  }
}
