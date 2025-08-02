'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Upload, Image as ImageIcon, Link, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './card-config-modal.module.css'
import { useToast } from '@/contexts/toast-context'
import { ButtonActionModal } from '../button-action-modal'
import { WebsiteConfigModal } from '../website-config-modal'

interface CardConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cardData: CardData) => void
  initialCard?: CardData
}

export interface CardData {
  image?: string
  title: string
  subtitle: string
  link?: string
  buttonAction?: 'message' | 'ai' | 'website'
  buttonTitle?: string
}

// Prevent page reload function
const preventReload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = 'Changes you made may not be saved. Are you sure you want to leave?'
  return e.returnValue
}

export function CardConfigModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialCard
}: CardConfigModalProps) {
  const [cardData, setCardData] = useState<CardData>({
    image: initialCard?.image || '',
    title: initialCard?.title || '',
    subtitle: initialCard?.subtitle || '',
    link: initialCard?.link || '',
    buttonAction: initialCard?.buttonAction || undefined
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const [showLinkSection, setShowLinkSection] = useState(false)
  const [linkDraft, setLinkDraft] = useState('')
  const [isButtonActionModalOpen, setIsButtonActionModalOpen] = useState(false)
  const [isWebsiteConfigModalOpen, setIsWebsiteConfigModalOpen] = useState(false)
  const { showToast } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const subtitleTextareaRef = useRef<HTMLTextAreaElement>(null)

  const titleCharacterCount = cardData.title.length
  const titleCharacterLimit = 80
  const subtitleCharacterCount = cardData.subtitle.length
  const subtitleCharacterLimit = 160

  useEffect(() => {
    if (initialCard) {
      setCardData({
        image: initialCard.image || '',
        title: initialCard.title || '',
        subtitle: initialCard.subtitle || '',
        link: initialCard.link || '',
        buttonAction: initialCard.buttonAction || undefined,
        buttonTitle: initialCard.buttonTitle || ''
      })
      setLinkDraft(initialCard.link || '')
      setShowLinkSection(!!initialCard.link && initialCard.buttonAction === 'website')
    }
  }, [initialCard])

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('beforeunload', preventReload)
    }
  }, [])

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCardData(prev => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleRemoveImage = () => {
    setCardData(prev => ({ ...prev, image: '' }))
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    if (title.length <= titleCharacterLimit) {
      setCardData(prev => ({ ...prev, title }))
    }
  }

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const subtitle = e.target.value
    if (subtitle.length <= subtitleCharacterLimit) {
      setCardData(prev => ({ ...prev, subtitle }))
    }
  }

  const handleSave = async () => {
    if (cardData.title.trim() || cardData.subtitle.trim()) {
      try {
        onClose()
        showToast('loading', 'Saving card', true)
        window.addEventListener('beforeunload', preventReload)

        await onSave(cardData)

        window.removeEventListener('beforeunload', preventReload)
        showToast('success', 'Card saved', true)
      } catch (error) {
        window.removeEventListener('beforeunload', preventReload)
        console.error('Error saving card:', error)
        showToast('error', 'Failed to save card', true)
      }
    }
  }

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const insertEmojiInTitle = (emoji: string) => {
    if (titleInputRef.current) {
      const start = titleInputRef.current.selectionStart || 0
      const end = titleInputRef.current.selectionEnd || 0
      const newText = cardData.title.substring(0, start) + emoji + cardData.title.substring(end)
      
      if (newText.length <= titleCharacterLimit) {
        setCardData(prev => ({ ...prev, title: newText }))
        // Set cursor position after emoji
        setTimeout(() => {
          if (titleInputRef.current) {
            titleInputRef.current.selectionStart = titleInputRef.current.selectionEnd = start + emoji.length
            titleInputRef.current.focus()
          }
        }, 0)
      }
    }
  }

  const insertEmojiInSubtitle = (emoji: string) => {
    if (subtitleTextareaRef.current) {
      const start = subtitleTextareaRef.current.selectionStart || 0
      const end = subtitleTextareaRef.current.selectionEnd || 0
      const newText = cardData.subtitle.substring(0, start) + emoji + cardData.subtitle.substring(end)
      
      if (newText.length <= subtitleCharacterLimit) {
        setCardData(prev => ({ ...prev, subtitle: newText }))
        // Set cursor position after emoji
        setTimeout(() => {
          if (subtitleTextareaRef.current) {
            subtitleTextareaRef.current.selectionStart = subtitleTextareaRef.current.selectionEnd = start + emoji.length
            subtitleTextareaRef.current.focus()
          }
        }, 0)
      }
    }
  }

  const handleButtonActionSelect = (actionType: 'message' | 'ai' | 'website') => {
    setCardData(prev => ({ ...prev, buttonAction: actionType }))
    
    // If website is selected, open the website config modal
    if (actionType === 'website') {
      setIsButtonActionModalOpen(false)
      setIsWebsiteConfigModalOpen(true)
    } else {
      // Clear link and button title for non-website actions
      setCardData(prev => ({ ...prev, link: '', buttonTitle: '' }))
      setShowLinkSection(false)
      setIsButtonActionModalOpen(false)
    }
  }

  const handleWebsiteConfigSave = (data: { title: string; url: string }) => {
    setCardData(prev => ({ 
      ...prev, 
      buttonTitle: data.title,
      link: data.url 
    }))
    setIsWebsiteConfigModalOpen(false)
  }

  const handleWebsiteConfigClose = () => {
    setIsWebsiteConfigModalOpen(false)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <div className={styles.dialogOverlay} />
        <DialogContent 
          ref={dialogRef}
          onClick={handleDialogClick}
          className={cn(
            styles.dialogContent,
            (isButtonActionModalOpen || isWebsiteConfigModalOpen) && styles.shifted,
            'sm:max-w-[520px] p-0 gap-0',
            'bg-white/80',
            'backdrop-blur-3xl',
            'border border-white/20',
            'shadow-[0_8px_60px_-12px_rgba(0,0,0,0.12)]',
            'sm:!rounded-[28px]',
            '[&>button]:hidden overflow-hidden',
            '[&_.radix-dialog-content]:!rounded-[28px]',
            '[&_.radix-dialog-overlay]:!rounded-[28px]',
            '[&>div]:!rounded-[28px]',
            '[&>*>*]:!rounded-[28px]',
            'ring-1 ring-black/[0.03]'
          )}
        >
          <DialogHeader className={cn(
            styles.dialogHeader,
            "p-6 pb-3 bg-gradient-to-b from-white/40 via-white/20 to-transparent",
          )}>
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-xl font-semibold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent font-hubot">
                  Configure Card
                </DialogTitle>
                <DialogDescription className="text-[14px] text-gray-600 mt-1.5 leading-relaxed font-mona">
                  Create an interactive card with image, title, subtitle, and optional button
                </DialogDescription>
              </div>
              <DialogClose 
                className="relative -mr-2 p-2 hover:bg-gray-900/5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Close dialog"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              >
                <X className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors" />
              </DialogClose>
            </div>
          </DialogHeader>

          <div className={styles.dialogBody}>
            {/* Image Upload Section */}
            <div className={styles.section}>
              <div
                className={cn(
                  styles.imageUploadArea,
                  isDragOver && styles.dragOver,
                  cardData.image && styles.hasImage
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !cardData.image && fileInputRef.current?.click()}
              >
                {cardData.image ? (
                  <div className={styles.imagePreview}>
                    <img src={cardData.image} alt="Card preview" className={styles.previewImage} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage()
                      }}
                      className={styles.removeImageButton}
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <Upload className={styles.uploadIcon} />
                    <p className={styles.uploadText}>Select / Drop an Image</p>
                    <p className={styles.uploadSubtext}>PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title Input Field */}
            <div className={styles.section}>
              <div className={styles.inputContainer}>
                <label htmlFor="card-title" className={styles.inputLabel}>
                  Title
                </label>
                <div className={styles.titleInputContainer}>
                  <input
                    id="card-title"
                    ref={titleInputRef}
                    type="text"
                    className={styles.titleInput}
                    value={cardData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter card title..."
                    aria-label="Card title"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <div className={styles.inputFooter}>
                    <div className={styles.characterCount}>
                      {titleCharacterCount} / {titleCharacterLimit}
                    </div>
                    <div className={styles.emojiContainer}>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInTitle('😀')}
                        title="Add happy emoji to title"
                      >
                        😀
                      </button>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInTitle('❤️')}
                        title="Add heart emoji to title"
                      >
                        ❤️
                      </button>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInTitle('👍')}
                        title="Add thumbs up emoji to title"
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInTitle('🎉')}
                        title="Add party emoji to title"
                      >
                        🎉
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtitle Input Field */}
            <div className={styles.section}>
              <div className={styles.inputContainer}>
                <label htmlFor="card-subtitle" className={styles.inputLabel}>
                  Subtitle
                </label>
                <div className={styles.subtitleInputContainer}>
                  <textarea
                    id="card-subtitle"
                    ref={subtitleTextareaRef}
                    className={styles.subtitleTextarea}
                    value={cardData.subtitle}
                    onChange={handleSubtitleChange}
                    placeholder="Enter card subtitle..."
                    aria-label="Card subtitle"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    rows={3}
                  />
                  <div className={styles.inputFooter}>
                    <div className={styles.characterCount}>
                      {subtitleCharacterCount} / {subtitleCharacterLimit}
                    </div>
                    <div className={styles.emojiContainer}>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInSubtitle('😀')}
                        title="Add happy emoji to subtitle"
                      >
                        😀
                      </button>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInSubtitle('❤️')}
                        title="Add heart emoji to subtitle"
                      >
                        ❤️
                      </button>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInSubtitle('👍')}
                        title="Add thumbs up emoji to subtitle"
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => insertEmojiInSubtitle('🎉')}
                        title="Add party emoji to subtitle"
                      >
                        🎉
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Button Section */}
            <div className={styles.section}>
              {!showLinkSection ? (
                <button
                  type="button"
                  className={styles.addLinkButton}
                  onClick={() => setIsButtonActionModalOpen(true)}
                >
                  <Link className="h-4 w-4" />
                  {cardData.buttonAction ? 
                    (cardData.buttonTitle ? cardData.buttonTitle : 'Edit Button') : 
                    'Add Button'
                  }
                </button>
              ) : (
                <div className={styles.linkSection}>
                  <label htmlFor="card-link" className={styles.inputLabel}>Button URL</label>
                  <input
                    id="card-link"
                    type="url"
                    className={styles.linkInput}
                    value={linkDraft}
                    onChange={(e) => setLinkDraft(e.target.value)}
                    placeholder="https://example.com"
                    aria-label="Card button URL"
                  />
                  <div className={styles.linkActions}>
                    <button
                      type="button"
                      className={styles.cancelLinkButton}
                      onClick={() => setShowLinkSection(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={styles.saveLinkButton}
                      onClick={() => {
                        setCardData(prev => ({ ...prev, link: linkDraft.trim() }))
                        setShowLinkSection(false)
                      }}
                      disabled={!linkDraft.trim()}
                    >
                      Add Button
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave()
                }}
                type="button"
                disabled={!cardData.title.trim() && !cardData.subtitle.trim()}
              >
                Save Card
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ButtonActionModal
        isOpen={isButtonActionModalOpen}
        onClose={() => setIsButtonActionModalOpen(false)}
        onSelect={handleButtonActionSelect}
      />
      
      <WebsiteConfigModal
        isOpen={isWebsiteConfigModalOpen}
        onClose={handleWebsiteConfigClose}
        onSave={handleWebsiteConfigSave}
        initialData={{
          title: cardData.buttonTitle || '',
          url: cardData.link || ''
        }}
      />
    </>
  )
}