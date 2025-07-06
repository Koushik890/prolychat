'use client'

import React, { useState } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import { Plus, MessageSquare, Bot } from 'lucide-react'
import styles from './placeholder-node.module.css'
import { ActionModal } from '../action-modal'

interface PlaceholderNodeProps {
  id: string
  data: {
    label?: string
    	onActionSelect?: (actionId: string, actionType: 'MESSAGE' | 'PROLYAI', actionName: string, icon: React.ComponentType<any>) => void
  }
}

export function PlaceholderNode({ id, data }: PlaceholderNodeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { setNodes, getNode } = useReactFlow()

  	const handleActionSelect = (actionId: string, action: 'MESSAGE' | 'PROLYAI', actionName: string, icon: React.ComponentType<any>) => {
    const node = getNode(id)
    if (node) {
      setNodes(nodes => nodes.map(n => {
        if (n.id === id) {
          return {
            ...n,
            type: 'action',
            data: {
              id: actionId,
              listener: {
                listener: action,
                prompt: '',
                commentReply: null,
                dmCount: 0,
                commentCount: 0
              }
            }
          }
        }
        return n
      }))
    }

    // Update sidebar through parent callback
    if (data.onActionSelect) {
      data.onActionSelect(actionId, action, actionName, icon)
    }
    
    setIsModalOpen(false)
  }

  return (
    <>
      <div 
        className={styles.placeholderNode}
        role="button"
        tabIndex={0}
        aria-label={data.label || 'Add action node'}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsModalOpen(true)
          }
        }}
      >
        {/* Handle for connections - invisible but functional */}
        <Handle
          type="target"
          position={Position.Left}
          className={styles.hiddenHandle}
          aria-label="Connection handle"
        />
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Plus className={styles.icon} aria-hidden="true" />
          </div>
          <p className={styles.text}>{data.label || 'Add Node'}</p>
        </div>
      </div>

      <ActionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleActionSelect}
      />
    </>
  )
} 