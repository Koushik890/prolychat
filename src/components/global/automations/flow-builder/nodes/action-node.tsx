'use client'

import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { MessageCircle, Bot } from 'lucide-react'
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
  const getButtons = (): string[] => {
    const labels: string[] = []
    if (cardData.buttonAction === 'website') {
      labels.push(cardData.buttonTitle || 'Open')
    } else if (cardData.buttonAction === 'message') {
      labels.push('Send Message')
    } else if (cardData.buttonAction === 'ai') {
      labels.push('Ask AI')
    }
    if (cardData.button2Action === 'website' && cardData.button2Link) {
      labels.push(cardData.button2Title || 'Open')
    }
    if (cardData.button3Action === 'website' && cardData.button3Link) {
      labels.push(cardData.button3Title || 'Open')
    }
    return labels
  }

  const buttons = getButtons()

  return (
    <div className="w-full">
      {cardData.image && (
        <div className="relative w-full h-16 rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-purple-50 to-purple-100/60 ring-1 ring-purple-200/40">
          <img 
            src={cardData.image} 
            alt="Card preview" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        </div>
      )}
      <div className="space-y-2">
        {cardData.title && (
          <h4 className="font-hubot text-gray-900 font-semibold text-sm leading-tight line-clamp-2">
            {cardData.title}
          </h4>
        )}
        {cardData.subtitle && (
          <p className="font-mona text-gray-600 text-xs leading-relaxed line-clamp-2">
            {cardData.subtitle}
          </p>
        )}
        {buttons.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {buttons.map((label, idx) => (
              <div
                key={idx}
                className="font-mona px-3 py-2.5 w-full text-center text-xs font-medium text-white bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg shadow-sm ring-1 ring-purple-900/[0.05]"
              >
                {label}
              </div>
            ))}
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
        type: 'TEXT' | 'RICH'
        textContent?: string
        richTitle?: string
        ctaLabel?: string
        ctaAction?: string
        ctaUrl?: string
        cta2Label?: string
        cta2Action?: string
        cta2Url?: string
        cta3Label?: string
        cta3Action?: string
        cta3Url?: string
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
    ? (data.listener.messageData?.textContent || (data.listener.messageData as any)?.richTitle)
    : data.listener.prompt

  // Extract display data from messageData
  const getMessageDisplayText = () => {
    if (data.listener.messageData) {
      if (data.listener.messageData.type === 'TEXT') {
        return data.listener.messageData.textContent || ''
      } else if (data.listener.messageData.type === 'RICH') {
        return `Card: ${(data.listener.messageData as any).richTitle || 'Untitled'}`
      }
    }
    return ''
  }

  const getCardDataFromMessage = () => {
    if (data.listener.messageData?.type === 'RICH') {
      return {
        title: (data.listener.messageData as any).richTitle || '',
        subtitle: '',
        link: (data.listener.messageData as any).ctaUrl || undefined,
        buttonAction: (data.listener.messageData as any).ctaAction as any,
        buttonTitle: (data.listener.messageData as any).ctaLabel || undefined,
        button2Link: (data.listener.messageData as any).cta2Url || undefined,
        button2Action: (data.listener.messageData as any).cta2Action as any,
        button2Title: (data.listener.messageData as any).cta2Label || undefined,
        button3Link: (data.listener.messageData as any).cta3Url || undefined,
        button3Action: (data.listener.messageData as any).cta3Action as any,
        button3Title: (data.listener.messageData as any).cta3Label || undefined,
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
        // Clear RICH-related fields
        ;(data.listener.messageData as any).richTitle = undefined
        ;(data.listener.messageData as any).ctaLabel = undefined
        ;(data.listener.messageData as any).ctaAction = undefined
        ;(data.listener.messageData as any).ctaUrl = undefined
      }
      
      onMessageUpdate?.(data.id, config.message)
    } else if (actionType === 'card' && config?.cardData) {
      data.listener.cardData = config.cardData
      data.listener.actionType = 'card'
      
      // Update messageData to maintain consistency
      if (!data.listener.messageData) {
        data.listener.messageData = { 
          type: 'RICH',
          richTitle: config.cardData.title,
          ctaLabel: config.cardData.buttonTitle,
          ctaAction: config.cardData.buttonAction,
          ctaUrl: config.cardData.link,
          // extra buttons for local state parity
          ...(config.cardData.button2Title ? { cta2Label: config.cardData.button2Title } : {} as any),
          ...(config.cardData.button2Action ? { cta2Action: config.cardData.button2Action } : {} as any),
          ...(config.cardData.button2Link ? { cta2Url: config.cardData.button2Link } : {} as any),
          ...(config.cardData.button3Title ? { cta3Label: config.cardData.button3Title } : {} as any),
          ...(config.cardData.button3Action ? { cta3Action: config.cardData.button3Action } : {} as any),
          ...(config.cardData.button3Link ? { cta3Url: config.cardData.button3Link } : {} as any),
        }
      } else {
        data.listener.messageData.type = 'RICH'
        ;(data.listener.messageData as any).richTitle = config.cardData.title
        ;(data.listener.messageData as any).ctaLabel = config.cardData.buttonTitle
        ;(data.listener.messageData as any).ctaAction = config.cardData.buttonAction as any
        ;(data.listener.messageData as any).ctaUrl = config.cardData.link
        ;(data.listener.messageData as any).cta2Label = config.cardData.button2Title
        ;(data.listener.messageData as any).cta2Action = config.cardData.button2Action as any
        ;(data.listener.messageData as any).cta2Url = config.cardData.button2Link
        ;(data.listener.messageData as any).cta3Label = config.cardData.button3Title
        ;(data.listener.messageData as any).cta3Action = config.cardData.button3Action as any
        ;(data.listener.messageData as any).cta3Url = config.cardData.button3Link
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
              <MessageCircle className={styles.icon} />
            ) : (
              <Bot className={styles.icon} />
            )}
          </div>
          <div className={styles.titleWrapper}>
            <h3 className={`${styles.title} font-hubot`}>
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
                } else {
                  // For message action, clicking the preview should open the configure sidebar
                  setIsConfigOpen(true)
                }
              }}
            >
              <span className={styles.buttonContent}>
                {isMessageAction ? (
                  (data.listener.messageData?.type === 'RICH' || data.listener.actionType === 'card') && getCardDataFromMessage() ? (
                    <ActionNodeCardPreview cardData={getCardDataFromMessage()!} />
                  ) : (
                    <p className={`${styles.configuredMessage} font-mona`} title={getMessageDisplayText()}>
                      {getMessageDisplayText()}
                    </p>
                  )
                ) : (
                  <span className="font-mona">View AI Prompt</span>
                )}
              </span>
            </Button>
          </div>
        ) : (
          <>
            <p className={`${styles.description} font-mona`}>
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
              <span className={`${styles.buttonContent} font-mona`}>
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