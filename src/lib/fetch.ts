import axios from 'axios'

export const refreshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
  )

  return refresh_token.data
}

export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log('sending message')
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

export const sendPrivateMessage = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log('Sending private message:', {
    userId,
    receiverId: recieverId,
    messageLength: prompt.length,
    hasToken: !!token
  })
  
  try {
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
  } catch (error) {
    console.error('Error sending private message:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: axios.isAxiosError(error) ? error.response?.status : 'N/A',
      statusText: axios.isAxiosError(error) ? error.response?.statusText : 'N/A',
      errorData: axios.isAxiosError(error) ? error.response?.data : 'N/A'
    })
    
    throw error;
  }
}

export const generateTokens = async (code: string) => {
  const insta_form = new FormData()
  insta_form.append('client_id', process.env.INSTAGRAM_CLIENT_ID as string)

  insta_form.append(
    'client_secret',
    process.env.INSTAGRAM_CLIENT_SECRET as string
  )
  insta_form.append('grant_type', 'authorization_code')
  insta_form.append(
    'redirect_uri',
    `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`
  )
  insta_form.append('code', code)

  const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string, {
    method: 'POST',
    body: insta_form,
  })

  const token = await shortTokenRes.json()
  if (token.permissions.length > 0) {
    console.log(token, 'got permissions')
    const long_token = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.access_token}`
    )

    return long_token.data
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

    // Use environment variable for base URL
    const baseUrl = process.env.INSTAGRAM_BASE_URL || 'https://graph.facebook.com'
    const apiVersion = 'v21.0' // Match the version used in sendDM

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