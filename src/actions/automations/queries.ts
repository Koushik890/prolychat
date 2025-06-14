'use server'

import { client } from '@/lib/prisma'
import { v4 } from 'uuid'
import { withDatabaseRetry, db } from '@/lib/db-utils'
import { Automation, Post, Keyword, ReplyMessage, ACTION_TYPE } from '@prisma/client'

// Define types for the returned automation data
type AutomationWithRelations = Automation & {
  trigger?: Array<{
    id: string
    type: string
    status: string
    automationId: string
    config: any
    createdAt: Date
    updatedAt: Date
    posts: Post[]
    keywords: Keyword[]
    replyMessages: ReplyMessage[]
  }>
  listener?: any
  User?: {
    subscription?: any
    integrations?: any[]
  }
}

export const createAutomation = async (clerkId: string, id?: string) => {
  try {
    const getUserId = await withDatabaseRetry(() => client.user.findFirst({
      where: {
        clerkId,
      },
      select: {
        id: true,
      },
    }))

    if (!getUserId) return null

    const result = await withDatabaseRetry(() => client.automation.create({
      data: {
        id: id || v4(),
        userId: getUserId.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }))

    return result
  } catch (error) {
    console.error('Error creating automation:', error)
    return null
  }
}

export const getAutomations = async (clerkId: string) => {
  try {
    const getUserId = await withDatabaseRetry(() => client.user.findFirst({
      where: {
        clerkId,
      },
      select: {
        id: true,
      },
    }))

    if (!getUserId) return []

    // Use type assertion to safely access the id property
    const userId = (getUserId as { id: string }).id

    const automations = await withDatabaseRetry(() => client.automation.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        trigger: {
          include: {
            posts: true,
            keywords: true,
            replyMessages: true,
          },
        },
        listener: true,
      },
    }))

    return automations
  } catch (error) {
    console.error('Error fetching automations:', error)
    return []
  }
}

export const findAutomation = async (id: string) => {
  try {
    // Use withDatabaseRetry directly for this critical function
    const result = await withDatabaseRetry(() => 
      client.automation.findUnique({
        where: {
          id,
        },
        include: {
          trigger: {
            include: {
              posts: true,
              keywords: true,
              replyMessages: true
            }
          },
          listener: true,
          User: {
            select: {
              subscription: true,
              integrations: true,
            },
          },
        },
      })
    );

    if (!result) {
      console.error('No automation found with id:', id)
      return null
    }

    // Transform trigger data to include proper configuration
    if (result.trigger?.length > 0) {
      console.log('Raw trigger data:', result.trigger) // Debug log

      result.trigger = result.trigger.map(trigger => {
        // Determine configuration status based on data
        const hasPost = trigger.posts.length > 0
        const hasKeywords = trigger.keywords.length > 0
        const hasReplyMessages = trigger.replyMessages.length > 0
        
        // Special handling for user-message (DM) triggers
        let status
        if (trigger.type === 'user-message') {
          // For Direct Message triggers, only keywords are required
          status = hasKeywords ? 'complete' : 'unconfigured'
        } else {
          // For other triggers, use the original logic
          status = hasPost && hasKeywords && hasReplyMessages ? 'complete' :
                  hasPost || hasKeywords || hasReplyMessages ? 'partial' :
                  'unconfigured'
        }

        console.log('Processing trigger:', {
          type: trigger.type,
          status,
          hasPost,
          hasKeywords,
          hasReplyMessages
        })

        // Create base trigger object with all data
        const transformedTrigger = {
          ...trigger,
          status,
          type: trigger.type, // Keep original API type
          config: {
            status,
            type: 'all', // Default to 'all'
            posts: trigger.posts.map(post => ({
              postId: post.postId,
              mediaType: post.mediaType,
              mediaUrl: post.mediaUrl,
              caption: post.caption
            })),
            keywords: {
              include: trigger.keywords.map(k => k.word)
            },
            replyMessages: trigger.replyMessages.map(r => r.message)
          }
        }

        console.log('Transformed trigger:', transformedTrigger)
        return transformedTrigger
      })
    }

    console.log('Final automation data:', result)
    return result
  } catch (error) {
    console.error('Error in findAutomation:', error)
    return null
  }
}

