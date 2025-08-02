'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Pencil, Sparkles, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReplyMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (messages: string | string[]) => void
  initialMessage?: string
}

const DEFAULT_REPLIES = [
  {
    id: '1',
    message: 'Link delivered, check your DMs 📬',
  },
  {
    id: '2',
    message: 'Sent the secret, check messages 💭',
  },
  {
    id: '3',
    message: 'Info delivered! Review your inbox ⭐',
  },
]

export function ReplyMessageModal({
  isOpen,
  onClose,
  onSave,
  initialMessage = ''
}: ReplyMessageModalProps) {
  const [predefinedReplies, setPredefinedReplies] = useState(DEFAULT_REPLIES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showNewReplyOptions, setShowNewReplyOptions] = useState(false)
  const [isManualInput, setIsManualInput] = useState(false)
  const [newReplyText, setNewReplyText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSection, setSelectedSection] = useState<'yes' | 'no' | null>(null)

  // Initialize modal state based on initialMessage when modal opens
  React.useEffect(() => {
    if (isOpen && initialMessage) {
      if (initialMessage === 'no') {
        // "No" option was previously selected
        setSelectedSection('no')
        setPredefinedReplies(DEFAULT_REPLIES) // Reset to defaults since no custom messages
      } else if (initialMessage.includes(' | ')) {
        // Multiple messages were previously selected
        setSelectedSection('yes')
        const savedMessages = initialMessage.split(' | ')
        const restoredReplies = savedMessages.map((message, index) => ({
          id: `restored-${index}`,
          message: message.trim()
        }))
        setPredefinedReplies(restoredReplies)
      } else if (initialMessage.trim()) {
        // Single message was previously selected
        setSelectedSection('yes')
        setPredefinedReplies([{
          id: 'restored-0',
          message: initialMessage.trim()
        }])
      } else {
        // No previous selection, show defaults
        setSelectedSection(null)
        setPredefinedReplies(DEFAULT_REPLIES)
      }
    } else if (isOpen && !initialMessage) {
      // Fresh modal opening, reset to defaults
      setSelectedSection(null)
      setPredefinedReplies(DEFAULT_REPLIES)
    }
  }, [isOpen, initialMessage])

  // Handle Escape key press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSelectYesSection = () => {
    const allMessages = predefinedReplies.map(reply => reply.message)
    setSelectedSection('yes')
    onSave(allMessages)
    onClose()
  }

  const handleSelectNoSection = () => {
    setSelectedSection('no')
    onSave('no')
    onClose()
  }

  const handleEdit = (id: string, message: string) => {
    setEditingId(id)
    setEditValue(message)
  }

  const handleSaveEdit = (id: string) => {
    setPredefinedReplies(prev => 
      prev.map(reply => 
        reply.id === id ? { ...reply, message: editValue } : reply
      )
    )
    setEditingId(null)
    setEditValue('')
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
    setEditValue('')
  }

  const handleNewReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNewReplyOptions(true)
  }

  const handleManualInput = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsManualInput(true)
    setShowNewReplyOptions(false)
  }

  const handleGenerateWithAI = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Generate a short, engaging social media reply notifying the user that their requested details have been sent via direct message. Ensure the response is concise, friendly, and varied in phrasing while including a clear call to action and a relevant emoji. Avoid repetitive wording across different responses.',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI response')
      }

      const data = await response.json()
      const newReply = {
        id: `reply-${Date.now()}`,
        message: data.message
      }
      setPredefinedReplies(prev => [...prev, newReply])
      setShowNewReplyOptions(false)
    } catch (error) {
      console.error('Error generating AI response:', error)
      // You might want to show a toast notification here
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveManualInput = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (newReplyText.trim()) {
      const newReply = {
        id: `reply-${Date.now()}`,
        message: newReplyText.trim()
      }
      setPredefinedReplies(prev => [...prev, newReply])
      setNewReplyText('')
      setIsManualInput(false)
    }
  }

  // Reset states when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowNewReplyOptions(false)
      setIsManualInput(false)
      setNewReplyText('')
      setIsGenerating(false)
      setSelectedSection(null)
      setEditingId(null)
      setEditValue('')
    }
  }, [isOpen])

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent 
        className={cn(
          'sm:max-w-[520px] p-0 gap-0',
          'bg-white/95 backdrop-blur-xl',
          'border border-purple-200/60',
          'shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)]',
          'ring-1 ring-purple-900/[0.05]',
          'sm:!rounded-[2rem]',
          '[&>button]:hidden overflow-hidden'
        )}
      >
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
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", damping: 20 }}
            className="p-8 pb-6"
          >
            <div className="flex justify-between items-start w-full">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-purple-900 mb-2 tracking-tight bg-gradient-to-br from-purple-900 to-purple-600 bg-clip-text text-transparent pr-2 font-hubot">
                  Would you like to set up Public Reply in the feed?
                </DialogTitle>
              </div>
            </div>
          </motion.div>

          {/* Body */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", damping: 20 }}
            className="px-8 pb-8 space-y-4"
          >
            {/* Yes, random multiple replies */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, type: "spring", damping: 20 }}
            >
              <Card
                className={cn(
                  'group relative flex flex-col gap-4 p-6',
                  'cursor-pointer',
                  'bg-white/40 backdrop-blur-sm',
                  'hover:bg-white/70',
                  'border border-purple-200/60',
                  'rounded-[1.5rem]',
                  'hover:shadow-[0_16px_32px_rgba(139,92,246,0.12)]',
                  'hover:-translate-y-[2px]',
                  'hover:border-purple-400/60',
                  'transition-all duration-300 ease-out',
                  selectedSection === 'yes' && 'ring-2 ring-purple-500 bg-white/70'
                )}
                onClick={handleSelectYesSection}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectYesSection()}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-purple-900">
                    Yes, random multiple replies
                  </h3>
                </div>
                
                {/* Scrollable container for replies */}
                <div className={cn(
                  "flex flex-col gap-3 transition-all duration-300",
                  predefinedReplies.length > 4 && "max-h-80 overflow-y-auto pr-2",
                  // Custom scrollbar styling for purple theme
                  "[&::-webkit-scrollbar]:w-2",
                  "[&::-webkit-scrollbar-track]:bg-purple-50/50",
                  "[&::-webkit-scrollbar-track]:rounded-full",
                  "[&::-webkit-scrollbar-thumb]:bg-purple-300/60",
                  "[&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-thumb:hover]:bg-purple-400/80",
                  "scrollbar-thin scrollbar-track-purple-50/50 scrollbar-thumb-purple-300/60"
                )}>
                  {predefinedReplies.map((reply, index) => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      className="relative p-3 bg-white/60 hover:bg-white/80 border border-purple-200/40 rounded-xl transition-all duration-200 group/reply"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {editingId === reply.id ? (
                        <div className="flex flex-col gap-3">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-white border-purple-300 focus:border-purple-500 focus:ring-purple-200 text-purple-900"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSaveEdit(reply.id)
                              }}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleCancelEdit(e)}
                              className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center gap-3">
                          <p className="flex-1 text-purple-800 font-medium font-mona">
                            {reply.message}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity duration-200">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(reply.id, reply.message)
                              }}
                              className="p-1.5 text-purple-500 hover:text-purple-700 bg-white/60 hover:bg-white rounded-lg transition-all duration-200"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setPredefinedReplies(prev => prev.filter(r => r.id !== reply.id))
                              }}
                              className="p-1.5 text-purple-500 hover:text-red-600 bg-white/60 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <X className="h-3.5 w-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isManualInput ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-3 bg-white/60 border border-purple-200/40 rounded-xl"
                      >
                        <div className="flex flex-col gap-3">
                          <Input
                            value={newReplyText}
                            onChange={(e) => setNewReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="bg-white border-purple-300 focus:border-purple-500 focus:ring-purple-200 text-purple-900"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveManualInput}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                              disabled={!newReplyText.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsManualInput(false)
                                setShowNewReplyOptions(false)
                              }}
                              className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        className="p-3 bg-purple-50/50 border border-purple-200/40 rounded-xl cursor-pointer hover:bg-purple-100/50 transition-all duration-200"
                        onClick={handleNewReplyClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-purple-600 font-medium text-center">+ New Reply</p>
                      </motion.div>
                    </>
                  ) : showNewReplyOptions ? (
                    <>
                      <div className="p-4 bg-white/60 border border-purple-200/40 rounded-xl space-y-3">
                        <Button
                          onClick={handleGenerateWithAI}
                          className={cn(
                            'w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white',
                            isGenerating && 'opacity-70 cursor-not-allowed'
                          )}
                          disabled={isGenerating}
                        >
                          <Sparkles className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </Button>
                        <Button
                          onClick={handleManualInput}
                          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
                          variant="outline"
                        >
                          <Type className="h-4 w-4" />
                          Type manually
                        </Button>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      className="p-3 bg-purple-50/50 border border-purple-200/40 rounded-xl cursor-pointer hover:bg-purple-100/50 transition-all duration-200"
                      onClick={handleNewReplyClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="text-purple-600 font-medium text-center font-mona">+ New Reply</p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* No Option */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, type: "spring", damping: 20 }}
            >
              <Card
                className={cn(
                  'group relative flex flex-row items-center gap-4 py-4 px-6',
                  'cursor-pointer',
                  'bg-white/40 backdrop-blur-sm',
                  'hover:bg-white/70',
                  'border border-purple-200/60',
                  'rounded-[1.5rem]',
                  'hover:shadow-[0_16px_32px_rgba(139,92,246,0.12)]',
                  'hover:-translate-y-[2px]',
                  'hover:border-purple-400/60',
                  'transition-all duration-300 ease-out',
                  selectedSection === 'no' && 'ring-2 ring-purple-500 bg-white/70'
                )}
                onClick={handleSelectNoSection}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectNoSection()}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-900 transition-colors duration-200">
                    No
                  </h3>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 