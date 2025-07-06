import { client } from '@/lib/prisma'
import { CardData, MessageData } from '@/types/automation'
import { withDatabaseRetry } from '@/lib/db-utils'

export const createOrUpdateMessage = async (
  listenerId: string,
  type: 'TEXT' | 'CARD',
  data: {
    textContent?: string
    cardData?: CardData
  }
): Promise<{ status: number; data: string | MessageData }> => {
  try {
    // First check if listener exists
    const listener = await withDatabaseRetry(() => 
      client.listener.findUnique({
        where: { id: listenerId },
        include: { messageData: true }
      })
    )

    if (!listener) {
      return { status: 404, data: 'Listener not found' }
    }

    let messageData: any = {
      type,
      updatedAt: new Date(),
    }

    if (type === 'TEXT' && data.textContent) {
      messageData = {
        ...messageData,
        textContent: data.textContent,
        // Clear card fields when switching to text
        cardTitle: null,
        cardSubtitle: null,
        cardButtonLabel: null,
        cardImage: null,
        cardImageUrl: null,
        cardButtonAction: null,
        cardLink: null,
      }
    } else if (type === 'CARD' && data.cardData) {
      const { cardData } = data
      

      
      // Convert base64 image to buffer if present
      let imageBuffer = null
      let imageUrl = null
      
      if (cardData.image) {
              if (cardData.image.startsWith('data:image/')) {
        // Convert base64 to buffer
        const base64Data = cardData.image.split(',')[1]
        
        // Validate base64 data exists and is not empty
        if (!base64Data || base64Data.trim() === '') {
          return { status: 400, data: 'Invalid base64 image data: missing or empty base64 content' }
        }
        
        try {
          imageBuffer = Buffer.from(base64Data, 'base64')
        } catch (error) {
          return { status: 400, data: 'Invalid base64 image data: failed to decode base64 content' }
        }

      } else {
          // Store as URL if it's not base64
          imageUrl = cardData.image
          
        }
      }

      messageData = {
        ...messageData,
        textContent: null, // Clear text content when switching to card
        cardTitle: cardData.title || null,
        cardSubtitle: cardData.subtitle || null,
        cardButtonLabel: cardData.buttonTitle || null,
        cardImage: imageBuffer,
        cardImageUrl: imageUrl,
        cardButtonAction: cardData.buttonAction || null,
        cardLink: cardData.link || null,
      }
      

    } else {
      return { status: 400, data: 'Invalid message data provided' }
    }

    // Upsert the message
    const result = await withDatabaseRetry(() =>
      client.message.upsert({
        where: { listenerId },
        create: {
          listenerId,
          ...messageData,
        },
        update: messageData,
      })
    )
    


    // Update listener status to configured
    await withDatabaseRetry(() =>
      client.listener.update({
        where: { id: listenerId },
        data: { 
          status: 'CONFIGURED',
          updatedAt: new Date()
        }
      })
    )

    // Transform result to match MessageData interface
    const transformedMessage: MessageData = {
      id: result.id,
      listenerId: result.listenerId,
      type: result.type as 'TEXT' | 'CARD',
      textContent: result.textContent || undefined,
      cardTitle: result.cardTitle || undefined,
      cardSubtitle: result.cardSubtitle || undefined,
      cardButtonLabel: result.cardButtonLabel || undefined,
      cardImage: result.cardImage ? (result.cardImage instanceof Buffer ? result.cardImage : Buffer.from(result.cardImage)) : undefined,
      cardImageUrl: result.cardImageUrl || undefined,
      cardButtonAction: result.cardButtonAction || undefined,
      cardLink: result.cardLink || undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }

    return { status: 200, data: transformedMessage }
  } catch (error) {
    console.error('Error creating/updating message:', error)
    return { 
      status: 500, 
      data: error instanceof Error ? error.message : 'Failed to save message' 
    }
  }
}

export const getMessage = async (listenerId: string): Promise<MessageData | null> => {
  try {
    const message = await withDatabaseRetry(() =>
      client.message.findUnique({
        where: { listenerId }
      })
    )

    if (!message) return null

    return {
      id: message.id,
      listenerId: message.listenerId,
      type: message.type as 'TEXT' | 'CARD',
      textContent: message.textContent || undefined,
      cardTitle: message.cardTitle || undefined,
      cardSubtitle: message.cardSubtitle || undefined,
      cardButtonLabel: message.cardButtonLabel || undefined,
      cardImage: message.cardImage ? (message.cardImage instanceof Buffer ? message.cardImage : Buffer.from(message.cardImage)) : undefined,
      cardImageUrl: message.cardImageUrl || undefined,
      cardButtonAction: message.cardButtonAction || undefined,
      cardLink: message.cardLink || undefined,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }
  } catch (error) {
    console.error('Error fetching message:', error)
    return null
  }
}

export const deleteMessage = async (listenerId: string): Promise<{ status: number; data: string }> => {
  try {
    await withDatabaseRetry(() =>
      client.message.delete({
        where: { listenerId }
      })
    )

    // Update listener status to unconfigured
    await withDatabaseRetry(() =>
      client.listener.update({
        where: { id: listenerId },
        data: { 
          status: 'UNCONFIGURED',
          updatedAt: new Date()
        }
      })
    )

    return { status: 200, data: 'Message deleted successfully' }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { 
      status: 500, 
      data: error instanceof Error ? error.message : 'Failed to delete message' 
    }
  }
}

export const getCardDataFromMessage = (message: MessageData): CardData | null => {
  if (message.type !== 'CARD') return null

  let imageData = message.cardImageUrl || undefined
  
  // Convert buffer/uint8array to base64 if image is stored as binary data
  if (message.cardImage) {
    let buffer: Buffer
    
    if (message.cardImage instanceof Buffer) {
      buffer = message.cardImage
    } else if (message.cardImage instanceof Uint8Array) {
      buffer = Buffer.from(message.cardImage)
    } else {
      // Handle other array-like structures
      buffer = Buffer.from(message.cardImage as any)
    }
    
    const base64 = buffer.toString('base64')
    imageData = `data:image/jpeg;base64,${base64}`
  }

  return {
    image: imageData,
    title: message.cardTitle || '',
    subtitle: message.cardSubtitle || '',
    link: message.cardLink || undefined,
    buttonAction: message.cardButtonAction as 'message' | 'ai' | 'website' | undefined,
    buttonTitle: message.cardButtonLabel || undefined,
  }
} 