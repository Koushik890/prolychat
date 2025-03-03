'use client'

import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Hash, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import styles from './message-trigger.module.css'
import { KeywordConfigurationModal } from '../../keyword-configuration-modal'
import { BaseTriggerConfigProps, KeywordState, updateConfigurationStatus } from '../types'
import { useAutomationSync } from '@/hooks/use-automations'
import { useQueryAutomation } from '@/hooks/user-queries'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useToast } from '@/contexts/toast-context'

const MotionSheetContent = motion.create(SheetContent)

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

  const handleKeywordSave = async (newKeywords: KeywordState) => {
    try {
      showToast('loading', 'Saving keyword configuration', true)
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
      
      // Invalidate and refetch the automation data
      await queryClient.invalidateQueries({ queryKey: ['automation-info', automationId] })

      // Remove reload prevention and show success
      window.removeEventListener('beforeunload', preventReload)
      showToast('success', 'Keywords saved successfully', true)
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <MotionSheetContent 
        side="right" 
        className={styles.sidebar}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <button 
          type="button"
          onClick={onClose} 
          className={styles.closeButton}
          aria-label="Close sidebar"
        >
          <X className={styles.closeIcon} />
          <span className="sr-only">Close</span>
        </button>

        <SheetHeader className={styles.header}>
          <div className="pr-8">
            <SheetTitle className={styles.title}>Configure Instagram Message</SheetTitle>
            <p className={styles.subtitle}>Set up your message trigger settings</p>
          </div>
        </SheetHeader>

        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Keywords Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <Hash className={styles.sectionIcon} />
              KEYWORDS
            </h4>
            <div className={styles.sectionContent}>
              <Button
                variant="outline"
                className={styles.configButton}
                onClick={() => setIsKeywordModalOpen(true)}
              >
                <span className={styles.buttonText}>
                  {keywords.include.length > 0 
                    ? `${keywords.include.length} Keywords Configured` 
                    : 'Configure Keywords'}
                </span>
                <ChevronRight className={styles.buttonIcon} />
              </Button>
              {keywords.include.length > 0 && (
                <div className={styles.keywordsSummary}>
                  <div className={styles.keywordGroup}>
                    <div className={styles.keywordTags}>
                      {keywords.include.map((keyword) => (
                        <div key={keyword} className={styles.keywordTag}>
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <p className={styles.helperText}>
                Configure keywords to filter incoming messages
              </p>
            </div>
          </div>
        </motion.div>

        {/* Keyword Configuration Modal */}
        <KeywordConfigurationModal
          isOpen={isKeywordModalOpen}
          onClose={() => setIsKeywordModalOpen(false)}
          onSave={handleKeywordSave}
          initialKeywords={keywords}
        />
      </MotionSheetContent>
    </Sheet>
  )
} 