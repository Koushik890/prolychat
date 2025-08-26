import { client } from '@/lib/prisma'
import { CardData, MessageData } from '@/types/automation'
import { withDatabaseRetry } from '@/lib/db-utils'
import { bufferToDataUrl } from '@/utils/image-utils'

export const createOrUpdateMessage = async (
  listenerId: string,
  type: 'TEXT' | 'RICH',
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
        // Clear rich fields when switching to text
        richTitle: null,
        ctaLabel: null,
        ctaAction: null,
        ctaUrl: null,
        cta2Label: null,
        cta2Action: null,
        cta2Url: null,
        cta3Label: null,
        cta3Action: null,
        cta3Url: null,
      }
    } else if (type === 'RICH' && data.cardData) {
      const { cardData } = data

      messageData = {
        ...messageData,
        textContent: null, // Clear text content when switching to rich
        richTitle: cardData.title || null,
        ctaLabel: cardData.buttonTitle || null,
        ctaAction: cardData.buttonAction || null,
        ctaUrl: cardData.link || null,
        cta2Label: cardData.button2Title || null,
        cta2Action: cardData.button2Action || null,
        cta2Url: cardData.button2Link || null,
        cta3Label: cardData.button3Title || null,
        cta3Action: cardData.button3Action || null,
        cta3Url: cardData.button3Link || null,
      }
      
      // Debug: log outgoing messageData button fields
      try {
        console.debug('[createOrUpdateMessage] messageData buttons', {
          ctaLabel: messageData.ctaLabel,
          ctaUrl: messageData.ctaUrl,
          cta2Label: messageData.cta2Label,
          cta2Url: messageData.cta2Url,
          cta3Label: messageData.cta3Label,
          cta3Url: messageData.cta3Url,
        })
      } catch {}

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
    
    // Debug: log saved row button fields
    try {
      console.debug('[createOrUpdateMessage] saved row buttons', {
        ctaLabel: (result as any).ctaLabel,
        ctaUrl: (result as any).ctaUrl,
        cta2Label: (result as any).cta2Label,
        cta2Url: (result as any).cta2Url,
        cta3Label: (result as any).cta3Label,
        cta3Url: (result as any).cta3Url,
      })
    } catch {}

    

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
      type: result.type as 'TEXT' | 'RICH',
      textContent: result.textContent || undefined,
      richTitle: (result as any).richTitle || undefined,
      ctaLabel: (result as any).ctaLabel || undefined,
      ctaAction: (result as any).ctaAction || undefined,
      ctaUrl: (result as any).ctaUrl || undefined,
      cta2Label: (result as any).cta2Label || undefined,
      cta2Action: (result as any).cta2Action || undefined,
      cta2Url: (result as any).cta2Url || undefined,
      cta3Label: (result as any).cta3Label || undefined,
      cta3Action: (result as any).cta3Action || undefined,
      cta3Url: (result as any).cta3Url || undefined,
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
      type: message.type as 'TEXT' | 'RICH',
      textContent: message.textContent || undefined,
      richTitle: (message as any).richTitle || undefined,
      ctaLabel: (message as any).ctaLabel || undefined,
      ctaAction: (message as any).ctaAction || undefined,
      ctaUrl: (message as any).ctaUrl || undefined,
      cta2Label: (message as any).cta2Label || undefined,
      cta2Action: (message as any).cta2Action || undefined,
      cta2Url: (message as any).cta2Url || undefined,
      cta3Label: (message as any).cta3Label || undefined,
      cta3Action: (message as any).cta3Action || undefined,
      cta3Url: (message as any).cta3Url || undefined,
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
  if (message.type !== 'RICH') return null

  return {
    title: (message as any).richTitle || '',
    subtitle: '',
    link: (message as any).ctaUrl || undefined,
    buttonAction: (message as any).ctaAction as any,
    buttonTitle: (message as any).ctaLabel || undefined,
    button2Link: (message as any).cta2Url || undefined,
    button2Action: (message as any).cta2Action as any,
    button2Title: (message as any).cta2Label || undefined,
    button3Link: (message as any).cta3Url || undefined,
    button3Action: (message as any).cta3Action as any,
    button3Title: (message as any).cta3Label || undefined,
  }
} 