'use client'

import React, { useEffect, useState, useRef, useContext, createContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from "framer-motion"

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { X, ArrowUp, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/toast-context'

interface TextConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { text: string; buttonLabel?: string; url?: string; buttons?: Array<{ label: string; url: string }> }) => void
  initialText?: string
  initialButtonLabel?: string
  initialUrl?: string
  initialButtonEnabled?: boolean
  initialButtons?: Array<{ label?: string; url?: string }>
}

// Tooltip components
const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-lg border border-purple-200/60 bg-white/95 backdrop-blur-xl px-3 py-1.5 text-sm text-purple-700 font-mona shadow-[0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Prompt Input Context
type PromptInputContextType = {
  isLoading: boolean
  value: string
  setValue: (value: string) => void
  maxHeight: number | string
  onSubmit?: () => void
  disabled?: boolean
}

const PromptInputContext = createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
})

function usePromptInput() {
  const context = useContext(PromptInputContext)
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput")
  }
  return context
}

type PromptInputProps = {
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  maxHeight?: number | string
  onSubmit?: () => void
  children: React.ReactNode
  className?: string
}

function PromptInput({
  className,
  isLoading = false,
  maxHeight = 240,
  value,
  onValueChange,
  onSubmit,
  children,
}: PromptInputProps) {
  const [internalValue, setInternalValue] = useState(value || "")

  const handleChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TooltipProvider>
      <PromptInputContext.Provider
        value={{
          isLoading,
          value: value ?? internalValue,
          setValue: onValueChange ?? handleChange,
          maxHeight,
          onSubmit,
        }}
      >
        <div
          className={cn(
            "border-purple-200/60 bg-white/95 backdrop-blur-xl rounded-[1.75rem] border p-3 shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] transition-all duration-300 hover:shadow-[0_32px_64px_rgba(139,92,246,0.16),0_12px_24px_rgba(139,92,246,0.12)]",
            className
          )}
        >
          {children}
        </div>
      </PromptInputContext.Provider>
    </TooltipProvider>
  )
}

export type PromptInputTextareaProps = {
  disableAutosize?: boolean
} & React.ComponentProps<typeof Textarea>

function PromptInputTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  ...props
}: PromptInputTextareaProps) {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (disableAutosize) return

    if (!textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`
  }, [value, maxHeight, disableAutosize])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit?.()
    }
    onKeyDown?.(e)
  }

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn(
        "text-purple-900 placeholder:text-purple-400 font-mona min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      rows={1}
      disabled={disabled}
      {...props}
    />
  )
}

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>

function PromptInputActions({
  children,
  className,
  ...props
}: PromptInputActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
}

type PromptInputActionProps = {
  className?: string
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

function PromptInputAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: PromptInputActionProps) {
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild className={className}>
        <Slot>{children}</Slot>
      </TooltipTrigger>
      <TooltipContent side={side}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

// Prevent page reload function
const preventReload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = 'Changes you made may not be saved. Are you sure you want to leave?'
  return e.returnValue
}

type MessageButton = {
	id: string
	kind?: 'website'
	label?: string
	url?: string
}

export function TextConfigModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialText = '',
  initialButtonLabel,
  initialUrl,
  initialButtonEnabled,
  initialButtons = [],
}: TextConfigModalProps) {
  const [text, setText] = useState(initialText)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const [buttons, setButtons] = useState<MessageButton[]>([])
  const [optionsForId, setOptionsForId] = useState<string | null>(null)
  const [configForId, setConfigForId] = useState<string | null>(null)
  const [tempLabel, setTempLabel] = useState('')
  const [tempUrl, setTempUrl] = useState('')
  const genId = () => Math.random().toString(36).slice(2)

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  useEffect(() => {
    if (isOpen) {
      const initial: MessageButton[] = []
      if ((initialButtonEnabled || initialUrl) && (!initialButtons || initialButtons.length === 0)) {
        initial.push({ id: genId(), kind: 'website', label: initialButtonLabel || 'Open', url: initialUrl || '' })
      }
      // Include any additional initial buttons if provided
      if (initialButtons && Array.isArray(initialButtons)) {
        for (const b of initialButtons.slice(0, 3)) {
          if ((b.url || '').trim()) {
            initial.push({ id: genId(), kind: 'website', label: (b.label || 'Open'), url: (b.url || '') })
          }
        }
      }
      setButtons(initial)
    }
  }, [isOpen, initialButtonEnabled, initialButtonLabel, initialUrl, initialButtons])

  const handleClose = useCallback(() => {
    // Reset text to initial value when closing without saving
    setText(initialText)
    onClose()
  }, [initialText, onClose])

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
        e.preventDefault() // Prevent event from bubbling
        e.stopPropagation()
        handleClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape, { capture: true })
    }
    return () => {
      document.removeEventListener('keydown', handleEscape, { capture: true })
    }
  }, [isOpen, handleClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('beforeunload', preventReload)
    }
  }, [])

  const handleSave = async () => {
    if (text.trim()) {
      try {
        setIsLoading(true)
        
        // Show loading toast and prevent page reload
        showToast('loading', 'Saving message', true)
        window.addEventListener('beforeunload', preventReload)

        // Build buttons payload (up to 3 website buttons)
        const websiteButtons = buttons
          .filter(b => b.kind === 'website' && (b.url || '').trim())
          .slice(0, 3)
          .map(b => ({ label: (b.label || 'Open').trim(), url: (b.url || '').trim() }))

        // Call the save function with primary and extras
        if (websiteButtons.length > 0) {
          const [first, ...rest] = websiteButtons
          await onSave({ text, buttonLabel: first.label, url: first.url, buttons: [first, ...rest] })
        } else {
          await onSave({ text })
        }

        // Remove reload prevention and show success
        window.removeEventListener('beforeunload', preventReload)
        showToast('success', 'Message saved', true)
        
        // Close the modal after successful save
        onClose()
      } catch (error) {
        // Remove reload prevention on error
        window.removeEventListener('beforeunload', preventReload)
        console.error('Error saving message:', error)
        showToast('error', 'Failed to save message', true)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleValueChange = (value: string) => {
    setText(value)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[70000] flex items-center justify-center p-6 sm:p-8"
      style={{ pointerEvents: 'auto' }}
      onClick={handleBackdropClick}
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
        className="absolute inset-0 bg-black/20 cursor-pointer"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-full max-w-lg"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-purple-200/60 shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] p-8 sm:p-10 overflow-hidden" style={{ pointerEvents: 'auto' }}>
          {/* Subtle gradient overlay matching animated-menu */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-transparent to-purple-100/40 rounded-2xl pointer-events-none" />
          
          {/* Animated Background Effects */}
          <div className="absolute inset-0 opacity-20">
            {/* Floating Gradient Orbs */}
            <div className="absolute top-4 right-8 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-full blur-2xl animate-pulse" 
                 style={{ animationDuration: '4s', animationDelay: '0s' }} />
            <div className="absolute bottom-8 left-4 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-purple-500/15 rounded-full blur-xl animate-pulse" 
                 style={{ animationDuration: '6s', animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-purple-500/15 to-transparent rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '8s', animationDelay: '1s' }} />
          </div>
          
          {/* Content with relative positioning */}
          <div className="relative z-10">
            {/* Header - Clean Minimal */}
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", damping: 20 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-purple-900 mb-2 tracking-tight font-hubot">Configure Message</h2>
              <p className="text-purple-600 text-sm font-medium font-mona">Enter the message you want to send to the user</p>
            </motion.div>

            {/* Prompt Input */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring", damping: 20 }}
            >
              <PromptInput
                value={text}
                onValueChange={handleValueChange}
                isLoading={isLoading}
                onSubmit={handleSave}
                className="w-full relative overflow-hidden"
              >
                {/* Input Background Animation */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent transform -skew-x-12 animate-pulse" 
                       style={{ animationDuration: '3s', animationDelay: '1s' }} />
                </div>
                <PromptInputTextarea 
                  placeholder="Type your message here..." 
                  className="text-base leading-relaxed px-2 py-1 relative z-10"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                {/* Removed top-right circular save button; footer actions below */}
              </PromptInput>
            </motion.div>
				{/* Buttons Section */}
				<motion.div 
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.5, type: "spring", damping: 20 }}
					className="mt-6"
				>
					{/* Current buttons list */}
					{buttons.length > 0 && (
						<div className="mb-3 flex flex-col gap-2">
							{buttons.map((b) => (
								<div
									key={b.id}
									className="flex items-center justify-between rounded-xl border border-purple-200/60 bg-white/90 px-3 py-2 cursor-pointer"
									onClick={() => setOptionsForId(b.id)}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOptionsForId(b.id) } }}
									style={{ pointerEvents: 'auto' }}
								>
									<span className="text-sm font-mona text-purple-700">
										{b.label || 'Button'}
									</span>
									<button
										type="button"
										onClick={(e) => { e.stopPropagation(); setButtons(prev => prev.filter(x => x.id !== b.id)) }}
										className="text-xs font-mona text-red-600 hover:text-red-700"
										style={{ pointerEvents: 'auto' }}
										aria-label="Remove button"
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}

					{/* Add button (hidden at 3) */}
					{buttons.length < 3 && (
						<button
							type="button"
							onClick={() => setButtons(prev => [...prev, { id: genId() }])}
							className="w-full flex items-center justify-center rounded-xl border border-purple-200/60 bg-white/90 px-4 py-2.5 text-sm font-mona text-purple-700 transition-all duration-200 hover:bg-purple-50/70 hover:shadow-[0_6px_14px_rgba(139,92,246,0.10)]"
							style={{ pointerEvents: 'auto' }}
						>
							+ Add Button (optional)
						</button>
					)}
				</motion.div>

				{/* Options Modal */}
				{optionsForId && (
					<div className="fixed inset-0 z-[71000] flex items-center justify-center p-6" onClick={() => setOptionsForId(null)}>
						<div className="absolute inset-0 bg-black/30" />
						<div className="relative z-10 w-full max-w-sm rounded-2xl border border-purple-200/60 bg-white/95 p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
							<h3 className="text-sm font-semibold text-purple-900 mb-3 font-hubot">Choose Button Action</h3>
							<button
								type="button"
								className="w-full rounded-lg border border-purple-200/60 bg-white px-3 py-2 text-sm font-mona text-purple-700 hover:bg-purple-50"
								onClick={() => {
									setOptionsForId(null)
									setConfigForId(optionsForId)
									const btn = buttons.find(b => b.id === optionsForId)
									setTempLabel(btn?.label || 'Open')
									setTempUrl(btn?.url || '')
									// preset kind
									setButtons(prev => prev.map(x => x.id === optionsForId ? { ...x, kind: 'website' } : x))
								}}
							>
								Open Website
							</button>
						</div>
					</div>
				)}

				{/* Website Config Modal */}
				{configForId && (
					<div className="fixed inset-0 z-[72000] flex items-center justify-center p-6" onClick={() => setConfigForId(null)}>
						<div className="absolute inset-0 bg-black/30" />
						<div className="relative z-10 w-full max-w-md rounded-2xl border border-purple-200/60 bg-white/95 p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
							<h3 className="text-base font-semibold text-purple-900 mb-4 font-hubot">Website Button</h3>
							<div className="space-y-3">
								<div>
									<label className="block text-xs text-purple-700 mb-1 font-mona">Button label</label>
									<input
										type="text"
										maxLength={20}
										value={tempLabel}
										onChange={(e) => setTempLabel(e.target.value)}
										className="w-full rounded-md border border-purple-200/60 bg-white/90 px-3 py-2 text-sm text-purple-900 placeholder:text-purple-400 font-mona focus:outline-none focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="block text-xs text-purple-700 mb-1 font-mona">Website URL</label>
									<input
										type="url"
										value={tempUrl}
										onChange={(e) => setTempUrl(e.target.value)}
										placeholder="https://yourwebsite.com/path"
										className="w-full rounded-md border border-purple-200/60 bg-white/90 px-3 py-2 text-sm text-purple-900 placeholder:text-purple-400 font-mona focus:outline-none focus:ring-2 focus:ring-purple-500/30"
									/>
									<p className="mt-1 text-[11px] text-purple-600 font-mona">Starts with https://</p>
								</div>
							</div>
							<div className="mt-4 flex items-center justify-end gap-2">
								<button
									type="button"
									className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-mona text-gray-700 hover:bg-gray-50"
									onClick={() => setConfigForId(null)}
								>
									Cancel
								</button>
								<button
									type="button"
									className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-mona text-white hover:bg-purple-700"
									onClick={() => {
										setButtons(prev => prev.map(x => x.id === configForId ? { ...x, label: (tempLabel || 'Open'), url: tempUrl } : x))
										setConfigForId(null)
									}}
								>
									Save
								</button>
							</div>
						</div>
					</div>
				)}
            {/* Footer Actions */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-mona text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-mona text-white hover:bg-purple-700 disabled:opacity-60"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
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
