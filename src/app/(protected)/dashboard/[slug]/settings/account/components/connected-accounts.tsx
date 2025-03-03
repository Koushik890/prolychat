'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link2, Mail, Trash2, AlertCircle } from 'lucide-react'
import { useUser, useClerk } from '@clerk/nextjs'
import { fontFamily } from '../constants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogOverlay
} from "@/components/ui/dialog"

// Provider icons
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
    <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00"/>
    <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
    <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.23 2.31-.9 3.53-.76 1.5.16 2.63.77 3.38 1.91-3.03 1.72-2.18 5.54.42 6.58-.42 1.17-.96 2.35-2.41 4.45z" fill="#000"/>
    <path d="M12.03 7.25c-.15-2.47 2.03-4.5 4.65-4.5.15 2.1-1.98 4.34-4.65 4.5z" fill="#000"/>
  </svg>
)

interface ConnectedAccountsProps {
  integrations?: {
    provider: string
    connected: boolean
    id: string
  }[]
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ 
  integrations = []
}) => {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser()
  const clerk = useClerk()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [updatedIntegrations, setUpdatedIntegrations] = useState(integrations)
  const [connectedAccounts, setConnectedAccounts] = useState<{[key: string]: string | null}>({})
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [providerToRemove, setProviderToRemove] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [activeConnectingProvider, setActiveConnectingProvider] = useState<string | null>(null)
  
  // Direct mapping to Clerk's exact provider IDs for OAuth strategies
  const PROVIDER_IDS = {
    GOOGLE: ['oauth_google', 'google', 'oauth-google'],
    APPLE: ['oauth_apple', 'apple', 'oauth-apple']
  }
  
  // Use this for the OAuth flow initiation
  const providerToStrategy: Record<string, string> = {
    'Google': 'oauth_google',
    'Apple': 'oauth_apple'
  }
  
  // Comprehensive check for whether an account is from a specific provider
  const isAccountFromProvider = (account: any, providerTypeArray: string[]): boolean => {
    if (!account) return false;
    
    // Check all possible provider fields
    const checks = [
      // Direct provider match
      providerTypeArray.some(p => account.provider === p),
      
      // Provider in verification
      account.verification && providerTypeArray.some(p => 
        account.verification.strategy === p || 
        account.verification.strategy?.includes(p)
      ),
      
      // Email domain match for Google - use with caution!
      providerTypeArray.includes('oauth_google') && 
      account.emailAddress && 
      (account.emailAddress.endsWith('@gmail.com') || account.emailAddress.endsWith('.googlemail.com')) &&
      // Only use domain match if we also have strategy info
      account.verification?.strategy?.includes('google'),
      
      // OAuth type match
      account.type && providerTypeArray.some(p => account.type.includes(p)),
      
      // Identity provider info
      account.identificationId && providerTypeArray.some(p => account.identificationId.includes(p.replace('oauth_', ''))),
      
      // OAuthProvider field match
      account.OAuthProvider && providerTypeArray.some(p => account.OAuthProvider.includes(p.replace('oauth_', ''))),
    ];
    
    return checks.some(check => check === true);
  };
  
  // Get the email address for a connected provider
  const getConnectedAccountEmail = (providerName: string): string | null => {
    if (!user || !isUserLoaded || !isSignedIn) return null;
    
    try {
      // Check provider-specific logic
      if (providerName === 'Google') {
        // First check external accounts with Google provider
        // Only use VERIFIED external accounts to prevent showing stale data
        const googleAccount = user.externalAccounts.find(account => 
          isAccountFromProvider(account, PROVIDER_IDS.GOOGLE) && 
          account.verification?.status === 'verified'
        );
        
        if (googleAccount?.emailAddress) {
          return googleAccount.emailAddress;
        }
        
        // Avoid using email address domain matching for Google in this function
        // This prevents wrong emails from showing during reconnection
      } else if (providerName === 'Apple') {
        // Similar logic for Apple accounts
        const appleAccount = user.externalAccounts.find(account => 
          isAccountFromProvider(account, PROVIDER_IDS.APPLE) &&
          account.verification?.status === 'verified'
        );
        
        if (appleAccount?.emailAddress) {
          return appleAccount.emailAddress;
        }
        
        // Check email addresses with Apple OAuth
        const appleEmail = user.emailAddresses.find(email => 
          email.verification?.strategy?.includes('apple') && 
          email.verification?.status === 'verified' &&
          (email.linkedTo && email.linkedTo.some((link: any) => link.type.includes('apple')))
        );
        
        if (appleEmail?.emailAddress) {
          return appleEmail.emailAddress;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting email for ${providerName}:`, error);
      return null;
    }
  };
  
  // Comprehensive check if a provider is connected
  const isProviderConnected = (providerName: string): boolean => {
    if (!user || !isUserLoaded || !isSignedIn) {
      console.warn('User not available for provider check');
      return false;
    }
    
    // Special case: If provider is actively being connected via OAuth flow
    // Don't show as connected until the OAuth flow completes successfully
    if (activeConnectingProvider === providerName) {
      console.log(`${providerName} is in OAuth flow but not completed yet`);
      return false;
    }
    
    try {
      const providerSlug = providerName.toLowerCase();
      const providerIds = providerName === 'Google' 
        ? PROVIDER_IDS.GOOGLE 
        : providerName === 'Apple' 
          ? PROVIDER_IDS.APPLE 
          : [];
      
      console.log(`Checking if ${providerName} is connected`);
      
      // Check direct external accounts - ONLY verified ones
      if (user.externalAccounts && user.externalAccounts.length > 0) {
        // Find account with matching provider and verified status
        const directMatch = user.externalAccounts.some(account => 
          isAccountFromProvider(account, providerIds) && 
          account.verification?.status === 'verified'
        );
        
        if (directMatch) {
          console.log(`${providerName} is connected via direct verified match`);
          return true;
        }
        
        // For Google, avoid using email domain as connection indicator
        // Only consider Google connected if there's an actual verified external account
      }
      
      console.log(`${providerName} is not connected`);
      return false;
    } catch (error) {
      console.error('Error checking provider connection status:', error);
      return false;
    }
  };
  
  // Direct update from Clerk's user object
  const updateIntegrationsStatus = () => {
    if (!user || !isUserLoaded || !isSignedIn) {
      console.warn('User not available for updating integrations status');
      return;
    }
    
    try {
      console.log('Updating integrations status with current user data');
      console.log('External accounts:', user.externalAccounts);
      
      // First, update which providers are connected
      const updated = integrations.map(integration => ({
        ...integration,
        connected: isProviderConnected(integration.provider)
      }));
      
      // Then, collect email addresses for connected providers
      const providerEmails: {[key: string]: string | null} = {};
      
      updated.forEach(integration => {
        if (integration.connected) {
          providerEmails[integration.provider] = getConnectedAccountEmail(integration.provider);
        }
      });
      
      console.log('Updated integrations with connection status:', updated);
      console.log('Connected account emails:', providerEmails);
      
      setUpdatedIntegrations(updated);
      setConnectedAccounts(providerEmails);
    } catch (error) {
      console.error('Error updating integrations status:', error);
    }
  };
  
  // Update status when user data changes
  useEffect(() => {
    if (isUserLoaded && isSignedIn && user) {
      console.log('User loaded, updating integration status');
      updateIntegrationsStatus();
    }
  }, [user, isUserLoaded, isSignedIn]);
  
  // Forced refresh when the page parameters change (like after redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params.entries()) {
      console.log(`URL Parameter: ${key}=${value}`);
    }
    
    if (params.has('__clerk_status') || params.has('createdSessionId')) {
      console.log('OAuth return detected in URL parameters');
      // Reset active connecting provider if OAuth flow is completed
      setActiveConnectingProvider(null);
    }
  }, []);
  
  // Check for canceled OAuth flows when URL parameters change
  useEffect(() => {
    const checkForCanceledFlow = () => {
      // If we had an active provider connection and URL parameters don't have success indicators
      if (activeConnectingProvider) {
        const params = new URLSearchParams(window.location.search);
        const hasOAuthSuccess = params.has('__clerk_status') || 
                               params.has('createdSessionId') || 
                               params.has('refresh');
        
        // If we navigated back without OAuth completion
        if (!hasOAuthSuccess) {
          console.log('OAuth flow appears to be canceled for', activeConnectingProvider);
          // Reset the activeConnectingProvider state
          setActiveConnectingProvider(null);
        }
      }
    };
    
    // Check on mount and whenever URL changes
    window.addEventListener('popstate', checkForCanceledFlow);
    checkForCanceledFlow();
    
    return () => {
      window.removeEventListener('popstate', checkForCanceledFlow);
    };
  }, [activeConnectingProvider]);
  
  // Log page load for debugging
  useEffect(() => {
    // Add a page-level debug handler for clerk errors
    const handleClerkError = (event: ErrorEvent) => {
      if (event.error && event.error.toString().includes('Clerk')) {
        console.error('Clerk error detected:', event.error);
      }
    };
    
    window.addEventListener('error', handleClerkError);
    
    return () => {
      window.removeEventListener('error', handleClerkError);
    };
  }, []);
  
  const handleConnectProvider = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      
      // Get the OAuth strategy for this provider
      const strategy = providerToStrategy[provider];
      
      if (!strategy) {
        console.error(`No OAuth strategy found for provider: ${provider}`);
        setLoadingProvider(null);
        return;
      }
      
      // Store the current path to return to after authentication
      localStorage.setItem('accountSettingsReturnPath', window.location.pathname);
      
      console.log(`Initiating OAuth flow for ${provider} using strategy ${strategy}`);
      
      // Set the active connecting provider to prevent showing stale data during OAuth flow
      setActiveConnectingProvider(provider);
      
      // Create an OAuth external account to initiate the connection flow
      const externalAccount = await user?.createExternalAccount({
        strategy: strategy as any,
        redirectUrl: `/sso-callback`,
      });
      
      console.log('External account creation response:', externalAccount);
      
      // Redirect the user to the external provider's auth page
      if (externalAccount?.verification?.externalVerificationRedirectURL) {
        const redirectUrl = externalAccount.verification.externalVerificationRedirectURL.toString();
        console.log('Redirecting to OAuth provider URL:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        console.error('Failed to get redirect URL for external account verification');
        setLoadingProvider(null);
        setActiveConnectingProvider(null); // Reset on failure
      }
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      setLoadingProvider(null);
      setActiveConnectingProvider(null); // Reset on failure
    }
  };
  
  // For already connected accounts, still use the Clerk profile to manage
  const handleManageConnectedAccount = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      
      // Store the current path to return to after authentication
      localStorage.setItem('accountSettingsReturnPath', window.location.pathname);
      
      // Open Clerk's user profile directly on the connections tab
      clerk.openUserProfile({
        // @ts-ignore - Using initialPage as per Clerk documentation
        initialPage: 'account-connections'
      });
      
      setLoadingProvider(null);
    } catch (error) {
      console.error(`Error managing ${provider} connection:`, error);
      setLoadingProvider(null);
    }
  };
  
  // Handle all connections management through Clerk UI
  const handleManageAllConnections = async () => {
    try {
      setLoadingProvider('all');
      
      // Store the current path to return to after authentication
      localStorage.setItem('accountSettingsReturnPath', window.location.pathname);
      
      // Open Clerk's user profile directly on the connections tab
      clerk.openUserProfile({
        // @ts-ignore - Using initialPage as per Clerk documentation
        initialPage: 'account-connections'
      });
      
      setLoadingProvider(null);
    } catch (error) {
      console.error("Error opening connections management:", error);
      setLoadingProvider(null);
    }
  };
  
  // Handle removal of a connected account
  const handleRemoveConnectedAccount = async (provider: string) => {
    // Open the confirmation dialog
    setProviderToRemove(provider);
    setShowRemoveDialog(true);
  };
  
  // Execute the actual removal after confirmation
  const confirmRemoveConnectedAccount = async () => {
    if (!providerToRemove || !user) return;
    
    try {
      setIsRemoving(true);
      console.log(`Removing ${providerToRemove} connection`);
      
      // Find the external account to remove
      const providerId = providerToRemove === 'Google' ? PROVIDER_IDS.GOOGLE : PROVIDER_IDS.APPLE;
      const externalAccount = user.externalAccounts.find(account => 
        isAccountFromProvider(account, providerId)
      );
      
      if (!externalAccount) {
        console.error(`No external account found for ${providerToRemove}`);
        throw new Error(`No external account found for ${providerToRemove}`);
      }
      
      console.log(`Found external account to remove:`, externalAccount);
      console.log(`Account ID: ${externalAccount.id}`);
      
      // Set a timeout in case the API call takes too long
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      // Make a direct API call to delete the external account
      try {
        console.log(`Calling API to delete account: /api/clerk/external-accounts/${externalAccount.id}`);
        
        // Use Promise.race to handle timeout
        const response = await Promise.race([
          fetch(`/api/clerk/external-accounts/${externalAccount.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          timeoutPromise
        ]) as Response;
        
        console.log(`API response status: ${response.status}`);
        
        const responseData = await response.json().catch(e => {
          console.error('Error parsing API response:', e);
          return { error: 'Failed to parse API response' };
        });
        
        console.log('API response data:', responseData);
        
        if (!response.ok) {
          // Show error in console but don't throw - we'll handle it gracefully
          console.error(`API error: ${responseData.error || response.statusText}`);
          
          // Try to reload user data anyway in case the operation succeeded despite error
          await user.reload();
          updateIntegrationsStatus();
          
          // Check if the account was actually removed (this handles cases where backend succeeded but returned error)
          const stillExists = user.externalAccounts.some(account => 
            account.id === externalAccount.id
          );
          
          if (stillExists) {
            throw new Error(responseData.error || 'Failed to remove account');
          } else {
            console.log('Account appears to be removed despite API error, continuing');
          }
        }
        
        console.log(`Successfully removed ${providerToRemove} connection`);
        
        // Reload user data to update the UI
        await user.reload();
        updateIntegrationsStatus();
        
        // Close dialog and reset state
        setShowRemoveDialog(false);
        setProviderToRemove(null);
        
      } catch (apiError: any) {
        console.error(`API error removing external account:`, apiError);
        
        // Create a more user-friendly error message
        const errorMessage = apiError.message && !apiError.message.includes('Failed to fetch') 
          ? apiError.message 
          : 'Connection could not be removed. Please try again or use account settings.';
        
        // Show error message in a toast or notice rather than an alert
        // Since we don't have toast imported, we'll create a temporary error display
        console.error(`Error removing account: ${errorMessage}`);
        
        // Fallback to Clerk portal if API removal fails
        console.log(`Falling back to Clerk portal for account removal`);
        
        // Store the current path to return to after authentication
        localStorage.setItem('accountSettingsReturnPath', window.location.pathname);
        
        // Open Clerk's user profile directly on the connections tab
        clerk.openUserProfile({
          // @ts-ignore - Using initialPage as per Clerk documentation
          initialPage: 'account-connections'
        });
        
        // Close dialog since we're redirecting
        setShowRemoveDialog(false);
        setProviderToRemove(null);
      }
      
    } catch (error: any) {
      console.error(`Error removing ${providerToRemove} connection:`, error);
      
      // Create a more user-friendly error message
      const errorMessage = error.message || 'An error occurred while removing the connection';
      console.error(`Error: ${errorMessage}`);
      
      setShowRemoveDialog(false);
      setProviderToRemove(null);
    } finally {
      // Reset loading state
      setIsRemoving(false);
    }
  };
  
  // Cancel removal
  const cancelRemoveConnectedAccount = () => {
    setShowRemoveDialog(false);
    setProviderToRemove(null);
  };
  
  return (
    <section className="font-sans mt-10">
      <h2 
        className="text-xl font-semibold text-gray-900 mb-1 font-sans tracking-tight"
        style={{ fontFamily }}
      >Connected Accounts</h2>
      <p className="text-gray-600 mb-3 font-sans text-base leading-relaxed" style={{ fontSize: '16px' }}>
        Connect your social accounts to share content across platforms.
      </p>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="space-y-5">
        {updatedIntegrations.map((integration, index) => (
          <div 
            key={integration.id} 
            className={`flex items-center justify-between ${
              index !== updatedIntegrations.length - 1 ? 'pb-5 border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg flex items-center justify-center ${
                integration.connected ? 'bg-indigo-50' : 'bg-gray-50'
              }`}>
                {integration.provider === 'Google' ? (
                  <GoogleIcon />
                ) : integration.provider === 'Apple' ? (
                  <AppleIcon />
                ) : (
                  <Link2 className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 font-sans tracking-tight">{integration.provider}</h3>
                {integration.connected ? (
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                    {connectedAccounts[integration.provider] && (
                      <div className="flex items-center ml-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {connectedAccounts[integration.provider]}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1 font-sans leading-relaxed">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      Not linked
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 bg-white font-medium transition-colors rounded-lg font-sans flex items-center ${
                integration.connected 
                  ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300' 
                  : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300'
              }`}
              onClick={() => 
                integration.connected 
                  ? handleRemoveConnectedAccount(integration.provider)
                  : handleConnectProvider(integration.provider)
              }
              disabled={loadingProvider !== null || isRemoving}
            >
              {integration.connected ? (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>
                    {loadingProvider === integration.provider 
                      ? 'Loading...' 
                      : isRemoving && providerToRemove === integration.provider
                        ? 'Removing...'
                        : 'Remove'}
                  </span>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  <span>
                    {loadingProvider === integration.provider 
                      ? 'Loading...' 
                      : 'Connect'}
                  </span>
                </>
              )}
            </Button>
          </div>
        ))}
        </div>
        
        <div className="pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-white border-gray-200 text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-colors rounded-lg font-sans flex items-center"
            onClick={handleManageAllConnections}
            disabled={loadingProvider !== null}
          >
            <Link2 className="h-4 w-4" />
            {loadingProvider === 'all' ? 'Loading...' : 'Manage Connections'}
          </Button>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent 
          className="
            sm:max-w-md w-[95vw] 
            fixed left-[50%] top-[50%] z-[9999] 
            translate-x-[-50%] translate-y-[-50%] 
            bg-white
            border-0 
            shadow-[0_0_25px_rgba(0,0,0,0.1)]
            rounded-xl 
            overflow-visible
            p-0
            font-sans
          "
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl"></div>
          
          <div className="p-6 pt-5">
            <DialogHeader className="text-left mb-3">
              <h2 
                className="text-xl font-semibold text-gray-900" 
                style={{ 
                  fontFamily: 'var(--font-inter), sans-serif !important',
                  fontWeight: 600
                }}
              >
                Remove connected account
              </h2>
              <DialogDescription className="text-gray-500 mt-2 text-sm">
                {providerToRemove} will be removed from this account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-2">
              <p className="text-sm text-gray-600 mb-4">
                You will no longer be able to use this connected account and any dependent features will no longer work.
              </p>
              {providerToRemove && connectedAccounts[providerToRemove] && (
                <div className="flex items-center p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-sm mb-4">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Removing account: <strong>{connectedAccounts[providerToRemove]}</strong></span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between w-full gap-4 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelRemoveConnectedAccount}
                disabled={isRemoving}
                className="rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700 w-full h-11 transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={confirmRemoveConnectedAccount}
                disabled={isRemoving}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white w-full h-11 transition-all shadow-sm"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default ConnectedAccounts
