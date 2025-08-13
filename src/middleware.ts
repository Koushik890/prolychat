import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/payment(.*)',
  // Callback routes need session context but not forced authentication
])

const isCallbackRoute = createRouteMatcher([
  '/callback(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  } else if (isCallbackRoute(req)) {
    // For callback routes, ensure session context is available but don't force authentication
    // This allows us to access session data if available, but won't redirect if not authenticated
    try {
      await auth()
    } catch (error) {
      // Ignore authentication errors for callback routes - they might be in the middle of OAuth flow
      console.log('OAuth callback - session context setup, authentication not required')
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}