'use client'

import React, { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card } from '@/components/ui/card'
import { Zap, LucideIcon, Plus, Settings, X } from 'lucide-react'
import { AutomationKeyword } from '@/types/automation'
import { Button } from '@/components/ui/button'
import { TriggerSidebar } from '../trigger-sidebar'
import { ActionModal } from '../action-modal'
import styles from './trigger-node.module.css'
import { motion } from 'framer-motion'
import { TriggerSidebarProps } from '../trigger-sidebar'

interface TriggerNodeData {
  type: string
  keywords: any[]
  selectedTriggers: Array<TriggerItem>
  onTriggerSelect: (triggerId: string, triggerName: string, icon: React.ComponentType<any>) => void
  onTriggerRemove: (triggerId: string) => void
  isConfigSidebarOpen: boolean
  onConfigSidebarClose: () => void
  onConfigSidebarOpen: () => void
  isTriggerSidebarOpen: boolean
  onTriggerSidebarOpen: () => void
  onTriggerSidebarClose: () => void
  onTriggerConfigurationOpen: (trigger: TriggerItem) => void
  	onActionSelect?: (actionId: string, action: 'MESSAGE' | 'PROLYAI', actionName: string, icon: React.ComponentType<any>) => void
  config?: any
  configurationStatus: 'unconfigured' | 'partial' | 'complete'
}

interface TriggerItem {
  id: string
  name: string
  icon: React.ComponentType<any>
}

export function TriggerNode({ data }: NodeProps<TriggerNodeData>) {
  const {
    selectedTriggers,
    onTriggerSelect,
    onTriggerRemove,
    isConfigSidebarOpen,
    onConfigSidebarClose,
    onConfigSidebarOpen,
    isTriggerSidebarOpen,
    onTriggerSidebarOpen,
    onTriggerSidebarClose,
    onTriggerConfigurationOpen,
    config
  } = data

  const [isActionModalOpen, setIsActionModalOpen] = useState(false)

  const handleNodeClick = (e: React.MouseEvent) => {
    // Check if the click was on the "+ New Trigger" button
    const isNewTriggerButton = (e.target as HTMLElement).closest(`.${styles.addTrigger}`)
    if (!isNewTriggerButton && data.onConfigSidebarOpen) {
      data.onConfigSidebarOpen()
    }
  }

  const handleTriggerClick = (trigger: { id: string; name: string; icon: React.ComponentType<any> }) => {
    if (data.onTriggerConfigurationOpen) {
      data.onTriggerConfigurationOpen(trigger)
    }
  }

  const getStatusIndicator = (status: 'unconfigured' | 'partial' | 'complete') => {
    const baseClasses = "w-2 h-2 rounded-full absolute right-2 top-2"
    switch (status) {
      case 'complete':
        return <div className={`${baseClasses} bg-green-500 ring-2 ring-green-200`} title="Fully configured" />
      case 'partial':
        return <div className={`${baseClasses} bg-yellow-500 ring-2 ring-yellow-200`} title="Partially configured" />
      case 'unconfigured':
      default:
        return <div className={`${baseClasses} bg-gray-400 ring-2 ring-gray-200`} title="Not configured" />
    }
  }

  return (
    <>
      <Card 
        className={styles.triggerNode}
        onClick={handleNodeClick}
      >
        {/* Status Indicator */}
        {selectedTriggers.length > 0 && getStatusIndicator(data.configurationStatus)}

        {/* Header with Icon and Title */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Zap className={styles.icon} />
          </div>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>When...</h3>
          </div>
        </div>

        {/* Description or Selected Triggers */}
        {selectedTriggers.length > 0 ? (
          <div className={styles.selectedTriggers}>
            {selectedTriggers.map((trigger) => (
              <motion.div
                key={trigger.id}
                className={`${styles.selectedTrigger} ${styles.clickable}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTriggerClick(trigger)
                }}
              >
                <div className={styles.triggerIconWrapper}>
                  <trigger.icon className={styles.triggerIcon} />
                </div>
                <p className={styles.selectedTriggerText}>{trigger.name}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className={styles.description}>
            A Trigger is an event that starts your Automation.
            <br />
            Click to add a Trigger.
          </p>
        )}

        {/* Add Trigger Button */}
        {selectedTriggers.length === 0 && (
          <Button
            variant="ghost"
            className={styles.addTrigger}
            onClick={(e) => {
              e.stopPropagation()
              if (data.onTriggerSidebarOpen) {
                data.onTriggerSidebarOpen()
              }
            }}
          >
            <span className={styles.buttonContent}>+ New Trigger</span>
          </Button>
        )}

        {/* Then text with flow indicator */}
        <div className={styles.flowIndicator}>
          <span className={styles.thenText}>Then</span>
          <div className={styles.arrow}></div>
        </div>

        {/* Handle for connections */}
        <Handle
          type="source"
          position={Position.Right}
          className={styles.handle}
          isConnectable={false}
        />
      </Card>

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onSelect={(actionId, action, actionName, icon) => {
          if (data.onActionSelect) {
            				data.onActionSelect(actionId, action as 'MESSAGE' | 'PROLYAI', actionName, icon)
          }
          setIsActionModalOpen(false)
        }}
      />
    </>
  )
}