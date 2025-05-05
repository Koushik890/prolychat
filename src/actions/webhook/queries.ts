import { client } from '@/lib/prisma'
import { ACTION_TYPE, Prisma } from '@prisma/client'
import { withDatabaseRetry } from '@/lib/db-utils'

// Create a Map to track automation processes that have been counted in the current session
// This will prevent multiple trackResponses calls for the same automation process
const processedAutomations = new Map<string, number>();

// Clear the processed automations every 24 hours to prevent memory leaks
setInterval(() => {
  processedAutomations.clear();
}, 24 * 60 * 60 * 1000);

// Function to increment the automation run counter directly
// This should be called once when the automation is first triggered
export const trackAutomationRun = async (automationId: string): Promise<boolean> => {
  try {
    const currentTime = Date.now();
    const lastProcessedTime = processedAutomations.get(automationId);
    
    // If this automation was processed in the last 10 seconds, consider it part of the same process
    const isPartOfSameProcess = lastProcessedTime && (currentTime - lastProcessedTime < 10000);
    
    if (isPartOfSameProcess) {
      console.log(`Skipping run counter increment for automation ${automationId} - part of same process`);
      return true;
    }
    
    console.log(`Incrementing run counter for automation ${automationId}`);
    
    // Use type assertion with the update data
    await withDatabaseRetry(() => 
      client.automation.update({
        where: { id: automationId },
        data: { 
          runCount: { increment: 1 } 
        } as any
      })
    );
    
    // Update the processed automations map with the current timestamp
    processedAutomations.set(automationId, currentTime);
    
    return true;
  } catch (error) {
    console.error(`Error tracking automation run for ${automationId}:`, error);
    return false;
  }
};

export const matchKeyword = async (text: string) => {
  const keywords = await withDatabaseRetry(() => 
    client.keyword.findMany({
      select: {
        id: true,
        word: true,
        triggerId: true,
        trigger: {
          select: {
            automationId: true,
            posts: {
              select: {
                postId: true
              }
            }
          }
        }
      }
    })
  )

  const match = keywords.find(keyword => 
    text.toLowerCase().includes(keyword.word.toLowerCase())
  )

  if (match) {
    console.log('Found keyword match:', {
      keyword: match.word,
      triggerId: match.triggerId,
      hasSpecificPost: match.trigger?.posts?.length > 0
    })
  }

  return match || null
}

export const getKeywordAutomation = async (
  automationId: string,
  dm: boolean
) => {
  try {
    // Validate if the ID is in the correct format
    if (!automationId || typeof automationId !== 'string') {
      console.error('Invalid automation ID:', automationId)
      return null
    }

    // Check if the ID is in the correct CUID format
    // CUID format: c[a-z0-9]{24}
    const cuidRegex = /^c[a-z0-9]{24}$/
    if (!cuidRegex.test(automationId)) {
      console.warn('Automation ID is not in CUID format:', automationId)
      // Don't return null here, try to fetch anyway as it might be a different ID format
    }

    const automation = await withDatabaseRetry(() => 
      client.automation.findFirst({
        where: {
          trigger: {
            some: {
              id: automationId
            }
          }
        },
        include: {
          trigger: {
            where: {
              type: dm ? 'user-message' : 'post-comments',
            },
            include: {
              posts: true,
              keywords: true,
              replyMessages: true
            }
          },
          listener: true,
          User: {
            select: {
              subscription: {
                select: {
                  plan: true,
                },
              },
              integrations: {
                select: {
                  id: true,
                  token: true,
                },
              },
            },
          },
        },
      })
    )
    
    // Log more detailed information for debugging
    if (automation) {
      console.log('Loaded automation details:', {
        id: automation.id,
        name: automation.name,
        hasTriggers: automation.trigger.length > 0,
        hasPosts: automation.trigger?.[0]?.posts?.length > 0,
        postCount: automation.trigger?.[0]?.posts?.length || 0,
        postIds: automation.trigger?.[0]?.posts?.map(p => p.postId) || [],
        keywordCount: automation.trigger?.[0]?.keywords?.length || 0
      })
    }
    
    return automation
  } catch (error) {
    console.error('Error in getKeywordAutomation:', error)
    return null
  }
}

