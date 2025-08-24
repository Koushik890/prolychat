'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MessageDotsIcon } from '@/components/icons/message-dots-icon'
import { BotAddIcon } from '@/components/icons/bot-add-icon'

interface ButtonActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (actionType: 'message' | 'ai' | 'website') => void
}

export function ButtonActionModal({ isOpen, onClose, onSelect }: ButtonActionModalProps) {
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

  const handleSelect = (actionType: 'message' | 'ai' | 'website') => {
    onSelect(actionType)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

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
                Choose Button Action
              </h2>
              <p className="text-[14px] text-gray-600 mt-1.5 leading-relaxed font-mona">
                Select what happens when users click the button on your card
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
          className="px-6 pb-6 space-y-2.5"
        >
          {/* Send Message Option */}
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
              handleSelect('message')
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleSelect('message')
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
                Button will send a direct message to the user
              </p>
            </div>
          </Card>

          {/* AI Assistant Option */}
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
              handleSelect('ai')
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleSelect('ai')
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
                Let AI handle the user interaction automatically
              </p>
            </div>
          </Card>

          {/* Open Website Option */}
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
              'motion-safe:delay-[100ms]'
            )}
            onClick={(e) => {
              e.stopPropagation()
              handleSelect('website')
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleSelect('website')
            }}
          >
            <div className={cn(
              'relative shrink-0 w-10 h-10',
              'bg-gradient-to-br from-blue-100 via-blue-50 to-white',
              'rounded-[14px]',
              'flex items-center justify-center',
              'shadow-sm transition-all duration-300 ease-out',
              'group-hover:shadow-md group-hover:shadow-blue-500/10',
              'group-hover:from-blue-200 group-hover:via-blue-100 group-hover:to-blue-50/80',
              'ring-1 ring-blue-900/[0.05]'
            )}>
              <ExternalLink className="h-[18px] w-[18px] text-blue-600 group-hover:scale-110 transition-transform duration-300 ease-out" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 font-hubot">
                Open website
              </h3>
              <p className="text-[13px] text-gray-600 group-hover:text-gray-700 transition-colors duration-200 mt-0.5 font-mona">
                Button will open the specified URL in a new tab
              </p>
            </div>
          </Card>
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