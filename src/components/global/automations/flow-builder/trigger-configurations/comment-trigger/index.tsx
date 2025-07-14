'use client'

import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Instagram, Hash, MessageSquare, ChevronRight, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SIDEBAR_ANIMATIONS, PURPLE_THEME, CLOSE_BUTTON_STYLES, HEADER_STYLES } from '../../shared/animation-patterns'
import { cn } from '@/lib/utils'
import { PostSelectionModal } from '../../post-selection-modal'
import { KeywordConfigurationModal } from '../../keyword-configuration-modal'
import { ReplyMessageModal } from '../../reply-message-modal'
import { BlurImage } from '@/components/ui/blur-image'
import { InstagramPostProps } from '@/types/posts.type'
import { useAutomationSync } from '@/hooks/use-automations'
import { useQueryAutomation } from '@/hooks/user-queries'
import { BaseTriggerConfigProps, KeywordState, TriggerConfig, updateConfigurationStatus } from '../types'
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

export function CommentTriggerConfig({
  isOpen,
  onClose,
  automationId,
  onTriggerConfig,
}: BaseTriggerConfigProps) {
  const [isPostSelectionModalOpen, setIsPostSelectionModalOpen] = useState(false)
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false)
  const [isReplyMessageModalOpen, setIsReplyMessageModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<InstagramPostProps | null>(null)
  const [keywords, setKeywords] = useState<KeywordState>({ include: [] })
  const [replyMessage, setReplyMessage] = useState('')
  
  const { saveChanges } = useAutomationSync(automationId)
  const { data: automationData } = useQueryAutomation(automationId)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Load existing configuration
  useEffect(() => {
    if (automationData?.data?.trigger) {
      const trigger = automationData.data.trigger.find(t => t.type === 'post-comments')
      
      if (trigger) {
        // Handle posts
        if (trigger.posts && trigger.posts.length > 0) {
          const post = trigger.posts[0]
          setSelectedPost({
            id: post.postId,
            media_url: post.mediaUrl,
            media_type: post.mediaType,
            caption: post.caption || undefined
          } as InstagramPostProps)
        }
        
        // Handle keywords
        if (trigger.keywords && trigger.keywords.length > 0) {
          setKeywords({
            include: trigger.keywords.map(k => k.word)
          })
        }
        
        // Handle reply messages
        if (trigger.replyMessages && trigger.replyMessages.length > 0) {
          setReplyMessage(trigger.replyMessages.map(r => r.message).join(' | '))
        }
      }
    }
  }, [automationData?.data])

  const handlePostSelection = async (selection: { type: 'specific' | 'all' | 'next'; postId?: string }, post?: InstagramPostProps) => {
    if (selection.type === 'specific' && post) {
      try {
        showToast('loading', 'Saving post configuration', true)
        // Add reload prevention
        window.addEventListener('beforeunload', preventReload)
        
        setSelectedPost(post)
        const config: TriggerConfig = {
          type: 'specific',
          postId: post.id,
          mediaUrl: post.media_url,
          keywords: keywords || { include: [] },
          replyMessages: replyMessage ? [replyMessage] : [],
          status: updateConfigurationStatus({
            type: 'specific',
            postId: post.id,
            mediaUrl: post.media_url,
            keywords: keywords || { include: [] },
            replyMessages: replyMessage ? [replyMessage] : []
          }),
          posts: [{
            postId: post.id,
            mediaType: post.media_type,
            mediaUrl: post.media_url,
            caption: post.caption || null
          }]
        }
        
        await saveChanges({
          trigger: [{
            type: 'post-comments',
            config
          }]
        })
        
        onTriggerConfig('post-comments', config)
        
        // Skip expensive refetch for instant UI response
        // await queryClient.invalidateQueries({ queryKey: ['automation-info', automationId] })
        
        // Remove reload prevention and show success
        window.removeEventListener('beforeunload', preventReload)
        showToast('success', 'Post configuration saved', true)
      } catch (error) {
        // Remove reload prevention on error
        window.removeEventListener('beforeunload', preventReload)
        console.error('Error saving post configuration:', error)
        toast.error('Failed to save post configuration')
      }
    }
    setIsPostSelectionModalOpen(false)
  }

  const handleKeywordSave = async (newKeywords: KeywordState) => {
    try {
      showToast('loading', 'Saving keyword configuration', true)
      // Add reload prevention
      window.addEventListener('beforeunload', preventReload)
      
      setKeywords(newKeywords)
      const config: TriggerConfig = {
        type: selectedPost ? 'specific' : 'all',
        postId: selectedPost?.id,
        mediaUrl: selectedPost?.media_url,
        keywords: newKeywords,
        replyMessages: replyMessage ? [replyMessage] : [],
        status: updateConfigurationStatus({
          type: selectedPost ? 'specific' : 'all',
          postId: selectedPost?.id,
          mediaUrl: selectedPost?.media_url,
          keywords: newKeywords,
          replyMessages: replyMessage ? [replyMessage] : []
        }),
        ...(selectedPost && {
          posts: [{
            postId: selectedPost.id,
            mediaType: selectedPost.media_type,
            mediaUrl: selectedPost.media_url,
            caption: selectedPost.caption || null
          }]
        })
      }

      await saveChanges({
        trigger: [{
          type: 'post-comments',
          config
        }]
      })

      onTriggerConfig('post-comments', config)
      // Removed redundant invalidation - saveChanges already handles this
      
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

  const handleReplyMessageSave = async (messages: string | string[]) => {
    try {
      showToast('loading', 'Saving reply message', true)
      // Add reload prevention
      window.addEventListener('beforeunload', preventReload)
      
      const messageArray = Array.isArray(messages) ? messages : [messages]
      setReplyMessage(messageArray.join(' | '))
      const config: TriggerConfig = {
        type: selectedPost ? 'specific' : 'all',
        postId: selectedPost?.id,
        mediaUrl: selectedPost?.media_url,
        keywords,
        replyMessages: messageArray,
        status: updateConfigurationStatus({
          type: selectedPost ? 'specific' : 'all',
          postId: selectedPost?.id,
          mediaUrl: selectedPost?.media_url,
          keywords,
          replyMessages: messageArray
        }),
        ...(selectedPost && {
          posts: [{
            postId: selectedPost.id,
            mediaType: selectedPost.media_type,
            mediaUrl: selectedPost.media_url,
            caption: selectedPost.caption || null
          }]
        })
      }

      await saveChanges({
        trigger: [{
          type: 'post-comments',
          config
        }]
      })

      onTriggerConfig('post-comments', config)
      
      // Remove reload prevention and show success
      window.removeEventListener('beforeunload', preventReload)
      showToast('success', 'Reply message saved successfully', true)
    } catch (error) {
      // Remove reload prevention on error
      window.removeEventListener('beforeunload', preventReload)
      console.error('Error saving reply message configuration:', error)
      toast.error('Failed to save reply message configuration')
    }
    setIsReplyMessageModalOpen(false)
  }

  const handleRemoveSelectedPost = async () => {
    try {
      showToast('loading', 'Removing post configuration', true)
      // Add reload prevention
      window.addEventListener('beforeunload', preventReload)
      
      setSelectedPost(null)
      const config: TriggerConfig = {
        type: 'all',
        keywords,
        replyMessages: replyMessage ? [replyMessage] : [],
        status: updateConfigurationStatus({
          type: 'all',
          keywords,
          replyMessages: replyMessage ? [replyMessage] : []
        })
      }

      await saveChanges({
        trigger: [{
          type: 'post-comments',
          config
        }]
      })

      onTriggerConfig('post-comments', config)
      
      // Remove reload prevention and show success
      window.removeEventListener('beforeunload', preventReload)
      showToast('success', 'Post configuration removed', true)
    } catch (error) {
      // Remove reload prevention on error
      window.removeEventListener('beforeunload', preventReload)
      console.error('Error removing post configuration:', error)
      toast.error('Failed to remove post configuration')
    }
  }

  const handleKeywordRemove = (keywordToRemove: string) => {
    const updatedKeywords = {
      include: keywords.include.filter(keyword => keyword !== keywordToRemove)
    }
    setKeywords(updatedKeywords)
    
    // Update configuration
    const config: TriggerConfig = {
      type: selectedPost ? 'specific' : 'all',
      postId: selectedPost?.id,
      mediaUrl: selectedPost?.media_url,
      keywords: updatedKeywords,
      replyMessages: replyMessage ? [replyMessage] : [],
      status: updateConfigurationStatus({
        type: selectedPost ? 'specific' : 'all',
        postId: selectedPost?.id,
        mediaUrl: selectedPost?.media_url,
        keywords: updatedKeywords,
        replyMessages: replyMessage ? [replyMessage] : []
      }),
      ...(selectedPost && {
        posts: [{
          postId: selectedPost.id,
          mediaType: selectedPost.media_type,
          mediaUrl: selectedPost.media_url,
          caption: selectedPost.caption || null
        }]
      })
    }

    saveChanges({
      trigger: [{
        type: 'post-comments',
        config
      }]
    })

    onTriggerConfig('post-comments', config)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <MotionSheetContent 
          showCloseButton={false}
          side="right" 
          className={cn(
            "p-6 w-[420px] top-0 h-screen flex flex-col overflow-hidden",
            PURPLE_THEME.glassBackground,
            PURPLE_THEME.shadow,
            PURPLE_THEME.border,
            "border-l",
            // Force override shadcn defaults
            "!bg-white/95 !backdrop-blur-xl"
          )}
          {...SIDEBAR_ANIMATIONS.slideIn}
        >
          {/* Gradient overlay */}
          <div className={cn(
            "absolute inset-0 pointer-events-none rounded-l-2xl",
            PURPLE_THEME.gradientOverlay
          )} />
          
          <button 
            type="button"
            onClick={onClose} 
            className={cn(CLOSE_BUTTON_STYLES.base, "group")}
            aria-label="Close sidebar"
          >
            <X className={CLOSE_BUTTON_STYLES.icon} />
            <span className="sr-only">Close</span>
          </button>
          
          <SheetHeader className={HEADER_STYLES.container}>
            <div className="pr-8">
              <SheetTitle className={HEADER_STYLES.title}>Configure Post/Reel Comments</SheetTitle>
              <p className={HEADER_STYLES.subtitle}>Set up your comment trigger settings</p>
            </div>
          </SheetHeader>

          <motion.div 
            className="flex flex-col gap-8 flex-1 overflow-y-auto pr-6 -mr-6 scrollbar-hide relative z-10"
            {...SIDEBAR_ANIMATIONS.contentFadeIn}
          >
            {/* Post/Reel Selection Section */}
            <motion.div 
              className="flex flex-col gap-4"
              {...SIDEBAR_ANIMATIONS.staggeredItem(0)}
            >
              <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2">
                <Instagram className="w-4.5 h-4.5 text-gray-600" />
                WHICH POST OR REEL?
              </h4>
              <div className="flex flex-col gap-3">
                {selectedPost ? (
                  <motion.div 
                    className={cn(
                      "flex gap-4 p-4 rounded-xl transition-all duration-200",
                      PURPLE_THEME.glassBackground,
                      PURPLE_THEME.border,
                      "hover:shadow-lg hover:-translate-y-0.5"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    {...SIDEBAR_ANIMATIONS.scaleOnHover}
                  >
                    <div className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden">
                      <BlurImage
                        src={selectedPost.media_url}
                        alt={selectedPost.caption || 'Selected Instagram post'}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                      />
                      {selectedPost.media_type === 'VIDEO' && (
                        <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                          <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {selectedPost.media_type === 'VIDEO' ? 'Reel' : 'Post'}
                      </p>
                      {selectedPost.caption && (
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                          {selectedPost.caption.length > 60 
                            ? `${selectedPost.caption.slice(0, 60)}...` 
                            : selectedPost.caption}
                        </p>
                      )}
                      <div className="flex gap-2 mt-auto">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "text-xs h-8 px-3 transition-all duration-200",
                              PURPLE_THEME.button.base,
                              PURPLE_THEME.button.hover,
                              PURPLE_THEME.button.text
                            )}
                            onClick={() => setIsPostSelectionModalOpen(true)}
                          >
                            <Pencil className="h-3 w-3 mr-1.5" />
                            Change
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-200"
                            onClick={handleRemoveSelectedPost}
                          >
                            <X className="h-3 w-3 mr-1.5" />
                            Remove
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
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
                      onClick={() => setIsPostSelectionModalOpen(true)}
                    >
                      <span className="text-sm font-medium">Select Post or Reel</span>
                      <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </motion.div>
                )}
                <p className="text-xs text-gray-500 -mt-1 leading-relaxed">
                  Choose the post or reel you want to monitor
                </p>
              </div>
            </motion.div>

            {/* Keywords Section */}
            <motion.div 
              className="flex flex-col gap-4"
              {...SIDEBAR_ANIMATIONS.staggeredItem(1)}
            >
              <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2">
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
                    onClick={() => setIsKeywordModalOpen(true)}
                  >
                    <span className="text-sm font-medium">Configure Keywords</span>
                    <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </motion.div>
                <p className="text-xs text-gray-500 -mt-1 leading-relaxed">
                  Set up keywords that will trigger this automation
                </p>
                {(keywords.include.length > 0) && (
                  <motion.div 
                    className={cn(
                      "p-4 rounded-xl",
                      PURPLE_THEME.glassBackground,
                      PURPLE_THEME.border
                    )}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 20 }}
                  >
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Keywords:</span>
                      <div className="flex flex-wrap gap-2">
                        {keywords.include.map((keyword, index) => (
                          <motion.div 
                            key={keyword} 
                            className="group relative text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full border border-purple-200 transition-all duration-200 cursor-pointer"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {keyword}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleKeywordRemove(keyword)
                              }}
                              className="absolute right-0 top-0 bottom-0 px-2 hidden group-hover:flex items-center justify-center hover:bg-red-100 hover:text-red-600 rounded-r-full transition-colors"
                              aria-label={`Remove keyword ${keyword}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Reply Configuration Section */}
            <motion.div 
              className="flex flex-col gap-4"
              {...SIDEBAR_ANIMATIONS.staggeredItem(2)}
            >
              <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2">
                <MessageSquare className="w-4.5 h-4.5 text-gray-600" />
                AUTO REPLY
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
                    onClick={() => setIsReplyMessageModalOpen(true)}
                  >
                    <span className="text-sm font-medium">Configure Reply Message</span>
                    <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </motion.div>
                <p className="text-xs text-gray-500 -mt-1 leading-relaxed">
                  Set up the message you want to send in response
                </p>
                {replyMessage && (
                  <motion.div 
                    className={cn(
                      "p-4 rounded-xl",
                      PURPLE_THEME.glassBackground,
                      PURPLE_THEME.border
                    )}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 20 }}
                  >
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto scrollbar-hide">{replyMessage}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </MotionSheetContent>
      </Sheet>

      <PostSelectionModal
        isOpen={isPostSelectionModalOpen}
        onClose={() => setIsPostSelectionModalOpen(false)}
        onSelect={handlePostSelection}
        selectedPostId={selectedPost?.id}
      />

      <KeywordConfigurationModal
        isOpen={isKeywordModalOpen}
        onClose={() => setIsKeywordModalOpen(false)}
        onSave={handleKeywordSave}
        initialKeywords={keywords}
        key={JSON.stringify(keywords)}
      />

      <ReplyMessageModal
        isOpen={isReplyMessageModalOpen}
        onClose={() => setIsReplyMessageModalOpen(false)}
        onSave={handleReplyMessageSave}
        initialMessage={replyMessage}
      />
    </>
  )
} 