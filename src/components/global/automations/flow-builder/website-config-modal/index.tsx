'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from '@/components/ui/dialog'
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

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const isFormValid = title.trim() && url.trim() && !urlError

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogOverlay className={styles.dialogOverlay} />
      <DialogContent 
        ref={dialogRef}
        onClick={handleDialogClick}
        className={cn(
          styles.dialogContent,
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
                Edit Button
              </DialogTitle>
              <DialogDescription className="text-[14px] text-gray-600 mt-1.5 leading-relaxed font-mona">
                Configure the button that will open a website
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

        <div className={cn(
          styles.dialogBody,
          "px-6 pb-6 space-y-4",
        )}>
          {/* Button Title Field */}
          <div className={styles.fieldContainer}>
            <label htmlFor="button-title" className={styles.fieldLabel}>
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
            <label htmlFor="website-url" className={styles.fieldLabel}>
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
                <div className={styles.errorMessage}>
                  {urlError}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemove}
            >
              Remove
            </button>
            <button
              type="button"
              className={styles.doneButton}
              onClick={handleSave}
              disabled={!isFormValid}
            >
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 