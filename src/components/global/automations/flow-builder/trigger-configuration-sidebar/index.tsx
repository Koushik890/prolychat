'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Instagram, Hash, MessageSquare, ChevronRight, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import styles from './trigger-configuration-sidebar.module.css'
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
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['automation-info', automationId] });
    } catch (error) {
      console.error(' Error saving trigger configuration:', error);
      // toast.error('Failed to save configuration. Please try again.');
    }
  }, [saveChanges, selectedTrigger, queryClient, automationId]);

  return (
    <>
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
              <SheetTitle className={styles.title}>Configure {selectedTrigger?.name}</SheetTitle>
              <p className={styles.subtitle}>Set up your automation trigger settings</p>
            </div>
          </SheetHeader>

          <motion.div 
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Post/Reel Selection Section */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <Instagram className={styles.sectionIcon} />
                WHICH POST OR REEL?
              </h4>
              <div className={styles.sectionContent}>
                {selectedPost ? (
                  <div className={styles.selectedPostPreview}>
                    <div className={styles.selectedPostImage}>
                      <BlurImage
                        src={selectedPost.media_url}
                        alt={selectedPost.caption || 'Selected Instagram post'}
                        width={120}
                        height={120}
                        className={styles.previewImage}
                      />
                      {selectedPost.media_type === 'VIDEO' && (
                        <div className={styles.videoIndicator}>
                          <div className={styles.playIcon} />
                        </div>
                      )}
                    </div>
                    <div className={styles.selectedPostInfo}>
                      <p className={styles.postType}>
                        {selectedPost.media_type === 'VIDEO' ? 'Reel' : 'Post'}
                      </p>
                      {selectedPost.caption && (
                        <p className={styles.postCaption}>
                          {selectedPost.caption.length > 50 
                            ? `${selectedPost.caption.slice(0, 50)}...` 
                            : selectedPost.caption}
                        </p>
                      )}
                      <div className={styles.postActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={styles.changeButton}
                          onClick={() => setIsPostSelectionModalOpen(true)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Change
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={styles.removeButton}
                          onClick={handleRemoveSelectedPost}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className={styles.configButton}
                    onClick={() => setIsPostSelectionModalOpen(true)}
                  >
                    <span className={styles.buttonText}>Select Post or Reel</span>
                    <ChevronRight className={styles.buttonIcon} />
                  </Button>
                )}
                <p className={styles.helperText}>
                  Choose the post or reel you want to monitor
                </p>
              </div>
            </div>

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
                  onClick={handleKeywordConfiguration}
                >
                  <span className={styles.buttonText}>Configure Keywords</span>
                  <ChevronRight className={styles.buttonIcon} />
                </Button>
                <p className={styles.helperText}>
                  Set up keywords that will trigger this automation
                </p>
                {(keywords.include.length > 0) && (
                  <div className={styles.keywordsSummary}>
                    <div className={styles.keywordGroup}>
                      <span className={styles.keywordLabel}>Keywords:</span>
                      <div className={styles.keywordTags}>
                        {keywords.include.map(keyword => (
                          <div 
                            key={keyword} 
                            className={`${styles.keywordTag} group relative`}
                          >
                            {keyword}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleKeywordRemove(keyword)
                              }}
                              className="absolute right-0 top-0 bottom-0 px-1.5 hidden group-hover:flex items-center justify-center hover:bg-gray-100 rounded-r-md transition-colors"
                              aria-label={`Remove keyword ${keyword}`}
                            >
                              <X className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Configuration Section */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <MessageSquare className={styles.sectionIcon} />
                REPLY MESSAGE
              </h4>
              <div className={styles.sectionContent}>
                <Button
                  variant="outline"
                  className={styles.configButton}
                  onClick={handleReplyConfiguration}
                >
                  <span className={styles.buttonText}>Configure Reply Message</span>
                  <ChevronRight className={styles.buttonIcon} />
                </Button>
                <p className={styles.helperText}>
                  Set up the message you want to send in response
                </p>
                {replyMessage && (
                  <div className={styles.messageSummary}>
                    <p className={styles.messagePreview}>{replyMessage}</p>
                  </div>
                )}
              </div>
            </div>
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