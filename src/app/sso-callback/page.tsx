'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthenticateWithRedirectCallback, useClerk, useUser } from '@clerk/clerk-react'

export default function SSOCallbackPage() {
  const router = useRouter()
  const clerk = useClerk()
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser()
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountSyncCompleted, setAccountSyncCompleted] = useState(false)

  // Handle clerk's errors if they occur
  useEffect(() => {
    // Parse URL for error information
    const params = new URLSearchParams(window.location.search)
    if (params.has('error')) {
      const errorMsg = params.get('error') || 'Unknown error occurred'
      console.error('OAuth error detected:', errorMsg)
      setError(errorMsg)
    }
    
    // Add a global error handler for clerk errors
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.toString().includes('Clerk')) {
        console.error('Clerk error detected during OAuth callback:', event.error)
        setError('Authentication error occurred. Please try again.')
      }
    }
    
    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  // Log authentication progress for debugging
  useEffect(() => {
    console.log('SSO Callback Page State:')
    console.log('- Clerk loaded:', clerk.loaded)
    console.log('- User loaded:', isUserLoaded)
    console.log('- User signed in:', isSignedIn)
    console.log('- Redirect attempted:', redirectAttempted)
    console.log('- Account sync completed:', accountSyncCompleted)
    
    // Log URL parameters for debugging
    const params = new URLSearchParams(window.location.search)
    console.log('URL parameters:')
    for (const [key, value] of params.entries()) {
      console.log(`- ${key}: ${value}`)
    }
  }, [clerk.loaded, isUserLoaded, isSignedIn, redirectAttempted, accountSyncCompleted])

  // Ensure user data is refreshed and accounts are synced before redirecting
  useEffect(() => {
    if (!isUserLoaded || !isSignedIn || !user || accountSyncCompleted || redirectAttempted) return;
    
    const syncUserData = async () => {
      try {
        console.log('Syncing user data after authentication...');
        
        // Reload the user to get fresh data including new connected accounts
        await user.reload();
        
        console.log('User data reloaded');
        console.log('External accounts:', user.externalAccounts.map(acc => ({ 
          id: acc.id, 
          provider: acc.provider,
          email: acc.emailAddress
        })));
        
        // Check if we have new emails from the authentication
        // This ensures any email from the OAuth provider is available in the UI
        const externalEmailsCount = user.emailAddresses.filter(email => 
          email.verification.strategy?.includes('oauth_')
        ).length;
        
        console.log(`User has ${externalEmailsCount} emails from OAuth providers`);
        
        setAccountSyncCompleted(true);
      } catch (error) {
        console.error('Error syncing user data:', error);
        // Continue with redirect even if sync fails
        setAccountSyncCompleted(true);
      }
    };
    
    syncUserData();
  }, [user, isUserLoaded, isSignedIn, accountSyncCompleted, redirectAttempted]);

  // After authentication completes and data is synced, redirect back to settings
  useEffect(() => {
    if (redirectAttempted || error || !accountSyncCompleted) return;

    // Function to redirect back to settings
    const redirectToSettings = () => {
      // Get the previous URL from localStorage or use a fallback
      const returnPath = localStorage.getItem('accountSettingsReturnPath') || '/dashboard';
      console.log('Redirecting to:', returnPath);
      
      // Set flag to prevent multiple redirects
      setRedirectAttempted(true);
      
      // Small delay to ensure Clerk has fully processed the authentication
      setTimeout(() => {
        // Add a refresh parameter to force the receiving page to refresh its data
        const hasParams = returnPath.includes('?');
        const redirectPath = `${returnPath}${hasParams ? '&' : '?'}refresh=true&ts=${Date.now()}`;
        router.push(redirectPath);
      }, 1500);
    };

    // Check if Clerk is available and loaded
    if (clerk.loaded) {
      console.log('Clerk is loaded, attempting redirect');
      redirectToSettings();
      return;
    }

    // Listen for Clerk to load
    const handleClerkLoaded = () => {
      console.log('Clerk loaded event detected');
      redirectToSettings();
    };

    // Set up observer to check for the Clerk loaded state
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-clerk-loaded="true"]')) {
        handleClerkLoaded();
      }
    });

    // Start observing the document body
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    // Also set a timeout as a fallback
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback timer triggered after 3 seconds');
      redirectToSettings();
    }, 3000);

    // Clean up
    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [router, clerk.loaded, redirectAttempted, error, accountSyncCompleted]);

  // If there's an error, show it to the user
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Authentication Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => {
                // Clear error and redirect to dashboard
                const returnPath = localStorage.getItem('accountSettingsReturnPath') || '/dashboard';
                router.push(returnPath);
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-gray-600">
          {accountSyncCompleted ? 'Redirecting to your account...' : 'Completing authentication...'}
        </p>

        {/* Clerk's component that handles the OAuth callback */}
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
} 