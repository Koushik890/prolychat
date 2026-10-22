import { NextResponse } from 'next/server'
import { fetchInstagramImage, ImageProxyError } from '@/lib/instagram-image-proxy'
export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const imageUrl = new URL(request.url).searchParams.get('url')
  if (!imageUrl) return NextResponse.json({ error: 'Missing image URL parameter' }, { status: 400 })
  try {
    const image = await fetchInstagramImage(imageUrl)
    return new NextResponse(image.body, { headers: {
      'Content-Type': image.contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    } })
  } catch (error) {
    const status = error instanceof ImageProxyError ? error.status : 502
    return NextResponse.json({ error: 'Unable to proxy this image' }, { status })
  }
}
