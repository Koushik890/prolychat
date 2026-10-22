const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'])
export class ImageProxyError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}
export function parseInstagramImageUrl(value: string): URL {
  let url: URL
  try { url = new URL(value) } catch { throw new ImageProxyError('Invalid image URL', 400) }
  const allowed = ['instagram.com', 'cdninstagram.com'].some(
    domain => url.hostname === domain || url.hostname.endsWith('.' + domain))
  if (!allowed || url.protocol !== 'https:' || url.username || url.password ||
      (url.port && url.port !== '443')) {
    throw new ImageProxyError('Only HTTPS Instagram image URLs are allowed', 400)
  }
  return url
}
export async function fetchInstagramImage(value: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(parseInstagramImageUrl(value), {
    redirect: 'error', signal: AbortSignal.timeout(10000),
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  if (!response.ok || !IMAGE_TYPES.has(contentType) || !response.body) {
    await response.body?.cancel()
    throw new ImageProxyError('Upstream did not return a supported image', 502)
  }
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value: chunk } = await reader.read()
      if (done) break
      length += chunk.byteLength
      if (length > MAX_IMAGE_BYTES) throw new ImageProxyError('Image exceeds size limit', 502)
      chunks.push(chunk)
    }
  } finally { await reader.cancel() }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return { body: bytes.buffer, contentType }
}
