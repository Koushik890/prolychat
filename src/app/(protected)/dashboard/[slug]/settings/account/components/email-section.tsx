'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Check, Plus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { fontFamily } from '../constants'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useToast } from '@/contexts/toast-context'
import { updateUserEmail } from '@/actions/user/account'

interface EmailSectionProps {
  email: string
}

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

const verificationCodeSchema = z.object({
  code: z.string().min(6, 'Verification code must be at least 6 characters')
})

// Icons for providers
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
    <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00"/>
    <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
    <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.23 2.31-.9 3.53-.76 1.5.16 2.63.77 3.38 1.91-3.03 1.72-2.18 5.54.42 6.58-.42 1.17-.96 2.35-2.41 4.45z" fill="#000"/>
    <path d="M12.03 7.25c-.15-2.47 2.03-4.5 4.65-4.5.15 2.1-1.98 4.34-4.65 4.5z" fill="#000"/>
  </svg>
)

// Helper function to determine icon for email provider
const getEmailProviderIcon = (email: any) => {
  if (email.verification?.strategy === 'oauth_google' || 
      (email.linkedTo && email.linkedTo.some((link: any) => link.type.includes('oauth_google')))) {
    return <GoogleIcon />;
  }
  if (email.verification?.strategy === 'oauth_apple' || 
      (email.linkedTo && email.linkedTo.some((link: any) => link.type.includes('oauth_apple')))) {
    return <AppleIcon />;
  }
  return null;
};