export const updateAutomation = async (
  id: string,
  update: {
    name?: string
    active?: boolean
  }
) => {
  try {
    return await withDatabaseRetry(() => client.automation.update({
      where: {
        id,
      },
      data: {
        ...update,
        updatedAt: new Date(),
      },
    }))
  } catch (error) {
    console.error('Error updating automation:', error)
    throw error
  }
}

export const addListener = async (
  automationId: string,
  actionType: ACTION_TYPE,
  prompt: string,
  message?: string
) => {
  if (!automationId) {
    return { status: 400, data: 'Automation ID is required' };
  }

  if (!actionType) {
    return { status: 400, data: 'Action type is required' };
  }

  try {
    const automation = await withDatabaseRetry(() => client.automation.findUnique({
      where: { id: automationId },
    }));

    if (!automation) {
      return { status: 404, data: 'Automation not found' };
    }

    const result = await withDatabaseRetry(() => client.automation.update({
      where: {
        id: automationId,
      },
      data: {
        updatedAt: new Date(),
        listener: {
          upsert: {
            create: {
              type: actionType,
              status: actionType === ACTION_TYPE.PROLYAI ? (prompt ? 'CONFIGURED' : 'UNCONFIGURED') : (message ? 'CONFIGURED' : 'UNCONFIGURED'),
              prompt: prompt || '',
              message: message || '',
            },
            update: {
              type: actionType,
              status: actionType === ACTION_TYPE.PROLYAI ? (prompt ? 'CONFIGURED' : 'UNCONFIGURED') : (message ? 'CONFIGURED' : 'UNCONFIGURED'),
              prompt: prompt || '',
              message: message || '',
            },
          },
        },
      },
    }));

    if (result) {
      return { status: 200, data: 'Listener set successfully' };
    } else {
      return { status: 500, data: 'Failed to set listener' };
    }
  } catch (error) {
    console.error('Error in addListener:', error);
    return { 
      status: 500, 
      data: error instanceof Error ? error.message : 'Failed to save listener' 
    };
  }
}

export const deleteTrigger = async (automationId: string) => {
  try {
    // Find all triggers for this automation
    const triggers = await withDatabaseRetry(() => client.trigger.findMany({
      where: {
        automationId,
      },
    }));

    if (!triggers || triggers.length === 0) {
      console.warn('No triggers found to delete for automation:', automationId);
      return { status: 404, data: 'No triggers found' };
    }

    // Delete all related posts, keywords, and reply messages
    for (const trigger of triggers) {
      await withDatabaseRetry(() => client.post.deleteMany({
        where: { triggerId: trigger.id },
      }));
      
      await withDatabaseRetry(() => client.keyword.deleteMany({
        where: { triggerId: trigger.id },
      }));
      
      await withDatabaseRetry(() => client.replyMessage.deleteMany({
        where: { triggerId: trigger.id },
      }));
    }

    // Delete the triggers themselves
    await withDatabaseRetry(() => client.trigger.deleteMany({
      where: { automationId },
    }));

    // Update the automation's updatedAt timestamp
    await withDatabaseRetry(() => client.automation.update({
      where: { id: automationId },
      data: { updatedAt: new Date() }
    }));

    return { status: 200, data: 'Triggers deleted successfully' };
  } catch (error) {
    console.error('Error deleting trigger:', error)
    throw error
  }
}

