'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Upload, Image as ImageIcon, Link, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/toast-context'
import { ButtonActionModal } from '../button-action-modal'
import { WebsiteConfigModal } from '../website-config-modal'
import type { CardData } from '@/types/automation'
import styles from './card-config-modal.module.css'

interface CardConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cardData: CardData) => void
  initialCard?: CardData
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

  // Handle body scroll lock and interaction blocking when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      
      // Block all interactions behind modal
      document.body.style.pointerEvents = 'none'
      document.body.classList.add('modal-open')
      
      // Ensure sidebar and other UI elements are non-interactive
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement
      const infobar = document.querySelector('[data-infobar]') as HTMLElement
      const mainContent = document.querySelector('main') as HTMLElement
      
      if (sidebar) sidebar.style.pointerEvents = 'none'
      if (infobar) infobar.style.pointerEvents = 'none'  
      if (mainContent) mainContent.style.pointerEvents = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.pointerEvents = ''
      document.body.classList.remove('modal-open')
      
      // Restore sidebar and UI interactions
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement
      const infobar = document.querySelector('[data-infobar]') as HTMLElement
      const mainContent = document.querySelector('main') as HTMLElement
      
      if (sidebar) sidebar.style.pointerEvents = ''
      if (infobar) infobar.style.pointerEvents = ''
      if (mainContent) mainContent.style.pointerEvents = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.pointerEvents = ''
      document.body.classList.remove('modal-open')
      
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement
      const infobar = document.querySelector('[data-infobar]') as HTMLElement
      const mainContent = document.querySelector('main') as HTMLElement
      
      if (sidebar) sidebar.style.pointerEvents = ''
      if (infobar) infobar.style.pointerEvents = ''
      if (mainContent) mainContent.style.pointerEvents = ''
    }
  }, [isOpen])

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape, { capture: true })
    }
    return () => {
      document.removeEventListener('keydown', handleEscape, { capture: true })
    }
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

  if (!isOpen) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
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

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {createPortal(
        <div
          className="fixed inset-0 z-[60000] flex items-center justify-center p-6 sm:p-8"
          style={{ pointerEvents: 'auto', touchAction: 'none' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{
              opacity: 0,
              backdropFilter: "blur(0px)"
            }}
            animate={{
              opacity: 1,
              backdropFilter: "blur(8px)"
            }}
            exit={{
              opacity: 0,
              backdropFilter: "blur(0px)"
            }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute inset-0 bg-black/30 cursor-pointer"
            style={{
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
            onClick={onClose}
            onMouseDown={(e) => e.preventDefault()}
          />
          
          {/* Modal */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-2xl outline-none"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-purple-200/60 shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] overflow-hidden cursor-default">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-transparent to-purple-100/40 rounded-2xl pointer-events-none" />
              
              {/* Animated Background Effects */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-8 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-full blur-2xl animate-pulse" 
                     style={{ animationDuration: '4s', animationDelay: '0s' }} />
                <div className="absolute bottom-8 left-4 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-purple-500/15 rounded-full blur-xl animate-pulse" 
                     style={{ animationDuration: '6s', animationDelay: '2s' }} />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", damping: 20 }}
          className="p-6 pb-3 bg-gradient-to-b from-white/40 via-white/20 to-transparent"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-semibold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent font-hubot">
                Configure Card
              </h2>
              <p className="text-[14px] text-gray-600 mt-1.5 leading-relaxed font-mona">
                Create an interactive card with image, title, subtitle, and optional button
              </p>
            </div>
            <button 
              className="relative -mr-2 p-2 hover:bg-gray-900/5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Close dialog"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Body */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, type: "spring", damping: 20 }}
          className="p-8 sm:p-10"
        >

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
                <label htmlFor="card-title" className={`${styles.inputLabel} font-mona`}>
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
                    <div className={`${styles.characterCount} font-mona`}>
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
                <label htmlFor="card-subtitle" className={`${styles.inputLabel} font-mona`}>
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
                    <div className={`${styles.characterCount} font-mona`}>
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
          </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button
                className={`${styles.cancelButton} font-mona`}
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className={`${styles.saveButton} font-mona`}
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
        </motion.div>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
      
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