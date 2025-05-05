import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Proxy endpoint to fetch Instagram images and avoid CORS issues
 * This endpoint fetches the image from Instagram's CDN and returns it with the correct headers
 * This allows us to display Instagram profile pictures in our application
 */
export async function GET(request: Request) {
  try {
    // Get the URL parameter from the request
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    // Validate URL parameter
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing image URL parameter' },
        { status: 400 }
      )
    }

    // Decode URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl)

    // Only allow Instagram domains for security
    if (!decodedUrl.includes('instagram.') && !decodedUrl.includes('cdninstagram.')) {
      return NextResponse.json(
        { error: 'Only Instagram image URLs are allowed' },
        { status: 400 }
      )
    }

    // Fetch the image
    const response = await fetch(decodedUrl, {
      headers: {
        // Some CDNs check for a reasonable user agent
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    // Check if the fetch was successful
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      )
    }

    // Get the image data as an array buffer
    const imageBuffer = await response.arrayBuffer()

    // Determine content type from the original response
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*' // Allow any origin to access this resource
      }
    })
  } catch (error) {
    console.error('Error in Instagram image proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
