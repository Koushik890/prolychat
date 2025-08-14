'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Instagram, Hash, MessageSquare, ChevronRight, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SIDEBAR_ANIMATIONS, PURPLE_THEME, CLOSE_BUTTON_STYLES, HEADER_STYLES } from '../shared/animation-patterns'
import { cn } from '@/lib/utils'
import { PostSelectionModal } from '../post-selection-modal'
import { KeywordConfigurationModal } from '../keyword-configuration-modal'
import { ReplyMessageModal } from '../reply-message-modal'
import { BlurImage } from '@/components/ui/blur-image'
import { InstagramPostProps } from '@/types/posts.type'
import { useAutomationSync } from '@/hooks/use-automations'
import { useQueryAutomation } from '@/hooks/user-queries'
import { TriggerConfig, TriggerConfigurationStatus } from '@/types/automation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useToast } from '@/contexts/toast-context'

interface TriggerConfigurationSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedTrigger: {
    id: string
    name: string
    icon: React.ComponentType<any>
  } | null
  automationId: string
  onTriggerConfig?: (type: string, config: any) => void
}

interface TriggerData {
  id: string;
  type: string;
  config?: any;
  automationId: string | null;
}

interface KeywordState {
  include: string[]
}

const MotionSheetContent = motion.create(SheetContent)

const updateConfigurationStatus = (config: Partial<TriggerConfig>): TriggerConfigurationStatus => {
  // Check for post selection
  const hasPost = config.type === 'specific' && !!config.postId && !!config.mediaUrl

  // Check for keywords
  const hasKeywords = config.keywords?.include && config.keywords.include.length > 0

  // Check for reply messages
  const hasReplyMessages = config.replyMessages && config.replyMessages.length > 0

  // Return complete only if ALL configurations are present
  if (hasPost && hasKeywords && hasReplyMessages) {
    return 'complete'
  }

  // Return partial if ANY configuration is present
  if (hasPost || hasKeywords || hasReplyMessages) {
    return 'partial'
  }

  // Return unconfigured if NO configuration is present
  return 'unconfigured'
}

