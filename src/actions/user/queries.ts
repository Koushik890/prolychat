'use server'

import { client } from '@/lib/prisma'
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from '@prisma/client'

export const findUser = async (clerkId: string) => {
  return await client.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      subscription: true,
      integrations: {
        select: {
          id: true,
          token: true,
          expiresAt: true,
          name: true,
        },
      },
    },
  })
}

export const createUser = async (
  clerkId: string,
  firstname: string,
  lastname: string,
  email: string
) => {
  // Use upsert to handle the race condition atomically
  try {
    const result = await client.user.upsert({
      where: { clerkId },
      update: {
        firstname,
        lastname,
        email,
      },
      create: {
        clerkId,
        firstname,
        lastname,
        email,
        subscription: {
          create: {
            plan: SUBSCRIPTION_PLAN.FREE,
            subscriptionStatus: undefined,
          },
        },
      },
      select: {
        firstname: true,
        lastname: true,
      },
    });
    
    return result;
  } catch (error: any) {
    console.error('Error in createUser:', {
      clerkId,
      firstname,
      lastname,
      email,
      error: error.message,
      code: error.code
    });
    
    // If we still get a unique constraint error, try a simple find and update
    if (error?.code === 'P2002') {
      try {
        // Wait a bit to avoid immediate retry conflicts
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const existingUser = await client.user.findUnique({
          where: { clerkId },
          select: {
            firstname: true,
            lastname: true,
          },
        });
        
        if (existingUser) {
          return existingUser;
        }
        
        // If still not found, something is very wrong, but try to update anyway
        return await client.user.update({
          where: { clerkId },
          data: {
            firstname,
            lastname,
            email,
          },
          select: {
            firstname: true,
            lastname: true,
          },
        });
      } catch (fallbackError: any) {
        console.error('Fallback error in createUser:', fallbackError);
        throw new Error(`Failed to create or update user: ${fallbackError.message}`);
      }
    }
    
    throw error; // Re-throw any other errors
  }
}

export const updateSubscription = async (
  clerkId: string,
  props: { customerId?: string; plan?: 'PRO' | 'FREE' }
) => {
  const user = await client.user.findUnique({
    where: { clerkId },
    include: { subscription: true }
  });

  if (!user) {
    console.error('User not found:', clerkId);
    throw new Error('User not found');
  }

  const subscriptionData = {
    plan: props.plan === 'PRO' ? SUBSCRIPTION_PLAN.PRO : SUBSCRIPTION_PLAN.FREE,
    subscriptionStatus: props.plan === 'PRO' ? SUBSCRIPTION_STATUS.ACTIVE : undefined,
    ...(props.customerId ? { customerId: props.customerId } : {})
  };

  // If subscription doesn't exist, create it
  if (!user.subscription) {
    return await client.user.update({
      where: { clerkId },
      data: {
        subscription: {
          create: subscriptionData
        }
      }
    });
  }

  // If subscription exists, update it
  return await client.user.update({
    where: { clerkId },
    data: {
      subscription: {
        update: subscriptionData
      }
    }
  });
};