export const addTrigger = async (automationId: string, trigger: string[], config?: Record<string, any>) => {
  if (!automationId || typeof automationId !== 'string') {
    return { status: 400, data: 'Automation ID is required' };
  }

  if (!trigger || !Array.isArray(trigger) || trigger.length === 0) {
    return { status: 400, data: 'Trigger is required' };
  }

  try {
    console.log('Adding/updating trigger in database:', { automationId, trigger, config });
    
    // First, get the associated trigger if there is one, or create a new one
    const existingTrigger = await withDatabaseRetry(() => client.trigger.findFirst({
      where: {
        automationId,
      },
      include: {
        posts: true,
        keywords: true,
        replyMessages: true,
      },
    }));

    let triggerId: string;

    if (existingTrigger) {
      console.log('Using existing trigger:', existingTrigger.id);
      triggerId = existingTrigger.id;
      
      // Update the automation's updatedAt timestamp
      await withDatabaseRetry(() => client.automation.update({
        where: { id: automationId },
        data: { updatedAt: new Date() }
      }));
    } else {
      console.log('Creating new trigger for automation:', automationId);
      // Create a new trigger
      const createdTrigger = await withDatabaseRetry(() => client.trigger.create({
        data: {
          type: trigger.join(','),
          automationId,
        },
      }));
      
      // Update the automation's updatedAt timestamp
      await withDatabaseRetry(() => client.automation.update({
        where: { id: automationId },
        data: { updatedAt: new Date() }
      }));
      
      triggerId = createdTrigger.id;
    }
    
    // Now we have a triggerId, we can manage keywords, posts, and reply messages
    
    // Normalize keywords if they exist (should be an array of strings)
    if (config?.keywords) {
      // If it's already an array, use it; if it's an object with include, extract that; otherwise empty array
      const keywordsArray = Array.isArray(config.keywords) 
        ? config.keywords 
        : (config.keywords?.include || []);
      
      // Update existing keywords or create new ones
      // First, remove all keywords associated with this trigger
      await withDatabaseRetry(() => client.keyword.deleteMany({
        where: { 
          triggerId
        }
      }));
      
      // Then create new keywords
      if (keywordsArray.length > 0) {
        for (const word of keywordsArray) {
          await withDatabaseRetry(() => client.keyword.create({
            data: {
              word,
              trigger: {
                connect: { id: triggerId }
              }
            }
          }));
        }
        console.log(`Added ${keywordsArray.length} keywords to trigger ${triggerId}`);
      }
    }
    
    // Handle posts if they exist
    if (config?.posts && Array.isArray(config.posts) && config.posts.length > 0) {
      // Remove existing posts 
      await withDatabaseRetry(() => client.post.deleteMany({
        where: { 
          triggerId
        }
      }));
      
      // Create new posts
      for (const post of config.posts) {
        await withDatabaseRetry(() => client.post.create({
          data: {
            postId: post.postId,
            mediaType: post.mediaType,
            mediaUrl: post.mediaUrl,
            caption: post.caption,
            trigger: {
              connect: { id: triggerId }
            }
          }
        }));
      }
      console.log(`Added ${config.posts.length} posts to trigger ${triggerId}`);
    }
    
    // Handle reply messages if they exist
    if (config?.replyMessages && Array.isArray(config.replyMessages) && config.replyMessages.length > 0) {
      // Remove existing reply messages
      await withDatabaseRetry(() => client.replyMessage.deleteMany({
        where: { 
          triggerId
        }
      }));
      
      // Create new reply messages
      for (const message of config.replyMessages) {
        await withDatabaseRetry(() => client.replyMessage.create({
          data: {
            message,
            trigger: {
              connect: { id: triggerId }
            }
          }
        }));
      }
      console.log(`Added ${config.replyMessages.length} reply messages to trigger ${triggerId}`);
    }

    console.log('Trigger operation completed successfully');
    return { status: 200, data: 'Trigger(s) added successfully' };
  } catch (error) {
    console.error('Error in addTrigger:', error);
    return { 
      status: 500, 
      data: error instanceof Error ? error.message : 'Failed to add trigger' 
    };
  }
}

