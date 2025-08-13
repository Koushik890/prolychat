import { onIntegrate } from '@/actions/integrations'
import { redirect } from 'next/navigation'
import { UserProfile } from '@/types/user'
import InstagramCallbackClient from './client'

interface PageProps {
  params: Promise<any>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function Page({ searchParams }: PageProps) {
  try {
    const resolvedParams = await searchParams
    const code = resolvedParams.code as string | undefined
    const error = resolvedParams.error as string | undefined
    const errorDescription = resolvedParams.error_description as string | undefined

    console.log('🔗 Instagram OAuth callback received:', {
      hasCode: !!code,
      codeLength: code?.length,
      hasError: !!error,
      error: error,
      errorDescription: errorDescription,
      timestamp: new Date().toISOString()
    })

    // Handle OAuth errors from Instagram
    if (error) {
      console.error('❌ Instagram OAuth error:', {
        error,
        errorDescription,
        timestamp: new Date().toISOString()
      })
      
      // Common OAuth error handling
      const errorMessages: Record<string, string> = {
        'access_denied': 'User denied access to Instagram account',
        'invalid_request': 'Invalid OAuth request configuration',
        'unauthorized_client': 'Application not authorized by Instagram',
        'unsupported_response_type': 'OAuth configuration error',
        'invalid_scope': 'Invalid permissions requested',
        'server_error': 'Instagram server error, please try again',
        'temporarily_unavailable': 'Instagram service temporarily unavailable'
      }
      
      const userFriendlyError = errorMessages[error] || `Instagram authentication failed: ${error}`
      
      return (
        <InstagramCallbackClient 
          success={false} 
          error={userFriendlyError}
          shouldRetry={error === 'server_error' || error === 'temporarily_unavailable'}
        />
      )
    }

    // Handle missing authorization code
    if (!code) {
      console.error('❌ No authorization code received from Instagram')
      return (
        <InstagramCallbackClient 
          success={false} 
          error="No authorization code received from Instagram" 
          shouldRetry={true}
        />
      )
    }

    // Clean the authorization code (remove any fragments)
    const cleanCode = code.split('#_')[0].split('#')[0]
    console.log('🔑 Processing authorization code:', {
      originalLength: code.length,
      cleanedLength: cleanCode.length,
      timestamp: new Date().toISOString()
    })

    // Attempt to integrate Instagram account
    const response = await onIntegrate(cleanCode)
    
    console.log('📊 Integration response:', {
      status: response.status,
      hasData: !!response.data,
      error: response.error,
      timestamp: new Date().toISOString()
    })

    // Handle successful integration
    if (response.status === 200 && response.data) {
      const { firstname, lastname } = response.data
      console.log('✅ Instagram integration successful:', {
        userId: response.data.id,
        username: `${firstname}${lastname}`,
        timestamp: new Date().toISOString()
      })
      
      if (firstname && lastname) {
        return (
          <InstagramCallbackClient 
            success={true} 
            redirectTo={`/dashboard/${firstname}${lastname}/integrations`}
          />
        )
      }
    }

    // Special handling for session-related auth failures during OAuth
    if (response.status === 401 && response.error === 'Unauthorized') {
      console.log('🔄 Session issue detected - using client-side session recovery approach')
      return (
        <InstagramCallbackClient 
          success={false} 
          error="Session recovery needed"
          shouldRetry={false}
          authorizationCode={cleanCode}
          useClientSideRecovery={true}
        />
      )
    }

    // Handle integration errors
    const errorMessages: Record<number, string> = {
      400: 'Invalid authorization code or expired session',
      401: 'Instagram authentication failed',
      409: 'Instagram account already connected',
      429: 'Rate limit exceeded, please try again later',
      500: 'Server error during integration'
    }

    const userFriendlyError = errorMessages[response.status] || response.error || 'Unknown integration error'
    
    console.error('❌ Integration failed:', {
      status: response.status,
      error: response.error,
      userFriendlyError,
      timestamp: new Date().toISOString()
    })

    return (
      <InstagramCallbackClient 
        success={false} 
        error={userFriendlyError}
        shouldRetry={response.status === 429 || response.status === 500}
      />
    )

  } catch (error) {
    console.error('💥 Unexpected error in Instagram callback:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return (
      <InstagramCallbackClient 
        success={false} 
        error="An unexpected error occurred during Instagram connection" 
        shouldRetry={true}
      />
    )
  }
}

export default Page