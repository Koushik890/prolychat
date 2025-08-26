'use server'

import { client } from '@/lib/prisma'
import { v4 } from 'uuid'
import { withDatabaseRetry, db } from '@/lib/db-utils'
import { Automation, Post, Keyword, ReplyMessage, ACTION_TYPE } from '@prisma/client'
import { CardData } from '@/types/automation'
import { 
  createOrUpdateMessage, 
  getMessage, 
  deleteMessage, 
  getCardDataFromMessage 
} from './message-queries'

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
        listener: {
          include: {
            messageData: true
          }
        },
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
    // Optimized database query - only select necessary fields
    const result = await withDatabaseRetry(() => 
      client.automation.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          active: true,
          status: true,
          runCount: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          trigger: {
            select: {
              id: true,
              type: true,
              status: true,
              automationId: true,
              config: true,
              createdAt: true,
              updatedAt: true,
              posts: {
                select: {
                  id: true,
                  postId: true,
                  mediaType: true,
                  mediaUrl: true,
                  caption: true,
                  triggerId: true
                }
              },
              keywords: {
                select: {
                  id: true,
                  word: true,
                  triggerId: true
                }
              },
              replyMessages: {
                select: {
                  id: true,
                  message: true,
                  triggerId: true
                }
              }
            }
          },
          listener: {
            select: {
              id: true,
              type: true,
              status: true,
              prompt: true,
              commentReply: true,
              dmCount: true,
              commentCount: true,
              automationId: true,
              messageData: true
            }
          },
          User: {
            select: {
              subscription: {
                select: {
                  plan: true,
                  subscriptionStatus: true
                }
              },
              integrations: {
                select: {
                  id: true,
                  token: true
                }
              }
            }
          }
        }
      })
    );

    if (!result) {
      return null
    }

    // Optimize trigger data transformation - remove expensive operations
    if (result.trigger?.length > 0) {
      result.trigger = result.trigger.map(trigger => {
        // Calculate status efficiently without multiple checks
        const hasPost = trigger.posts.length > 0
        const hasKeywords = trigger.keywords.length > 0
        const hasReplyMessages = trigger.replyMessages.length > 0
        
        // Optimized status calculation
        const status = trigger.type === 'user-message' 
          ? (hasKeywords ? 'complete' : 'unconfigured')
          : (hasPost && hasKeywords && hasReplyMessages ? 'complete' : 
             hasPost || hasKeywords || hasReplyMessages ? 'partial' : 'unconfigured')

        // Streamlined trigger object creation
        return {
          ...trigger,
          status,
          config: {
            status,
            type: 'all',
            posts: trigger.posts,
            keywords: {
              include: trigger.keywords.map(k => k.word)
            },
            replyMessages: trigger.replyMessages.map(r => r.message)
          }
        }
      })
    }

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
  message?: string,
  cardData?: any
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

    // Check if listener already exists and has a message to determine proper status
    const existingListener = await withDatabaseRetry(() => client.listener.findUnique({
      where: { automationId },
      include: { messageData: true }
    }));

    // Determine listener status based on action type, provided data, and existing message data
    let status = 'UNCONFIGURED';
    
    if (existingListener?.messageData) {
      // If message data exists, preserve CONFIGURED status
      status = 'CONFIGURED';
    } else if (actionType === 'PROLYAI' && prompt) {
      // For AI prompts, set to CONFIGURED if prompt exists
      status = 'CONFIGURED';
    } else if (actionType === 'MESSAGE' && (message || cardData)) {
      // For messages, set to CONFIGURED if message or card data exists
      status = 'CONFIGURED';
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
              status: status as any,
              prompt: prompt || '',
            },
            update: {
              type: actionType,
              status: status as any,
              prompt: prompt || '',
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
    // ULTRA-FAST: Remove all console.log overhead and use direct client operations
    // Get or create trigger with minimal operations
    let existingTrigger = await withDatabaseRetry(() => client.trigger.findFirst({
      where: { automationId },
      select: { id: true }
    }));

    let triggerId: string;

    if (existingTrigger) {
      triggerId = existingTrigger.id;
    } else {
      const createdTrigger = await withDatabaseRetry(() => client.trigger.create({
        data: {
          type: trigger.join(','),
          automationId,
        },
        select: { id: true }
      }));
      triggerId = createdTrigger.id;
    }
    
    // Prepare data arrays (optimized extraction)
    const keywordsArray = config?.keywords ? 
      (Array.isArray(config.keywords) ? config.keywords : (config.keywords?.include || [])) : [];
    const postsArray = config?.posts || [];
    const replyMessagesArray = config?.replyMessages || [];

    // MAXIMUM SPEED: Direct parallel operations without transaction overhead
    // Clear existing data in parallel
    await Promise.all([
      withDatabaseRetry(() => client.keyword.deleteMany({ where: { triggerId } })),
      withDatabaseRetry(() => client.post.deleteMany({ where: { triggerId } })),
      withDatabaseRetry(() => client.replyMessage.deleteMany({ where: { triggerId } }))
    ]);

    // Create new data in parallel (only if arrays have content)
    const createOperations = [];
    
    if (keywordsArray.length > 0) {
      createOperations.push(
        withDatabaseRetry(() => client.keyword.createMany({
          data: keywordsArray.map((word: string) => ({ word, triggerId })),
          skipDuplicates: true
        }))
      );
    }
    
    if (postsArray.length > 0) {
      createOperations.push(
        withDatabaseRetry(() => client.post.createMany({
          data: postsArray.map((post: any) => ({
            postId: post.postId,
            mediaType: post.mediaType,
            mediaUrl: post.mediaUrl,
            caption: post.caption,
            triggerId
          })),
          skipDuplicates: true
        }))
      );
    }
    
    if (replyMessagesArray.length > 0) {
      createOperations.push(
        withDatabaseRetry(() => client.replyMessage.createMany({
          data: replyMessagesArray.map((message: string) => ({ message, triggerId })),
          skipDuplicates: true
        }))
      );
    }

    // Execute all creates in parallel
    if (createOperations.length > 0) {
      await Promise.all(createOperations);
    }

    // Calculate status (ultra-fast, no database queries)
    const triggerType = trigger[0];
    const calculatedStatus = triggerType === 'user-message' 
      ? (keywordsArray.length > 0 ? 'complete' : 'unconfigured')
      : (postsArray.length > 0 && keywordsArray.length > 0 && replyMessagesArray.length > 0 ? 'complete' : 
         postsArray.length > 0 || keywordsArray.length > 0 || replyMessagesArray.length > 0 ? 'partial' : 'unconfigured');

    // Single status update operation
    await withDatabaseRetry(() => client.trigger.update({
      where: { id: triggerId },
      data: { status: calculatedStatus }
    }));
    
    return { status: 200, data: 'Trigger(s) added successfully' };
  } catch (error) {
    return { 
      status: 500, 
      data: error instanceof Error ? error.message : 'Failed to add trigger' 
    };
  }
}