const EmailSection: React.FC<EmailSectionProps> = ({ email: initialEmail }) => {
  const { user, isLoaded } = useUser()
  const { showToast, hideToast } = useToast()
  const [currentEmail, setCurrentEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingEmailId, setPendingEmailId] = useState<string>('')
  const [allEmails, setAllEmails] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh all user emails on mount and when connections change
  useEffect(() => {
    if (isLoaded && user) {
      // Sort emails: primary first, then verified, then unverified
      const emails = [...user.emailAddresses].sort((a, b) => {
        // Primary email first
        if (a.id === user.primaryEmailAddressId) return -1;
        if (b.id === user.primaryEmailAddressId) return 1;
        
        // Then verified emails
        if (a.verification.status === 'verified' && b.verification.status !== 'verified') return -1;
        if (a.verification.status !== 'verified' && b.verification.status === 'verified') return 1;
        
        return 0;
      });
      
      setAllEmails(emails);
      
      // Update current email
      const primaryEmail = user.primaryEmailAddress?.emailAddress;
      if (primaryEmail && primaryEmail !== currentEmail) {
        setCurrentEmail(primaryEmail);
      }
    }
  }, [isLoaded, user, refreshKey]);

  // Watch for changes in the user's external accounts
  useEffect(() => {
    const checkForExternalAccountChanges = () => {
      if (user) {
        // Reload user data to ensure we have the latest
        user.reload().then(() => {
          console.log('Refreshed user data in EmailSection');
          setRefreshKey(prev => prev + 1);
        });
      }
    };
    
    // Check initially and on interval
    checkForExternalAccountChanges();
    const interval = setInterval(checkForExternalAccountChanges, 5000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleChangeEmail = async () => {
    if (isEditing && !showVerification) {
      try {
        // Reset state
        hideToast()
        
        // Validate the email
        const validation = emailSchema.safeParse({ email: newEmail })
        if (!validation.success) {
          showToast('success', validation.error.errors[0].message)
          return
        }
        
        // Check if the new email is the same as the current one
        if (newEmail === currentEmail) {
          showToast('success', 'Please enter a different email address')
          return
        }

        setIsLoading(true)
        
        if (!user) {
          showToast('success', 'User not authenticated')
          setIsLoading(false)
          return
        }
        
        // Check if email already exists in user's email addresses
        const existingEmail = user.emailAddresses.find(
          email => email.emailAddress.toLowerCase() === newEmail.toLowerCase()
        )
        
        if (existingEmail) {
          // Always send a verification code regardless of whether the email is verified or not
          setPendingEmailId(existingEmail.id)
          
          try {
            await existingEmail.prepareVerification({
              strategy: 'email_code'
            })
            
            hideToast()
            showToast('success', 'Verification email sent. Please check your inbox and enter the verification code below.')
            setShowVerification(true)
            setIsLoading(false)
            return
          } catch (prepError) {
            console.error("Error preparing verification for existing email:", prepError)
            showToast('success', 'Failed to send verification email. Please try again.')
            setIsLoading(false)
            return
          }
        }
        
        // Create a new email address for the user
        try {
          console.log('Creating new email address:', newEmail)
          const emailAddress = await user.createEmailAddress({
            email: newEmail
          })
          
          console.log('Email address created successfully:', emailAddress)
          
          // Set pending email ID for later verification
          setPendingEmailId(emailAddress.id)
          
          // Send a verification email
          try {
            console.log('Preparing verification for email:', newEmail)
            await emailAddress.prepareVerification({
              strategy: 'email_code'
            })
            
            console.log('Verification prepared successfully')
            
            // Show verification code input
            setShowVerification(true)
            showToast('success', 'Verification email sent. Please check your inbox and enter the verification code below.')
          } catch (verificationError: any) {
            console.error("Error preparing verification:", verificationError)
            showToast('success', `Failed to send verification email: ${verificationError.message || 'Unknown error'}`)
            setIsLoading(false)
            return
          }
        } catch (createError: any) {
          console.error("Error creating email address:", createError)
          
          // Handle specific error cases
          if (createError.errors && createError.errors.length > 0) {
            const clerkError = createError.errors[0]
            if (clerkError.code === 'form_identifier_exists') {
              showToast('success', 'This email is already associated with another account.')
            } else {
              showToast('success', `Failed to add email: ${clerkError.message || clerkError.code || 'Unknown error'}`)
            }
          } else {
            showToast('success', `Failed to add email: ${createError.message || 'Unknown error'}`)
          }
          
          setIsLoading(false)
          return
        }
        
        setIsLoading(false)
      } catch (error: any) {
        console.error("Error in handleChangeEmail:", error)
        showToast('success', `Failed to update email: ${error.message || 'Please try again.'}`)
        setIsLoading(false)
      }
    } else if (isEditing && showVerification) {
      // User is already in verification mode and clicked Send Code again
      // Just reset the verification code
      setVerificationCode('')
      hideToast()
      
      try {
        if (!user || !pendingEmailId) {
          showToast('success', 'Cannot resend verification code. Please start over.')
          return
        }
        
        setIsLoading(true)
        
        // Find the email address by ID
        const emailAddress = user.emailAddresses.find(email => email.id === pendingEmailId)
        if (!emailAddress) {
          showToast('success', 'Email address not found. Please start over.')
          setIsLoading(false)
          return
        }
        
        // Resend verification
        await emailAddress.prepareVerification({
          strategy: 'email_code'
        })
        
        showToast('success', 'Verification email resent. Please check your inbox for the code.')
        setIsLoading(false)
      } catch (error: any) {
        console.error("Error resending verification:", error)
        showToast('success', `Failed to resend verification: ${error.message || 'Please try again.'}`)
        setIsLoading(false)
      }
    } else {
      // Start the edit process
      setIsEditing(true)
      setNewEmail('')
      hideToast()
      setShowVerification(false)
    }
  }

  const handleVerifyEmail = async () => {
    try {
      // Validate the verification code
      const validation = verificationCodeSchema.safeParse({ code: verificationCode })
      if (!validation.success) {
        showToast('success', validation.error.errors[0].message)
        return
      }

      setIsLoading(true)
      hideToast()

      if (!user) {
        showToast('success', 'User not authenticated')
        setIsLoading(false)
        return
      }

      if (!pendingEmailId) {
        showToast('success', 'No pending email verification found')
        setIsLoading(false)
        return
      }

      // Find the email address that needs verification
      const emailAddressToVerify = user.emailAddresses.find(
        email => email.id === pendingEmailId
      )

      if (!emailAddressToVerify) {
        showToast('success', 'Email address not found')
        setIsLoading(false)
        return
      }

      // Check if the email is already verified
      if (emailAddressToVerify.verification.status === 'verified') {
        // Email is already verified, just set it as primary
        try {
          await user.update({
            primaryEmailAddressId: pendingEmailId
          })
          
          // Update the displayed email to reflect the change
          if (emailAddressToVerify.emailAddress) {
            setCurrentEmail(emailAddressToVerify.emailAddress)
            
            // Also update the email in our database
            const dbResult = await updateUserEmail(emailAddressToVerify.emailAddress)
            if (dbResult.status === 'error') {
              console.error("Database update failed:", dbResult.message)
            }
            
            // Remove all non-primary email addresses
            await removeNonPrimaryEmails(pendingEmailId)
          }
          
          showToast('success', 'Email successfully set as primary.')
          setIsEditing(false)
          setShowVerification(false)
          setVerificationCode('')
          setPendingEmailId('')
          setIsLoading(false)
          return
        } catch (error: any) {
          console.error("Error setting primary email:", error)
          // Provide more detailed error message if available
          if (error.errors && error.errors.length > 0) {
            const clerkError = error.errors[0]
            showToast('success', `Could not set email as primary: ${clerkError.message || clerkError.code}`)
          } else {
            showToast('success', 'Could not set email as primary. Please try again later.')
          }
          setIsLoading(false)
          return
        }
      }

      // Attempt to verify the email with the correct Clerk API method
      try {
        console.log('Verifying email with code:', verificationCode)
        console.log('Email address to verify:', emailAddressToVerify)
        
        // Use the attemptVerification method on the email address object
        const result = await emailAddressToVerify.attemptVerification({
          code: verificationCode
        })
        
        console.log('Verification result:', result)

        // If verification successful, set as primary
        if (result.verification.status === 'verified') {
          try {
            // Update user details with the new primary email ID
            // This is the correct way to set the primary email address
            await user.update({
              primaryEmailAddressId: pendingEmailId
            })
            
            // Update the displayed email to reflect the change
            if (emailAddressToVerify.emailAddress) {
              setCurrentEmail(emailAddressToVerify.emailAddress)
              
              // Also update the email in our database
              const dbResult = await updateUserEmail(emailAddressToVerify.emailAddress)
              if (dbResult.status === 'error') {
                console.error("Database update failed:", dbResult.message)
              }
              
              // Remove all non-primary email addresses
              await removeNonPrimaryEmails(pendingEmailId)
            }
            
            showToast('success', 'Email successfully verified and set as primary.')
          } catch (error: any) {
            console.error("Error setting primary email:", error)
            // Provide more detailed error message if available
            if (error.errors && error.errors.length > 0) {
              const clerkError = error.errors[0]
              showToast('success', `Email verified but could not be set as primary: ${clerkError.message || clerkError.code}`)
            } else {
              showToast('success', 'Email verified but could not be set as primary. Please try again later.')
            }
          }
        }

        setIsEditing(false)
        setShowVerification(false)
        setVerificationCode('')
        setPendingEmailId('')
        setIsLoading(false)
      } catch (error: any) {
        console.error("Error verifying email:", error)
        
        // Handle specific error cases
        if (error.errors && error.errors.length > 0) {
          const clerkError = error.errors[0]
          if (clerkError.code === 'verification_expired') {
            showToast('success', 'Verification code has expired. Please request a new code.')
          } else if (clerkError.code === 'verification_failed') {
            showToast('success', 'Invalid verification code. Please check and try again.')
          } else if (clerkError.message === 'already verified') {
            // Directly try to set as primary if already verified
            try {
              await user.update({
                primaryEmailAddressId: pendingEmailId
              })
              
              if (emailAddressToVerify.emailAddress) {
                setCurrentEmail(emailAddressToVerify.emailAddress)
                
                // Also update the email in our database
                const dbResult = await updateUserEmail(emailAddressToVerify.emailAddress)
                if (dbResult.status === 'error') {
                  console.error("Database update failed:", dbResult.message)
                }
                
                // Remove all non-primary email addresses
                await removeNonPrimaryEmails(pendingEmailId)
              }
              
              showToast('success', 'Email successfully set as primary.')
              setIsEditing(false)
              setShowVerification(false)
              setVerificationCode('')
              setPendingEmailId('')
            } catch (updateError: any) {
              console.error("Error setting primary email:", updateError)
              showToast('success', 'Email is verified but could not be set as primary. Please try again.')
            }
          } else {
            showToast('success', `Verification failed: ${clerkError.message || clerkError.code}`)
          }
        } else {
          showToast('success', `Failed to verify email: ${error.message || 'Please check the code and try again.'}`)
        }
        
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error in handleVerifyEmail:", error)
      showToast('success', `Verification failed: ${error.message || 'Please try again.'}`)
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setShowVerification(false)
    setNewEmail('')
    setVerificationCode('')
    setPendingEmailId('')
    hideToast()
  }

  const removeNonPrimaryEmails = async (primaryEmailId: string) => {
    try {
      if (!user) return
      
      // Get all email addresses except the primary one
      const emailsToRemove = user.emailAddresses.filter(email => email.id !== primaryEmailId)
      
      // Delete each non-primary email
      for (const email of emailsToRemove) {
        try {
          await email.destroy()
          console.log(`Removed email: ${email.emailAddress}`)
        } catch (error) {
          console.error(`Failed to remove email ${email.emailAddress}:`, error)
        }
      }
    } catch (error) {
      console.error("Error removing non-primary emails:", error)
    }
  }

  // Function to remove a single email address
  const removeEmail = async (emailId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Find the email
      const emailToRemove = user.emailAddresses.find(
        email => email.id === emailId
      );
      
      if (!emailToRemove) {
        showToast('success', 'Email address not found');
        setIsLoading(false);
        return;
      }
      
      // Check if primary - cannot remove primary email
      if (emailId === user.primaryEmailAddressId) {
        showToast('success', 'Cannot remove primary email address');
        setIsLoading(false);
        return;
      }
      
      // Remove the email
      await emailToRemove.destroy();
      
      // Update the UI by refreshing the email list
      setRefreshKey(prev => prev + 1);
      showToast('success', 'Email address removed successfully');
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error removing email:", error);
      showToast('success', `Failed to remove email: ${error.message || 'Please try again.'}`);
      setIsLoading(false);
    }
  };

  // Function to make an email the primary email
  const makeEmailPrimary = async (emailId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Find the email
      const emailToMakePrimary = user.emailAddresses.find(
        email => email.id === emailId
      );
      
      if (!emailToMakePrimary) {
        showToast('success', 'Email address not found');
        setIsLoading(false);
        return;
      }
      
      // Check if already primary
      if (emailId === user.primaryEmailAddressId) {
        showToast('success', 'This is already your primary email');
        setIsLoading(false);
        return;
      }
      
      // Check if verified
      if (emailToMakePrimary.verification.status !== 'verified') {
        showToast('success', 'Email must be verified before setting as primary');
        setIsLoading(false);
        return;
      }
      
      // Set as primary
      await user.update({
        primaryEmailAddressId: emailId
      });
      
      // Update the UI
      setCurrentEmail(emailToMakePrimary.emailAddress);
      setRefreshKey(prev => prev + 1);
      
      // Update the email in our database
      const dbResult = await updateUserEmail(emailToMakePrimary.emailAddress);
      if (dbResult.status === 'error') {
        console.error("Database update failed:", dbResult.message);
      } else {
        showToast('success', 'Primary email updated successfully');
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error making email primary:", error);
      showToast('success', `Failed to update primary email: ${error.message || 'Please try again.'}`);
      setIsLoading(false);
    }
  };

  return (
    <section className="font-sans mt-10">
      <h2 
        className="text-xl font-semibold text-gray-900 mb-1 font-sans tracking-tight"
        style={{ fontFamily }}
      >Email address</h2>
      <p className="text-gray-600 mb-3 font-sans text-base leading-relaxed" style={{ fontSize: '16px' }}>
        Update your email and manage additional email addresses.
      </p>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="divide-y divide-gray-100">
          {/* Primary Email Section */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 font-sans tracking-tight">Primary Email</h3>
              {isEditing ? (
                <div className="mt-2">
                  {!showVerification ? (
                    <div className="space-y-2">
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email address"
                        className="w-full bg-white text-gray-900 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'white',
                          color: '#1f2937'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-sans leading-relaxed" style={{ fontSize: '16px' }}>
                        We sent a verification code to <span className="font-medium">{newEmail}</span>
                      </p>
                      <Input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter verification code"
                        className="w-full bg-white text-gray-900 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'white',
                          color: '#1f2937'
                        }}
                      />
                      <Button
                        size="sm"
                        className="mt-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-sans"
                        onClick={handleVerifyEmail}
                        disabled={isLoading}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        <span>{isLoading ? 'Verifying...' : 'Verify Code'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center mt-1">
                  {allEmails.length > 0 && allEmails[0] && (
                    <>
                      <p className="text-sm text-gray-600 font-sans leading-relaxed mr-2" style={{ fontSize: '16px' }}>
                        {allEmails[0].emailAddress}
                      </p>
                      {getEmailProviderIcon(allEmails[0]) && (
                        <span className="flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                          {getEmailProviderIcon(allEmails[0])}
                          <span className="ml-1">Connected</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg font-sans"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <span>Cancel</span>
                </Button>
              )}
              {isEditing && !showVerification ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white border-gray-200 text-indigo-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg font-sans"
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                >
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <span>{isLoading ? 'Sending...' : 'Send Code'}</span>
                </Button>
              ) : isEditing && showVerification ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white border-gray-200 text-indigo-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg font-sans"
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                >
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <span>{isLoading ? 'Sending...' : 'Resend Code'}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white border-gray-200 text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg font-sans"
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                >
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <span>Change</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Additional Emails Section */}
          {allEmails.length > 1 && (
            <div className="pt-4">
              <h3 className="font-medium text-gray-900 font-sans tracking-tight mb-2">Additional Email Addresses</h3>
              <div className="space-y-3">
                {allEmails.slice(1).map((email) => (
                  <div key={email.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600 font-sans leading-relaxed mr-2">
                        {email.emailAddress}
                        {email.verification.status !== 'verified' && (
                          <span className="ml-2 text-amber-600 text-xs">(Unverified)</span>
                        )}
                      </p>
                      {getEmailProviderIcon(email) && (
                        <span className="flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                          {getEmailProviderIcon(email)}
                          <span className="ml-1">Connected</span>
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {/* Only show options for non-primary emails that aren't connected to external accounts */}
                      {email.id !== user?.primaryEmailAddressId && !getEmailProviderIcon(email) && (
                        <>
                          {email.verification.status === 'verified' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-white border-gray-200 text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-colors rounded-lg"
                              onClick={() => makeEmailPrimary(email.id)}
                              disabled={isLoading}
                            >
                              Make Primary
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-white border-gray-200 text-red-600 font-medium hover:bg-red-50 hover:border-red-300 transition-colors rounded-lg"
                            onClick={() => removeEmail(email.id)}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add Email Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white border-gray-200 text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-colors rounded-lg font-sans"
              onClick={() => {
                setIsEditing(true);
                setNewEmail('');
                setShowVerification(false);
              }}
              disabled={isLoading || isEditing}
            >
              <Plus className="h-4 w-4" />
              <span>Add Email Address</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EmailSection
