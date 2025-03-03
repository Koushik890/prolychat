'use client'

/**
 * This is an example file showing how to integrate the NodeOverlay component with
 * your TriggerNode and ActionNode components in the Flow Builder.
 * 
 * Implementation steps:
 * 1. Import the NodeOverlay component
 * 2. Import the useToast hook
 * 3. Add the NodeOverlay component inside your node component
 * 4. When configuring a node, pass its ID to the showToast function
 */

import React from 'react'
import { Handle, Position } from 'reactflow'
import { useToast } from '@/contexts/toast-context'
import NodeOverlay from './node-overlay'

interface TriggerNodeProps {
  id: string
  data: {
    label: string
    // ... other data properties
  }
  selected: boolean
}

/**
 * Example implementation of a TriggerNode with overlay support
 */
export function TriggerNode({ id, data, selected }: TriggerNodeProps) {
  const { affectedNodeId } = useToast()
  const isAffected = affectedNodeId === id

  return (
    <div className={`relative rounded-lg bg-white p-4 shadow-lg ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Add the NodeOverlay component if this node is affected */}
      {isAffected && <NodeOverlay nodeId={id} />}
      
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      
      {/* ReactFlow handles */}
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  )
}

/**
 * Example of configuring a node with the updated toast system
 */
export function ConfigureNodeExample() {
  const { showToast } = useToast()
  const nodeId = 'trigger-123'
  
  const handleConfigNode = () => {
    // Start configuration - pass nodeId as third parameter
    showToast('loading', 'Configuring trigger...', nodeId)
    
    // Simulate configuration process
    setTimeout(() => {
      // When done, show success toast
      showToast('success', 'Trigger configured successfully', nodeId)
    }, 2000)
  }
  
  return (
    <button 
      onClick={handleConfigNode}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Configure Node
    </button>
  )
}
