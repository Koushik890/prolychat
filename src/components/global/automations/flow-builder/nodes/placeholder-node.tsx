'use client'

import React, { useState, useRef } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import { Plus, MessageSquare, Bot } from 'lucide-react'
import styles from './placeholder-node.module.css'
import { AnimatedMenu } from '@/components/ui/animated-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface PlaceholderNodeProps {
  id: string
  data: {
    label?: string
    	onActionSelect?: (actionId: string, actionType: 'MESSAGE' | 'PROLYAI', actionName: string, icon: React.ComponentType<any>) => void
  }
}

export function PlaceholderNode({ id, data }: PlaceholderNodeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { setNodes, getNode } = useReactFlow()
  const triggerRef = useRef<HTMLDivElement>(null)
  const [popoverSide, setPopoverSide] = useState<'right' | 'bottom' | 'top' | 'left'>('right')
  const [arrowAlign, setArrowAlign] = useState<'left' | 'right' | 'top' | 'bottom'>('left')

  const handleOpenChange = (open: boolean) => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const { innerWidth, innerHeight } = window

      const menuWidth = 240
      const menuHeight = 110
      const sideOffset = 16
      const requiredWidth = menuWidth + sideOffset
      const requiredHeight = menuHeight + sideOffset

      const hasSpaceRight = innerWidth - rect.right > requiredWidth
      const hasSpaceBottom = innerHeight - rect.bottom > requiredHeight
      const hasSpaceTop = rect.top > requiredHeight
      const hasSpaceLeft = rect.left > requiredWidth
      
      const bottomThreshold = innerHeight - 180 // Area for minimap/controls
      const isNearBottom = rect.bottom > bottomThreshold

      if (isNearBottom) {
        // When near the bottom, prioritize opening upwards
        if (hasSpaceTop) {
          setPopoverSide('top')
          setArrowAlign('bottom')
        } else if (hasSpaceRight) {
          setPopoverSide('right')
          setArrowAlign('left')
        } else if (hasSpaceLeft) {
          setPopoverSide('left')
          setArrowAlign('right')
        } else {
          // Fallback to bottom if no other space is available
          setPopoverSide('bottom')
          setArrowAlign('top')
        }
      } else {
        // Default behavior when not near the bottom
        if (hasSpaceRight) {
          setPopoverSide('right')
          setArrowAlign('left')
        } else if (hasSpaceBottom) {
          setPopoverSide('bottom')
          setArrowAlign('top')
        } else if (hasSpaceTop) {
          setPopoverSide('top')
          setArrowAlign('bottom')
        } else {
          setPopoverSide('left')
          setArrowAlign('right')
        }
      }
    }
    setIsPopoverOpen(open)
  }

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
    
    setIsPopoverOpen(false)
  }

  const menuItems = [
    {
      riveIcon: {
        src: "https://public.rive.app/community/runtime-files/2063-4080-phone-icon.riv",
        stateMachine: "phoneIconSM"
      },
      label: <span className="font-mona">Send Message</span>,
      hotkey: "M",
      icon: MessageSquare,
      onClick: () => {
        const actionId = `action-${Date.now()}`
        handleActionSelect(actionId, 'MESSAGE', 'Send Message', MessageSquare)
      },
    },
    {
      riveIcon: {
        src: "https://public.rive.app/community/runtime-files/2487-5077-robot-dance.riv",
        stateMachine: "State Machine 1"
      },
      label: <span className="font-mona">AI Assistant</span>,
      hotkey: "A",
      icon: Bot,
      onClick: () => {
        const actionId = `action-${Date.now()}`
        handleActionSelect(actionId, 'PROLYAI', 'AI Assistant', Bot)
      },
    },
  ]

  return (
    <>
      <div className={styles.placeholderNode}>
        {/* Handle for connections - invisible but functional */}
        <Handle
          type="target"
          position={Position.Left}
          className={styles.hiddenHandle}
          aria-label="Connection handle"
        />
        
        <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              className={styles.content}
              role="button"
              tabIndex={0}
              aria-label={data.label || 'Add action node'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleOpenChange(true)
                }
              }}
            >
              <div className={styles.iconWrapper}>
                <Plus className={styles.icon} aria-hidden="true" />
              </div>
              <p className={`${styles.text} font-mona`}>{data.label || 'Add Node'}</p>
            </div>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-auto p-0 border-none bg-transparent shadow-none"
            side={popoverSide}
            align="center"
            sideOffset={16}
            avoidCollisions={false}
          >
            <AnimatedMenu items={menuItems} arrowAlign={arrowAlign} />
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
} 