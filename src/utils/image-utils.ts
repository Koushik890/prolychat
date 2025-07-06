/**
 * Detects MIME type from image buffer based on file signature
 * @param buffer - Image buffer data
 * @returns MIME type string or 'image/jpeg' as fallback
 */
export const detectMimeType = (buffer: Buffer): string => {
  if (!buffer || buffer.length < 4) {
    return 'image/jpeg' // fallback
  }

  const signature = buffer.slice(0, 4)
  
  // Check for common image file signatures
  if (signature[0] === 0xFF && signature[1] === 0xD8 && signature[2] === 0xFF) {
    return 'image/jpeg'
  }
  
  if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
    return 'image/png'
  }
  
  if (signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x38) {
    return 'image/gif'
  }
  
  // Check for WebP (RIFF format)
  if (signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46) {
    // Check for WebP signature at bytes 8-11
    if (buffer.length >= 12) {
      const webpSignature = buffer.slice(8, 12)
      if (webpSignature.toString() === 'WEBP') {
        return 'image/webp'
      }
    }
  }
  
  // Check for BMP
  if (signature[0] === 0x42 && signature[1] === 0x4D) {
    return 'image/bmp'
  }
  
  // Fallback to JPEG
  return 'image/jpeg'
}

/**
 * Converts image buffer to base64 data URL with correct MIME type
 * @param buffer - Image buffer data
 * @returns Base64 data URL string
 */
export const bufferToDataUrl = (buffer: Buffer): string => {
  const mimeType = detectMimeType(buffer)
  const base64 = buffer.toString('base64')
  return `data:${mimeType};base64,${base64}`
} 