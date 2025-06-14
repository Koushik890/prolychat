import axios, { AxiosResponse } from 'axios'
import { updateIntegration } from '@/actions/integrations/queries'

/**
 * Refreshes an Instagram access token
 * 
 * @param token The existing access token to refresh
 * @returns The refreshed token data containing access_token and expires_in properties
 */
export const refreshToken = async (token: string) => {
  try {
    console.log('Attempting to refresh Instagram token')
    const refresh_token = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
    )
    
    console.log('Token refresh successful, new expiration:', refresh_token.data.expires_in)
    return refresh_token.data
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw error
  }
}

/**
 * Updates the integration record in the database with a new token
 * 
 * @param integrationId The ID of the integration to update
 * @param newToken The new token value
 * @param expiresIn Seconds until the token expires
 */
export const updateTokenInDatabase = async (integrationId: string, newToken: string, expiresIn: number) => {
  try {
    // Calculate new expiration date
    const expireDate = new Date()
    expireDate.setSeconds(expireDate.getSeconds() + expiresIn)
    
    // Update the token in the database
    await updateIntegration(newToken, expireDate, integrationId)
    console.log('Updated token in database for integration:', integrationId)
    return true
  } catch (error) {
    console.error('Failed to update token in database:', error)
    return false
  }
}

/**
 * Splits a message into chunks of appropriate size for Instagram's message limits
 * @param message The message to split
 * @param maxLength Maximum length of each chunk
 * @returns Array of message chunks
 */
const splitIntoChunks = (message: string, maxLength: number): string[] => {
  if (message.length <= maxLength) {
    return [message];
  }

  const chunks: string[] = [];
  
  // Try to split at paragraph breaks first when possible
  const paragraphs = message.split('\n\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the limit, push the current chunk and start a new one
    if (currentChunk.length + paragraph.length + 2 > maxLength) {
      // If the current chunk is not empty, add it to chunks
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      // If the paragraph itself is too long, split it further
      if (paragraph.length > maxLength) {
        // Split at sentence boundaries
        const sentences = paragraph.split(/(?<=\.|\?|\!)\s+/);
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 1 > maxLength) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk);
              currentChunk = '';
            }
            
            // If even a single sentence is too long, split it into smaller parts
            if (sentence.length > maxLength) {
              let remainingSentence = sentence;
              while (remainingSentence.length > 0) {
                // Find a good breakpoint around maxLength
                let endPos = Math.min(maxLength, remainingSentence.length);
                
                // Try to break at a space if possible
                if (endPos < remainingSentence.length) {
                  const lastSpace = remainingSentence.lastIndexOf(' ', endPos);
                  if (lastSpace > endPos * 0.7) { // Only break at space if it's not too far back
                    endPos = lastSpace;
                  }
                }
                
                chunks.push(remainingSentence.substring(0, endPos));
                remainingSentence = remainingSentence.substring(endPos).trim();
              }
            } else {
              currentChunk = sentence;
            }
          } else {
            currentChunk = currentChunk.length > 0 
              ? currentChunk + ' ' + sentence 
              : sentence;
          }
        }
      } else {
        // This paragraph is not too long to stand alone, so start a new chunk with it
        currentChunk = paragraph;
      }
    } else {
      // Add to the current chunk with paragraph separator if needed
      currentChunk = currentChunk.length > 0 
        ? currentChunk + '\n\n' + paragraph 
        : paragraph;
    }
  }
  
  // Add the last chunk if there's anything left
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

/**
 * Strips markdown formatting from text to make it more suitable for plain text messaging platforms
 * @param text The markdown-formatted text
 * @returns Plain text without markdown formatting
 */