export const addKeyWord = async (automationId: string, keyword: string) => {
  console.log('Adding keyword:', { automationId, keyword });
  
  try {
    // Get the trigger with its related data
    const trigger = await withDatabaseRetry(() => client.trigger.findFirst({
      where: {
        automationId,
      },
      include: {
        posts: true,
        keywords: true,
        replyMessages: true,
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
      // Calculate the new status based on the updated configuration
      const hasPost = trigger.posts.length > 0;
      const hasKeywords = trigger.keywords.length + 1 > 0; // +1 for the newly added keyword
      const hasReplyMessages = trigger.replyMessages.length > 0;
      
      let calculatedStatus = 'unconfigured';
      
      // Special handling for user-message (DM) triggers
      if (trigger.type === 'user-message') {
        // For Direct Message triggers, only keywords are required
        calculatedStatus = hasKeywords ? 'complete' : 'unconfigured';
      } else {
        // For other triggers (like post-comments), all three are required
        calculatedStatus = hasPost && hasKeywords && hasReplyMessages ? 'complete' :
                          hasPost || hasKeywords || hasReplyMessages ? 'partial' :
                          'unconfigured';
      }
      
      console.log(`Calculated status for trigger ${trigger.id}: ${calculatedStatus}`, {
        triggerType: trigger.type,
        hasPost,
        hasKeywords,
        hasReplyMessages
      });

      // Update the trigger status and automation timestamp
      await withDatabaseRetry(() => client.trigger.update({
        where: { id: trigger.id },
        data: { 
          status: calculatedStatus,
          updatedAt: new Date()
        }
      }));

      await withDatabaseRetry(() => client.automation.update({
        where: { id: automationId },
        data: { updatedAt: new Date() }
      }));
      
      console.log(`Trigger status updated to: ${calculatedStatus}`);
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
            id: true,
            type: true,
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

    // Update the trigger status and automation timestamp
    if (keyword.trigger?.automationId) {
      const automationId = keyword.trigger.automationId;
      const triggerId = keyword.trigger.id;
      const triggerType = keyword.trigger.type;
      
      if (automationId && triggerId) {
        // Get the current state of the trigger to calculate new status
        const updatedTrigger = await withDatabaseRetry(() => client.trigger.findUnique({
          where: { id: triggerId },
          include: {
            posts: true,
            keywords: true,
            replyMessages: true,
          },
        }));

        if (updatedTrigger) {
          const hasPost = updatedTrigger.posts.length > 0;
          const hasKeywords = updatedTrigger.keywords.length > 0;
          const hasReplyMessages = updatedTrigger.replyMessages.length > 0;
          
          let calculatedStatus = 'unconfigured';
          
          // Special handling for user-message (DM) triggers
          if (triggerType === 'user-message') {
            // For Direct Message triggers, only keywords are required
            calculatedStatus = hasKeywords ? 'complete' : 'unconfigured';
          } else {
            // For other triggers (like post-comments), all three are required
            calculatedStatus = hasPost && hasKeywords && hasReplyMessages ? 'complete' :
                              hasPost || hasKeywords || hasReplyMessages ? 'partial' :
                              'unconfigured';
          }
          
          console.log(`Calculated status after keyword deletion for trigger ${triggerId}: ${calculatedStatus}`, {
            triggerType,
            hasPost,
            hasKeywords,
            hasReplyMessages
          });

          // Update the trigger status
          await withDatabaseRetry(() => client.trigger.update({
            where: { id: triggerId },
            data: { 
              status: calculatedStatus,
              updatedAt: new Date()
            }
          }));

          console.log(`Trigger status updated to: ${calculatedStatus}`);
        }

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
    // First get the trigger with its related data
    const trigger = await withDatabaseRetry(() => client.trigger.findFirst({
      where: {
        automationId,
      },
      include: {
        posts: true,
        keywords: true,
        replyMessages: true,
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

    // Calculate the new status based on the updated configuration
    const hasPost = posts.length > 0; // Use the new posts array length
    const hasKeywords = trigger.keywords.length > 0;
    const hasReplyMessages = trigger.replyMessages.length > 0;
    
    let calculatedStatus = 'unconfigured';
    
    // Special handling for user-message (DM) triggers
    if (trigger.type === 'user-message') {
      // For Direct Message triggers, only keywords are required
      calculatedStatus = hasKeywords ? 'complete' : 'unconfigured';
    } else {
      // For other triggers (like post-comments), all three are required
      calculatedStatus = hasPost && hasKeywords && hasReplyMessages ? 'complete' :
                        hasPost || hasKeywords || hasReplyMessages ? 'partial' :
                        'unconfigured';
    }
    
    console.log(`Calculated status after adding posts for trigger ${trigger.id}: ${calculatedStatus}`, {
      triggerType: trigger.type,
      hasPost,
      hasKeywords,
      hasReplyMessages
    });

    // Update the trigger status and automation timestamp
    await withDatabaseRetry(() => client.trigger.update({
      where: { id: trigger.id },
      data: { 
        status: calculatedStatus,
        updatedAt: new Date()
      }
    }));

    await withDatabaseRetry(() => client.automation.update({
      where: { id: automationId },
      data: { updatedAt: new Date() }
    }));

    console.log(`Trigger status updated to: ${calculatedStatus}`);
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

// New functions for handling message data (text and card)
export const saveListenerMessage = async (
  automationId: string,
  messageType: 'TEXT' | 'RICH',
  data: {
    textContent?: string
    cardData?: CardData
  }
) => {
  try {
    // First find the listener for this automation
    const listener = await withDatabaseRetry(() =>
      client.listener.findUnique({
        where: { automationId }
      })
    )

    if (!listener) {
      return { status: 404, data: 'Listener not found' }
    }

    // Create or update the message data
    const result = await createOrUpdateMessage(listener.id, messageType, data)
    
    if (result.status === 200) {
      // Update automation timestamp
      await withDatabaseRetry(() =>
        client.automation.update({
          where: { id: automationId },
          data: { updatedAt: new Date() }
        })
      )
    }

    return result
  } catch (error) {
    console.error('Error saving listener message:', error)
    return { 
      status: 500, 
      data: error instanceof Error ? error.message : 'Failed to save message' 
    }
  }
}

export const getListenerMessage = async (automationId: string) => {
  try {
    // Find the listener for this automation
    const listener = await withDatabaseRetry(() =>
      client.listener.findUnique({
        where: { automationId }
      })
    )

    if (!listener) {
      return null
    }

    // Get the message data if it exists
    return await getMessage(listener.id)
  } catch (error) {
    console.error('Error getting listener message:', error)
    return null
  }
}

export const deleteListenerMessage = async (automationId: string) => {
  try {
    // Find the listener for this automation
    const listener = await withDatabaseRetry(() =>
      client.listener.findUnique({
        where: { automationId }
      })
    )

    if (!listener) {
      return { status: 404, data: 'Listener not found' }
    }

    // Delete the message data
    const result = await deleteMessage(listener.id)
    
    if (result.status === 200) {
      // Update automation timestamp
      await withDatabaseRetry(() =>
        client.automation.update({
          where: { id: automationId },
          data: { updatedAt: new Date() }
        })
      )
    }

    return result
  } catch (error) {
    console.error('Error deleting listener message:', error)
    return { 
      status: 500, 
      data: error instanceof Error ? error.message : 'Failed to delete message' 
    }
  }
}
