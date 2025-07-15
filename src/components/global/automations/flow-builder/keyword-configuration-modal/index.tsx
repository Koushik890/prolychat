'use client'

import React, { useState, KeyboardEvent, useEffect, useRef, useContext, createContext, useCallback } from 'react'
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Plus, ArrowUp, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/toast-context'

interface KeywordConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (keywords: { include: string[] }) => void
  initialKeywords?: { include: string[] }
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
      "z-50 overflow-hidden rounded-lg border border-purple-200/60 bg-white/95 backdrop-blur-xl px-3 py-1.5 text-sm text-purple-700 shadow-[0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Keyword Input Context
type KeywordInputContextType = {
  isLoading: boolean
  value: string
  setValue: (value: string) => void
  onSubmit?: () => void
  disabled?: boolean
}

const KeywordInputContext = createContext<KeywordInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  onSubmit: undefined,
  disabled: false,
})

function useKeywordInput() {
  const context = useContext(KeywordInputContext)
  if (!context) {
    throw new Error("useKeywordInput must be used within a KeywordInput")
  }
  return context
}

type KeywordInputProps = {
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  onSubmit?: () => void
  children: React.ReactNode
  className?: string
}

function KeywordInput({
  className,
  isLoading = false,
  value,
  onValueChange,
  onSubmit,
  children,
}: KeywordInputProps) {
  const [internalValue, setInternalValue] = useState(value || "")

  const handleChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TooltipProvider>
      <KeywordInputContext.Provider
        value={{
          isLoading,
          value: value ?? internalValue,
          setValue: onValueChange ?? handleChange,
          onSubmit,
        }}
      >
        <div
          className={cn(
            "border-purple-200/60 bg-white/95 backdrop-blur-xl rounded-[2rem] border p-3 shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] transition-all duration-300 hover:shadow-[0_32px_64px_rgba(139,92,246,0.16),0_12px_24px_rgba(139,92,246,0.12)]",
            className
          )}
        >
          {children}
        </div>
      </KeywordInputContext.Provider>
    </TooltipProvider>
  )
}

export type KeywordInputInputProps = React.ComponentProps<typeof Input>

