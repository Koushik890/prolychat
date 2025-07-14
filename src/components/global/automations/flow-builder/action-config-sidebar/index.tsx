'use client'

import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Type, Image, Video, Clock, PlayCircle, LayoutGrid, FileImage, CreditCard, Zap, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useParams, usePathname } from 'next/navigation'
import { TextConfigModal } from '../text-config-modal'
import { CardConfigModal, CardData } from '../card-config-modal'
import { SIDEBAR_ANIMATIONS, PURPLE_THEME, CLOSE_BUTTON_STYLES, HEADER_STYLES } from '../shared/animation-patterns'
import { cn } from '@/lib/utils'
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
    <motion.div 
      className={cn(
        PURPLE_THEME.glassBackground,
        PURPLE_THEME.border,
        "rounded-2xl p-4 relative transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5"
      )}
      {...SIDEBAR_ANIMATIONS.scaleOnHover}
    >
      {cardData.image && (
        <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-200">
          <img 
            src={cardData.image} 
            alt="Card preview" 
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105" 
          />
        </div>
      )}
      <div className="mb-3">
        {cardData.title && (
          <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2">{cardData.title}</h3>
        )}
        {cardData.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{cardData.subtitle}</p>
        )}
        {cardData.buttonAction && (
          <div className="flex items-center justify-center w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium">
            {getButtonText()}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-100">
        <button 
          onClick={onEdit}
          className={cn(
            "flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all duration-150",
            PURPLE_THEME.button.base,
            PURPLE_THEME.button.hover,
            PURPLE_THEME.button.text
          )}
          aria-label="Edit card"
        >
          Edit
        </button>
        <button 
          onClick={onDelete}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition-all duration-150"
          aria-label="Delete card"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </motion.div>
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
  const params = useParams()
  const pathname = usePathname()
  
  // Helper function to get automation ID safely
  const getAutomationId = (): string => {
    // Handle params.id when it's a string
    if (params?.id && typeof params.id === 'string') {
      return params.id
    }
    
    // Handle params.id when it's an array (take first element)
    if (params?.id && Array.isArray(params.id) && params.id.length > 0) {
      return params.id[0]
    }
    
    // Fallback to URL parsing if params not available
    const pathSegments = pathname.split('/')
    const automationIndex = pathSegments.findIndex(segment => segment === 'automations')
    if (automationIndex !== -1 && automationIndex + 1 < pathSegments.length) {
      const extractedId = pathSegments[automationIndex + 1]
      if (extractedId && extractedId.trim() !== '') {
        return extractedId
      }
    }
    
    // Log error for debugging but don't crash the component
    console.error('Unable to determine automation ID from params:', params, 'or pathname:', pathname)
    return '' // Return empty string instead of throwing
  }

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
      onClose() // Collapse the sidebar before opening text modal
      setIsTextModalOpen(true)
    } else if (option.id === 'card') {
      onClose() // Collapse the sidebar before opening card modal
      setIsCardModalOpen(true)
    } else {
      onSelect(option.id)
    }
  }

  const handleTextSave = async (text: string) => {
    try {
      // Save text data to database
      const automationId = getAutomationId()
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
      const automationId = getAutomationId()
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
      
      // Get automation ID using robust method
      const automationId = getAutomationId()
      
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
        // Still update UI for better UX, but log the error
        setSelectedText(null)
        setSelectedActionType(null)
        setSelectedCardData(null)
        onSelect('text', { message: null, status: 'UNCONFIGURED' })
        onMessageDelete?.()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
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
          showCloseButton={false}
          side="right" 
          className={cn(
            "p-6 w-[400px] top-0 h-screen",
            PURPLE_THEME.glassBackground,
            PURPLE_THEME.shadow,
            PURPLE_THEME.border,
            "border-l"
          )}
          {...SIDEBAR_ANIMATIONS.slideIn}
        >
          {/* Gradient overlay */}
          <div className={cn(
            "absolute inset-0 pointer-events-none rounded-l-2xl",
            PURPLE_THEME.gradientOverlay
          )} />
          
          <button 
            onClick={onClose} 
            className={cn(CLOSE_BUTTON_STYLES.base, "group")}
            aria-label="Close sidebar"
          >
            <X className={CLOSE_BUTTON_STYLES.icon} />
            <span className="sr-only">Close</span>
          </button>
          
          <SheetHeader className={HEADER_STYLES.container}>
            <SheetTitle className={HEADER_STYLES.title}>Configure Message</SheetTitle>
            <p className={HEADER_STYLES.subtitle}>Choose how you want to respond to the user</p>
          </SheetHeader>

          <motion.div 
            className="flex flex-col gap-8 overflow-y-auto max-h-[calc(100vh-8.5rem)] scrollbar-hide relative z-10"
            {...SIDEBAR_ANIMATIONS.contentFadeIn}
          >
            {selectedText && (
              <motion.div 
                className={cn(
                  PURPLE_THEME.glassBackground,
                  PURPLE_THEME.border,
                  "rounded-2xl p-4 mb-4 relative"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 relative mb-3">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800 flex-grow">Selected Message</h4>
                  <button 
                    onClick={handleMessageDelete}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Delete message"
                    disabled={isDeletingMessage}
                  >
                    {isDeletingMessage ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : (
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
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
                  <div className="flex items-start justify-between gap-4 py-2 px-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800 leading-relaxed flex-1 break-words">{selectedText}</p>
                    <button 
                      onClick={() => {
                        if (selectedActionType === 'card') {
                          setIsCardModalOpen(true)
                        } else {
                          setIsTextModalOpen(true)
                        }
                      }}
                      className={cn(
                        "py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap",
                        PURPLE_THEME.button.base,
                        PURPLE_THEME.button.hover,
                        PURPLE_THEME.button.text
                      )}
                      aria-label="Edit message"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {!selectedText && (
              <div className="flex flex-col gap-4">
                <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2">
                  <Zap className="w-4.5 h-4.5 text-gray-600" />
                  ACTIONS
                </h4>
                <div className="flex flex-col gap-4">
                  {ACTION_OPTIONS.map((option, index) => (
                    <motion.button
                      key={option.id}
                      className={cn(
                        "flex flex-col justify-center gap-1 p-3 rounded-2xl transition-all duration-200 text-left w-full relative overflow-hidden",
                        PURPLE_THEME.glassBackground,
                        PURPLE_THEME.border,
                        !option.isDisabled && "hover:-translate-y-0.5 hover:shadow-lg",
                        option.isDisabled && "opacity-60 cursor-not-allowed bg-gray-50/80"
                      )}
                      onClick={() => handleOptionClick(option)}
                      disabled={Boolean(option.isDisabled)}
                      {...SIDEBAR_ANIMATIONS.staggeredItem(index)}
                      {...(!option.isDisabled ? SIDEBAR_ANIMATIONS.buttonHover : {})}
                      role="button"
                      aria-disabled={Boolean(option.isDisabled)}
                    >
                      <div className="flex items-center justify-between w-full min-h-[2.25rem]">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                            option.isDisabled 
                              ? "bg-gray-100 border border-gray-200" 
                              : cn(PURPLE_THEME.icon.background, PURPLE_THEME.icon.border)
                          )}>
                            <option.icon className={cn(
                              "w-4.5 h-4.5 transition-all duration-200",
                              option.isDisabled ? "text-gray-400" : PURPLE_THEME.icon.text
                            )} />
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className={cn(
                              "text-sm font-medium transition-colors duration-200",
                              option.isDisabled ? "text-gray-500" : "text-gray-800"
                            )}>{option.name}</span>
                            <span className="text-xs text-gray-500 font-normal truncate">
                              {option.description}
                            </span>
                          </div>
                        </div>
                        {option.isDisabled && (
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full transition-all duration-200",
                            "bg-purple-50 border border-purple-200 text-purple-600",
                            "ml-2 flex-shrink-0"
                          )} aria-label="Coming Soon">
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