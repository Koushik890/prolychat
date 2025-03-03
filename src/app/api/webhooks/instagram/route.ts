import { findAutomation } from '@/actions/automations/queries'
import {
  createChatHistory,
  getChatHistory,
  getKeywordAutomation,
  getKeywordPost,
  getRandomReplyMessage,
  matchKeyword,
  trackResponses,
} from '@/actions/webhook/queries'
import { sendDM, sendPrivateMessage, replyToComment } from '@/lib/fetch'
import { mistralAI } from '@/lib/mistral'
import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ACTION_TYPE } from '@prisma/client'

interface KeywordMatch {
  id: string;
  triggerId: string;
  word: string;
}

interface WebhookPayload {
  entry: Array<{
    id: string;
    messaging?: Array<{
      sender: { id: string };
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
        from: { id: string };
        media?: {
          id: string;
        };
      };
    }>;
  }>;
}

export async function GET(req: NextRequest) {
  const hub = req.nextUrl.searchParams.get('hub.challenge')
  return new NextResponse(hub)
}

export async function POST(req: NextRequest) {
  const webhook_payload = await req.json() as WebhookPayload
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

      console.log('🔍 Processing changes webhook:', {
        changeType: 'changes',
        changeContent: webhook_payload.entry[0].changes[0]?.value?.text,
        timestamp: new Date().toISOString()
      })
      
      matcher = await matchKeyword(
        webhook_payload.entry[0].changes[0].value.text
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

        console.log('Found automation:', {
          id: automation.id,
          type: automation.listener?.type,
          subscription: automation.User?.subscription?.plan,
          active: automation.active
        })

        if (automation?.trigger && automation.listener) {
          const commentId = webhook_payload.entry[0].changes[0].value.id
          const token = automation.User?.integrations[0].token
          // Check if reply messages are configured
          const hasReplyMessages = automation.trigger.some(trigger => 
            trigger.type === 'post-comments' && trigger.replyMessages && trigger.replyMessages.length > 0
          )

          // Handle message action for comments
          if (automation.listener.type === ACTION_TYPE.MESSAGE) {
            console.log(
              'COMMENT VERSION:',
              webhook_payload.entry[0].changes[0].value.from.id
            )

            // First, try to send a direct message
            const commentId = webhook_payload.entry[0].changes[0].value.id
            const dmMessage = automation.listener.message || 'Thank you for your comment!'
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
                token
              )

              if (direct_message.status === 200) {
                  console.log('DM sent successfully')
                  dmSent = true
                await trackResponses(automation.id, 'DM')

                  // DM was successful, now check if we should reply to the comment
                  if (hasReplyMessages) {
                    console.log('DM sent successfully, now sending comment reply')
                    // Get a random reply message from the array if available
                    const replyMessages = automation.trigger[0]?.replyMessages?.[0]?.message?.split('|').map((msg: string) => msg.trim()).filter(Boolean) || []
                    const replyMessage = replyMessages.length > 0
                      ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                      : 'Check your DMs for more information!'
                    
                    // Reply to the comment with the randomly selected message
                    const commentReply = await replyToComment(
                commentId,
                replyMessage,
                token
              )

                    if (commentReply.status === 200) {
                      console.log('Comment reply sent successfully after DM')
                await trackResponses(automation.id, 'COMMENT')
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
                      return NextResponse.json(
                        {
                          message: 'DM sent successfully but comment reply failed',
                        },
                        { status: 200 }
                      )
                    }
                  } else {
                    // No reply messages configured, just return success for DM
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
                console.log('DM failed but attempting comment reply as fallback')
                // Get a random reply message from the array if available
                const replyMessages = automation.trigger[0]?.replyMessages?.[0]?.message?.split('|').map((msg: string) => msg.trim()).filter(Boolean) || []
                const replyMessage = replyMessages.length > 0
                  ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                  : 'Check your DMs for more information!'
                
                // Reply to the comment with the randomly selected message
                const commentReply = await replyToComment(
                  commentId,
                  replyMessage,
                  token
                )

                if (commentReply.status === 200) {
                  console.log('Comment reply sent successfully as fallback after DM failure')
                  await trackResponses(automation.id, 'COMMENT')
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
        
        console.log('Found automation:', {
          id: automation.id,
          type: automation.listener?.type,
          subscription: automation.User?.subscription?.plan,
          active: automation.active
        })

        if (automation?.trigger && automation.listener) {
          // Handle message action
          if (automation.listener.type === ACTION_TYPE.MESSAGE) {
            console.log('Processing MESSAGE listener')
            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              automation.listener.message || '',
              automation.User?.integrations[0].token!
            )

            if (direct_message.status === 200) {
              console.log('MESSAGE: DM sent successfully')
              const tracked = await trackResponses(automation.id, 'DM')
              if (tracked) {
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
            automation.listener.type === ACTION_TYPE.OMNIAI &&
            automation.User?.subscription?.plan === 'PRO'
          ) {
            console.log('Starting Omni AI processing')
            try {
              const omni_ai_message = await mistralAI.chat.complete({
                model: 'mistral-large-latest',
                messages: [
                  {
                    role: 'system',
                    content: automation.listener.prompt || 'You are a helpful assistant'
                  },
                  {
                    role: 'user',
                    content: webhook_payload.entry[0]?.messaging?.[0]?.message?.text || ''
                  }
                ],
              })
              
              console.log('Omni AI response received:', omni_ai_message.choices[0].message.content)

              if (
                omni_ai_message.choices[0]?.message?.content && 
                webhook_payload.entry[0]?.messaging?.[0]?.message?.text &&
                webhook_payload.entry[0]?.messaging?.[0]?.sender?.id &&
                automation.User?.integrations?.[0]?.token
              ) {
                const senderId = webhook_payload.entry[0].messaging[0].sender.id
                const messageText = webhook_payload.entry[0].messaging[0].message.text
                const entryId = webhook_payload.entry[0].id
                const aiResponse = omni_ai_message.choices[0].message.content
                const token = automation.User.integrations[0].token as string

                console.log('Creating chat history')
                await client.$transaction(async (tx) => {
                  await createChatHistory(
                    automation.id,
                    entryId,
                    senderId,
                    messageText
                  )

                  await createChatHistory(
                    automation.id,
                    entryId,
                    senderId,
                    aiResponse
                  )
                })
                console.log('Chat history created')

                console.log('Sending DM with Omni AI response')
                const direct_message = await sendDM(
                  entryId,
                  senderId,
                  aiResponse,
                  token
                )

                if (direct_message.status === 200) {
                  console.log('DM sent successfully')
                  const tracked = await trackResponses(automation.id, 'DM')
                  if (tracked) {
                    return NextResponse.json(
                      {
                        message: 'Message sent',
                      },
                      { status: 200 }
                    )
                  }
                }
              }
            } catch (error) {
              console.error('Error in Omni AI processing:', error)
              return NextResponse.json(
                {
                  message: 'Error processing Omni AI request',
                  error: error instanceof Error ? error.message : 'Unknown error'
                },
                { status: 500 }
              )
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

        console.log('Found automation:', {
          id: automation.id,
          type: automation.listener?.type,
          subscription: automation.User?.subscription?.plan,
          active: automation.active
        })

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

          if (automations_post) {
            // Handle message action for comments
            if (automation.listener.type === ACTION_TYPE.MESSAGE) {
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
              const dmMessage = automation.listener.message || 'Thank you for your comment!'
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
                    token
                  )

              if (direct_message.status === 200) {
                    console.log('DM sent successfully')
                    dmSent = true
                    await trackResponses(automation.id, 'DM')
                    
                    // DM was successful, now check if we should reply to the comment
                    if (hasReplyMessages) {
                      console.log('DM sent successfully, now sending comment reply')
                      // Get a random reply message from the array if available
                      const replyMessages = automation.trigger[0]?.replyMessages?.[0]?.message?.split('|').map((msg: string) => msg.trim()).filter(Boolean) || []
                      const replyMessage = replyMessages.length > 0
                        ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                        : 'Check your DMs for more information!'
                      
                      // Reply to the comment with the randomly selected message
                      const commentReply = await replyToComment(
                        commentId,
                        replyMessage,
                        token
                      )

                      if (commentReply.status === 200) {
                        console.log('Comment reply sent successfully after DM')
                        await trackResponses(automation.id, 'COMMENT')
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
                        return NextResponse.json(
                          {
                            message: 'DM sent successfully but comment reply failed',
                          },
                          { status: 200 }
                        )
                      }
                    } else {
                      // No reply messages configured, just return success for DM
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
                  console.log('DM failed but attempting comment reply as fallback')
                  // Get a random reply message from the array if available
                  const replyMessages = automation.trigger[0]?.replyMessages?.[0]?.message?.split('|').map((msg: string) => msg.trim()).filter(Boolean) || []
                  const replyMessage = replyMessages.length > 0
                    ? replyMessages[Math.floor(Math.random() * replyMessages.length)]
                    : 'Check your DMs for more information!'
                  
                  // Reply to the comment with the randomly selected message
                  const commentReply = await replyToComment(
                    commentId,
                    replyMessage,
                    token
                  )

                  if (commentReply.status === 200) {
                    console.log('Comment reply sent successfully as fallback after DM failure')
                    await trackResponses(automation.id, 'COMMENT')
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
                  return NextResponse.json(
                    {
                      message: 'DM failed and no reply message configured',
                      dmError
                    },
                    { status: 200 }
                  )
                }
              } else {
                console.error('No token available for sending messages')
                return NextResponse.json(
                  {
                    message: 'No token available for sending messages',
                  },
                  { status: 200 }
                )
              }
            }

            // Handle AI action for comments
            if (
              automation.listener.type === ACTION_TYPE.OMNIAI &&
              automation.User?.subscription?.plan === 'PRO'
            ) {
              const omni_ai_message = await mistralAI.chat.complete({
                model: 'mistral-large-latest',
                messages: [
                  {
                    role: 'assistant',
                    content: `${automation.listener.prompt || ''}: keep responses under 2 sentences`,
                  },
                ],
              })

              if (
                omni_ai_message.choices[0]?.message?.content && 
                webhook_payload.entry[0]?.changes?.[0]?.value?.text &&
                webhook_payload.entry[0]?.changes?.[0]?.value?.from?.id &&
                automation.User?.integrations?.[0]?.token
              ) {
                const fromId = webhook_payload.entry[0].changes[0].value.from.id
                const commentId = webhook_payload.entry[0].changes[0].value.id
                const commentText = webhook_payload.entry[0].changes[0].value.text
                const entryId = webhook_payload.entry[0].id
                const aiResponse = omni_ai_message.choices[0].message.content
                const token = automation.User.integrations[0].token as string

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
                })

                const direct_message = await sendPrivateMessage(
                  entryId,
                  commentId,
                  aiResponse,
                  token
                )

                if (direct_message.status === 200) {
                  const tracked = await trackResponses(automation.id, 'COMMENT')

                  if (tracked) {
                    return NextResponse.json(
                      {
                        message: 'Message sent',
                      },
                      { status: 200 }
                    )
                }
              }
            }
          }
        }
      }
    }

    // Handle continued conversations
    if (!matcher && webhook_payload.entry[0].messaging) {
      const customer_history = await getChatHistory(
        webhook_payload.entry[0].messaging[0].recipient.id,
        webhook_payload.entry[0].messaging[0].sender.id
      )

      if (customer_history.history.length > 0 && customer_history.automationId) {
        const automation = await findAutomation(customer_history.automationId)

        if (
          automation?.User?.subscription?.plan === 'PRO' &&
          automation.listener?.type === ACTION_TYPE.OMNIAI
        ) {
          const omni_ai_message = await mistralAI.chat.complete({
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'assistant',
                content: `${automation.listener.prompt || ''}: keep responses under 2 sentences`,
              },
              ...customer_history.history,
              {
                role: 'user',
                content: webhook_payload.entry[0]?.messaging?.[0]?.message?.text || ''
              },
            ],
          })

          if (
            omni_ai_message.choices[0]?.message?.content && 
            webhook_payload.entry[0]?.messaging?.[0]?.message?.text &&
            webhook_payload.entry[0]?.messaging?.[0]?.sender?.id &&
            automation.User?.integrations?.[0]?.token
          ) {
            const senderId = webhook_payload.entry[0].messaging[0].sender.id
            const messageText = webhook_payload.entry[0].messaging[0].message.text
            const entryId = webhook_payload.entry[0].id
            const aiResponse = omni_ai_message.choices[0].message.content
            const token = automation.User.integrations[0].token as string

            console.log('Creating chat history')
            await client.$transaction(async (tx) => {
              await createChatHistory(
                automation.id,
                entryId,
                senderId,
                messageText
              )

              await createChatHistory(
                automation.id,
                entryId,
                senderId,
                aiResponse
              )
            })
            console.log('Chat history created')

            console.log('Sending DM with Omni AI response')
            const direct_message = await sendDM(
              entryId,
              senderId,
              aiResponse,
              token
            )

            if (direct_message.status === 200) {
              return NextResponse.json(
                {
                  message: 'Message sent',
                },
                { status: 200 }
              )
              }
            }
          }
        }
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
}