export const getKeywordPost = async (
  postId: string,
  automationId: string
) => {
  console.log('Checking if post is configured for automation:', {
    postId,
    automationId
  });
  
  const post = await withDatabaseRetry(() => 
    client.post.findFirst({
      where: {
        postId,
        trigger: {
          automationId
        }
      }
    })
  )
  
  console.log('Post lookup result:', {
    found: !!post,
    postId,
    automationId,
    triggerIdIfFound: post?.triggerId || null
  });
  
  return post;
}

export const createChatHistory = async (
  automationId: string,
  recipientId: string,
  senderId: string,
  message: string
): Promise<boolean> => {
  try {
    await withDatabaseRetry(() => 
      client.dms.create({
        data: {
          automationId,
          reciever: recipientId,
          senderId,
          message
        }
      }),
      7,     // Increase max retries to 7
      500    // Start with a 500ms delay
    )
    return true
  } catch (error) {
    console.error('Failed to create chat history:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      automationId,
      recipientId,
      senderId,
      messageLength: message?.length
    })
    return false
  }
}

export const getChatHistory = async (
  recipientId: string,
  senderId: string
) => {
  const history = await withDatabaseRetry(() => 
    client.dms.findMany({
      where: {
        reciever: recipientId,
        senderId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  )

  return {
    history: history.map(h => ({
      role: h.senderId === recipientId ? 'user' : 'assistant',
      content: h.message || ''
    })),
    automationId: history[0]?.automationId
  }
}

export const trackResponses = async (
  automationId: string,
  type: 'DM' | 'COMMENT'
) => {
  const automation = await withDatabaseRetry(() => 
    client.automation.findUnique({
      where: { id: automationId },
      include: { listener: true }
    })
  )

  if (!automation?.listener) return false

  // Get the current timestamp for logging purposes
  const currentTime = Date.now();
  const lastProcessedTime = processedAutomations.get(automationId);
  
  // Note: We keep track of this for logging but no longer skip incrementing based on it
  const isPartOfSameProcess = lastProcessedTime && (currentTime - lastProcessedTime < 5000);
  
  // Log tracking information
  console.log(`Tracking ${type} response for automation ${automationId}:`, {
    isPartOfSameProcess,
    lastProcessedTime: lastProcessedTime ? new Date(lastProcessedTime).toISOString() : 'none',
    currentTime: new Date(currentTime).toISOString(),
    timeSinceLastProcess: lastProcessedTime ? `${(currentTime - lastProcessedTime) / 1000}s ago` : 'N/A'
  });

  // Create update data for the specific type being tracked
  const updateData: any = {}
  
  // Always increment action counts regardless of time window
  // This ensures each action is counted independently from the run count
  if (type === 'DM') {
    const currentCount = automation.listener.dmCount || 0;
    updateData.dmCount = currentCount + 1;
    console.log(`Incrementing DM count from ${currentCount} to ${updateData.dmCount}`);
  } else {
    const currentCount = automation.listener.commentCount || 0;
    updateData.commentCount = currentCount + 1;
    console.log(`Incrementing COMMENT count from ${currentCount} to ${updateData.commentCount}`);
  }
  
  // The non-null assertion is safe here because we already checked above
  const listenerId = automation.listener.id
  if (!listenerId) return false

  // Update the individual response type count
  await withDatabaseRetry(() => 
    client.listener.update({
      where: { id: listenerId },
      data: updateData
    })
  )
  
  console.log(`Incremented ${type} count for automation ${automationId}`);

  // Still update the processed automations map with the current timestamp
  // This doesn't affect counting but helps with debugging and tracking timing
  processedAutomations.set(automationId, currentTime);

  return true
}

export const getRandomReplyMessage = async (triggerId: string): Promise<string | null> => {
  try {
    const replyMessages = await withDatabaseRetry(() => 
      client.replyMessage.findMany({
        where: {
          triggerId
        },
        select: {
          message: true
        }
      })
    )

    if (!replyMessages.length) {
      console.log('No reply messages found for trigger:', triggerId)
      return null
    }

    const randomIndex = Math.floor(Math.random() * replyMessages.length)
    return replyMessages[randomIndex].message
  } catch (error) {
    console.error('Error getting random reply message:', error)
    return null
  }
}