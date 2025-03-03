'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { fontFamily } from './constants'
import { FormState } from '@/actions/user/account'
import { useUser } from '@clerk/nextjs'
import NameForm from './components/name-form'
import EmailSection from './components/email-section'
import ConnectedAccounts from './components/connected-accounts'
import PasswordSection from './components/password-section'
import SettingsHeader from '@/components/global/settings/settings-header'
import Toast from './components/toast'
import styles from './account.module.css'

export default function AccountSettingsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const userSlug = params.slug as string
  const { user, isLoaded } = useUser()
  
  const [isLoading, setIsLoading] = useState(!isLoaded)
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    integrations: []
  })
  
  const [toastState, setToastState] = useState<FormState>({ 
    status: 'idle'
  })
  
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Check for refresh parameter in URL (coming from SSO callback)
  useEffect(() => {
    const refreshParam = searchParams.get('refresh')
    const timestamp = searchParams.get('ts')
    
    if (refreshParam === 'true' && timestamp) {
      console.log(`Detected refresh request in URL with timestamp: ${timestamp}`)
      setRefreshKey(prev => prev + 1)
    }
  }, [searchParams])
  
  // Load user data function - reusable for forced refreshes
  const loadUserData = useCallback(async () => {
    if (isLoaded && user) {
      console.log('Loading user data in account settings page')
      
      try {
        // For fresh data, reload the user first
        await user.reload()
        
        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          integrations: []
        })
        
        // Log external accounts for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('User external accounts:', user.externalAccounts.map(acc => ({
            id: acc.id,
            provider: acc.provider
          })))
          
          console.log('User email addresses:', user.emailAddresses.map(email => ({
            id: email.id,
            email: email.emailAddress,
            primary: email.id === user.primaryEmailAddressId,
            verified: email.verification.status
          })))
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading user data:', error)
        setIsLoading(false)
      }
    }
  }, [isLoaded, user])
  
  // Set user data when Clerk user is loaded or when refresh is triggered
  useEffect(() => {
    loadUserData()
  }, [loadUserData, refreshKey])
  
  // Check for user changes periodically (connected accounts might change)
  useEffect(() => {
    if (!user) return
    
    const intervalId = setInterval(() => {
      user.reload().then(() => {
        console.log('Periodic user data refresh in account page')
        loadUserData()
      })
    }, 5000)
    
    return () => clearInterval(intervalId)
  }, [user, loadUserData])
  
  const handleToastClose = () => {
    setToastState({ status: 'idle' })
  }
  
  const handleFormSuccess = (state: FormState) => {
    setToastState(state)
    
    // Update the user data if successful
    if (state.status === 'success' && user) {
      loadUserData()
    }
  }
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <SettingsHeader 
        userSlug={userSlug}
        title="Settings"
      />
      
      <div className="max-w-4xl mx-auto px-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <NameForm 
              initialFirstName={userData.firstName}
              initialLastName={userData.lastName}
              onSuccess={handleFormSuccess}
            />
            
            <EmailSection email={userData.email} />
            
            <PasswordSection />
            
            <ConnectedAccounts 
              integrations={[
                // Use static provider info - the component will check connections dynamically
                { 
                  provider: 'Google', 
                  connected: false, // Let the component check connections dynamically 
                  id: 'google' 
                },
                { 
                  provider: 'Apple', 
                  connected: false, // Let the component check connections dynamically
                  id: 'apple' 
                }
              ]}
            />
          </div>
        )}
        
        {/* Toast notification */}
        {toastState.status !== 'idle' && (
          <Toast 
            status={toastState.status} 
            message={toastState.message || ''} 
            onClose={handleToastClose}
          />
        )}
      </div>
    </div>
  )
}
