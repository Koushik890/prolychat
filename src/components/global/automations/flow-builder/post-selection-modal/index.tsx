'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useQueryAutomationPosts } from '@/hooks/user-queries'
import { InstagramPostProps } from '@/types/posts.type'
import { BlurImage } from '@/components/ui/blur-image'
import Loader from '@/components/global/loader'

interface PostSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (selection: {
    type: 'specific' | 'all' | 'next'
    postId?: string
  }, post?: InstagramPostProps) => void
  selectedPostId?: string
}

// All Posts Modal Component
interface AllPostsModalProps {
  isOpen: boolean
  onClose: () => void
  posts: InstagramPostProps[]
  selectedId: string | null
  onPostSelect: (postId: string) => void
}

function AllPostsModal({ isOpen, onClose, posts, selectedId, onPostSelect }: AllPostsModalProps) {
  const allPostsModalRef = React.useRef<HTMLDivElement>(null)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle Escape key press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus management - ensure modal receives focus when opened
  React.useEffect(() => {
    if (isOpen && allPostsModalRef.current) {
      // Small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        allPostsModalRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center p-6 sm:p-8"
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
        onClick={onClose}
      />
      
             {/* Modal */}
       <motion.div
         ref={allPostsModalRef}
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: 20 }}
         transition={{ type: "spring", damping: 20, stiffness: 300 }}
         className="relative w-full max-w-4xl max-h-[90vh] outline-none"
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
           <div className="relative z-10 p-8 sm:p-10 max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
            {/* Custom scrollbar styling */}
            <style jsx>{`
              .relative.z-10::-webkit-scrollbar {
                width: 8px;
              }
              .relative.z-10::-webkit-scrollbar-track {
                background: rgba(139, 92, 246, 0.1);
                border-radius: 4px;
              }
              .relative.z-10::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.3);
                border-radius: 4px;
              }
              .relative.z-10::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.5);
              }
            `}</style>
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", damping: 20 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-purple-900 mb-2 tracking-tight">All Posts & Reels</h2>
              <p className="text-purple-600 text-sm font-medium">Choose from all your Instagram content</p>
            </motion.div>

            {/* Posts Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring", damping: 20 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {posts.map((post: InstagramPostProps, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.6 + (index * 0.05), 
                    duration: 0.4, 
                    type: "spring", 
                    damping: 20, 
                    stiffness: 300 
                  }}
                  className={cn(
                    "aspect-square rounded-xl overflow-hidden cursor-pointer relative bg-purple-50/50 transition-all duration-200 hover:scale-105 hover:shadow-lg",
                    selectedId === post.id && "ring-2 ring-purple-500 shadow-lg shadow-purple-500/25"
                  )}
                  onClick={() => onPostSelect(post.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BlurImage
                    src={post.media_url}
                    alt={post.caption || 'Instagram post'}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                  {post.media_type === 'VIDEO' && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                  )}
                  {selectedId === post.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Close Button */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5, type: "spring", damping: 20 }}
              className="flex justify-center mt-8"
            >
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-white/60 border-purple-200/60 text-purple-700 hover:bg-purple-50/60 hover:border-purple-300/60 px-6 py-2 rounded-full transition-all duration-200"
              >
                Close
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}

