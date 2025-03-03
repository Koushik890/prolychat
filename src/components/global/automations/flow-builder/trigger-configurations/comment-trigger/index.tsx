'use client'

import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Instagram, Hash, MessageSquare, ChevronRight, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import styles from './comment-trigger.module.css'
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
        await queryClient.invalidateQueries({ queryKey: ['automation-info', automationId] })
        
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
      await queryClient.invalidateQueries({ queryKey: ['automation-info', automationId] })
      
      // Remove reload prevention and show success
      window.removeEventListener('beforeunload', preventReload)
      showToast('success', 'Reply message saved', true)
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
        replyMessages: replyMessage ? replyMessage.split(' | ') : [],
        status: updateConfigurationStatus({
          type: 'all',
          keywords,
          replyMessages: replyMessage ? replyMessage.split(' | ') : []
        }),
        posts: [] // Explicitly set empty posts array
      }

      await saveChanges({
        trigger: [{
          type: 'post-comments',
          config
        }]
      })

      onTriggerConfig('post-comments', config)
      await queryClient.invalidateQueries({ queryKey: ['automation-info', automationId] })
      
      // Remove reload prevention and show success
      window.removeEventListener('beforeunload', preventReload)
      showToast('success', 'Post configuration removed', true)
    } catch (error) {
      // Remove reload prevention on error
      window.removeEventListener('beforeunload', preventReload)
      console.error('Error removing post configuration:', error)
      toast.error('Failed to remove post configuration')
      const currentPost = automationData?.data?.trigger?.[0]?.posts?.[0]
      if (currentPost) {
        setSelectedPost({
          id: currentPost.postId,
          media_url: currentPost.mediaUrl,
          media_type: currentPost.mediaType,
          caption: currentPost.caption || undefined
        } as InstagramPostProps)
      }
    }
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
            <SheetTitle className={styles.title}>Configure Post/Reel Comments</SheetTitle>
            <p className={styles.subtitle}>Set up your comment trigger settings</p>
          </div>
        </SheetHeader>

        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Post Selection Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <Instagram className={styles.sectionIcon} />
              WHICH POST OR REEL?
            </h4>
            <div className={styles.sectionContent}>
              {selectedPost ? (
                <div className={styles.selectedPost}>
                  <div className={styles.postPreview}>
                    <BlurImage
                      src={selectedPost.media_url}
                      alt="Selected post"
                      width={80}
                      height={80}
                      className={styles.postImage}
                    />
                    <div className={styles.postInfo}>
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
            </div>
          </div>

          {/* Reply Message Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <MessageSquare className={styles.sectionIcon} />
              AUTO REPLY
            </h4>
            <div className={styles.sectionContent}>
              <Button
                variant="outline"
                className={styles.configButton}
                onClick={() => setIsReplyMessageModalOpen(true)}
              >
                <span className={styles.buttonText}>
                  {replyMessage ? 'Edit Reply Message' : 'Configure Reply Message'}
                </span>
                <ChevronRight className={styles.buttonIcon} />
              </Button>
              {replyMessage && (
                <div className={styles.messageSummary}>
                  <p className={styles.messagePreview}>
                    {replyMessage.split(' | ').map((msg, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <br />}
                        {msg}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Modals */}
        <PostSelectionModal
          isOpen={isPostSelectionModalOpen}
          onClose={() => setIsPostSelectionModalOpen(false)}
          onSelect={handlePostSelection}
        />

        <KeywordConfigurationModal
          isOpen={isKeywordModalOpen}
          onClose={() => setIsKeywordModalOpen(false)}
          onSave={handleKeywordSave}
          initialKeywords={keywords}
        />

        <ReplyMessageModal
          isOpen={isReplyMessageModalOpen}
          onClose={() => setIsReplyMessageModalOpen(false)}
          onSave={handleReplyMessageSave}
          initialMessage={replyMessage}
        />
      </MotionSheetContent>
    </Sheet>
  )
} 