'use client'

import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Hash, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { KeywordConfigurationModal } from '../../keyword-configuration-modal'
import { BaseTriggerConfigProps, KeywordState, updateConfigurationStatus } from '../types'
import { useAutomationSync } from '@/hooks/use-automations'
import { useQueryAutomation } from '@/hooks/user-queries'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useToast } from '@/contexts/toast-context'
import { cn } from '@/lib/utils'

// const MotionSheetContent = motion.create(SheetContent) // Simplified for debugging

// Prevent page reload function
const preventReload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = 'Changes you made may not be saved. Are you sure you want to leave?'
  return e.returnValue
}

export function MessageTriggerConfig({
  isOpen,
  onClose,
  automationId,
  onTriggerConfig,
}: BaseTriggerConfigProps) {
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false)
  const [keywords, setKeywords] = useState<KeywordState>({ include: [] })
  const { saveChanges } = useAutomationSync(automationId)
  const { data: automationData } = useQueryAutomation(automationId)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Load existing configuration
  useEffect(() => {
    if (automationData?.data?.trigger) {
      const trigger = automationData.data.trigger.find(t => t.type === 'user-message')
      
      if (trigger && trigger.keywords && trigger.keywords.length > 0) {
        setKeywords({
          include: trigger.keywords.map(k => k.word)
        })
      }
    }
  }, [automationData?.data])

  const handleKeywordSave = async (newKeywords: KeywordState, options?: { isDeletion?: boolean }) => {
    try {
      // Only show toast if it's not a deletion (deletion has its own toast in modal)
      if (!options?.isDeletion) {
        showToast('loading', 'Saving keyword configuration', true)
      }
      // Add reload prevention
      window.addEventListener('beforeunload', preventReload)

      setKeywords(newKeywords)
      const config = {
        keywords: newKeywords,
        status: updateConfigurationStatus({
          keywords: newKeywords
        }, 'user-message')
      }

      // Save changes to database
      await saveChanges({
        trigger: [{
          type: 'user-message',
          config
        }]
      })

      // Update local state after successful save
      onTriggerConfig('user-message', config)
      
      // Removed redundant invalidation - saveChanges already handles this

      // Remove reload prevention and show success
      window.removeEventListener('beforeunload', preventReload)
      if (!options?.isDeletion) {
        showToast('success', 'Keywords saved successfully', true)
      }
    } catch (error) {
      // Remove reload prevention on error
      window.removeEventListener('beforeunload', preventReload)
      console.error('Error saving keyword configuration:', error)
      toast.error('Failed to save keyword configuration')
    }

    setIsKeywordModalOpen(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('beforeunload', preventReload)
    }
  }, [])

  return (
    <Sheet open={isOpen} modal={false} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        showCloseButton={false}
        side="right"
        className={cn(
          'p-6 w-[420px] top-0 h-screen flex flex-col overflow-hidden z-[60]',
          'bg-white border-gray-200 shadow-xl border-l'
        )}
        style={{ zIndex: 60 }}
        onOpenAutoFocus={(e) => { if (isKeywordModalOpen) e.preventDefault() }}
        onCloseAutoFocus={(e) => { if (isKeywordModalOpen) e.preventDefault() }}
        onInteractOutside={(e) => { if (isKeywordModalOpen) e.preventDefault() }}
      >
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded z-10"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
          <span className="sr-only font-mona">Close</span>
        </button>

        <SheetHeader className="mb-6">
          <div className="pr-8">
            <SheetTitle className="text-lg font-semibold font-hubot">Configure Direct Message</SheetTitle>
            <p className="text-sm text-gray-600 font-mona">Set up your message trigger settings</p>
          </div>
        </SheetHeader>

        <div 
          className="flex flex-col gap-8 flex-1 overflow-y-auto pr-6 -mr-6 scrollbar-hide relative z-10"
        >
          {/* Keywords Section */}
          <motion.div 
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2 font-hubot">
              <Hash className="w-4.5 h-4.5 text-gray-600" />
              KEYWORDS
            </h4>
            <div className="flex flex-col gap-3">
              <motion.div
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                whileTap={{ y: -1 }}
              >
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-between px-4 rounded-xl transition-all duration-200",
                    "bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-300",
                    "text-gray-600 hover:text-purple-700 group"
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsKeywordModalOpen(true)
                  }}
                >
                  <span className="text-sm font-medium font-mona">
                    {keywords.include.length > 0 
                      ? `${keywords.include.length} Keywords Configured` 
                      : 'Configure Keywords'}
                  </span>
                  <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </motion.div>
              {keywords.include.length > 0 && (
                <motion.div 
                  className={cn(
                    "p-4 rounded-xl",
                    "bg-white border border-gray-200"
                  )}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: 'spring', damping: 20 }}
                >
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider font-hubot">Keywords:</span>
                    <div className="flex flex-wrap gap-2">
                      {keywords.include.map((keyword, index) => (
                        <motion.div 
                          key={keyword} 
                          className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200 transition-all duration-200 font-mona"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {keyword}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <p className="text-xs text-gray-500 -mt-1 leading-relaxed font-mona">
                Configure keywords to filter incoming messages
              </p>
            </div>
          </motion.div>
        </div>

        {/* Keyword Configuration Modal */}
        <KeywordConfigurationModal
          isOpen={isKeywordModalOpen}
          onClose={() => setIsKeywordModalOpen(false)}
          onSave={handleKeywordSave}
          initialKeywords={keywords}
        />
      </SheetContent>
    </Sheet>
  )
} 