export const addKeyWord = async (automationId: string, keyword: string) => {
  console.log('Adding keyword:', { automationId, keyword });
  
  try {
    // Get the trigger ID first
    const trigger = await withDatabaseRetry(() => client.trigger.findFirst({
      where: {
        automationId,
      },
    }));

    if (!trigger) {
      console.error('No trigger found for automation:', automationId);
      return { status: 404, data: 'No trigger found for this automation' };
    }

    // Create the keyword
    const result = await withDatabaseRetry(() => client.keyword.create({
      data: {
        word: keyword,
        triggerId: trigger.id,
      },
    }));

    if (result) {
      // Update the automation's updatedAt timestamp
      await withDatabaseRetry(() => client.automation.update({
        where: { id: automationId },
        data: { updatedAt: new Date() }
      }));
      
      return { status: 200, data: 'Keyword added successfully' };
    }

    return { status: 400, data: 'Failed to add keyword' };
  } catch (error) {
    console.error('Error adding keyword:', error);
    throw error;
  }
}

export const deleteKeywordQuery = async (id: string) => {
  try {
    // First get the keyword to find its associated trigger and automation
    const keyword = await withDatabaseRetry(() => client.keyword.findUnique({
      where: { id },
      include: {
        trigger: {
          select: {
            automationId: true
          }
        }
      }
    }));

    if (!keyword) {
      console.error('Keyword not found:', id);
      return null;
    }

    // Delete the keyword
    const result = await withDatabaseRetry(() => client.keyword.delete({
      where: { id },
    }));

    // Update the associated automation's updatedAt timestamp
    if (keyword.trigger?.automationId) {
      const automationId = keyword.trigger.automationId;
      if (automationId) {
        await withDatabaseRetry(() => client.automation.update({
          where: { id: automationId },
          data: { updatedAt: new Date() }
        }));
      }
    }

    return result;
  } catch (error) {
    console.error('Error deleting keyword:', error);
    throw error;
  }
}

export const addPost = async (
  automationId: string,
  posts: {
    postid: string
    caption?: string
    media: string
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROSEL_ALBUM'
  }[]
) => {
  try {
    // First get the trigger ID
    const trigger = await withDatabaseRetry(() => client.trigger.findFirst({
      where: {
        automationId,
      },
    }));

    if (!trigger) {
      console.error('No trigger found for automation:', automationId);
      return null;
    }

    // Clear existing posts first
    await withDatabaseRetry(() => client.post.deleteMany({
      where: {
        triggerId: trigger.id,
      },
    }));

    // Add each new post
    for (const post of posts) {
      await withDatabaseRetry(() => client.post.create({
        data: {
          postId: post.postid,
          mediaUrl: post.media,
          mediaType: post.mediaType,
          caption: post.caption || '',
          triggerId: trigger.id,
        },
      }));
    }

    // Update the automation's updatedAt timestamp
    await withDatabaseRetry(() => client.automation.update({
      where: { id: automationId },
      data: { updatedAt: new Date() }
    }));

    return true;
  } catch (error) {
    console.error('Error adding posts:', error);
    throw error;
  }
}

export const deleteAutomationQuery = async (id: string) => {
  try {
    // First, try to clean up chat history related to this automation
    try {
      // Log the cleanup attempt
      console.log(`Attempting to clean up chat history for automation: ${id}`);
      
      // Delete all DMs associated with this automation
      const deletedDms = await withDatabaseRetry(() => client.dms.deleteMany({
        where: { automationId: id },
      }));
      
      console.log(`Deleted ${deletedDms.count} chat history entries for automation ${id}`);
    } catch (dmError) {
      // Log error but continue with automation deletion
      console.error('Error deleting chat history:', dmError);
      console.log('Continuing with automation deletion despite chat history error');
    }

    // Delete the automation
    return await withDatabaseRetry(() => client.automation.delete({
      where: { id },
    }));
  } catch (error) {
    console.error('Error deleting automation:', error);
    throw error;
  }
}
