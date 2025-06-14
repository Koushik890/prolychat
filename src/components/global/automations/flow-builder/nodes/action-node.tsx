'use client'

import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { MessageSquare, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionConfigSidebar } from '../action-config-sidebar'
import { AiPromptModal } from '../ai-prompt-modal'
import { ViewPromptModal } from '../view-prompt-modal'
import styles from './action-node.module.css'

interface ActionNodeProps {
  data: {
    id: string
    listener: {
      	listener: 'PROLYAI' | 'MESSAGE'
      prompt: string
      commentReply: string | null
      dmCount: number
      commentCount: number
      message?: string
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
  const hasConfiguredMessage = isMessageAction ? data.listener.message : data.listener.prompt

  const handleConfigSelect = (actionType: string, config?: any) => {
    if (actionType === 'text' && config?.message) {
      data.listener.message = config.message
      onMessageUpdate?.(data.id, config.message)
    }
    setIsConfigOpen(false)
  }

  const handleMessageDelete = () => {
    if (isMessageAction) {
      data.listener.message = ''
      onMessageUpdate?.(data.id, '')
    }
    setIsConfigOpen(false)
  }

  const handleAiPromptSave = (prompt: string) => {
    data.listener.prompt = prompt
    data.listener.status = 'CONFIGURED'
    onPromptUpdate?.(data.id, prompt)
  }

  const handleNodeClick = () => {
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
        className={`${styles.actionNode} ${hasConfiguredMessage ? styles.configured : ''}`}
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
                  <p className={styles.configuredMessage} title={data.listener.message}>
                    {data.listener.message}
                  </p>
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
          className={styles.handle}
          isConnectable={false}
        />
      </Card>

      {isMessageAction ? (
        <ActionConfigSidebar
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onSelect={handleConfigSelect}
          initialMessage={data.listener.message}
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