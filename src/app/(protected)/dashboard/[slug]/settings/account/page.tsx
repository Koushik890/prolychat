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
import { motion } from 'framer-motion'

// Animation variants for staggered content loading
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
}

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
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your account settings.</p>
          <div className="mt-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 font-sans ${styles.accountSettings}`}>
      <SettingsHeader 
        userSlug={userSlug}
        title="Settings"
        description=""
      />
      
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <NameForm 
                initialFirstName={userData.firstName}
                initialLastName={userData.lastName}
                onSuccess={handleFormSuccess}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <EmailSection email={userData.email} />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <PasswordSection />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ConnectedAccounts 
                integrations={[
                  // Use static provider info - the component will check connections dynamically
                  { 
                    provider: 'Google', 
                    connected: false, 
                    id: 'google' 
                  },
                  { 
                    provider: 'Apple', 
                    connected: false, 
                    id: 'apple' 
                  }
                ]}
              />
            </motion.div>
          </motion.div>
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
