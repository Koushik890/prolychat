'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './view-prompt-modal.module.css'

interface ViewPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  prompt: string
}

export function ViewPromptModal({
  isOpen,
  onClose,
  onEdit,
  prompt
}: ViewPromptModalProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogOverlay className={styles.dialogOverlay} />
      <DialogContent 
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
                AI Assistant Prompt
              </DialogTitle>
              <DialogDescription className="text-[14px] text-gray-600 mt-1.5 leading-relaxed">
                					Review how Proly AI will respond to the user
              </DialogDescription>
            </div>
            <DialogClose 
              className="relative -mr-2 p-2 hover:bg-gray-900/5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors" />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className={cn(
          styles.dialogBody,
          "px-6 pb-6"
        )}>
          <div className={styles.promptContent}>
            <p className={styles.promptText}>{prompt}</p>
          </div>
          <div className={styles.footer}>
            <button
              className={styles.editButton}
              onClick={() => {
                onClose()
                onEdit()
              }}
              type="button"
            >
              Edit Prompt
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 