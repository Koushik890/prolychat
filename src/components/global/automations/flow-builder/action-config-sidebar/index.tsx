'use client'

import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Type, Image, Video, Clock, PlayCircle, LayoutGrid, FileImage, CreditCard, Zap, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { TextConfigModal } from '../text-config-modal'
import { CardConfigModal, CardData } from '../card-config-modal'
import styles from './action-config-sidebar.module.css'
import { useToast } from '@/contexts/toast-context'

export type { CardData }

interface ActionConfigSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (actionType: string, config?: any) => void
  initialMessage?: string
  initialCardData?: CardData
  onMessageDelete?: () => void
}

const ACTION_OPTIONS = [
  {
    id: 'text',
    name: 'Text',
    description: 'Send a text message to the user',
    icon: Type,
    isDisabled: false,
  },
  {
    id: 'audio',
    name: 'Audio',
    description: 'Send an audio message',
    icon: PlayCircle,
    isDisabled: true,
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Share a video message',
    icon: Video,
    isDisabled: true,
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Send an interactive card',
    icon: CreditCard,
    isDisabled: true,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Share multiple images',
    icon: LayoutGrid,
    isDisabled: true,
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    description: 'Dynamic content based on user',
    icon: FileImage,
    isDisabled: true,
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Send a single image',
    icon: Image,
    isDisabled: true,
  },
  {
    id: 'delay',
    name: 'Delay',
    description: 'Add a delay before next action',
    icon: Clock,
    isDisabled: true,
  },
]

const MotionSheetContent = motion.create(SheetContent)

// Card Preview Component
interface CardPreviewProps {
  cardData: CardData
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
}

const CardPreview: React.FC<CardPreviewProps> = ({ cardData, onEdit, onDelete, isDeleting = false }) => {
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
    <div className={styles.cardPreview}>
      {cardData.image && (
        <div className={styles.cardImageContainer}>
          <img src={cardData.image} alt="Card preview" className={styles.cardImage} />
        </div>
      )}
      <div className={styles.cardContent}>
        {cardData.title && (
          <h3 className={styles.cardTitle}>{cardData.title}</h3>
        )}
        {cardData.subtitle && (
          <p className={styles.cardSubtitle}>{cardData.subtitle}</p>
        )}
        {cardData.buttonAction && (
          <div className={styles.cardButton}>
            {getButtonText()}
          </div>
        )}
      </div>
      <div className={styles.cardPreviewActions}>
        <button 
          onClick={onEdit}
          className={styles.cardEditButton}
          aria-label="Edit card"
        >
          Edit
        </button>
        <button 
          onClick={onDelete}
          className={styles.cardDeleteButton}
          aria-label="Delete card"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
          ) : (
            <X className={styles.cardDeleteIcon} />
          )}
        </button>
      </div>
    </div>
  )
}

