'use server'

import { client } from '@/lib/prisma'
import { v4 } from 'uuid'

export const createAutomation = async (clerkId: string, id?: string) => {
  const newId = id || v4();
  try {
    // First find the user to ensure they exist
    const user = await client.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create the automation with all required fields
    const automation = await client.automation.create({
      data: {
        id: newId,
        name: 'Untitled',
        active: false,
        userId: user.id
      },
      // Include essential relations in the response
      include: {
        User: {
          select: {
            subscription: true
          }
        }
      }
    });
    
    if (!automation) {
      throw new Error('Failed to create automation');
    }
    
    return automation;
  } catch (error) {
    console.error('Error creating automation:', error);
    if (error instanceof Error && error.message === 'User not found') {
      throw new Error('User not found in database');
    }
    throw new Error('Failed to create automation');
  }
}

export const getAutomations = async (clerkId: string) => {
  try {
    const result = await client.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        automations: {
          select: {
            id: true,
            name: true,
            active: true,
            createdAt: true,
            updatedAt: true,
            status: true,
            trigger: true,
            listener: {
              select: {
                dmCount: true,
                commentCount: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc',
          }
        },
      },
    })

    if (!result) {
      console.error('No user found with clerkId:', clerkId)
      return null
    }

    return result
  } catch (error) {
    console.error('Error in getAutomations:', error)
    throw error
  }
}

export const findAutomation = async (id: string) => {
  try {
    const result = await client.automation.findUnique({
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
    throw error
  }
}

export const updateAutomation = async (
  id: string,
  update: {
    name?: string
    active?: boolean
  }
) => {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid automation ID');
  }

  if (!update || typeof update !== 'object') {
    throw new Error('Invalid update payload');
  }

  try {
    const data: Record<string, any> = {};
    
    if (update.name !== undefined) {
      if (typeof update.name !== 'string') {
        throw new Error('Name must be a string');
      }
      data.name = update.name.trim();
    }
    
    if (update.active !== undefined) {
      if (typeof update.active !== 'boolean') {
        throw new Error('Active must be a boolean');
      }
      data.active = update.active;
      // Update status based on active state
      data.status = update.active ? 'PUBLISHED' : 'DRAFT';
    }

    const result = await client.automation.update({
      where: { id },
      data,
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
      }
    });

    if (!result) {
      throw new Error('Failed to update automation');
    }

    return result;
  } catch (error) {
    console.error('Error in updateAutomation:', error);
    throw error;
  }
}

export const addListener = async (
  automationId: string,
  actionType: 'OMNIAI' | 'MESSAGE',
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
    const automation = await client.automation.findUnique({
      where: { id: automationId },
    });

    if (!automation) {
      return { status: 404, data: 'Automation not found' };
    }

    const result = await client.automation.update({
      where: {
        id: automationId,
      },
      data: {
        listener: {
          upsert: {
            create: {
              type: actionType,
              status: actionType === 'OMNIAI' ? (prompt ? 'CONFIGURED' : 'UNCONFIGURED') : (message ? 'CONFIGURED' : 'UNCONFIGURED'),
              prompt: prompt || '',
              message: message || '',
              commentReply: null,
              dmCount: 0,
              commentCount: 0
            },
            update: {
              type: actionType,
              status: actionType === 'OMNIAI' ? (prompt ? 'CONFIGURED' : 'UNCONFIGURED') : (message ? 'CONFIGURED' : 'UNCONFIGURED'),
              prompt: prompt || '',
              message: message || '',
              commentReply: null,
              dmCount: 0,
              commentCount: 0
            }
          }
        },
      },
    });

    if (!result) {
      return { status: 500, data: 'Failed to save listener' };
    }

    return { status: 200, data: 'Listener saved successfully' };
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
    // First delete all existing triggers for this automation
    await client.trigger.deleteMany({
      where: {
        automationId
      }
    })

    // Update the automation to reflect the trigger removal
    return await client.automation.update({
      where: {
        id: automationId
      },
      data: {
        trigger: {
          deleteMany: {} // This ensures all triggers are removed from the relation
        }
      },
      include: {
        trigger: true
      }
    })
  } catch (error) {
    console.error('Error deleting trigger:', error)
    throw error
  }
}

export const addTrigger = async (automationId: string, trigger: string[], config?: Record<string, any>) => {
  console.log('Adding trigger:', { automationId, trigger, config }) // Debug log

  // If trigger array is empty, use the dedicated delete function
  if (trigger.length === 0) {
    return await deleteTrigger(automationId)
  }

  try {
    // First check if a trigger already exists for this automation with any type
    const existingTriggers = await client.trigger.findMany({
      where: {
        automationId
      }
    })

    // If any triggers exist, delete them all first to ensure clean state
    if (existingTriggers.length > 0) {
      console.log('Cleaning up existing triggers:', existingTriggers.length)
      await client.trigger.deleteMany({
        where: {
          automationId
        }
      })
    }

    // Create new trigger with its configurations
    const result = await client.automation.update({
      where: {
        id: automationId,
      },
      data: {
        trigger: {
          create: {
            type: trigger[0],
            status: config?.status || ((trigger[0] === 'user-message' && config?.keywords?.include?.length > 0) 
              ? 'complete' 
              : 'unconfigured'),
            ...(config?.posts && {
              posts: {
                create: config.posts.map((post: any) => ({
                  postId: post.postId,
                  mediaType: post.mediaType,
                  mediaUrl: post.mediaUrl,
                  caption: post.caption
                }))
              }
            }),
            ...(config?.keywords && {
              keywords: {
                create: config.keywords.include.map((word: string) => ({
                  word
                }))
              }
            }),
            ...(config?.replyMessages && {
              replyMessages: {
                create: config.replyMessages.map((message: string) => ({
                  message
                }))
              }
            })
          }
        }
      },
      include: {
        trigger: {
          include: {
            posts: true,
            keywords: true,
            replyMessages: true
          }
        }
      }
    })

    console.log('Trigger added successfully:', result) // Debug log
    return result
  } catch (error) {
    console.error('Error adding trigger:', error)
    throw error
  }
}

export const addKeyWord = async (automationId: string, keyword: string) => {
  // First get the trigger ID for this automation
  const automation = await client.automation.findUnique({
    where: { id: automationId },
    include: { trigger: true }
  })

  if (!automation?.trigger?.[0]?.id) {
    throw new Error('No trigger found for this automation')
  }

  return client.trigger.update({
    where: { id: automation.trigger[0].id },
    data: {
      keywords: {
        create: {
          word: keyword
        }
      }
    }
  })
}

export const deleteKeywordQuery = async (id: string) => {
  return client.keyword.delete({
    where: { id },
  })
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
  // First get the trigger ID for this automation
  const automation = await client.automation.findUnique({
    where: { id: automationId },
    include: { trigger: true }
  })

  if (!automation?.trigger?.[0]?.id) {
    throw new Error('No trigger found for this automation')
  }

  return client.trigger.update({
    where: { id: automation.trigger[0].id },
    data: {
      posts: {
        createMany: {
          data: posts.map(post => ({
            postId: post.postid,
            mediaType: post.mediaType,
            mediaUrl: post.media,
            caption: post.caption
          }))
        }
      }
    }
  })
}

export const deleteAutomationQuery = async (id: string) => {
  return await client.automation.delete({
    where: { id },
  })
}
