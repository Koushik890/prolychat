import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * DELETE handler for removing external accounts
 * Route: /api/clerk/external-accounts/:id
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the external account ID from the URL params
    const externalAccountId = params.id;
    if (!externalAccountId) {
      return NextResponse.json(
        { error: 'External account ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete external account ${externalAccountId} for user ${userId}`);
    
    // Make direct fetch request to Clerk Backend API 
    // This is a server-side route, so we need to use the backend API format
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}/external_accounts/${externalAccountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Clerk API response status: ${response.status}`);
    
    // If the first endpoint fails, try the alternative token revocation endpoint
    if (response.status === 404) {
      console.log('External account endpoint returned 404, trying oauth tokens endpoint');
      
      // Try the OAuth tokens endpoint as an alternative
      const tokenResponse = await fetch(`https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/${externalAccountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`OAuth tokens API response status: ${tokenResponse.status}`);
      
      if (!tokenResponse.ok) {
        let errorMessage = 'Failed to revoke external account tokens';
        
        try {
          const contentType = tokenResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const text = await tokenResponse.text();
            if (text) {
              const errorData = JSON.parse(text);
              console.error('Clerk API token revocation error:', errorData);
              errorMessage = errorData.errors?.[0]?.message || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Error parsing token revocation error response:', parseError);
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: tokenResponse.status }
        );
      }
      
      return NextResponse.json(
        { success: true, message: 'External account tokens revoked successfully' },
        { status: 200 }
      );
    }
    
    if (!response.ok) {
      let errorMessage = 'Failed to remove external account';
      
      try {
        // Only attempt to parse JSON if there's content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            const errorData = JSON.parse(text);
            console.error('Clerk API error:', errorData);
            errorMessage = errorData.errors?.[0]?.message || errorMessage;
          }
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'External account removed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error removing external account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove external account' },
      { status: 500 }
    );
  }
} 