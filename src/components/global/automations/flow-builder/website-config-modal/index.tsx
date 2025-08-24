'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './website-config-modal.module.css'

interface WebsiteConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; url: string }) => void
  initialData?: { title?: string; url?: string }
}

export function WebsiteConfigModal({ isOpen, onClose, onSave, initialData }: WebsiteConfigModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [url, setUrl] = useState(initialData?.url || '')
  const [urlError, setUrlError] = useState('')
  const dialogRef = React.useRef<HTMLDivElement>(null)

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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '')
      setUrl(initialData?.url || '')
      setUrlError('')
    }
  }, [isOpen, initialData])

  const validateUrl = (urlString: string) => {
    if (!urlString.trim()) {
      setUrlError('URL is required')
      return false
    }
    
    try {
      const url = new URL(urlString)
      if (!['http:', 'https:'].includes(url.protocol)) {
        setUrlError('URL must start with http:// or https://')
        return false
      }
      setUrlError('')
      return true
    } catch {
      setUrlError('Please enter a valid URL')
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    if (newUrl.trim() && urlError) {
      validateUrl(newUrl)
    }
  }

  const handleSave = () => {
    if (!title.trim()) {
      return
    }
    
    if (!validateUrl(url)) {
      return
    }

    onSave({ title: title.trim(), url: url.trim() })
    onClose()
  }

  const handleRemove = () => {
    setTitle('')
    setUrl('')
    setUrlError('')
    onSave({ title: '', url: '' })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const isFormValid = title.trim() && url.trim() && !urlError

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[60000] flex items-center justify-center p-6 sm:p-8"
      style={{ pointerEvents: 'auto', touchAction: 'none' }}
      onClick={handleBackdropClick}
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
        className="relative w-full max-w-[520px] outline-none"
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
                Edit Button
              </h2>
              <p className="text-[14px] text-gray-600 mt-1.5 leading-relaxed font-mona">
                Configure the button that will open a website
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
          className="px-6 pb-6 space-y-4"
        >
          {/* Button Title Field */}
          <div className={styles.fieldContainer}>
            <label htmlFor="button-title" className={`${styles.fieldLabel} font-mona`}>
              Button title
            </label>
            <input
              id="button-title"
              type="text"
              className={styles.textInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter button text..."
              aria-label="Button title"
            />
          </div>

          {/* Website URL Field */}
          <div className={styles.fieldContainer}>
            <label htmlFor="website-url" className={`${styles.fieldLabel} font-mona`}>
              Website URL
            </label>
            <div className={styles.urlInputContainer}>
              <div className={styles.urlInputWrapper}>
                <ExternalLink className={styles.urlIcon} />
                <input
                  id="website-url"
                  type="url"
                  className={cn(
                    styles.urlInput,
                    urlError && styles.urlInputError
                  )}
                  value={url}
                  onChange={handleUrlChange}
                  onBlur={() => url.trim() && validateUrl(url)}
                  placeholder="https://example.com"
                  aria-label="Website URL"
                />
              </div>
              {urlError && (
                <div className={`${styles.errorMessage} font-mona`}>
                  {urlError}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={`${styles.removeButton} font-mona`}
              onClick={handleRemove}
            >
              Remove
            </button>
            <button
              type="button"
              className={`${styles.doneButton} font-mona`}
              onClick={handleSave}
              disabled={!isFormValid}
            >
              Done
            </button>
          </div>
        </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  // Use portal to render outside any parent containers
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
} 