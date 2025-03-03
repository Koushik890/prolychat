'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './text-config-modal.module.css'
import { useToast } from '@/contexts/toast-context'

interface TextConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (text: string) => void
  initialText?: string
}

// Prevent page reload function
const preventReload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = 'Changes you made may not be saved. Are you sure you want to leave?'
  return e.returnValue
}

export function TextConfigModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialText = ''
}: TextConfigModalProps) {
  const [text, setText] = useState(initialText)
  const { showToast } = useToast()
  const dialogRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault() // Prevent event from bubbling
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

  const handleSave = async () => {
    if (text.trim()) {
      try {
        // Close the modal immediately
        onClose()
        
        // Show loading toast and prevent page reload
        showToast('loading', 'Saving message', true)
        window.addEventListener('beforeunload', preventReload)

        // Add a small delay to simulate saving
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Call the save function
        await onSave(text)

        // Remove reload prevention and show success
        window.removeEventListener('beforeunload', preventReload)
        showToast('success', 'Message saved', true)
      } catch (error) {
        // Remove reload prevention on error
        window.removeEventListener('beforeunload', preventReload)
        console.error('Error saving message:', error)
        showToast('loading', 'Failed to save message', true)
      }
    }
  }

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent click from reaching parent elements
  }

  return (
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
              <DialogTitle className="text-xl font-semibold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Configure Message
              </DialogTitle>
              <DialogDescription className="text-[14px] text-gray-600 mt-1.5 leading-relaxed">
                Enter the message you want to send to the user
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
          <textarea
            className={styles.textArea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            aria-label="Message text"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
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
              disabled={!text.trim()}
            >
              Save Message
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 