'use client'

import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { MessageSquare, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionConfigSidebar, CardData } from '../action-config-sidebar'
import { AiPromptModal } from '../ai-prompt-modal'
import { ViewPromptModal } from '../view-prompt-modal'
import { bufferToDataUrl } from '@/utils/image-utils'
import styles from './action-node.module.css'

// Small Card Preview Component for Action Node
interface ActionNodeCardPreviewProps {
  cardData: CardData
}

const ActionNodeCardPreview: React.FC<ActionNodeCardPreviewProps> = ({ cardData }) => {
  const getButtonText = () => {
    if (!cardData.buttonAction) return null
    
    if (cardData.buttonAction === 'website' && cardData.buttonTitle) {
      return cardData.buttonTitle
    }
    
    switch (cardData.buttonAction) {
      case 'website':
        return 'Visit Website'
      case 'message':
        return 'Send Message'
      case 'ai':
        return 'Ask AI'
      default:
        return 'Button'
    }
  }

  return (
    <div className={styles.actionCardPreview}>
      {cardData.image && (
        <div className={styles.actionCardImageContainer}>
          <img src={cardData.image} alt="Card preview" className={styles.actionCardImage} />
        </div>
      )}
      <div className={styles.actionCardContent}>
        {cardData.title && (
          <h4 className={styles.actionCardTitle}>{cardData.title}</h4>
        )}
        {cardData.subtitle && (
          <p className={styles.actionCardSubtitle}>{cardData.subtitle}</p>
        )}
        {cardData.buttonAction && (
          <div className={styles.actionCardButton}>
            {getButtonText()}
          </div>
        )}
      </div>
    </div>
  )
}