export const TriggerConfigurationSidebar: React.FC<TriggerConfigurationSidebarProps> = ({
  isOpen,
  onClose,
  selectedTrigger,
  automationId,
  onTriggerConfig
}) => {
  const { showToast, hideToast } = useToast()
  const [isPostSelectionModalOpen, setIsPostSelectionModalOpen] = useState(false)
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false)
  const [isReplyMessageModalOpen, setIsReplyMessageModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<InstagramPostProps | null>(null)
  const [keywords, setKeywords] = useState<KeywordState>({
    include: []
  })
  const [replyMessage, setReplyMessage] = useState('')
  const { saveChanges } = useAutomationSync(automationId)
  const { data: automationData } = useQueryAutomation(automationId)
  const queryClient = useQueryClient()

  // Reset all configuration states when selectedTrigger changes or is removed
  useEffect(() => {
    if (!selectedTrigger) {
      // Reset all states when trigger is removed
      setSelectedPost(null)
      setKeywords({ include: [] })
      setReplyMessage('')
      return
    }

    // When a new trigger is selected or page is reloaded, initialize states from automation data
    if (automationData?.data?.trigger) {
      const trigger = automationData.data.trigger.find((t) => {
        // Map API type to UI type for comparison
        const uiType = t.type === 'user-message' ? 'DM' :
                      t.type === 'post-comments' ? 'COMMENT' :
                      t.type
        return uiType === selectedTrigger.id
      })
      
      if (trigger) {
        // Handle posts
        if (trigger.posts && trigger.posts.length > 0) {
          const post = trigger.posts[0] // Get the first post
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

        // If there's a trigger but no configurations, ensure states are reset
        if (!trigger.posts?.length && !trigger.keywords?.length && !trigger.replyMessages?.length) {
          setSelectedPost(null)
          setKeywords({ include: [] })
          setReplyMessage('')
        }
      }
    }
  }, [selectedTrigger, automationData?.data])

  const handlePostSelection = async (selection: { type: 'specific' | 'all' | 'next'; postId?: string }, post?: InstagramPostProps) => {
    if (selection.type === 'specific' && post) {
      // Update local state first
      setSelectedPost(post)
      setIsPostSelectionModalOpen(false)

      // Show loading toast with the node ID to properly block interaction
      showToast('loading', 'Saving configuration post', 'trigger-1')

      // Then update the configuration with API type
      const config: Partial<TriggerConfig> = {
        type: selection.type,
        postId: post.id,
        mediaUrl: post.media_url,
        keywords: keywords,
        replyMessages: replyMessage ? replyMessage.split(' | ') : undefined,
        status: updateConfigurationStatus({
          type: selection.type,
          postId: post.id,
          mediaUrl: post.media_url,
          keywords: keywords,
          replyMessages: replyMessage ? replyMessage.split(' | ') : undefined
        }),
        // Ensure posts array is properly formatted for the database
        posts: [{
          postId: post.id,
          mediaType: post.media_type || 'IMAGE',
          mediaUrl: post.media_url,
          caption: post.caption || null
        }]
      }

      if (onTriggerConfig && selectedTrigger) {
        try {
          // Map UI type to API type when saving
          const apiType = selectedTrigger.id === 'DM' ? 'user-message' :
                         selectedTrigger.id === 'COMMENT' ? 'post-comments' :
                         selectedTrigger.id

          // Wait for the save operation to complete
          await onTriggerConfig(apiType, config)
          
          // Update toast to success state after save completes
          showToast('success', 'Post configuration saved', 'trigger-1')
        } catch (error) {
          console.error('Error saving trigger config:', error)
          toast.error('Failed to save post configuration')
          hideToast()
        }
      }
    } else {
      // Update local state first
      setSelectedPost(null)
      setIsPostSelectionModalOpen(false)
      
      // Show loading toast with the node ID
      showToast('loading', 'Saving configuration', 'trigger-1')

      // Then update the configuration
      const config = { 
        type: selection.type,
        keywords: keywords,
        replyMessages: replyMessage ? replyMessage.split(' | ') : undefined,
        status: updateConfigurationStatus({
          type: selection.type,
          keywords: keywords,
          replyMessages: replyMessage ? replyMessage.split(' | ') : undefined
        })
      }

      if (onTriggerConfig && selectedTrigger) {
        try {
          // Map UI type to API type when saving
          const apiType = selectedTrigger.id === 'DM' ? 'user-message' :
                         selectedTrigger.id === 'COMMENT' ? 'post-comments' :
                         selectedTrigger.id

          // Wait for the save operation to complete
          await onTriggerConfig(apiType, config)
          
          // Update toast to success state after save completes
          showToast('success', 'Configuration saved', 'trigger-1')
        } catch (error) {
          console.error('Error saving trigger config:', error)
          toast.error('Failed to save configuration')
          hideToast()
        }
      }
    }
  }

  const handleRemoveSelectedPost = async () => {
    // Show loading toast
    showToast('loading', 'Removing trigger item...', 'trigger-1')
    
    try {
      // First optimistically update the UI by clearing the selected post
      setSelectedPost(null)
      
      if (onTriggerConfig && selectedTrigger) {
        // CRITICAL FIX: We need to pass the API type format, not the UI format
        // Map UI type to API type when removing
        const apiType = selectedTrigger.id === 'DM' ? 'user-message' :
                       selectedTrigger.id === 'COMMENT' ? 'post-comments' :
                       selectedTrigger.id
        
        console.log('Removing trigger with API type:', apiType)
        
        // Pass null to indicate removal
        await onTriggerConfig(apiType, null)
        
        // Show success toast
        showToast('success', 'Trigger item removed', 'trigger-1')
        
        // Close the sidebar after removal
        onClose()
      }
    } catch (error) {
      console.error('Error removing trigger item:', error)
      hideToast()
      toast.error('Failed to remove trigger item')
    }
  }

  const handleKeywordConfiguration = () => {
    setIsKeywordModalOpen(true)
  }

  const handleKeywordSave = async (newKeywords: { include: string[] }) => {
    // Update local state first
    setKeywords(newKeywords)
    setIsKeywordModalOpen(false)

    // Then update the configuration
    if (onTriggerConfig && selectedTrigger) {
      const config = {
        type: selectedPost ? 'specific' : undefined,
        postId: selectedPost?.id,
        mediaUrl: selectedPost?.media_url,
        keywords: newKeywords,
        replyMessages: replyMessage ? replyMessage.split(' | ') : undefined,
        status: updateConfigurationStatus({
          type: selectedPost ? 'specific' : undefined,
          postId: selectedPost?.id,
          mediaUrl: selectedPost?.media_url,
          keywords: newKeywords,
          replyMessages: replyMessage ? replyMessage.split(' | ') : undefined
        })
      }

      try {
        // Use async/await to ensure state updates complete
        await Promise.resolve()
        onTriggerConfig(selectedTrigger.id, config)
      } catch (error) {
        console.error('Error saving keywords:', error)
      }
    }
  }

  const handleReplyConfiguration = () => {
    setIsReplyMessageModalOpen(true)
  }

  const handleReplyMessageSave = (messages: string | string[]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages]
    setReplyMessage(messageArray.join(' | '))
    
    if (onTriggerConfig && selectedTrigger) {
      const config = {
        type: selectedPost ? 'specific' : undefined,
        postId: selectedPost?.id,
        mediaUrl: selectedPost?.media_url,
        keywords: keywords,
        replyMessages: messageArray,
        status: updateConfigurationStatus({
          type: selectedPost ? 'specific' : undefined,
          postId: selectedPost?.id,
          mediaUrl: selectedPost?.media_url,
          keywords: keywords,
          replyMessages: messageArray
        })
      }
      onTriggerConfig(selectedTrigger.id, config)
    }
  }

  const handleKeywordRemove = (keywordToRemove: string) => {
    const updatedKeywords = {
      include: keywords.include.filter(keyword => keyword !== keywordToRemove)
    }
    setKeywords(updatedKeywords)
    
    if (onTriggerConfig && selectedTrigger) {
      const config = {
        type: selectedPost ? 'specific' : undefined,
        postId: selectedPost?.id,
        mediaUrl: selectedPost?.media_url,
        keywords: updatedKeywords,
        replyMessages: replyMessage ? replyMessage.split(' | ') : undefined,
        status: updateConfigurationStatus({
          type: selectedPost ? 'specific' : undefined,
          postId: selectedPost?.id,
          mediaUrl: selectedPost?.media_url,
          keywords: updatedKeywords,
          replyMessages: replyMessage ? replyMessage.split(' | ') : undefined
        })
      }
      onTriggerConfig(selectedTrigger.id, config)
    }
  }

  const handleTriggerConfig = useCallback(async (type: string, config: Partial<TriggerConfig>) => {
    if (!selectedTrigger) return;

    console.log(' Saving trigger config:', { type, config });

    // Map UI type to API type for consistency
    const apiType = type === 'DM' ? 'user-message' :
                   type === 'COMMENT' ? 'post-comments' :
                   type

    // Format data properly for the backend
    const formattedConfig = {
      ...config,
      // Ensure keywords is formatted correctly as expected by the backend
      keywords: { include: config.keywords?.include || [] },
      // Ensure posts are formatted as expected by the backend
      posts: config.posts?.map(post => ({
        postId: post.postId,
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl,
        caption: post.caption
      })) || [],
      status: config.status || 'unconfigured'
    };

    console.log(' Formatted config for API:', { apiType, formattedConfig });

    try {
      const result = await saveChanges({
        trigger: [{
          type: apiType,
          config: formattedConfig
        }]
      });
      console.log(' Save result:', result);
      
      // Skip expensive refetch for instant UI response
      // queryClient.invalidateQueries({ queryKey: ['automation-info', automationId] });
    } catch (error) {
      console.error(' Error saving trigger configuration:', error);
      // toast.error('Failed to save configuration. Please try again.');
    }
  }, [saveChanges, selectedTrigger, queryClient, automationId]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <MotionSheetContent 
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
          
          <SheetHeader className={HEADER_STYLES.container}>
            <div className="pr-8">
              <SheetTitle className={HEADER_STYLES.title}>Configure {selectedTrigger?.name}</SheetTitle>
              <p className={HEADER_STYLES.subtitle}>Set up your automation trigger settings</p>
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
                    onClick={handleKeywordConfiguration}
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
                REPLY MESSAGE
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
                    onClick={handleReplyConfiguration}
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