const stripMarkdown = (text: string): string => {
  if (!text) return '';
  
  // First, replace markdown elements with appropriate text
  let result = text
    // Remove bold/italic markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/__(.*?)__/g, '$1')     // Bold with underscore
    .replace(/_(.*?)_/g, '$1')       // Italic with underscore
    
    // Keep headers but remove the # symbols
    .replace(/#{1,6}\s+(.*?)(?:\n|$)/g, '$1\n')
    
    // Remove code blocks but keep content
    .replace(/```(?:.*?)\n([\s\S]*?)```/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    
    // Keep link text but remove URL
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    
    // Handle list items - convert to plain text with proper formatting
    .replace(/^\s*[-*+]\s+(.*?)(?:\n|$)/gm, '• $1\n')
    .replace(/^\s*(\d+)[\.)]\s+(.*?)(?:\n|$)/gm, '$1. $2\n')
    
    // Remove any remaining markdown characters
    .replace(/[\\`~^{}[\]<>]/g, '');
  
  // Now ensure proper spacing and formatting for list items
  
  // Find all numbered points in the format "1. Something" or "1) Something"
  const numberedPointRegex = /(\d+)[\.)\]]\s+(.*?)(?=\n|$)/g;
  
  // Replace numbered points to ensure they start on a new line
  result = result.replace(numberedPointRegex, (match, number, content) => {
    // Get the trimmed content
    const trimmedContent = content.trim();
    // Return the formatted numbered point
    return `\n${number}. ${trimmedContent}`;
  });
  
  // Ensure consistent line breaks for bullet points
  result = result.replace(/•\s+(.*?)(?=\n|$)/g, '\n• $1');
  
  // Fix any instances of multiple consecutive line breaks
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // Ensure the text starts without a leading newline
  result = result.replace(/^\n+/, '');
  
  // Ensure proper spacing between list items
  result = result.replace(/(\d+\.\s+.*?)(\n)(\d+\.)/g, '$1\n$3');
  result = result.replace(/(•\s+.*?)(\n)(•)/g, '$1\n$3');
  
  return result;
};

/**
 * Sends a message to an Instagram user, splitting into multiple messages if needed
 */
export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string,
  integrationId?: string,
  retryCount = 0
): Promise<AxiosResponse> => {
  console.log('sending message, length:', prompt.length)
  
  // Instagram has a 1000 character limit for messages as indicated by the error
  const MAX_MESSAGE_LENGTH = 1000
  let lastResponse: AxiosResponse | null = null;
  
  try {
    // Strip markdown formatting from the message
    prompt = stripMarkdown(prompt);
    console.log('Message after markdown stripping, length:', prompt.length)
    
    // Check if the message exceeds the character limit
    if (prompt.length > MAX_MESSAGE_LENGTH) {
      console.log(`Message exceeds ${MAX_MESSAGE_LENGTH} character limit. Splitting into chunks.`)
      
      // Split the message into chunks
      const messageChunks = splitIntoChunks(prompt, MAX_MESSAGE_LENGTH);
      console.log(`Split message into ${messageChunks.length} chunks`)
      
      // Send each chunk with a delay between messages
      for (let i = 0; i < messageChunks.length; i++) {
        const chunk = messageChunks[i];
        console.log(`Sending chunk ${i+1}/${messageChunks.length}, length: ${chunk.length} characters`)
        
        // Send the message chunk
        lastResponse = await axios.post(
          `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
          {
            recipient: {
              id: recieverId,
            },
            message: {
              text: chunk,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
        
        // Delay between chunks (3 seconds) to prevent rate limiting
        if (i < messageChunks.length - 1) {
          console.log(`Waiting 3 seconds before sending next chunk...`)
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      return lastResponse!;
    } else {
      // If the message is within limits, send it as is
      return await axios.post(
        `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
        {
          recipient: {
            id: recieverId,
          },
          message: {
            text: prompt,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
    }
  } catch (error) {
    // Check if this is an authentication error (401) and we have the integration ID
    if (
      axios.isAxiosError(error) && 
      error.response?.status === 401 && 
      integrationId && 
      retryCount < 1  // Only attempt one retry to avoid infinite loops
    ) {
      console.log('Received 401 error, attempting to refresh token')
      try {
        // Try to refresh the token
        const refreshedToken = await refreshToken(token)
        
        if (refreshedToken?.access_token) {
          // Update the token in the database
          const updated = await updateTokenInDatabase(
            integrationId,
            refreshedToken.access_token,
            refreshedToken.expires_in
          )
          
          if (updated) {
            console.log('Token refreshed, retrying sendDM with new token')
            // Retry the request with the new token
            return await sendDM(
              userId, 
              recieverId, 
              prompt, 
              refreshedToken.access_token,
              integrationId,
              retryCount + 1
            )
          }
        }
      } catch (refreshError) {
        console.error('Error during token refresh attempt:', refreshError)
      }
    }
    
    // Re-throw the original error if we couldn't handle it
    throw error
  }
}

export const sendPrivateMessage = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string,
  integrationId?: string,
  retryCount = 0
): Promise<AxiosResponse> => {
  console.log('Sending private message:', {
    userId,
    receiverId: recieverId,
    messageLength: prompt.length,
    hasToken: !!token
  })
  
  // Instagram has a 1000 character limit for messages
  const MAX_MESSAGE_LENGTH = 1000
  let lastResponse: AxiosResponse | null = null;
  
  try {
    // Strip markdown formatting from the message
    prompt = stripMarkdown(prompt);
    console.log('Private message after markdown stripping, length:', prompt.length)
    
    // Check if the message exceeds the character limit
    if (prompt.length > MAX_MESSAGE_LENGTH) {
      console.log(`Private message exceeds ${MAX_MESSAGE_LENGTH} character limit. Splitting into chunks.`)
      
      // Split the message into chunks
      const messageChunks = splitIntoChunks(prompt, MAX_MESSAGE_LENGTH);
      console.log(`Split private message into ${messageChunks.length} chunks`)
      
      // Send each chunk with a delay between messages
      for (let i = 0; i < messageChunks.length; i++) {
        const chunk = messageChunks[i];
        console.log(`Sending private message chunk ${i+1}/${messageChunks.length}, length: ${chunk.length} characters`)
        
        // Send the message chunk
        lastResponse = await axios.post(
          `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
          {
            recipient: {
              comment_id: recieverId,
            },
            message: {
              text: chunk,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
        
        // Delay between chunks (3 seconds) to prevent rate limiting
        if (i < messageChunks.length - 1) {
          console.log(`Waiting 3 seconds before sending next private message chunk...`)
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      return lastResponse!;
    } else {
      // If the message is within limits, send it as is
      return await axios.post(
        `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
        {
          recipient: {
            comment_id: recieverId,
          },
          message: {
            text: prompt,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
    }
  } catch (error) {
    // Check if this is an authentication error (401) and we have the integration ID
    if (
      axios.isAxiosError(error) && 
      error.response?.status === 401 && 
      integrationId && 
      retryCount < 1  // Only attempt one retry to avoid infinite loops
    ) {
      console.log('Received 401 error, attempting to refresh token for private message')
      try {
        // Try to refresh the token
        const refreshedToken = await refreshToken(token)
        
        if (refreshedToken?.access_token) {
          // Update the token in the database
          const updated = await updateTokenInDatabase(
            integrationId,
            refreshedToken.access_token,
            refreshedToken.expires_in
          )
          
          if (updated) {
            console.log('Token refreshed, retrying sendPrivateMessage with new token')
            // Retry the request with the new token
            return await sendPrivateMessage(
              userId, 
              recieverId, 
              prompt, 
              refreshedToken.access_token,
              integrationId,
              retryCount + 1
            )
          }
        }
      } catch (refreshError) {
        console.error('Error during token refresh attempt for private message:', refreshError)
      }
    }
    
    // Re-throw the original error if we couldn't handle it
    throw error
  }
}

export const generateTokens = async (code: string) => {
  try {
    // Validate input
    if (!code || code.trim() === '') {
      throw new Error('Authorization code is required')
    }

    // Validate environment variables
    const requiredEnvs = ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET', 'INSTAGRAM_TOKEN_URL']
    const missing = requiredEnvs.filter(key => !process.env[key])
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }

  const insta_form = new FormData()
  insta_form.append('client_id', process.env.INSTAGRAM_CLIENT_ID as string)
    insta_form.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET as string)
  insta_form.append('grant_type', 'authorization_code')
  insta_form.append(
    'redirect_uri',
    process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`
  )
  insta_form.append('code', code)

    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`
    console.log('Exchanging authorization code for short-lived token', {
      redirectUri,
      codeLength: code.length
    })

    // Exchange authorization code for short-lived token
  const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string, {
    method: 'POST',
    body: insta_form,
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!shortTokenRes.ok) {
      const errorText = await shortTokenRes.text()
      console.error('Short token exchange failed:', {
        status: shortTokenRes.status,
        statusText: shortTokenRes.statusText,
        response: errorText
      })
      throw new Error(`Token exchange failed: ${shortTokenRes.status} ${shortTokenRes.statusText}`)
    }

  const token = await shortTokenRes.json()
    console.log('Short-lived token received:', { 
      hasAccessToken: !!token.access_token,
      tokenType: token.token_type,
      expiresIn: token.expires_in 
    })
  
    // Validate short-lived token response
    if (!token || !token.access_token) {
      console.error('Invalid short token response:', token)
      throw new Error('Invalid token response: missing access_token')
    }

    // Exchange short-lived token for long-lived token
    try {
      console.log('Exchanging short-lived token for long-lived token')
      
      const long_token_response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.access_token}`,
        { 
          timeout: 15000,
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      
      const longToken = long_token_response.data
      console.log('Long-lived token received:', { 
        hasAccessToken: !!longToken.access_token,
        tokenType: longToken.token_type,
        expiresIn: longToken.expires_in 
      })

      if (!longToken.access_token) {
        throw new Error('Long-lived token exchange failed: missing access_token')
      }

      return longToken
    } catch (error) {
      console.error('Error exchanging short token for long token:', error)
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        console.error('Long token exchange API error:', { status, data })
        
        if (status === 400) {
          throw new Error('Invalid short-lived token or client configuration')
        } else if (status === 401) {
          throw new Error('Authentication failed during token exchange')
        } else if (status === 429) {
          throw new Error('Rate limit exceeded during token exchange')
        }
        
        throw new Error(`Token exchange API error: ${status} - ${data?.error?.message || error.message}`)
      }
      
      throw new Error(`Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error in generateTokens:', error)
    throw error
  }
}

export const replyToComment = async (
  commentId: string,
  message: string,
  token: string
): Promise<{ status: number; data?: any }> => {
  try {
    // Ensure we have valid inputs
    if (!commentId || !message || !token) {
      console.error('Missing required parameters:', { commentId, message, hasToken: !!token })
      return { status: 400, data: { error: 'Missing required parameters' } }
    }

    // Instagram has a 1000 character limit for comments as well
    const MAX_MESSAGE_LENGTH = 1000
    
    // Strip markdown formatting from the message
    message = stripMarkdown(message);
    console.log('Comment reply after markdown stripping, length:', message.length)
    
    // Use environment variable for base URL
    const baseUrl = process.env.INSTAGRAM_BASE_URL || 'https://graph.facebook.com'
    const apiVersion = 'v21.0' // Match the version used in sendDM

    // Check if the message exceeds the character limit
    if (message.length > MAX_MESSAGE_LENGTH) {
      console.log(`Comment reply exceeds ${MAX_MESSAGE_LENGTH} character limit. Splitting into separate comments.`)
      
      // Split the message into chunks
      const messageChunks = splitIntoChunks(message, MAX_MESSAGE_LENGTH);
      console.log(`Split comment reply into ${messageChunks.length} chunks`)
      
      let lastResponse: Response | null = null;
      let lastResponseData: any = null;
      
      // Send each chunk as a separate comment reply with a delay between
      for (let i = 0; i < messageChunks.length; i++) {
        const chunk = messageChunks[i];
        console.log(`Sending comment chunk ${i+1}/${messageChunks.length}, length: ${chunk.length} characters`)
        
        // Send the comment chunk
        lastResponse = await fetch(
          `${baseUrl}/${apiVersion}/${commentId}/replies`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              message: chunk
            }),
          }
        )
        
        lastResponseData = await lastResponse.json();
        
        if (!lastResponse.ok) {
          console.error(`Error sending comment chunk ${i+1}:`, {
            status: lastResponse.status,
            data: lastResponseData,
            commentId,
            tokenLength: token?.length
          })
          
          // Return on first error
          return { status: lastResponse.status, data: lastResponseData }
        }
        
        // Delay between chunks (3 seconds) to prevent rate limiting
        if (i < messageChunks.length - 1) {
          console.log(`Waiting 3 seconds before sending next comment chunk...`)
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      console.log('Successfully sent all comment reply chunks:', {
        commentId,
        status: lastResponse?.status,
        data: lastResponseData
      })
      
      return { status: lastResponse?.status || 200, data: lastResponseData }
    } else {
      // If the message is within limits, send it as is
      const response = await fetch(
        `${baseUrl}/${apiVersion}/${commentId}/replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: message
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Error replying to comment:', {
          status: response.status,
          data,
          commentId,
          tokenLength: token?.length
        })
        return { status: response.status, data }
      }

      console.log('Successfully replied to comment:', {
        commentId,
        status: response.status,
        data
      })

      return { status: response.status, data }
    }
  } catch (error) {
    console.error('Error in replyToComment:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      commentId,
      tokenLength: token?.length
    })
    return { 
      status: 500,
      data: { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}