interface ActionNodeProps {
  data: {
    id: string
    listener: {
      	listener: 'PROLYAI' | 'MESSAGE'
      prompt: string
      commentReply: string | null
      dmCount: number
      commentCount: number
      messageData?: {
        type: 'TEXT' | 'CARD'
        textContent?: string
        cardTitle?: string
        cardSubtitle?: string
        cardButtonLabel?: string
        cardImage?: Buffer
        cardImageUrl?: string
        cardButtonAction?: string
        cardLink?: string
      }
      cardData?: CardData
      actionType?: 'text' | 'card'
      status: 'CONFIGURED' | 'UNCONFIGURED'
    }
  }
  onMessageUpdate?: (actionId: string, message: string) => void
  onPromptUpdate?: (actionId: string, prompt: string) => void
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data, onMessageUpdate, onPromptUpdate }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isAiPromptModalOpen, setIsAiPromptModalOpen] = useState(false)
  const [isViewPromptModalOpen, setIsViewPromptModalOpen] = useState(false)
  const isMessageAction = data.listener.listener === 'MESSAGE'
  
  // Determine if there's a configured message based on messageData
  const hasConfiguredMessage = isMessageAction 
    ? (data.listener.messageData?.textContent || data.listener.messageData?.cardTitle)
    : data.listener.prompt

  // Extract display data from messageData
  const getMessageDisplayText = () => {
    if (data.listener.messageData) {
      if (data.listener.messageData.type === 'TEXT') {
        return data.listener.messageData.textContent || ''
      } else if (data.listener.messageData.type === 'CARD') {
        return `Card: ${data.listener.messageData.cardTitle || 'Untitled'}`
      }
    }
    return ''
  }

  const getCardDataFromMessage = () => {
    if (data.listener.messageData?.type === 'CARD') {
      let imageData = data.listener.messageData.cardImageUrl || undefined
      
      // Convert buffer/uint8array to base64 if image is stored as binary data
      if (data.listener.messageData.cardImage) {
        let buffer: Buffer | null = null
        
        if (data.listener.messageData.cardImage instanceof Buffer) {
          buffer = data.listener.messageData.cardImage
        } else if (data.listener.messageData.cardImage instanceof Uint8Array) {
          buffer = Buffer.from(data.listener.messageData.cardImage)
                          } else {
          // Safe handling of array-like structures
          try {
            const rawImageData = data.listener.messageData.cardImage
            if (Array.isArray(rawImageData)) {
              buffer = Buffer.from(rawImageData)
            } else if (typeof rawImageData === 'object' && rawImageData !== null && 'length' in rawImageData) {
              // Convert array-like object to actual array
              buffer = Buffer.from(Array.from(rawImageData as ArrayLike<number>))
            } else {
              console.warn('Unexpected cardImage data type:', typeof rawImageData, rawImageData)
            }
          } catch (error) {
            console.warn('Failed to convert cardImage to Buffer:', error)
          }
        }
        
        if (buffer) {
          imageData = bufferToDataUrl(buffer)
        }
      }

      return {
        image: imageData,
        title: data.listener.messageData.cardTitle || '',
        subtitle: data.listener.messageData.cardSubtitle || '',
        link: data.listener.messageData.cardLink || undefined,
        buttonAction: data.listener.messageData.cardButtonAction as 'message' | 'ai' | 'website' | undefined,
        buttonTitle: data.listener.messageData.cardButtonLabel || undefined,
      }
    }
    return data.listener.cardData
  }

  const handleConfigSelect = (actionType: string, config?: any) => {
    if (actionType === 'text' && config?.message) {
      // Update messageData structure
      data.listener.actionType = 'text'
      data.listener.cardData = undefined
      
      // Update messageData to maintain consistency
      if (!data.listener.messageData) {
        data.listener.messageData = { type: 'TEXT', textContent: config.message }
      } else {
        data.listener.messageData.type = 'TEXT'
        data.listener.messageData.textContent = config.message
        // Clear card-related fields
        data.listener.messageData.cardTitle = undefined
        data.listener.messageData.cardSubtitle = undefined
        data.listener.messageData.cardButtonLabel = undefined
        data.listener.messageData.cardImage = undefined
        data.listener.messageData.cardImageUrl = undefined
        data.listener.messageData.cardButtonAction = undefined
        data.listener.messageData.cardLink = undefined
      }
      
      onMessageUpdate?.(data.id, config.message)
    } else if (actionType === 'card' && config?.cardData) {
      data.listener.cardData = config.cardData
      data.listener.actionType = 'card'
      
      // Update messageData to maintain consistency
      if (!data.listener.messageData) {
        data.listener.messageData = { 
          type: 'CARD',
          cardTitle: config.cardData.title,
          cardSubtitle: config.cardData.subtitle,
          cardButtonLabel: config.cardData.buttonTitle,
          cardImageUrl: config.cardData.image,
          cardButtonAction: config.cardData.buttonAction,
          cardLink: config.cardData.link
        }
      } else {
        data.listener.messageData.type = 'CARD'
        data.listener.messageData.cardTitle = config.cardData.title
        data.listener.messageData.cardSubtitle = config.cardData.subtitle
        data.listener.messageData.cardButtonLabel = config.cardData.buttonTitle
        data.listener.messageData.cardImageUrl = config.cardData.image
        data.listener.messageData.cardButtonAction = config.cardData.buttonAction
        data.listener.messageData.cardLink = config.cardData.link
        // Clear text content when switching to card
        data.listener.messageData.textContent = undefined
      }
      
      onMessageUpdate?.(data.id, `Card: ${config.cardData.title || 'Untitled'}`)
    }
    setIsConfigOpen(false)
  }

  const handleMessageDelete = () => {
    if (isMessageAction) {
      // Reset all message-related data
      data.listener.messageData = undefined
      data.listener.cardData = undefined
      data.listener.actionType = undefined
      data.listener.status = 'UNCONFIGURED' // Ensure status is reset
      onMessageUpdate?.(data.id, '')
    }
    setIsConfigOpen(false)
  }

  const handleAiPromptSave = (prompt: string) => {
    data.listener.prompt = prompt
    data.listener.status = 'CONFIGURED'
    onPromptUpdate?.(data.id, prompt)
  }

  const handleNodeClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Prevent ReactFlow's node click handler
    }
    
    if (isMessageAction) {
      setIsConfigOpen(true)
    } else if (hasConfiguredMessage) {
      setIsViewPromptModalOpen(true)
    } else {
      setIsAiPromptModalOpen(true)
    }
  }

  return (
    <>
      <Card 
        className={`${styles.actionNode} ${hasConfiguredMessage ? styles.configured : ''} ${data.listener.actionType === 'card' ? styles.cardExpanded : ''}`}
        onClick={handleNodeClick}
      >
        {/* Header with Icon and Title */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            {isMessageAction ? (
              <MessageSquare className={styles.icon} />
            ) : (
              <Bot className={styles.icon} />
            )}
          </div>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>
              {isMessageAction ? 'Send Message' : 'AI Assistant'}
            </h3>
          </div>
        </div>

        {/* Content Area */}
        {hasConfiguredMessage ? (
          <div className={styles.messageContent}>
            <Button
              variant="ghost"
              className={styles.viewPromptButton}
              onClick={(e) => {
                e.stopPropagation()
                if (!isMessageAction) {
                  setIsViewPromptModalOpen(true)
                }
              }}
            >
              <span className={styles.buttonContent}>
                {isMessageAction ? (
                  (data.listener.messageData?.type === 'CARD' || data.listener.actionType === 'card') && getCardDataFromMessage() ? (
                    <ActionNodeCardPreview cardData={getCardDataFromMessage()!} />
                  ) : (
                    <p className={styles.configuredMessage} title={getMessageDisplayText()}>
                      {getMessageDisplayText()}
                    </p>
                  )
                ) : (
                  'View AI Prompt'
                )}
              </span>
            </Button>
          </div>
        ) : (
          <>
            <p className={styles.description}>
              {isMessageAction
                ? 'Configure the message that will be sent to the user.'
                					: 'Configure how Proly AI should respond to the user.'}
            </p>
            <Button
              variant="ghost"
              className={styles.configureButton}
              onClick={(e) => {
                e.stopPropagation()
                if (isMessageAction) {
                  setIsConfigOpen(true)
                } else {
                  setIsAiPromptModalOpen(true)
                }
              }}
            >
              <span className={styles.buttonContent}>
                {isMessageAction ? '+ Configure Action' : '+ Type Prompt'}
              </span>
            </Button>
          </>
        )}

        {/* Handle for connections */}
        <Handle
          type="target"
          position={Position.Left}
          className={styles.hiddenHandle}
          isConnectable={false}
        />
      </Card>

      {isMessageAction ? (
        <ActionConfigSidebar
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onSelect={handleConfigSelect}
          initialMessage={getMessageDisplayText()}
          initialCardData={getCardDataFromMessage()}
          onMessageDelete={handleMessageDelete}
        />
      ) : (
        <>
          <AiPromptModal
            isOpen={isAiPromptModalOpen}
            onClose={() => setIsAiPromptModalOpen(false)}
            onSave={handleAiPromptSave}
            initialPrompt={data.listener.prompt}
          />
          <ViewPromptModal
            isOpen={isViewPromptModalOpen}
            onClose={() => setIsViewPromptModalOpen(false)}
            onEdit={() => {
              setIsViewPromptModalOpen(false)
              setIsAiPromptModalOpen(true)
            }}
            prompt={data.listener.prompt}
          />
        </>
      )}
    </>
  )
} 