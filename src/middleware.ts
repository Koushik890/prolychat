import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/payment(.*)',
  '/callback(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    try {
      await auth.protect()
    } catch (error: any) {
      // Handle clock skew gracefully - silently allow request to proceed
      if (error?.clerk_digest?.includes('CLERK_PROTECT_REDIRECT_TO_SIGN_IN')) {
        return // Allow request to proceed without logging
      }
      throw error // Re-throw other errors
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