function KeywordInputInput({
  className,
  onKeyDown,
  ...props
}: KeywordInputInputProps) {
  const { value, setValue, onSubmit, disabled } = useKeywordInput()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit?.()
    }
    onKeyDown?.(e)
  }

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn(
        "text-purple-900 placeholder:text-purple-400 h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}

type KeywordInputActionsProps = React.HTMLAttributes<HTMLDivElement>

function KeywordInputActions({
  children,
  className,
  ...props
}: KeywordInputActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
}

type KeywordInputActionProps = {
  className?: string
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

function KeywordInputAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: KeywordInputActionProps) {
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

export function KeywordConfigurationModal({
  isOpen,
  onClose,
  onSave,
  initialKeywords = { include: [] }
}: KeywordConfigurationModalProps) {
  const [includeKeywords, setIncludeKeywords] = useState<string[]>(initialKeywords.include)
  const [includeInput, setIncludeInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const keywordsRef = useRef<string[]>([])
  const { showToast } = useToast()

  // Update state when initialKeywords changes
  useEffect(() => {
    setIncludeKeywords(initialKeywords.include)
    keywordsRef.current = initialKeywords.include
  }, [initialKeywords])

  const handleClose = useCallback(() => {
    // Reset keywords to initial value when closing without saving
    setIncludeKeywords(initialKeywords.include)
    keywordsRef.current = initialKeywords.include
    setIncludeInput('')
    onClose()
  }, [initialKeywords, onClose])

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: Event) => {
      const keyboardEvent = e as unknown as KeyboardEvent
      if (keyboardEvent.key === 'Escape' && isOpen) {
        keyboardEvent.preventDefault() // Prevent event from bubbling
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('beforeunload', preventReload)
    }
  }, [])

  const handleAddIncludeKeyword = useCallback(() => {
    if (includeInput.trim() && !keywordsRef.current.includes(includeInput.trim())) {
      const newKeywords = [...keywordsRef.current, includeInput.trim()]
      setIncludeKeywords(newKeywords)
      keywordsRef.current = newKeywords
      setIncludeInput('')
    }
  }, [includeInput])

  const handleRemoveIncludeKeyword = useCallback((keyword: string) => {
    const newKeywords = keywordsRef.current.filter(k => k !== keyword)
    setIncludeKeywords(newKeywords)
    keywordsRef.current = newKeywords
  }, [])

  const handleSave = async () => {
    if (keywordsRef.current.length > 0) {
      try {
        setIsLoading(true)
        
        // Show loading toast and prevent page reload
        showToast('loading', 'Saving keywords', true)
        window.addEventListener('beforeunload', preventReload)

        // Call the save function
        await onSave({ include: keywordsRef.current })

        // Remove reload prevention and show success
        window.removeEventListener('beforeunload', preventReload)
        showToast('success', 'Keywords saved', true)
        
        // Close the modal after successful save
        onClose()
      } catch (error) {
        // Remove reload prevention on error
        window.removeEventListener('beforeunload', preventReload)
        console.error('Error saving keywords:', error)
        showToast('error', 'Failed to save keywords', true)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleValueChange = (value: string) => {
    setIncludeInput(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 border-purple-200/60 bg-white/95 backdrop-blur-xl !rounded-[2rem] sm:!rounded-[2rem] shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle gradient overlay matching animated-menu */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-transparent to-purple-100/40 !rounded-[2rem] pointer-events-none" />
        
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
        <div className="relative z-10 p-8 sm:p-10">
          {/* Header - Clean Minimal */}
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', damping: 20 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold text-purple-900 mb-2 tracking-tight">Configure Keywords</h2>
            <p className="text-purple-600 text-sm font-medium">Set up keywords that will trigger your DM automation</p>
          </motion.div>

          {/* Keyword Input Section */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, type: 'spring', damping: 20 }}
            className="mb-6"
          >
            <KeywordInput
              value={includeInput}
              onValueChange={handleValueChange}
              isLoading={isLoading}
              onSubmit={handleAddIncludeKeyword}
              className="w-full relative overflow-hidden"
            >
              {/* Input Background Animation */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent transform -skew-x-12 animate-pulse" 
                     style={{ animationDuration: '3s', animationDelay: '1s' }} />
              </div>
              <KeywordInputInput 
                placeholder="Add a keyword..." 
                className="text-base leading-relaxed px-2 py-1 relative z-10"
              />
              <KeywordInputActions className="justify-end pt-3 relative z-10">
                <KeywordInputAction
                  tooltip={isLoading ? 'Adding keyword...' : 'Add keyword'}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  >
                    <Button
                      variant="default"
                      size="icon"
                      className="h-10 w-10 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 relative overflow-hidden bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={handleAddIncludeKeyword}
                      disabled={isLoading || !includeInput.trim()}
                    >
                      {/* Button Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <Plus className="size-5 transition-transform duration-200 group-hover:translate-y-[-1px]" />
                      </div>
                    </Button>
                  </motion.div>
                </KeywordInputAction>
              </KeywordInputActions>
            </KeywordInput>
          </motion.div>

          {/* Keywords List - Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, type: 'spring', damping: 20 }}
            className="mb-6"
          >
            <div className="border-purple-200/60 bg-white/95 backdrop-blur-xl rounded-[1.75rem] border p-3 shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] min-h-[60px] transition-all duration-300 hover:shadow-[0_32px_64px_rgba(139,92,246,0.16),0_12px_24px_rgba(139,92,246,0.12)]">
              <div className="flex flex-wrap gap-2">
                {includeKeywords.map((keyword) => (
                  <motion.div
                    key={keyword}
                    className="flex items-center gap-2 bg-purple-100/80 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:bg-purple-200/80 hover:scale-105"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveIncludeKeyword(keyword)}
                      className="flex items-center justify-center p-0.5 rounded-full text-purple-600 hover:bg-purple-200/60 transition-all duration-200 hover:scale-110"
                      aria-label={`Remove keyword ${keyword}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
                {includeKeywords.length === 0 && (
                  <div className="text-purple-400 text-sm italic py-4 text-center w-full">
                    No keywords added yet
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Helper Text */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, type: 'spring', damping: 20 }}
            className="mb-6 text-center"
          >
            <p className="text-purple-600 text-sm italic">
              Keywords are not case-sensitive, e.g. "Hello" and "hello" are recognized as the same.
            </p>
          </motion.div>

          {/* Save Button */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, type: 'spring', damping: 20 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <Button
                onClick={handleSave}
                disabled={includeKeywords.length === 0 || isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-[1.5rem] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {/* Button Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Square className="size-5 fill-current animate-pulse" />
                      Saving Keywords...
                    </>
                  ) : (
                    <>
                      <ArrowUp className="size-5 transition-transform duration-200 group-hover:translate-y-[-1px]" />
                      Save Keywords
                    </>
                  )}
                </div>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}