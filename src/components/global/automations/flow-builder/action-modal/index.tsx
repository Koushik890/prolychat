'use client'

import React, { useEffect } from 'react'
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
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MessageDotsIcon } from '@/components/icons/message-dots-icon'
import { BotAddIcon } from '@/components/icons/bot-add-icon'
import styles from './action-modal.module.css'

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (actionId: string, action: 'MESSAGE' | 'PROLYAI', actionName: string, icon: React.ComponentType<any>) => void
}

export function ActionModal({ isOpen, onClose, onSelect }: ActionModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)

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

  const handleSelect = (action: 'MESSAGE' | 'PROLYAI') => {
    const actionId = `action-${Date.now()}`
    const actionName = action === 'MESSAGE' ? 'Send Message' : 'AI Assistant'
    const icon = action === 'MESSAGE' ? MessageDotsIcon : BotAddIcon
    onSelect(actionId, action, actionName, icon)
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
                Choose an Action
              </DialogTitle>
              <DialogDescription className="text-[14px] text-gray-600 mt-1.5 leading-relaxed font-mona">
                Select the type of action you want to perform
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
          "px-6 pb-6 space-y-2.5",
        )}>
          <Card
            className={cn(
              'group relative flex flex-row items-center gap-4 py-3.5 px-4',
              'cursor-pointer',
              'bg-white/40',
              'hover:bg-gradient-to-br hover:from-white hover:to-white/95',
              'border border-white/50',
              'rounded-[16px]',
              'hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)]',
              'hover:-translate-y-[2px]',
              'hover:border-purple-500/30',
              'transition-all duration-300 ease-out',
              'motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-2',
              'motion-reduce:transition-none'
            )}
            onClick={(e) => {
              e.stopPropagation()
              handleSelect('MESSAGE')
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleSelect('MESSAGE')
            }}
          >
            <div className={cn(
              'relative shrink-0 w-10 h-10',
              'bg-gradient-to-br from-purple-100 via-purple-50 to-white',
              'rounded-[14px]',
              'flex items-center justify-center',
              'shadow-sm transition-all duration-300 ease-out',
              'group-hover:shadow-md group-hover:shadow-purple-500/10',
              'group-hover:from-purple-200 group-hover:via-purple-100 group-hover:to-purple-50/80',
              'ring-1 ring-purple-900/[0.05]'
            )}>
              <MessageDotsIcon className="h-[18px] w-[18px] text-purple-600 group-hover:scale-110 transition-transform duration-300 ease-out" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 font-hubot">
                Send the user a message
              </h3>
              <p className="text-[13px] text-gray-600 group-hover:text-gray-700 transition-colors duration-200 mt-0.5 font-mona">
                Enter the message that you want to send the user
              </p>
            </div>
          </Card>

          <Card
            className={cn(
              'group relative flex flex-row items-center gap-4 py-3.5 px-4',
              'cursor-pointer',
              'bg-white/40',
              'hover:bg-gradient-to-br hover:from-white hover:to-white/95',
              'border border-white/50',
              'rounded-[16px]',
              'hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)]',
              'hover:-translate-y-[2px]',
              'hover:border-purple-500/30',
              'transition-all duration-300 ease-out',
              'motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-2',
              'motion-reduce:transition-none',
              'motion-safe:delay-[50ms]'
            )}
            onClick={(e) => {
              e.stopPropagation()
              handleSelect('PROLYAI')
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleSelect('PROLYAI')
            }}
          >
            <div className={cn(
              'relative shrink-0 w-10 h-10',
              'bg-gradient-to-br from-purple-100 via-purple-50 to-white',
              'rounded-[14px]',
              'flex items-center justify-center',
              'shadow-sm transition-all duration-300 ease-out',
              'group-hover:shadow-md group-hover:shadow-purple-500/10',
              'group-hover:from-purple-200 group-hover:via-purple-100 group-hover:to-purple-50/80',
              'ring-1 ring-purple-900/[0.05]'
            )}>
              <BotAddIcon className="h-[18px] w-[18px] text-purple-600 group-hover:scale-110 transition-transform duration-300 ease-out" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 font-hubot">
                Use Proly AI Assistant
              </h3>
              <p className="text-[13px] text-gray-600 group-hover:text-gray-700 transition-colors duration-200 mt-0.5 font-mona">
                Let Proly AI handle the conversation with smart responses
              </p>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}