export function PostSelectionModal({ isOpen, onClose, onSelect, selectedPostId }: PostSelectionModalProps) {
  const { data: postsData, isLoading, error } = useQueryAutomationPosts()
  const [selectedId, setSelectedId] = React.useState<string | null>(selectedPostId || null)
  const [showAllPostsModal, setShowAllPostsModal] = React.useState(false)
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Handle Escape key press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus management - ensure modal receives focus when opened
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      // Small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset selection when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedId(null)
      setShowAllPostsModal(false)
    }
  }, [isOpen])

  // Update selected ID when selectedPostId prop changes
  React.useEffect(() => {
    setSelectedId(selectedPostId || null)
  }, [selectedPostId])

  const handlePostSelect = (postId: string) => {
    setSelectedId(postId)
    setShowAllPostsModal(false) // Close "See More" modal when selecting from it
  }

  const handleConfirmSelection = () => {
    if (selectedId) {
      const selectedPost = postsData?.status === 200 
        ? postsData.data.data.find((post: InstagramPostProps) => post.id === selectedId)
        : undefined
      onSelect({ type: 'specific', postId: selectedId }, selectedPost)
      onClose()
    }
  }

  const handleSeeMore = () => {
    setShowAllPostsModal(true)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-6 sm:p-8"
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
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[90vh] outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-purple-200/60 shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)] ring-1 ring-purple-900/[0.05] overflow-hidden cursor-default">
          {/* Subtle gradient overlay matching text config modal */}
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
          <div className="relative z-10 p-8 sm:p-10 max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
            {/* Custom scrollbar styling */}
            <style jsx>{`
              .relative.z-10::-webkit-scrollbar {
                width: 8px;
              }
              .relative.z-10::-webkit-scrollbar-track {
                background: rgba(139, 92, 246, 0.1);
                border-radius: 4px;
              }
              .relative.z-10::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.3);
                border-radius: 4px;
              }
              .relative.z-10::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.5);
              }
            `}</style>
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", damping: 20 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-purple-900 mb-2 tracking-tight">Which Post or Reel do you want to use?</h2>
              <p className="text-purple-600 text-sm font-medium">Select the content you want to monitor for this automation</p>
            </motion.div>

            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring", damping: 20 }}
              className="space-y-4"
            >
              {/* Specific Post Selection */}
              <Card className="group relative flex flex-col gap-6 p-6 cursor-pointer bg-white/40 hover:bg-white/60 border border-purple-200/60 rounded-[1.5rem] hover:shadow-[0_16px_32px_rgba(139,92,246,0.12)] hover:-translate-y-[2px] hover:border-purple-300/60 transition-all duration-300 ease-out">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-purple-900">
                    Specific Post or Reel
                  </h3>
                  {postsData?.status === 200 && postsData.data.data.length > 3 && (
                    <Button
                      variant="link"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium p-0 h-auto transition-colors duration-200"
                      onClick={handleSeeMore}
                    >
                      See More
                    </Button>
                  )}
                </div>
                
                {/* Post Grid - Show only last 3 posts */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  {isLoading ? (
                    <div className="col-span-3 py-8 flex justify-center items-center">
                      <Loader state>Loading posts...</Loader>
                    </div>
                  ) : error ? (
                    <div className="col-span-3 py-8 text-center text-purple-600">
                      Failed to load posts. Please try again.
                    </div>
                  ) : postsData?.status === 200 && postsData.data.data.length > 0 ? (
                    postsData.data.data.slice(0, 3).map((post: InstagramPostProps, index: number) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: 0.6 + (index * 0.1), 
                          duration: 0.4, 
                          type: "spring", 
                          damping: 20, 
                          stiffness: 300 
                        }}
                        className={cn(
                          "aspect-square rounded-xl overflow-hidden cursor-pointer relative bg-purple-50/50 transition-all duration-200 hover:scale-105 hover:shadow-lg",
                          selectedId === post.id && "ring-2 ring-purple-500 shadow-lg shadow-purple-500/25"
                        )}
                        onClick={() => handlePostSelect(post.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <BlurImage
                          src={post.media_url}
                          alt={post.caption || 'Instagram post'}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                        {post.media_type === 'VIDEO' && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                            </div>
                          </div>
                        )}
                        {selectedId === post.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"
                          >
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center text-purple-600">
                      No posts found. Create some posts on Instagram first.
                    </div>
                  )}
                </div>

                {selectedId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="flex justify-end"
                  >
                    <Button
                      onClick={handleConfirmSelection}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:from-purple-600 hover:to-purple-700 active:from-purple-700 active:to-purple-800 transition-all duration-200 px-6 py-2 rounded-full shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
                    >
                      Confirm Selection
                    </Button>
                  </motion.div>
                )}
              </Card>

              {/* All Posts Option */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5, type: "spring", damping: 20 }}
              >
                <Card className="group relative flex flex-row items-center gap-4 py-4 px-6 cursor-not-allowed opacity-75 bg-white/40 border border-purple-200/60 rounded-[1.5rem] transition-all duration-300 ease-out">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-900 transition-colors duration-200">
                      All Posts or Reels
                    </h3>
                    <p className="text-sm text-purple-600 transition-colors duration-200 mt-1">
                      Monitor all your content automatically
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-purple-100/80 to-purple-200/60 text-purple-700 text-xs font-semibold rounded-full border border-purple-200/60">
                    Coming Soon
                  </div>
                </Card>
              </motion.div>

              {/* Next Post Option */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5, type: "spring", damping: 20 }}
              >
                <Card className="group relative flex flex-row items-center gap-4 py-4 px-6 cursor-not-allowed opacity-75 bg-white/40 border border-purple-200/60 rounded-[1.5rem] transition-all duration-300 ease-out">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-900 transition-colors duration-200">
                      Next Post or Reel
                    </h3>
                    <p className="text-sm text-purple-600 transition-colors duration-200 mt-1">
                      Automatically apply to your next upload
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-purple-100/80 to-purple-200/60 text-purple-700 text-xs font-semibold rounded-full border border-purple-200/60">
                    Coming Soon
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* All Posts Modal */}
      {postsData?.status === 200 && (
        <AllPostsModal
          isOpen={showAllPostsModal}
          onClose={() => setShowAllPostsModal(false)}
          posts={postsData.data.data}
          selectedId={selectedId}
          onPostSelect={handlePostSelect}
        />
      )}
    </div>
  )

  // Use portal to render outside any parent containers
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
} 