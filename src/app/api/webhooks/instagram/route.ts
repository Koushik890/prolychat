import { findAutomation } from '@/actions/automations/queries'
import {
  createChatHistory,
  getChatHistory,
  getKeywordAutomation,
  getKeywordPost,
  getRandomReplyMessage,
  matchKeyword,
  trackResponses,
  trackAutomationRun,
} from '@/actions/webhook/queries'
import { sendDM, sendPrivateMessage, replyToComment } from '@/lib/fetch'
import { mistralAI } from '@/lib/mistral'
import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ACTION_TYPE } from '@prisma/client'
import { addContactFromAutomation } from '@/lib/contact-manager'
import { fetchInstagramProfileData, fetchInstagramProfilePicture } from '@/lib/instagram-utils'
import { isContactPaused, isContactReported } from '@/lib/contact-utils'
import axios from 'axios'

// Helper function to safely compare enum values
function isSameActionType(actionType: any, compareType: ACTION_TYPE): boolean {
  return String(actionType) === String(compareType);
}

// Track automation activities efficiently to avoid double-counting runs
// This is used to track the responses for a single automation process
// Returns true if any tracking was successful
async function trackAutomationActivity(
  automationId: string,
  actions: Array<'DM' | 'COMMENT'>
): Promise<boolean> {
  let trackingSuccessful = false;
  
  console.log(`Starting automation activity tracking for ${automationId} with actions:`, actions);
  
  // First, ensure that we've incremented the runCount for this automation
  // This should have happened earlier in the webhook flow, but we double-check here
  const runTrackingSuccessful = await trackAutomationRun(automationId);
  if (runTrackingSuccessful) {
    console.log(`Successfully incremented runCount for automation ${automationId}`);
  } else {
    console.error(`Failed to increment runCount for automation ${automationId}`);
  }
  
  // Track each unique action type only once
  // Using a Set to ensure we only track each action type once
  const uniqueActions = [...new Set(actions)];
  
  for (const action of uniqueActions) {
    console.log(`Tracking action ${action} for automation ${automationId}`);
    
    const success = await trackResponses(automationId, action);
    if (success) {
      trackingSuccessful = true;
      console.log(`Successfully tracked ${action} response for automation ${automationId}`);
      
      // Add a small delay between actions to maintain order
      if (action !== uniqueActions[uniqueActions.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      console.error(`Failed to track ${action} response for automation ${automationId}`);
    }
  }
  
  return trackingSuccessful;
}

// Helper function to get message text from listener
function getListenerMessage(listener: any): string {
  // Try to get from messageData first (new system)
  if (listener.messageData) {
    if (listener.messageData.type === 'TEXT' && listener.messageData.textContent) {
      return listener.messageData.textContent;
    } else if (listener.messageData.type === 'CARD' && listener.messageData.cardTitle) {
      return `Card: ${listener.messageData.cardTitle}`;
    }
  }
  
  // Fallback to legacy message field
  return listener.message || 'Thank you for your comment!';
}

// Cache to store Instagram IDs to usernames from webhooks
const usernameCache = new Map<string, string>();

// Cache to store profile picture URLs
const profilePicCache = new Map<string, string>();

// Cache to prevent duplicate webhook processing (commentId -> timestamp)
const processedComments = new Map<string, number>();
// Set expiration time for processed comments (10 minutes)
const COMMENT_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

interface KeywordMatch {
  id: string;
  triggerId: string;
  word: string;
}

interface WebhookPayload {
  entry: Array<{
    id: string;
    messaging?: Array<{
      sender: { 
        id: string; 
        name?: string; 
        username?: string;
        profile_pic?: string;
        avatar?: string; 
      };
      recipient: { id: string };
      message?: {
        text?: string;
        is_echo?: boolean;
      };
    }>;
    changes?: Array<{
      field: string;
      value: {
        id: string;
        text?: string;
        from: { 
          id: string; 
          name?: string;
          username?: string;
          profile_pic?: string;
          avatar?: string;
          picture?: string;
        };
        media?: {
          id: string;
        };
        // Add any other fields that might contain username data
        username?: string;
        user_name?: string;
        name?: string;
        profile_picture?: string;
        profile_pic?: string;
        avatar?: string;
        picture?: string;
      };
    }>;
  }>;
}

/**
 * Extract full user profile from webhook if available
 */
interface InstagramProfileFromWebhook {
  username?: string | null;
  name?: string | null;
  profilePictureUrl?: string | null;
}

async function extractUserProfileFromWebhook(webhook_payload: WebhookPayload, instagramId: string): Promise<InstagramProfileFromWebhook> {
  try {
    const result: InstagramProfileFromWebhook = {};
    
    // Log the entire webhook payload for debugging
    console.log('Full webhook payload structure:', JSON.stringify({
      hasSender: !!webhook_payload.entry[0].messaging?.[0]?.sender,
      hasChanges: !!webhook_payload.entry[0].changes?.[0]?.value,
      senderFields: webhook_payload.entry[0].messaging?.[0]?.sender ? 
        Object.keys(webhook_payload.entry[0].messaging[0].sender) : [],
      fromFields: webhook_payload.entry[0].changes?.[0]?.value?.from ? 
        Object.keys(webhook_payload.entry[0].changes[0].value.from) : [],
      valueFields: webhook_payload.entry[0].changes?.[0]?.value ?
        Object.keys(webhook_payload.entry[0].changes[0].value) : []
    }, null, 2));
    
    // If available, log the actual data for debugging
    if (webhook_payload.entry[0].changes?.[0]?.value?.from) {
      console.log('From data:', JSON.stringify(webhook_payload.entry[0].changes[0].value.from, null, 2));
    }
    
    // Check for data in messaging
    if (webhook_payload.entry[0].messaging) {
      const sender = webhook_payload.entry[0].messaging[0]?.sender;
      if (sender && sender.id === instagramId) {
        if (sender.username) result.username = sender.username;
        if (sender.name) result.name = sender.name;
        if (sender.profile_pic || sender.avatar) {
          result.profilePictureUrl = sender.profile_pic || sender.avatar;
          console.log('Found profile picture in sender:', result.profilePictureUrl);
        }
      }
    }
    
    // Check for data in changes
    if (webhook_payload.entry[0].changes) {
      const change = webhook_payload.entry[0].changes[0]?.value;
      
      // Check from object
      if (change?.from && change.from.id === instagramId) {
        if (change.from.username && !result.username) result.username = change.from.username;
        if (change.from.name && !result.name) result.name = change.from.name;
        
        const fromPic = change.from.profile_pic || change.from.avatar || change.from.picture;
        if (fromPic && !result.profilePictureUrl) {
          result.profilePictureUrl = fromPic;
          console.log('Found profile picture in from object:', result.profilePictureUrl);
        }
      }
      
      // Extract deeper fields - sometimes Instagram nests data differently
      // Use type assertion to access dynamic properties not in the type definition
      const fromUserObj = (change?.from as any)?.user;
      if (fromUserObj?.username && !result.username) {
        result.username = fromUserObj.username;
      }
      
      if (fromUserObj?.full_name && !result.name) {
        result.name = fromUserObj.full_name;
      }
      
      // Check direct properties
      if (change?.username && !result.username && change.id === instagramId) {
        result.username = change.username;
      }
      
      if (change?.user_name && !result.username && change.id === instagramId) {
        result.username = change.user_name;
      }
      
      if (change?.name && !result.name && change.id === instagramId) {
        result.name = change.name;
      }
      
      // Access dynamic properties with type assertion
      if ((change as any)?.full_name && !result.name) {
        result.name = (change as any).full_name;
      }
      
      // Access nested user object with type assertion
      const userObj = (change as any)?.user;
      if (userObj?.full_name && !result.name) {
        result.name = userObj.full_name;
      }
      
      const changePic = change?.profile_picture || change?.profile_pic || change?.avatar || change?.picture;
      if (changePic && !result.profilePictureUrl && change?.id === instagramId) {
        result.profilePictureUrl = changePic;
        console.log('Found profile picture in change properties:', result.profilePictureUrl);
      }
    }
    
    // If we have a username but failed to get a name, convert username to a display name
    if (result.username && !result.name) {
      // Create a display name from username by replacing underscores and dots with spaces and capitalizing words
      result.name = result.username
        .replace(/[_\.]+/g, ' ') // Replace consecutive special chars with a single space
        .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
        .split(' ')
        .filter(word => word.length > 0) // Remove empty words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
      console.log('Generated display name from username:', result.name);
    }
    
    // If we have a username but no profile picture, try a public approach
    if (result.username && !result.profilePictureUrl && result.username !== instagramId) {
      try {
        console.log(`Attempting to fetch public profile picture for: ${result.username}`);
        
        // Try to fetch the actual profile picture using our utility
        const profilePic = await fetchInstagramProfilePicture(result.username);
        
        if (profilePic) {
          result.profilePictureUrl = profilePic;
          console.log(`Successfully fetched profile picture for ${result.username}: ${profilePic}`);
        } else {
          // Fallback to default Instagram profile picture if we can't fetch the real one
          result.profilePictureUrl = 'https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png';
          console.log(`Using default Instagram profile picture: ${result.profilePictureUrl}`);
        }
      } catch (publicError) {
        console.error('Error setting profile picture:', publicError);
        // Fallback to default in case of any error
        result.profilePictureUrl = 'https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png';
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting user profile from webhook:', error);
    return {};
  }
}

// Helper function to add contact after automation
async function addContactAfterAutomation(
  userId: string,
  instagramId: string,
  instagramHandle: string,
  webhook_payload?: WebhookPayload
): Promise<{ success: boolean; message: string }> {
  try {
    // Basic validation - just ensure userId is a non-empty string
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId:', userId);
      return { success: false, message: 'Invalid userId' };
    }

    console.log(`Adding Instagram account to contacts - UserId: ${userId}, InstagramId: ${instagramId}, Handle: ${instagramHandle}`);
    
    // Try to extract user profile from webhook first if available
    let profileData: InstagramProfileFromWebhook = {};
    
    if (webhook_payload) {
      profileData = await extractUserProfileFromWebhook(webhook_payload, instagramId);
      if (profileData.username || profileData.name || profileData.profilePictureUrl) {
        console.log(`Extracted profile data from webhook:`, profileData);
      }
    }
    
    // If we couldn't get complete profile from webhook, use our enhanced profile fetching
    if (!profileData.username || !profileData.name || !profileData.profilePictureUrl) {
      try {
        console.log('Webhook data incomplete, fetching complete profile data');
        
        // Use the Instagram handle as username if we don't have one
        const username = profileData.username || instagramHandle;
        
        // Fetch complete profile data (name, username, profile picture)
        const completeProfileData = await fetchInstagramProfileData(username);
        
        // Update missing fields with what we fetched
        if (completeProfileData.username && !profileData.username) {
          profileData.username = completeProfileData.username;
        }
        
        if (completeProfileData.fullName && !profileData.name) {
          profileData.name = completeProfileData.fullName;
          console.log(`Found real full name: ${profileData.name}`);
        }
        
        if (completeProfileData.profilePictureUrl && !profileData.profilePictureUrl) {
          profileData.profilePictureUrl = completeProfileData.profilePictureUrl;
        }
        
        console.log('Profile data after enhanced fetching:', {
          username: profileData.username,
          name: profileData.name,
          hasProfilePic: !!profileData.profilePictureUrl
        });
      } catch (directError) {
        console.error('Error fetching complete profile data:', directError);
      }
    }

    // If we still don't have a profile picture, use the fallback
    if (!profileData.profilePictureUrl) {
      profileData.profilePictureUrl = 'https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png';
      console.log(`Using default Instagram profile picture: ${profileData.profilePictureUrl}`);
    }

    // Ensure we have a name by using the username as a fallback
    if (!profileData.name && profileData.username) {
      profileData.name = profileData.username
        .replace(/[_\.]+/g, ' ') // Replace consecutive special chars with a single space
        .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
        .split(' ')
        .filter(word => word.length > 0) // Remove empty words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
      console.log(`Generated display name from username: ${profileData.name}`);
    }
    
    // As a last resort, use the Instagram ID if we have nothing else
    if (!profileData.name && !profileData.username) {
      profileData.name = instagramHandle;
      profileData.username = instagramHandle;
    }

    // Add the contact to the database via our service function
    const result = await addContactFromAutomation({
      userId,
      instagramId,
      username: profileData.username || instagramHandle,
      name: profileData.name || profileData.username || instagramHandle,
      profilePictureUrl: profileData.profilePictureUrl
    });

    return result;
  } catch (error) {
    console.error('Error adding contact after automation:', error);
    return { success: false, message: 'Internal server error' };
  }
}

// Helper function to check if contact is paused or reported before sending automation
async function checkContactStatus(
  userId: string,
  instagramId: string
): Promise<{ isBlocked: boolean; blockInfo?: string }> {
  try {
    // Find the contact in the database
    const contact = await client.contact.findFirst({
      where: {
        userId,
        instagramId,
      },
    });

    if (!contact) {
      // Contact doesn't exist yet, so not paused or reported
      return { isBlocked: false };
    }

    // Check if contact is reported first (higher priority)
    const reported = isContactReported(contact);
    if (reported) {
      const reportInfo = 'Contact is reported and blocked from receiving automations';
      console.log(`Automation skipped: ${reportInfo}`);
      return { isBlocked: true, blockInfo: reportInfo };
    }

    // Check if contact is paused using our utility function
    const paused = isContactPaused(contact);
    
    // If paused, return some information about the pause state
    if (paused) {
      let pauseInfo = 'Contact is paused';
      
      if (contact.isPausedForever) {
        pauseInfo = 'Contact is paused indefinitely';
      } else if (contact.pauseEndTime) {
        const endTime = new Date(contact.pauseEndTime);
        pauseInfo = `Contact is paused until ${endTime.toISOString()}`;
      }
      
      console.log(`Automation skipped: ${pauseInfo}`);
      return { isBlocked: true, blockInfo: pauseInfo };
    }
    
    return { isBlocked: false };
  } catch (error) {
    console.error('Error checking contact status:', error);
    // Continue with automation even if there's an error checking status
    return { isBlocked: false };
  }
}

// Helper to modify the messaging processing to check contact status
async function processMessagingAutomation(
  webhook_payload: WebhookPayload,
  automation: any
) {
  // Check if contact is paused or reported before sending automation
  if (automation.userId) {
    const senderId = webhook_payload.entry[0]?.messaging?.[0]?.sender?.id;
    
    if (!senderId) {
      console.log('Sender ID not found in webhook payload');
      return NextResponse.json(
        {
          message: 'Sender ID not found',
        },
        { status: 200 }
      );
    }
    
    const contactStatus = await checkContactStatus(automation.userId, senderId);
    
    if (contactStatus.isBlocked) {
      console.log(`Skipping automation for blocked contact: ${contactStatus.blockInfo}`);
      return NextResponse.json(
        {
          message: 'Contact is blocked, automation skipped',
          blockInfo: contactStatus.blockInfo
        },
        { status: 200 }
      );
    }
  }

  // ... rest of the function remains the same
}

export async function GET(req: NextRequest) {
  const hub = req.nextUrl.searchParams.get('hub.challenge')
  return new NextResponse(hub)
}

export async function POST(req: NextRequest) {
  try {
    // Parse webhook payload
    const webhook_payload = await req.json() as WebhookPayload;
    
    let matcher: KeywordMatch | null = null
    
    try {
      // Handle direct messages
      if (webhook_payload.entry[0].messaging) {
        if (webhook_payload.entry[0].messaging[0]?.message?.is_echo) {
          return NextResponse.json({ message: 'Echo message skipped' }, { status: 200 })
        }

        if (!webhook_payload.entry[0].messaging[0]?.message?.text) {
          return NextResponse.json({ message: 'Empty message skipped' }, { status: 200 })
        }

        console.log('🔍 Processing messaging webhook:', {
          messageType: 'messaging',
          messageContent: webhook_payload.entry[0].messaging[0]?.message?.text,
          senderId: webhook_payload.entry[0].messaging[0]?.sender?.id,
          timestamp: new Date().toISOString()
        })
        
        matcher = await matchKeyword(
          webhook_payload.entry[0].messaging[0].message.text
        )
        console.log('Keyword matcher result:', matcher)
      }

      // Handle comment changes
      if (webhook_payload.entry[0].changes) {
        if (!webhook_payload.entry[0].changes[0]?.value?.text) {
          return NextResponse.json({ message: 'Empty change skipped' }, { status: 200 })
        }

        const changeData = webhook_payload.entry[0].changes[0]?.value
        const commentId = changeData?.id
        const commentText = changeData?.text
        
        // Skip processing if we've already handled this comment recently
        if (commentId) {
          const now = Date.now()
          const lastProcessed = processedComments.get(commentId)
          
          if (lastProcessed && (now - lastProcessed < COMMENT_CACHE_EXPIRY)) {
            console.log(`Skipping duplicate comment processing for comment ID: ${commentId}`, {
              text: commentText,
              timeSinceLastProcessed: `${Math.round((now - lastProcessed) / 1000)}s ago`
            })
            return NextResponse.json({ message: 'Duplicate comment skipped' }, { status: 200 })
          }
          
          // Mark this comment as processed with current timestamp
          processedComments.set(commentId, now)
          
          // Clean up old entries from the cache
          for (const [cachedId, timestamp] of processedComments.entries()) {
            if (now - timestamp > COMMENT_CACHE_EXPIRY) {
              processedComments.delete(cachedId)
            }
          }
        }

        console.log('🔍 Processing changes webhook:', {
          changeType: 'changes',
          changeContent: commentText,
          commentId,
          timestamp: new Date().toISOString()
        })
        
        matcher = await matchKeyword(
          commentText || ''
        )

        if (matcher) {
          console.log('Matched keyword for automation:', matcher.triggerId)
          
          const automation = await getKeywordAutomation(
            matcher.triggerId,
            false // Set to false for comment handling
          )

          if (!automation) {
            console.log('No valid automation found for trigger ID:', matcher.triggerId)
            return NextResponse.json(
              {
                message: 'No valid automation found',
                triggerId: matcher.triggerId
              },
              { status: 200 }
            )
          }

          // Add check for active status
          if (!automation.active) {
            console.log('Automation is disabled:', automation.id)
            return NextResponse.json(
              {
                message: 'Automation is disabled',
                automationId: automation.id
              },
              { status: 200 }
            )
          }

          // Check if contact is paused before proceeding with automation
          if (automation.userId) {
            const senderId = webhook_payload.entry[0].changes[0].value.from.id;
            try {
              const contactStatus = await checkContactStatus(automation.userId, senderId);
            
              if (contactStatus.isBlocked) {
                console.log(`Skipping automation for blocked contact: ${contactStatus.blockInfo}`);
                return NextResponse.json(
                  {
                    message: 'Contact is blocked, automation skipped',
                    blockInfo: contactStatus.blockInfo
                  },
                  { status: 200 }
                );
              }
            } catch (error) {
              console.error('Error checking contact status:', error);
              // Continue with automation even if there's an error checking status
            }
          }

          // Track the automation run as soon as we know it's a valid, active automation
          // This counts the run based on the trigger, not the actions performed
          await trackAutomationRun(automation.id);

          console.log('Found automation:', {
            id: automation.id,
            type: automation.listener?.type,
            subscription: automation.User?.subscription?.plan,
            active: automation.active
          })

          // Check if this automation has specific posts configured
          const hasSpecificPost = automation.trigger?.[0]?.posts?.length > 0;
          const mediaId = webhook_payload.entry[0].changes?.[0]?.value?.media?.id;
          
          // If the automation is configured for specific posts and the media ID doesn't match any configured post,
          // then we should not process this webhook
          if (hasSpecificPost && mediaId) {
            const isPostConfigured = await getKeywordPost(
              mediaId,
              automation.id
            );
            
            if (!isPostConfigured) {
              console.log('Comment is on a different post than the one configured:', {
                mediaId,
                automationId: automation.id
              });
              return NextResponse.json(
                {
                  message: 'Comment is on a non-configured post',
                  mediaId,
                  automationId: automation.id
                },
                { status: 200 }
              );
            }
          }

          if (automation?.trigger && automation.listener) {
            const commentId = webhook_payload.entry[0].changes[0].value.id
            const token = automation.User?.integrations[0].token
            // Check if reply messages are configured
            const hasReplyMessages = automation.trigger.some(trigger => 
              trigger.type === 'post-comments' && trigger.replyMessages && trigger.replyMessages.length > 0
            )

            // Handle message action for comments
            if (isSameActionType(automation.listener.type, ACTION_TYPE.MESSAGE)) {
              console.log(
                'COMMENT VERSION:',
                webhook_payload.entry[0].changes[0].value.from.id
              )

              // Load the full automation data to get messageData
              const fullAutomation = await findAutomation(automation.id)
              const listenerToUse = fullAutomation?.listener || automation.listener

              // First, try to send a direct message
              const dmMessage = getListenerMessage(listenerToUse)
              let dmSent = false
              let dmError = null
              
              if (token) {
                console.log('Attempting to send DM first:', {
                  userId: webhook_payload.entry[0].id,
                  commentId: commentId,
                  messageLength: dmMessage.length,
                  tokenAvailable: !!token
                })

                try {
                  const direct_message = await sendPrivateMessage(
                    webhook_payload.entry[0].id,
                    commentId,
                    dmMessage,
                    token,
                    automation.User?.integrations[0].id
                  )

                  if (direct_message.status === 200) {
                    console.log('DM sent successfully');
                    dmSent = true;
                    
                    // Add this contact to the user's contacts list
                    if (automation.userId) {
                      await addContactAfterAutomation(
                        automation.userId,
                        webhook_payload.entry[0].changes[0].value.from.id,
                        webhook_payload.entry[0].changes[0].value.from.id,
                        webhook_payload
                      );
                    }

                    // DM was successful, now check if we should reply to the comment
                    if (hasReplyMessages) {
                      console.log('DM sent successfully, now checking comment reply configuration')
                      // Get a random reply message from the array if available
                      const replyMessages = automation.trigger[0]?.replyMessages?.map(msg => msg.message) || []
                      const replyMessage = replyMessages.length > 0
                        ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                        : 'Check your DMs for more information!'
                      
                      // Check if the selected reply message is "no" - if so, skip comment reply
                      if (replyMessage.toLowerCase() === 'no') {
                        console.log('Reply message is "No" - skipping comment reply but showing green status')
                        // Track only DM since we're not replying to comment
                        await trackAutomationActivity(automation.id, ['DM'])
                        return NextResponse.json(
                          {
                            message: 'DM sent successfully, no comment reply configured',
                          },
                          { status: 200 }
                        )
                      }
                      
                      // Reply to the comment with the randomly selected message
                      const commentReply = await replyToComment(
                        commentId,
                        replyMessage,
                        token
                      )

                      if (commentReply.status === 200) {
                        console.log('Comment reply sent successfully after DM')
                        // Track both actions together at the end
                        await trackAutomationActivity(automation.id, ['DM', 'COMMENT'])
                        return NextResponse.json(
                          {
                            message: 'DM and comment reply sent successfully',
                          },
                          { status: 200 }
                        )
                      } else {
                        console.error('Failed to reply to comment after successful DM:', {
                          status: commentReply.status,
                          error: commentReply.data?.error,
                          commentId
                        })
                        
                        // DM was successful but comment reply failed
                        // Track only DM since the comment reply failed
                        await trackAutomationActivity(automation.id, ['DM'])
                        return NextResponse.json(
                          {
                            message: 'DM sent successfully but comment reply failed',
                          },
                          { status: 200 }
                        )
                      }
                    } else {
                      // No reply messages configured, just track DM
                      await trackAutomationActivity(automation.id, ['DM'])
                      return NextResponse.json(
                        {
                          message: 'DM sent successfully, no reply messages configured',
                        },
                        { status: 200 }
                      )
                    }
                  } else {
                    console.error('Failed to send DM:', {
                      status: direct_message.status,
                      error: direct_message.data?.error
                    })
                    
                    dmError = {
                      status: direct_message.status,
                      error: direct_message.data?.error
                    }
                    
                    // DM failed, record the error but continue to potentially reply to comment
                    console.log('DM failed with Instagram API error (likely 24-hour window restriction)')
                  }
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                  console.error('Error sending private message:', {
                    error: errorMessage
                  })
                  
                  dmError = {
                    error: errorMessage
                  }
                  
                  // DM failed with exception, record the error but continue to potentially reply to comment
                  console.log('DM failed with exception')
                }
                
                // If DM failed but we have reply messages configured, reply to the comment as a fallback
                if (!dmSent && hasReplyMessages) {
                  console.log('DM failed but checking comment reply configuration as fallback')
                  // Get a random reply message from the array if available
                  const replyMessages = automation.trigger[0]?.replyMessages?.map(msg => msg.message) || []
                  const replyMessage = replyMessages.length > 0
                    ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                    : 'Check your DMs for more information!'
                  
                  // Check if the selected reply message is "no" - if so, skip comment reply
                  if (replyMessage.toLowerCase() === 'no') {
                    console.log('Reply message is "No" - skipping comment reply fallback but showing green status')
                    // Don't track anything since both DM failed and we're not replying to comment
                    return NextResponse.json(
                      {
                        message: 'DM failed and no comment reply configured',
                        dmError
                      },
                      { status: 200 }
                    )
                  }
                  
                  // Reply to the comment with the randomly selected message
                  const commentReply = await replyToComment(
                    commentId,
                    replyMessage,
                    token
                  )

                  if (commentReply.status === 200) {
                    console.log('Comment reply sent successfully as fallback after DM failure')
                    // Track only the comment since DM failed
                    await trackAutomationActivity(automation.id, ['COMMENT'])
                    return NextResponse.json(
                      {
                        message: 'DM failed but comment reply sent successfully',
                        dmError
                      },
                      { status: 200 }
                    )
                  } else {
                    console.error('Failed to reply to comment after DM failure:', {
                      status: commentReply.status,
                      error: commentReply.data?.error,
                      commentId
                    })
                    
                    // Both DM and comment reply failed
                    // No need to track anything since no actions succeeded
                    return NextResponse.json(
                      {
                        message: 'Both DM and comment reply failed',
                        dmError,
                        commentError: {
                          status: commentReply.status,
                          error: commentReply.data?.error
                        }
                      },
                      { status: 200 }
                    )
                  }
                } else {
                  // DM failed and no reply message, return failure
                  // No need to track anything since no actions succeeded
                  return NextResponse.json(
                    {
                      message: 'DM failed and no reply message configured',
                      dmError
                    },
                    { status: 200 }
                  )
                }
              }
            }
          }
        }
      }

      // Log no match for direct messages
      if (!matcher && 
          webhook_payload.entry[0].messaging && 
          !webhook_payload.entry[0].messaging[0]?.message?.is_echo && 
          webhook_payload.entry[0].messaging[0]?.message?.text) {
        console.log('ℹ️ No keyword match for message:', {
          timestamp: new Date().toISOString(),
          messageContent: webhook_payload.entry[0].messaging[0].message.text
        })
      }

      // Handle matched keywords
      if (matcher) {
        console.log('Matched keyword for automation:', matcher.triggerId)
        
        // Handle direct messages
        if (webhook_payload.entry[0].messaging) {
          const automation = await getKeywordAutomation(
            matcher.triggerId,
            true
          )
          
          if (!automation) {
            console.log('No valid automation found for trigger ID:', matcher.triggerId)
            return NextResponse.json(
              {
                message: 'No valid automation found',
                triggerId: matcher.triggerId
              },
              { status: 200 }
            )
          }
          
          // Add check for active status
          if (!automation.active) {
            console.log('Automation is disabled:', automation.id)
            return NextResponse.json(
              {
                message: 'Automation is disabled',
                automationId: automation.id
              },
              { status: 200 }
            )
          }
          
          // Check if contact is paused before proceeding with automation
          if (automation.userId) {
            const senderId = webhook_payload.entry[0]?.messaging?.[0]?.sender?.id;
            
            if (senderId) {
              try {
                const contactStatus = await checkContactStatus(automation.userId, senderId);
                
                if (contactStatus.isBlocked) {
                  console.log(`Skipping automation for blocked contact: ${contactStatus.blockInfo}`);
                  return NextResponse.json(
                    {
                      message: 'Contact is blocked, automation skipped',
                      blockInfo: contactStatus.blockInfo
                    },
                    { status: 200 }
                  );
                }
              } catch (error) {
                console.error('Error checking contact status:', error);
                // Continue with automation even if there's an error checking status
              }
            }
          }
          
          // Track the automation run as soon as we know it's a valid, active automation
          // This counts the run based on the trigger, not the actions performed
          await trackAutomationRun(automation.id);

          console.log('Found automation:', {
            id: automation.id,
            type: automation.listener?.type,
            subscription: automation.User?.subscription?.plan,
            active: automation.active
          })

          if (automation?.trigger && automation.listener) {
            // Ensure we're using the correct action type that was configured for this automation
            // First check if the automation was found directly with the correct ID
            if (automation.id !== matcher.triggerId) {
              // If not, get the full automation details to ensure we have the right listener (action) type
              console.log(`Verifying action type for automation ${automation.id} with trigger ${matcher.triggerId}`)
              
              // Get the full automation directly by ID to ensure we have the correct configuration
              const fullAutomation = await findAutomation(automation.id)
              if (fullAutomation) {
                console.log(`Using verified action type: ${fullAutomation.listener?.type} for automation: ${automation.id}`)
                // Use the action type from the full automation data
                if (fullAutomation.listener?.type) {
                  automation.listener.type = fullAutomation.listener.type
                }
                // Also update the full listener data to include messageData
                if (fullAutomation.listener) {
                  automation.listener = fullAutomation.listener
                }
              }
            }
            
            // Handle message action
            if (isSameActionType(automation.listener.type, ACTION_TYPE.MESSAGE)) {
              console.log('Processing MESSAGE listener')
              
              const direct_message = await sendDM(
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                getListenerMessage(automation.listener),
                automation.User?.integrations[0].token!,
                automation.User?.integrations[0].id
              )

              if (direct_message.status === 200) {
                console.log('MESSAGE: DM sent successfully')
                const tracked = await trackAutomationActivity(automation.id, ['DM'])
                if (tracked) {
                  // Add this contact to the user's contacts list
                  if (automation.userId) {
                    await addContactAfterAutomation(
                      automation.userId,
                      webhook_payload.entry[0].messaging[0].sender.id,
                      webhook_payload.entry[0].messaging[0].sender.id,
                      webhook_payload
                    );
                  }
                  return NextResponse.json(
                    {
                      message: 'Message sent',
                    },
                    { status: 200 }
                  )
                }
              }
            }

            // Handle AI action
            if (
              isSameActionType(automation.listener.type, ACTION_TYPE.PROLYAI) &&
              automation.User?.subscription?.plan === 'PRO'
            ) {
              // If we're handling a comment (changes), let the comment-specific handler take care of it
              if (webhook_payload.entry[0].changes) {
                console.log('Skipping direct message Proly AI processing for comment - will be handled by comment-specific handler');
                return NextResponse.json(
                  {
                    message: 'Comment Proly AI processing deferred to specific handler',
                  },
                  { status: 200 }
                );
              }
              
              				console.log('Starting Proly AI processing for direct message')
              try {
                const messageText = webhook_payload.entry[0]?.messaging?.[0]?.message?.text || '';
                const senderId = webhook_payload.entry[0]?.messaging?.[0]?.sender?.id;
                const entryId = webhook_payload.entry[0].id;
                console.log('Processing user message:', messageText);
                
                // Check if there's existing chat history first
                const customer_history = await getChatHistory(
                  entryId,
                  senderId
                );
                
                let messages = [];
                
                // If we have chat history, include it in the AI call
                if (customer_history.history.length > 0) {
                  console.log(`Found existing chat history with ${customer_history.history.length} messages`);
                  messages = [
                    {
                      role: 'system',
                      content: (automation.listener.prompt || 'You are a helpful assistant') + ' IMPORTANT: Keep your responses concise and under 950 characters when possible to fit messaging platform limits better. Longer responses will be split into multiple messages. DO NOT use markdown formatting like bold (**), italic (*), or other special formatting characters as they will not display correctly.'
                    },
                    ...customer_history.history,
                    {
                      role: 'user',
                      content: messageText
                    }
                  ];
                } else {
                  console.log('No existing chat history found, starting new conversation');
                  messages = [
                    {
                      role: 'system',
                      content: (automation.listener.prompt || 'You are a helpful assistant') + ' IMPORTANT: Keep your responses concise and under 950 characters when possible to fit messaging platform limits better. Longer responses will be split into multiple messages. DO NOT use markdown formatting like bold (**), italic (*), or other special formatting characters as they will not display correctly.'
                    },
                    {
                      role: 'user',
                      content: messageText
                    }
                  ];
                }
                
                const omni_ai_message = await mistralAI.chat.complete({
                  model: 'mistral-large-latest',
                  messages: messages,
                });
                
                				console.log('Proly AI response received:', omni_ai_message.choices[0].message.content);

                if (
                  omni_ai_message.choices[0]?.message?.content && 
                  webhook_payload.entry[0]?.messaging?.[0]?.message?.text &&
                  webhook_payload.entry[0]?.messaging?.[0]?.sender?.id &&
                  automation.User?.integrations?.[0]?.token
                ) {
                  const aiResponse = omni_ai_message.choices[0].message.content;
                  const token = automation.User.integrations[0].token as string;

                  console.log('Creating chat history');
                  try {
                    // Attempt with higher transaction timeout (30 seconds instead of default 5)
                    await client.$transaction(async (tx) => {
                      await createChatHistory(
                        automation.id,
                        entryId,
                        senderId,
                        messageText
                      );

                      await createChatHistory(
                        automation.id,
                        entryId,
                        senderId,
                        aiResponse
                      );
                    }, {
                      maxWait: 30000, // 30 seconds max wait time
                      timeout: 30000  // 30 seconds timeout
                    });
                    console.log('Chat history created successfully');
                  } catch (dbError) {
                    // Log the error but continue with message delivery
                    console.error('Error creating chat history:', dbError);
                    console.log('Continuing with message delivery despite chat history error');
                  }

                  				console.log('Sending DM with Proly AI response');
                  const direct_message = await sendDM(
                    entryId,
                    senderId,
                    aiResponse,
                    token,
                    automation.User?.integrations[0].id
                  );

                  if (direct_message.status === 200) {
                    // Add this contact to the user's contacts list
                    if (automation.userId) {
                      await addContactAfterAutomation(
                        automation.userId,
                        webhook_payload.entry[0].messaging[0].sender.id,
                        webhook_payload.entry[0].messaging[0].sender.id,
                        webhook_payload
                      );
                    }
                    return NextResponse.json(
                      {
                        message: 'Message sent',
                      },
                      { status: 200 }
                    )
                  }
                }
              } catch (error) {
                				console.error('Error in Proly AI processing:', error);
                
                // Check if this is a token-related error
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                  console.log('Proly AI processing failed with 401 error - likely an expired token');
                  
                  // Track that the automation was triggered even though message delivery failed
                  await trackAutomationActivity(automation.id, []);
                  
                  return NextResponse.json(
                    {
                      						message: 'Authentication error when processing Proly AI request. Token may need to be refreshed.',
                      error: error.response?.data?.error?.message || 'Token authentication failed',
                      suggestedAction: 'Please reconnect your Instagram account in settings to refresh your token.'
                    },
                    { status: 401 }
                  );
                }
                
                return NextResponse.json(
                  {
                    						message: 'Error processing Proly AI request',
                    error: error instanceof Error ? error.message : 'Unknown error'
                  },
                  { status: 500 }
                );
              }
            }
          }
        }

        // Handle comment changes
        if (
          webhook_payload.entry[0].changes &&
          webhook_payload.entry[0].changes[0].field === 'comments'
        ) {
          const automation = await getKeywordAutomation(
            matcher.triggerId,
            false
          )

          if (!automation) {
            console.log('No valid automation found for trigger ID:', matcher.triggerId)
            return NextResponse.json(
              {
                message: 'No valid automation found',
                triggerId: matcher.triggerId
              },
              { status: 200 }
            )
          }

          // Add check for active status
          if (!automation.active) {
            console.log('Automation is disabled:', automation.id)
            return NextResponse.json(
              {
                message: 'Automation is disabled',
                automationId: automation.id
              },
              { status: 200 }
            )
          }

          // Check if contact is paused before proceeding with automation
          if (automation.userId && webhook_payload.entry[0]?.changes?.[0]?.value?.from?.id) {
            const senderId = webhook_payload.entry[0].changes[0].value.from.id;
            try {
              const contactStatus = await checkContactStatus(automation.userId, senderId);
              
              if (contactStatus.isBlocked) {
                console.log(`Skipping automation for blocked contact: ${contactStatus.blockInfo}`);
                return NextResponse.json(
                  {
                    message: 'Contact is blocked, automation skipped',
                    blockInfo: contactStatus.blockInfo
                  },
                  { status: 200 }
                );
              }
            } catch (error) {
              console.error('Error checking contact status:', error);
              // Continue with automation even if there's an error checking status
            }
          }

          // Track the automation run as soon as we know it's a valid, active automation
          // This counts the run based on the trigger, not the actions performed
          await trackAutomationRun(automation.id);

          console.log('Found automation:', {
            id: automation.id,
            type: automation.listener?.type,
            subscription: automation.User?.subscription?.plan,
            active: automation.active
          })

          // Only process if we have media information
          if (!webhook_payload.entry[0].changes[0].value.media) {
            console.log('No media information in the webhook payload, skipping');
            return NextResponse.json(
              {
                message: 'No media information provided',
                triggerId: matcher.triggerId
              },
              { status: 200 }
            );
          }

          // Check if this automation has specific posts configured 
          const hasSpecificPost = automation.trigger?.[0]?.posts?.length > 0;
          
          // If the automation was configured for a specific post, we need to verify this comment is on that post
          if (hasSpecificPost) {
            const mediaId = webhook_payload.entry[0].changes[0].value.media.id;
            const automations_post = await getKeywordPost(
              mediaId,
              automation.id
            );
            
            if (!automations_post) {
              console.log('Comment is on a different post than the one configured for automation:', {
                mediaId,
                automationId: automation.id
              });
              return NextResponse.json(
                {
                  message: 'Comment is on a non-configured post',
                  mediaId,
                  automationId: automation.id
                },
                { status: 200 }
              );
            }
            
            console.log('Found matching configured post for comment:', automations_post);
          } else {
            console.log('Automation is configured for all posts, processing comment');
          }

          if (automation?.trigger && automation.listener && webhook_payload.entry[0].changes[0].value.media) {
            const automations_post = await getKeywordPost(
              webhook_payload.entry[0].changes[0].value.media.id,
              automation.id
            )

            console.log('Found keyword post:', automations_post)

            // Check if reply messages are configured
            const hasReplyMessages = automation.trigger.some(trigger => 
              trigger.type === 'post-comments' && trigger.replyMessages && trigger.replyMessages.length > 0
            )
            
            // Log the automation type to help with debugging
            console.log('Automation type for comment handling:', {
              type: automation.listener.type,
              isProlyAI: isSameActionType(automation.listener.type, ACTION_TYPE.PROLYAI),
              isMessage: isSameActionType(automation.listener.type, ACTION_TYPE.MESSAGE),
              subscription: automation.User?.subscription?.plan
            });

            if (automations_post) {
              // Handle Proly AI action for comments first
              if (
                isSameActionType(automation.listener.type, ACTION_TYPE.PROLYAI) &&
                automation.User?.subscription?.plan === 'PRO'
              ) {
                console.log('Processing Proly AI for comment before other handlers');
                
                const commentText = webhook_payload.entry[0].changes[0].value.text || '';
                  
                const omni_ai_message = await mistralAI.chat.complete({
                  model: 'mistral-large-latest',
                  messages: [
                    {
                      role: 'system',
                      content: `${automation.listener.prompt || 'You are a helpful assistant'}: keep responses under 2 sentences and under 950 characters when possible to fit messaging platform limits better. Longer responses will be split into multiple messages. DO NOT use markdown formatting like bold (**), italic (*), or other special formatting characters as they will not display correctly.`,
                    },
                    {
                      role: 'user',
                      content: commentText
                    }
                  ],
                })

                console.log('Proly AI generated response:', omni_ai_message.choices[0]?.message?.content);

                if (
                  omni_ai_message.choices[0]?.message?.content && 
                  webhook_payload.entry[0]?.changes?.[0]?.value?.text &&
                  webhook_payload.entry[0]?.changes?.[0]?.value?.from?.id &&
                  automation.User?.integrations?.[0]?.token
                ) {
                  const fromId = webhook_payload.entry[0].changes[0].value.from.id
                  const commentId = webhook_payload.entry[0].changes[0].value.id
                  const entryId = webhook_payload.entry[0].id
                  const aiResponse = omni_ai_message.choices[0].message.content
                  const token = automation.User.integrations[0].token as string

                  console.log('Creating chat history')
                  try {
                    // Attempt with higher transaction timeout (30 seconds instead of default 5)
                    await client.$transaction(async (tx) => {
                      await createChatHistory(
                        automation.id,
                        entryId,
                        fromId,
                        commentText
                      )

                      await createChatHistory(
                        automation.id,
                        entryId,
                        fromId,
                        aiResponse
                      )
                    }, {
                      maxWait: 30000, // 30 seconds max wait time
                      timeout: 30000  // 30 seconds timeout
                    })
                    console.log('Chat history created successfully')
                  } catch (dbError) {
                    // Log the error but continue with message delivery
                    console.error('Error creating chat history:', dbError)
                    console.log('Continuing with message delivery despite chat history error')
                  }

                  				console.log('Sending DM with Proly AI response')
                  const direct_message = await sendDM(
                    entryId,
                    commentId,
                    aiResponse,
                    token,
                    automation.User?.integrations[0].id
                  )

                  if (direct_message.status === 200) {
                    console.log('Proly AI private message sent successfully');
                    const tracked = await trackAutomationActivity(automation.id, ['DM'])

                    if (tracked) {
                      // Add this contact to the user's contacts list
                      if (automation.userId) {
                        await addContactAfterAutomation(
                          automation.userId,
                          webhook_payload.entry[0].changes[0].value.from.id,
                          webhook_payload.entry[0].changes[0].value.from.id,
                          webhook_payload
                        );
                      }
                      
                      // Now check if we should also reply to the comment publicly
                      if (hasReplyMessages) {
                        console.log('Proly AI DM sent successfully, now checking comment reply configuration');
                        // Get a random reply message from the array if available
                        const replyMessages = automation.trigger[0]?.replyMessages?.map(msg => msg.message) || []
                        const replyMessage = replyMessages.length > 0
                          ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                          : 'Check your DMs for more information!'
                        
                        // Check if the selected reply message is "no" - if so, skip comment reply
                        if (replyMessage.toLowerCase() === 'no') {
                          console.log('Reply message is "No" - skipping comment reply but showing green status')
                          // Only track DM since we're not replying to comment
                          // (DM already tracked above)
                        } else {
                          // Reply to the comment with the randomly selected message
                          const commentReply = await replyToComment(
                            commentId,
                            replyMessage,
                            token
                          )

                          if (commentReply.status === 200) {
                            console.log('Comment reply sent successfully after Proly AI DM');
                            await trackAutomationActivity(automation.id, ['DM', 'COMMENT']);
                          }
                          else {
                            // Still track the DM since it was successful
                            await trackAutomationActivity(automation.id, ['DM']);
                          }
                        }
                      }
                      
                      return NextResponse.json(
                        {
                          message: 'Proly AI message sent',
                        },
                        { status: 200 }
                      )
                    }
                  } else {
                    console.error('Failed to send Proly AI private message:', {
                      status: direct_message.status,
                      error: direct_message.data?.error
                    });
                  }
                }
              }
              
              // Handle message action for comments
              if (isSameActionType(automation.listener.type, ACTION_TYPE.MESSAGE)) {
                console.log(
                  'SENDING DM, WEBHOOK PAYLOAD:',
                  webhook_payload,
                  'changes:',
                  webhook_payload.entry[0].changes[0].value.from
                )

                console.log(
                  'COMMENT VERSION:',
                  webhook_payload.entry[0].changes[0].value.from.id
                )

                // First, try to send a direct message
                const commentId = webhook_payload.entry[0].changes[0].value.id
                const dmMessage = getListenerMessage(automation.listener)
                const token = automation.User?.integrations[0].token!
                let dmSent = false
                let dmError = null
                
                if (token) {
                  console.log('Attempting to send DM first:', {
                    userId: webhook_payload.entry[0].id,
                    commentId: commentId,
                    messageLength: dmMessage.length,
                    tokenAvailable: !!token
                  })

                  try {
                    const direct_message = await sendPrivateMessage(
                      webhook_payload.entry[0].id,
                      commentId,
                      dmMessage,
                      token,
                      automation.User?.integrations[0].id
                    )

                    if (direct_message.status === 200) {
                      console.log('DM sent successfully')
                      dmSent = true
                      // Remove this tracking call since we'll track all actions at the end
                      // await trackAutomationActivity(automation.id, ['DM'])

                      // Add this contact to the user's contacts list
                      if (automation.userId) {
                        await addContactAfterAutomation(
                          automation.userId,
                          webhook_payload.entry[0].changes[0].value.from.id,
                          webhook_payload.entry[0].changes[0].value.from.id,
                          webhook_payload
                        );
                      }

                      // DM was successful, now check if we should reply to the comment
                      if (hasReplyMessages) {
                        console.log('DM sent successfully, now checking comment reply configuration')
                        // Get a random reply message from the array if available
                        const replyMessages = automation.trigger[0]?.replyMessages?.map(msg => msg.message) || []
                        const replyMessage = replyMessages.length > 0
                          ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                          : 'Check your DMs for more information!'
                        
                        // Check if the selected reply message is "no" - if so, skip comment reply
                        if (replyMessage.toLowerCase() === 'no') {
                          console.log('Reply message is "No" - skipping comment reply but showing green status')
                          // Track only DM since we're not replying to comment
                          await trackAutomationActivity(automation.id, ['DM'])
                          return NextResponse.json(
                            {
                              message: 'DM sent successfully, no comment reply configured',
                            },
                            { status: 200 }
                          )
                        }
                        
                        // Reply to the comment with the randomly selected message
                        const commentReply = await replyToComment(
                          commentId,
                          replyMessage,
                          token
                        )

                        if (commentReply.status === 200) {
                          console.log('Comment reply sent successfully after DM')
                          // Track both actions together at the end
                          await trackAutomationActivity(automation.id, ['DM', 'COMMENT'])
                          return NextResponse.json(
                            {
                              message: 'DM and comment reply sent successfully',
                            },
                            { status: 200 }
                          )
                        } else {
                          console.error('Failed to reply to comment after successful DM:', {
                            status: commentReply.status,
                            error: commentReply.data?.error,
                            commentId
                          })
                          
                          // DM was successful but comment reply failed
                          // Track only DM since the comment reply failed
                          await trackAutomationActivity(automation.id, ['DM'])
                          return NextResponse.json(
                            {
                              message: 'DM sent successfully but comment reply failed',
                            },
                            { status: 200 }
                          )
                        }
                      } else {
                        // No reply messages configured, just track DM
                        await trackAutomationActivity(automation.id, ['DM'])
                        return NextResponse.json(
                          {
                            message: 'DM sent successfully, no reply messages configured',
                          },
                          { status: 200 }
                        )
                      }
                    } else {
                      console.error('Failed to send DM:', {
                        status: direct_message.status,
                        error: direct_message.data?.error
                      })
                      
                      dmError = {
                        status: direct_message.status,
                        error: direct_message.data?.error
                      }
                      
                      // DM failed, record the error but continue to potentially reply to comment
                      console.log('DM failed with Instagram API error (likely 24-hour window restriction)')
                    }
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error('Error sending private message:', {
                      error: errorMessage
                    })
                    
                    dmError = {
                      error: errorMessage
                    }
                    
                    // DM failed with exception, record the error but continue to potentially reply to comment
                    console.log('DM failed with exception')
                  }
                  
                  // If DM failed but we have reply messages configured, reply to the comment as a fallback
                  if (!dmSent && hasReplyMessages) {
                    console.log('DM failed but checking comment reply configuration as fallback')
                    // Get a random reply message from the array if available
                    const replyMessages = automation.trigger[0]?.replyMessages?.map(msg => msg.message) || []
                    const replyMessage = replyMessages.length > 0
                      ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                      : 'Check your DMs for more information!'
                    
                    // Check if the selected reply message is "no" - if so, skip comment reply
                    if (replyMessage.toLowerCase() === 'no') {
                      console.log('Reply message is "No" - skipping comment reply fallback but showing green status')
                      // Don't track anything since both DM failed and we're not replying to comment
                      return NextResponse.json(
                        {
                          message: 'DM failed and no comment reply configured',
                          dmError
                        },
                        { status: 200 }
                      )
                    }
                    
                    // Reply to the comment with the randomly selected message
                    const commentReply = await replyToComment(
                      commentId,
                      replyMessage,
                      token
                    )

                    if (commentReply.status === 200) {
                      console.log('Comment reply sent successfully as fallback after DM failure')
                      // Track only the comment since DM failed
                      await trackAutomationActivity(automation.id, ['COMMENT'])
                      return NextResponse.json(
                        {
                          message: 'DM failed but comment reply sent successfully',
                          dmError
                        },
                        { status: 200 }
                      )
                    } else {
                      console.error('Failed to reply to comment after DM failure:', {
                        status: commentReply.status,
                        error: commentReply.data?.error,
                        commentId
                      })
                      
                      // Both DM and comment reply failed
                      // No need to track anything since no actions succeeded
                      return NextResponse.json(
                        {
                          message: 'Both DM and comment reply failed',
                          dmError,
                          commentError: {
                            status: commentReply.status,
                            error: commentReply.data?.error
                          }
                        },
                        { status: 200 }
                      )
                    }
                  } else {
                    // DM failed and no reply message, return failure
                    // No need to track anything since no actions succeeded
                    return NextResponse.json(
                      {
                        message: 'DM failed and no reply message configured',
                        dmError
                      },
                      { status: 200 }
                    )
                  }
                }

                // Handle AI action for comments
                if (
                  isSameActionType(automation.listener.type, ACTION_TYPE.PROLYAI) &&
                  automation.User?.subscription?.plan === 'PRO'
                ) {
                  // This implementation has been moved above for better flow control
                  console.log('Skipping redundant Proly AI processing, already handled above');
                  return NextResponse.json(
                    {
                      message: 'Proly AI processing already handled',
                    },
                    { status: 200 }
                  );
                }
              }
            }
          }
        }
      }

      // Handle continued conversations
      if (!matcher && webhook_payload.entry[0].messaging) {
        // Get the relevant IDs from the webhook payload
        const senderId = webhook_payload.entry[0].messaging[0].sender.id;
        const recipientId = webhook_payload.entry[0].messaging[0].recipient.id;
        const messageText = webhook_payload.entry[0].messaging[0]?.message?.text || '';
        const entryId = webhook_payload.entry[0].id;
        
        console.log('Checking for existing conversation history for user:', {
          senderId,
          recipientId,
          hasMessage: !!messageText,
        });
        
        // Get chat history - fix the parameter order to match the function definition
        // The order should be entryId (or recipientId) first, then senderId
        const customer_history = await getChatHistory(
          recipientId,
          senderId
        );

        console.log('Chat history check result:', {
          hasHistory: customer_history.history.length > 0,
          messageCount: customer_history.history.length,
          automationId: customer_history.automationId
        });

        if (customer_history.history.length > 0 && customer_history.automationId) {
          const automation = await findAutomation(customer_history.automationId);
          
          console.log('Found automation for ongoing conversation:', {
            id: automation?.id,
            type: automation?.listener?.type,
            subscription: automation?.User?.subscription?.plan
          });

          if (
            automation?.User?.subscription?.plan === 'PRO' &&
            automation.listener?.type === ACTION_TYPE.PROLYAI
          ) {
            console.log('Processing ongoing conversation with Proly AI');
            
            const omni_ai_message = await mistralAI.chat.complete({
              model: 'mistral-large-latest',
              messages: [
                {
                  role: 'system',
                  content: `${automation.listener.prompt || 'You are a helpful assistant'}: keep responses under 2 sentences and under 950 characters when possible to fit messaging platform limits better. Longer responses will be split into multiple messages. DO NOT use markdown formatting like bold (**), italic (*), or other special formatting characters as they will not display correctly.`,
                },
                ...customer_history.history,
                {
                  role: 'user',
                  content: messageText
                },
              ],
            });

            if (
              omni_ai_message.choices[0]?.message?.content && 
              messageText &&
              senderId &&
              automation.User?.integrations?.[0]?.token
            ) {
              const aiResponse = omni_ai_message.choices[0].message.content;
              const token = automation.User.integrations[0].token as string;

              console.log('Creating chat history for ongoing conversation');
              try {
                // Attempt with higher transaction timeout (30 seconds instead of default 5)
                await client.$transaction(async (tx) => {
                  await createChatHistory(
                    automation.id,
                    recipientId,
                    senderId,
                    messageText
                  );

                  await createChatHistory(
                    automation.id,
                    recipientId,
                    senderId,
                    aiResponse
                  );
                }, {
                  maxWait: 30000, // 30 seconds max wait time
                  timeout: 30000  // 30 seconds timeout
                });
                console.log('Chat history created successfully for ongoing conversation');
              } catch (dbError) {
                // Log the error but continue with message delivery
                console.error('Error creating chat history for ongoing conversation:', dbError);
                console.log('Continuing with message delivery despite chat history error');
              }

              				console.log('Sending DM with Proly AI response for ongoing conversation');
              const direct_message = await sendDM(
                entryId,
                senderId,
                aiResponse,
                token,
                automation.User?.integrations[0].id
              );

              if (direct_message.status === 200) {
                console.log('Successfully sent response for ongoing conversation');
                
                // Track the automation activity
                const tracked = await trackAutomationActivity(automation.id, ['DM']);
                
                if (tracked) {
                  console.log('Successfully tracked activity for ongoing conversation');
                }
                
                // Add this contact to the user's contacts list
                if (automation.userId) {
                  await addContactAfterAutomation(
                    automation.userId,
                    senderId,
                    senderId,
                    webhook_payload
                  );
                }
                
                return NextResponse.json(
                  {
                    message: 'Response sent for ongoing conversation',
                  },
                  { status: 200 }
                );
              } else {
                console.error('Failed to send response for ongoing conversation:', {
                  status: direct_message.status,
                  error: direct_message.data?.error
                });
              }
            }
          }
        } else {
          console.log('No existing conversation found for this user');
        }
      }

      return NextResponse.json(
        {
          message: 'No automation set',
        },
        { status: 200 }
      )
    } catch (error) {
      // Improved error logging with safe stringification
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = {
        message: 'Error processing webhook',
        error: errorMessage,
        timestamp: new Date().toISOString(),
        payload: webhook_payload || null
      }
      
      console.error('Error processing webhook:', JSON.stringify(errorDetails, null, 2))
      
      return NextResponse.json(
        {
          message: 'Error processing webhook',
          error: errorMessage
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error processing webhook:', {
      message: 'Error processing webhook',
      error: error?.message || String(error),
      timestamp: new Date().toISOString(),
      payload: await req.json().catch(() => 'Invalid JSON')
    });
    
    // Connection cleanup is handled by Prisma automatically
    
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to process webhook
async function processWebhook(webhook_payload: WebhookPayload) {
  let matcher: KeywordMatch | null = null;
  
  try {
    // Handle direct messages
    if (webhook_payload.entry[0].messaging) {
      if (webhook_payload.entry[0].messaging[0]?.message?.is_echo) {
        return { success: true, message: 'Echo message skipped' };
      }

      if (!webhook_payload.entry[0].messaging[0]?.message?.text) {
        return { success: true, message: 'Empty message skipped' };
      }

      console.log('🔍 Processing messaging webhook:', {
        messageType: 'messaging',
        messageContent: webhook_payload.entry[0].messaging[0]?.message?.text,
        senderId: webhook_payload.entry[0].messaging[0]?.sender?.id,
        timestamp: new Date().toISOString()
      });
      
      matcher = await matchKeyword(
        webhook_payload.entry[0].messaging[0].message.text
      );
      console.log('Keyword matcher result:', matcher);
    }

    // All the existing webhook processing logic continues here
    // ...

    // Return success after processing
    return { success: true, message: 'Webhook processed' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in processWebhook:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  } finally {
    // Connection cleanup is handled by Prisma automatically
  }
}