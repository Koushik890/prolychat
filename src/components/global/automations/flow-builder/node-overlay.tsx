'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/contexts/toast-context'

interface NodeOverlayProps {
  nodeId: string
}

/**
 * NodeOverlay component that disables interactions with a node when a toast is shown.
 * This helps prevent users from making unintended edits during configuration operations.
 */
export function NodeOverlay({ nodeId }: NodeOverlayProps) {
  const { isShowingOverlay } = useToast()

  if (!isShowingOverlay) return null

  return (
    <motion.div
      className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] rounded-lg z-[50] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ 
        pointerEvents: 'all'
      }}
    >
      <div className="text-white text-sm bg-black/50 px-3 py-2 rounded-md backdrop-blur-md">
        Please wait...
      </div>
    </motion.div>
  )
}

export default NodeOverlay