export const ActionConfigSidebar: React.FC<ActionConfigSidebarProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialMessage,
  initialCardData,
  onMessageDelete
}) => {
  const [isTextModalOpen, setIsTextModalOpen] = useState(false)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [selectedText, setSelectedText] = useState<string | null>(initialMessage || null)
  const [selectedActionType, setSelectedActionType] = useState<'text' | 'card' | null>(null)
  const [selectedCardData, setSelectedCardData] = useState<CardData | null>(null)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (initialMessage) {
      setSelectedText(initialMessage)
      // Check if the initial message is a card by looking for "Card:" prefix
      if (initialMessage.startsWith('Card:') && initialCardData) {
        setSelectedActionType('card')
        setSelectedCardData(initialCardData)
      } else {
        setSelectedActionType('text')
        setSelectedCardData(null)
      }
    }
  }, [initialMessage, initialCardData])

  const handleOptionClick = (option: typeof ACTION_OPTIONS[0]) => {
    if (option.isDisabled || selectedText) return // Disable click if there's already a selected message

    if (option.id === 'text') {
      setIsTextModalOpen(true)
    } else if (option.id === 'card') {
      setIsCardModalOpen(true)
    } else {
      onSelect(option.id)
    }
  }

  const handleTextSave = async (text: string) => {
    try {
      // Save text data to database
      const automationId = window.location.pathname.split('/')[4] // Extract automation ID from URL
      const { saveTextMessage } = await import('@/actions/automations')
      
      const result = await saveTextMessage(automationId, text)
      
      if (result.status === 200) {
        setSelectedText(text)
        setSelectedActionType('text')
        setSelectedCardData(null)
        onSelect('text', { message: text })
      } else {
        console.error('Failed to save text:', result.data)
        // Still update UI for now
        setSelectedText(text)
        setSelectedActionType('text')
        setSelectedCardData(null)
        onSelect('text', { message: text })
      }
    } catch (error) {
      console.error('Error saving text:', error)
      // Still update UI for now
      setSelectedText(text)
      setSelectedActionType('text')
      setSelectedCardData(null)
      onSelect('text', { message: text })
    }
    
    setIsTextModalOpen(false)
  }

  const handleCardSave = async (cardData: CardData) => {
    try {
      // Save card data to database
      const automationId = window.location.pathname.split('/')[4] // Extract automation ID from URL
      const { saveCardMessage } = await import('@/actions/automations')
      
      const result = await saveCardMessage(automationId, cardData)
      
      if (result.status === 200) {
        const titlePart = cardData.title ? cardData.title : ''
        const subtitlePart = cardData.subtitle ? ` • ${cardData.subtitle}` : ''
        const imagePart = cardData.image ? ' [Image]' : ''
        const buttonActionPart = cardData.buttonAction 
          ? cardData.buttonAction === 'website' 
            ? cardData.buttonTitle 
              ? ` [${cardData.buttonTitle}]`
              : ' [Website]'
            : cardData.buttonAction === 'message' 
              ? ' [Message]' 
              : ' [AI]'
          : ''
        const cardText = `Card: ${titlePart}${subtitlePart}${imagePart}${buttonActionPart}`
        setSelectedText(cardText)
        setSelectedActionType('card')
        setSelectedCardData(cardData)
        onSelect('card', { cardData })
      } else {
        console.error('Failed to save card:', result.data)
        // Still update UI for now
        const titlePart = cardData.title ? cardData.title : ''
        const subtitlePart = cardData.subtitle ? ` • ${cardData.subtitle}` : ''
        const imagePart = cardData.image ? ' [Image]' : ''
        const buttonActionPart = cardData.buttonAction 
          ? cardData.buttonAction === 'website' 
            ? cardData.buttonTitle 
              ? ` [${cardData.buttonTitle}]`
              : ' [Website]'
            : cardData.buttonAction === 'message' 
              ? ' [Message]' 
              : ' [AI]'
          : ''
        const cardText = `Card: ${titlePart}${subtitlePart}${imagePart}${buttonActionPart}`
        setSelectedText(cardText)
        setSelectedActionType('card')
        setSelectedCardData(cardData)
        onSelect('card', { cardData })
      }
    } catch (error) {
      console.error('Error saving card:', error)
      // Still update UI for now
      const titlePart = cardData.title ? cardData.title : ''
      const subtitlePart = cardData.subtitle ? ` • ${cardData.subtitle}` : ''
      const imagePart = cardData.image ? ' [Image]' : ''
      const buttonActionPart = cardData.buttonAction 
        ? cardData.buttonAction === 'website' 
          ? cardData.buttonTitle 
            ? ` [${cardData.buttonTitle}]`
            : ' [Website]'
          : cardData.buttonAction === 'message' 
            ? ' [Message]' 
            : ' [AI]'
        : ''
      const cardText = `Card: ${titlePart}${subtitlePart}${imagePart}${buttonActionPart}`
      setSelectedText(cardText)
      setSelectedActionType('card')
      setSelectedCardData(cardData)
      onSelect('card', { cardData })
    }
    
    setIsCardModalOpen(false)
  }

  const handleMessageDelete = async () => {
    if (isDeletingMessage) return // Prevent double deletion
    
    try {
      setIsDeletingMessage(true)
      showToast('loading', 'Deleting message...', true)
      
      // Extract automation ID from URL
      const automationId = window.location.pathname.split('/')[4]
      
      // Delete from database
      const { deleteAutomationMessage } = await import('@/actions/automations')
      const result = await deleteAutomationMessage(automationId)
      
      if (result.status === 200) {
        // Only update UI state if database deletion succeeded
        setSelectedText(null)
        setSelectedActionType(null)
        setSelectedCardData(null)
        onSelect('text', { message: null, status: 'UNCONFIGURED' })
        onMessageDelete?.()
        showToast('success', 'Message deleted successfully', true)
      } else {
        console.error('Failed to delete message:', result.data)
        showToast('success', 'Failed to delete message', true)
        // Still update UI for better UX, but log the error
        setSelectedText(null)
        setSelectedActionType(null)
        setSelectedCardData(null)
        onSelect('text', { message: null, status: 'UNCONFIGURED' })
        onMessageDelete?.()
      }
          } catch (error) {
        console.error('Error deleting message:', error)
        showToast('success', 'Error deleting message', true)
        // Still update UI for better UX, but log the error
        setSelectedText(null)
        setSelectedActionType(null)
        setSelectedCardData(null)
        onSelect('text', { message: null, status: 'UNCONFIGURED' })
        onMessageDelete?.()
    } finally {
      setIsDeletingMessage(false)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <MotionSheetContent 
          side="right" 
          className={styles.sidebar}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Close sidebar"
          >
            <X className={styles.closeIcon} />
            <span className="sr-only">Close</span>
          </button>
          <SheetHeader className={styles.header}>
            <SheetTitle className={styles.title}>Configure Message</SheetTitle>
            <p className={styles.subtitle}>Choose how you want to respond to the user</p>
          </SheetHeader>

          <motion.div 
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {selectedText && (
              <motion.div 
                className={styles.selectedAction}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.selectedActionHeader}>
                  <MessageCircle className={styles.selectedActionIcon} />
                  <h4 className={styles.selectedActionTitle}>Selected Message</h4>
                  <button 
                    onClick={handleMessageDelete}
                    className={styles.deleteButton}
                    aria-label="Delete message"
                    disabled={isDeletingMessage}
                  >
                    {isDeletingMessage ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : (
                      <X className={styles.deleteIcon} />
                    )}
                  </button>
                </div>
                {selectedActionType === 'card' && selectedCardData ? (
                  <CardPreview
                    cardData={selectedCardData}
                    onEdit={() => setIsCardModalOpen(true)}
                    onDelete={handleMessageDelete}
                    isDeleting={isDeletingMessage}
                  />
                ) : (
                  <div className={styles.selectedActionContent}>
                    <p className={styles.selectedActionText}>{selectedText}</p>
                    <button 
                      onClick={() => {
                        if (selectedActionType === 'card') {
                          setIsCardModalOpen(true)
                        } else {
                          setIsTextModalOpen(true)
                        }
                      }}
                      className={styles.editButton}
                      aria-label="Edit message"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {!selectedText && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  <Zap className={styles.sectionIcon} />
                  ACTIONS
                </h4>
                <div className={styles.options}>
                  {ACTION_OPTIONS.map((option, index) => (
                    <motion.button
                      key={option.id}
                      className={`${styles.option} ${option.isDisabled ? styles.disabled : ''}`}
                      onClick={() => handleOptionClick(option)}
                      disabled={Boolean(option.isDisabled)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      whileHover={!option.isDisabled ? { y: -2, transition: { duration: 0.2 } } : {}}
                      whileTap={!option.isDisabled ? { y: -1 } : {}}
                      role="button"
                      aria-disabled={Boolean(option.isDisabled)}
                    >
                      <div className={styles.optionContent}>
                        <div className={styles.optionInfo}>
                          <option.icon className={styles.optionIcon} />
                          <div className={styles.optionTextContent}>
                            <span className={styles.optionName}>{option.name}</span>
                            <span className={styles.optionDescription}>{option.description}</span>
                          </div>
                        </div>
                        {option.isDisabled && (
                          <span className={styles.comingSoon} aria-label="Coming Soon">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </MotionSheetContent>
      </Sheet>

      <TextConfigModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onSave={handleTextSave}
        initialText={selectedText || ''}
      />
      
      <CardConfigModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleCardSave}
        initialCard={selectedCardData || undefined}
      />
    </>
  )
} 