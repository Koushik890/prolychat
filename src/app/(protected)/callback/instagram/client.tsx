'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { onOauthInstagram, onIntegrate } from '@/actions/integrations'
import { toast } from 'sonner'

interface InstagramCallbackClientProps {
  success: boolean
  error?: string
  redirectTo?: string
  shouldRetry?: boolean
  authorizationCode?: string
  useClientSideRecovery?: boolean
}

export default function InstagramCallbackClient({ 
  success, 
  error, 
  redirectTo, 
  shouldRetry = false,
  authorizationCode,
  useClientSideRecovery = false
}: InstagramCallbackClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser()
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveryComplete, setRecoveryComplete] = useState(false)

  useEffect(() => {
    const handleCallback = async () => {
      if (success) {
        console.log('✅ Instagram connection successful - invalidating cache')
        
        // Invalidate all user-related queries to refresh integration status
        await queryClient.invalidateQueries({ 
          queryKey: ['user-profile'],
          exact: false,
          refetchType: 'all'
        })
        
        // Also invalidate any integration-specific queries
        await queryClient.invalidateQueries({ 
          predicate: (query) => {
            const key = query.queryKey[0] as string
            return key.includes('integration') || key.includes('instagram')
          }
        })
        
        console.log('🔄 Cache invalidated - all integration data will refresh')
        
        // Show success toast
        toast.success('Instagram connected successfully!', {
          description: 'Your Instagram account has been linked to your dashboard.',
          duration: 4000,
        })
        
        // Redirect after short delay to ensure cache updates complete
        if (redirectTo) {
          setTimeout(() => {
            console.log('🚀 Redirecting to:', redirectTo)
            router.push(redirectTo)
          }, 1500)
        }
      } else if (error) {
        console.error('❌ Instagram connection failed:', error)
        
        // Show error toast
        toast.error('Instagram connection failed', {
          description: error,
          duration: 6000,
        })
      }
    }

    handleCallback()
  }, [success, error, redirectTo, router, queryClient])

  // Client-side session recovery for OAuth callback scenarios
  useEffect(() => {
    const handleSessionRecovery = async () => {
      if (!useClientSideRecovery || !authorizationCode || isRecovering || recoveryComplete) {
        return
      }

      console.log('🔄 Starting client-side session recovery for Instagram OAuth')

      // Wait for Clerk user session to be loaded and available
      if (!isUserLoaded) {
        console.log('⏳ Waiting for Clerk session to load...')
        return
      }

      if (!isSignedIn || !user) {
        console.error('❌ No signed-in user found after session recovery attempt')
        // Redirect to sign-in on the SAME domain, then return to this callback URL (preserving the code)
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '/dashboard'
        toast.message('Signing in required', {
          description: 'Redirecting to sign in to finish connecting Instagram…',
          duration: 3000,
        })
        router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`)
        return
      }

      setIsRecovering(true)

      try {
        console.log('✅ Clerk session recovered, attempting Instagram integration with code:', {
          codeLength: authorizationCode.length,
          userId: user.id,
          timestamp: new Date().toISOString()
        })

        // Now attempt the integration with the recovered session
        const response = await onIntegrate(authorizationCode)
        
        console.log('📊 Client-side integration response:', {
          status: response.status,
          hasData: !!response.data,
          error: response.error,
          timestamp: new Date().toISOString()
        })

        if (response.status === 200 && response.data) {
          const { firstname, lastname } = response.data
          console.log('✅ Instagram integration successful after session recovery:', {
            userId: response.data.id,
            username: `${firstname}${lastname}`,
            timestamp: new Date().toISOString()
          })

          // Invalidate cache and show success
          await queryClient.invalidateQueries({ 
            queryKey: ['user-profile'],
            exact: false,
            refetchType: 'all'
          })
          
          await queryClient.invalidateQueries({ 
            predicate: (query) => {
              const key = query.queryKey[0] as string
              return key.includes('integration') || key.includes('instagram')
            }
          })

          toast.success('Instagram connected successfully!', {
            description: 'Your Instagram account has been linked after session recovery.',
            duration: 4000,
          })

          setRecoveryComplete(true)

          // Redirect to dashboard
          if (firstname && lastname) {
            setTimeout(() => {
              router.push(`/dashboard/${firstname}${lastname}/integrations`)
            }, 1500)
          }
        } else {
          console.error('❌ Instagram integration failed after session recovery:', response.error)
          toast.error('Instagram connection failed', {
            description: response.error || 'Integration failed after session recovery',
            duration: 6000,
          })
        }
      } catch (error) {
        console.error('💥 Error during client-side session recovery:', error)
        toast.error('Session recovery failed', {
          description: error instanceof Error ? error.message : 'Unknown error during recovery'
        })
      } finally {
        setIsRecovering(false)
      }
    }

    handleSessionRecovery()
  }, [useClientSideRecovery, authorizationCode, isUserLoaded, isSignedIn, user, isRecovering, recoveryComplete, queryClient, router])

  const handleRetry = async () => {
    try {
      console.log('🔄 Retrying Instagram OAuth connection...')
      await onOauthInstagram('INSTAGRAM')
    } catch (error) {
      console.error('💥 Retry failed:', error)
      toast.error('Failed to retry connection', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  // Recovery state - show when attempting client-side session recovery
  if (useClientSideRecovery && !recoveryComplete) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50">
        <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-6">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isRecovering ? 'Connecting Instagram...' : 'Preparing Connection...'}
        </h3>
        
        <p className="text-sm text-gray-500 max-w-sm text-center mb-6">
          {isRecovering 
            ? 'Processing your Instagram connection after session recovery...' 
            : 'Waiting for session to be ready...'}
        </p>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">
            {isRecovering 
              ? 'Integrating Instagram account...' 
              : 'Loading session data...'}
          </span>
        </div>
      </div>
    )
  }

  // Success state
  if (success || recoveryComplete) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50">
        <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Instagram Connected Successfully!
        </h3>
        
        <p className="text-sm text-gray-500 max-w-sm text-center mb-6">
          Your Instagram account has been linked. Redirecting to your dashboard...
        </p>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Updating your dashboard...</span>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-6">
        <XCircle className="h-8 w-8 text-red-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Instagram Connection Failed
      </h3>
      
      <p className="text-sm text-gray-500 max-w-sm text-center mb-6">
        {error || 'There was a problem connecting your Instagram account.'}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {shouldRetry && (
          <Button
            onClick={handleRetry}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Back to Dashboard
        </Button>
      </div>
      
      {/* Additional help for configuration issues */}
      {error?.includes('configuration') && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
          <p className="text-sm text-yellow-800">
            <strong>Configuration Issue:</strong> Please check that your Instagram app settings in Meta Developer Console match your application's redirect URI.
          </p>
        </div>
      )}
    </div>
  )
}

