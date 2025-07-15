'use client'

import React from 'react'
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Panel,
  addEdge,
  BackgroundVariant,
  OnConnectStartParams,
  XYPosition,
  NodeChange,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useQueryAutomation } from '@/hooks/user-queries'
import { TriggerNode } from './nodes/trigger-node'
import { ActionNode } from './nodes/action-node'
import { PlaceholderNode } from './nodes/placeholder-node'
import { CustomEdge, customEdgeTypes } from './custom-edge'
import { AutomationData, TriggerConfig, TriggerConfigurationStatus } from '@/types/automation'
import { Button } from '@/components/ui/button'
import { MessageSquare, Bot, Instagram, MousePointer, Zap, Settings, Play, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { FlowConfigSidebar } from './flow-config-sidebar/index'
import { ActionModal } from './action-modal'
import { TriggerSidebar } from './trigger-sidebar'
import { getTriggerConfigComponent } from './trigger-configurations'
import { useAutomationWorkflow, useAutomationSync } from '@/hooks/use-automations'
import { useToast } from '@/contexts/toast-context'
import { useQueryClient } from '@tanstack/react-query'
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface FlowBuilderProps {
  id: string
}

interface TriggerDetails {
  name: string
  icon: React.ComponentType<any>
}

const TRIGGER_DETAILS: Record<string, TriggerDetails> = {
  'post-comments': {
    name: 'Post Comments',
    icon: MessageSquare
  },
  'COMMENT': {
    name: 'Post Comments',
    icon: MessageSquare
  },
  'user-message': {
    name: 'Instagram Message',
    icon: MessageSquare
  },
  'DM': {
    name: 'Instagram Message',
    icon: MessageSquare
  }
}

const getTriggerDetails = (type: string): TriggerDetails | undefined => {
  return TRIGGER_DETAILS[type]
}

// Pro options to remove watermark
const proOptions = { hideAttribution: true }

const getConfigurationStatus = (config?: TriggerConfig, triggerType?: string): TriggerConfigurationStatus => {
  if (!config) return 'unconfigured'
  if (config.status) return config.status

  // Special handling for message trigger (Direct Message)
  if (triggerType === 'user-message' || triggerType === 'DM') {
    // For message trigger, only keywords are required
    const hasKeywords = (config.keywords?.include ?? []).length > 0
    return hasKeywords ? 'complete' : 'unconfigured'
  }

  // Determine status based on config content for other trigger types
  const hasPost = config.type === 'specific' && !!config.postId && !!config.mediaUrl
  const hasKeywords = (config.keywords?.include ?? []).length > 0
  const hasReplyMessages = (config.replyMessages ?? []).length > 0

  if (hasPost && hasKeywords && hasReplyMessages) return 'complete'
  if (hasPost || hasKeywords || hasReplyMessages) return 'partial'
  return 'unconfigured'
}

// Gradient Button Component
const gradientButtonVariants = cva(
  [
    "gradient-button",
    "inline-flex items-center justify-center",
    "rounded-[11px] min-w-[132px] px-9 py-4",
    "text-base leading-[19px] font-[500] text-white",
    "font-sans font-bold",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        variant: "gradient-button-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GradientButton.displayName = "GradientButton"

// Animated Checkbox Component
interface CheckBoxProps {
  checked: boolean
  onClick: () => void
  size?: number
  color?: string
  duration?: number
}

const CheckBox = ({
  checked,
  onClick,
  size = 16,
  color = "#8b5cf6",
  duration = 0.3,
}: CheckBoxProps) => {
  return (
    <div className="select-none cursor-pointer" onClick={onClick}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <motion.path
          d="M 2.45 24.95 V 33.95 C 2.45 35.9382 4.0618 37.55 6.05 37.55 H 33.95 C 35.9382 37.55 37.55 35.9382 37.55 33.95 V 6.05 C 37.55 4.0618 35.9382 2.45 33.95 2.45 H 6.05 C 4.0618 2.45 2.45 4.0618 2.45 6.05 V 22.0617 C 2.45 23.0443 2.8516 23.9841 3.5616 24.6633 L 10.0451 30.8649 C 11.5404 32.2952 13.9308 32.1735 15.2731 30.5988 L 36.2 6.05"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={3}
          animate={{
            strokeDasharray: checked ? 150 : 132,
            strokeDashoffset: checked ? -134 : 0,
          }}
          transition={{
            duration,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  )
}

// Feature Item Component
interface FeatureItemProps {
  icon: React.ReactNode
  text: string
}

const FeatureItem = ({ icon, text }: FeatureItemProps) => {
  return (
    <motion.div 
      className="flex items-center gap-3 py-1"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </motion.div>
  )
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({ id }) => {
  const { data } = useQueryAutomation(id)
  const { showToast, hideToast } = useToast()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = React.useState<Node | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = React.useState(false)
  const [isTriggerConfigOpen, setIsTriggerConfigOpen] = React.useState(false)
  const [isTriggerSidebarOpen, setIsTriggerSidebarOpen] = React.useState(false)
  const [isTriggerConfigurationOpen, setIsTriggerConfigurationOpen] = React.useState(false)
  const [selectedTriggerForConfig, setSelectedTriggerForConfig] = React.useState<{
    id: string
    name: string
    icon: React.ComponentType<any>
  } | null>(null)
  const [selectedActions, setSelectedActions] = React.useState<Array<{ id: string; name: string; icon: React.ComponentType<any> }>>([])
  const [selectedTriggers, setSelectedTriggers] = React.useState<Array<{ id: string; name: string; icon: React.ComponentType<any> }>>([])
  const actionNodeStateRef = React.useRef<{id: string; data: any} | null>(null)
  const isInitializedRef = React.useRef(false)
  const { saveChanges } = useAutomationSync(id)
  const [triggerConfig, setTriggerConfig] = React.useState<Record<string, TriggerConfig>>({})
  const queryClient = useQueryClient()
  
  // Mobile detection and desktop mode toggle
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [forceDesktopMode, setForceDesktopMode] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Check for stored desktop mode preference
    const storedDesktopMode = localStorage.getItem(`flow-builder-desktop-mode-${id}`)
    if (storedDesktopMode === 'true') {
      setForceDesktopMode(true)
    }
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [id])

  // Save desktop mode preference
  const toggleDesktopMode = React.useCallback(() => {
    const newMode = !forceDesktopMode
    setForceDesktopMode(newMode)
    localStorage.setItem(`flow-builder-desktop-mode-${id}`, newMode.toString())
  }, [forceDesktopMode, id])

  // Determine if we should show mobile view
  const showMobileView = isMobile && !forceDesktopMode

  // Add this near the top of the FlowBuilder component
  const memoizedNodes = React.useMemo(() => nodes, [nodes])
  const memoizedEdges = React.useMemo(() => edges, [edges])

  // Prevent page reload during critical operations
  const preventReload = React.useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = 'Changes you made may not be saved. Are you sure you want to leave?'
    return e.returnValue
  }, [])

  // Handle trigger selection
  const handleTriggerSelect = React.useCallback((triggerId: string, triggerName: string, icon: React.ComponentType<any>) => {
    const newTrigger = { id: triggerId, name: triggerName, icon }
    console.log('Selecting trigger:', newTrigger);
    
    // Clear previous trigger configuration
    setTriggerConfig({})
    
    // Set new trigger, replacing any existing ones
    setSelectedTriggers([newTrigger]) // Only allow one trigger at a time
    
    // Map UI trigger type to API trigger type for saving
    const apiTriggerType = triggerId === 'DM' ? 'user-message' :
                        triggerId === 'COMMENT' ? 'post-comments' :
                        triggerId
    
    // Save the trigger selection with fresh configuration
    saveChanges({
      trigger: [{
        type: apiTriggerType,
        config: {
          status: 'unconfigured',
          type: 'all',
          keywords: { include: [] },
          replyMessages: [],
          posts: []
        }
      }]
    })

    // Update nodes with fresh configuration
    setNodes(nds => nds.map(node => {
      if (node.type === 'trigger') {
        const config: TriggerConfig = {
          status: 'unconfigured' as TriggerConfigurationStatus,
          type: 'all',
          keywords: { include: [] },
          replyMessages: [],
          posts: []
        }
        return {
          ...node,
          data: {
            ...node.data,
            selectedTriggers: [newTrigger],
            config: config,
            configurationStatus: getConfigurationStatus(config, apiTriggerType),
            type: triggerId
          }
        }
      }
      return node
    }))
    
    setIsTriggerSidebarOpen(false)
    setSelectedTriggerForConfig(newTrigger)
    setIsTriggerConfigurationOpen(true)
    
    // Also store in localStorage as a backup
    localStorage.setItem(`automation-trigger-${id}`, JSON.stringify([{
      id: triggerId,
      name: triggerName
    }]));
  }, [saveChanges, setNodes, id])

  // Handle trigger configuration
  const handleTriggerConfigurationOpen = React.useCallback((trigger: { id: string; name: string; icon: React.ComponentType<any> }) => {
    // Map UI trigger type to API trigger type for configuration
    const mappedTrigger = {
      ...trigger,
      id: trigger.id === 'COMMENT' ? 'post-comments' :
          trigger.id === 'DM' ? 'user-message' :
          trigger.id
    }
    setSelectedTriggerForConfig(mappedTrigger)
    setIsTriggerConfigurationOpen(true)
  }, [])

  // Handle trigger removal
  const handleTriggerRemove = React.useCallback(async (triggerId: string) => {
    // Store current state for potential rollback
    const previousTriggers = [...selectedTriggers]
    
    try {
      // Show loading toast and prevent page reload
      showToast('loading', 'Removing trigger configuration', 'trigger-1')
      window.addEventListener('beforeunload', preventReload)
      
      // First update the UI optimistically
      setSelectedTriggers([])
      setSelectedTriggerForConfig(null)
      setIsTriggerConfigurationOpen(false)
      setTriggerConfig({})

      // Update trigger node data
      setNodes(currentNodes => 
        currentNodes.map(node => 
          node.type === 'trigger' 
            ? {
                ...node,
                data: {
                  ...node.data,
                  selectedTriggers: [],
                  config: undefined,
                  configurationStatus: 'unconfigured',
                  type: 'New Trigger',
                  // Preserve the event handlers
                  onTriggerSelect: node.data.onTriggerSelect,
                  onTriggerRemove: node.data.onTriggerRemove,
                  onActionSelect: node.data.onActionSelect,
                  onActionRemove: node.data.onActionRemove,
                  isConfigSidebarOpen: node.data.isConfigSidebarOpen,
                  onConfigSidebarClose: node.data.onConfigSidebarClose,
                  onConfigSidebarOpen: node.data.onConfigSidebarOpen,
                  isTriggerSidebarOpen: node.data.isTriggerSidebarOpen,
                  onTriggerSidebarOpen: node.data.onTriggerSidebarOpen,
                  onTriggerSidebarClose: node.data.onTriggerSidebarClose,
                  onTriggerConfigurationOpen: node.data.onTriggerConfigurationOpen
                }
              }
            : node
        )
      )
      
      // Clear local storage
      localStorage.removeItem(`automation-trigger-${id}`)
      
      // Now update the database - CRITICAL FIX: Pass a valid but empty trigger array
      const result = await saveChanges({
        trigger: [] // This is the correct format expected by the API
      })

      if (!result || result.status !== 200) {
        throw new Error('Failed to remove trigger from database')
      }
      
      // Success toast
      showToast('success', 'Trigger removed successfully', 'trigger-1')
      
      // Remove event listener
      window.removeEventListener('beforeunload', preventReload)
      
      // Skip expensive refetch for instant UI response
      // setTimeout(() => {
      //   queryClient.invalidateQueries({ 
      //     queryKey: ['automation-info', id]
      //   })
      // }, 300)
    } catch (error) {
      console.error('Error removing trigger:', error)
      
      // Revert state on error
      setSelectedTriggers(previousTriggers)
      
      // Revert node data
      setNodes(currentNodes => 
        currentNodes.map(node => 
          node.type === 'trigger' 
            ? {
                ...node,
                data: {
                  ...node.data,
                  selectedTriggers: previousTriggers,
                  configurationStatus: previousTriggers.length > 0 ? 'configured' : 'unconfigured'
                }
              }
            : node
        )
      )
      
      // Error toast
      hideToast()
      toast.error('Failed to remove trigger')
      
      // Skip expensive refetch for instant UI response
      // queryClient.invalidateQueries({ 
      //   queryKey: ['automation-info', id] 
      // })
      
      // Remove event listener
      window.removeEventListener('beforeunload', preventReload)
    }
  }, [id, saveChanges, showToast, hideToast, queryClient, setNodes, selectedTriggers, preventReload])

  // Handle new trigger button click
  const handleNewTrigger = React.useCallback(() => {
    setIsTriggerConfigOpen(false)
    setIsTriggerSidebarOpen(true)
  }, [])

  // Handle action removal
  const handleActionRemove = React.useCallback(async (actionId: string) => {
    try {
      console.log('Removing action:', actionId)
      
      // Show loading toast and prevent page reload
      showToast('loading', 'Removing action', true)
      window.addEventListener('beforeunload', preventReload)

      // First remove the listener from the database
      const result = await saveChanges({
        listener: undefined // Use undefined to match the type
      })

      if (!result || result.status !== 200) {
        throw new Error('Failed to remove listener')
      }

      // After successful database update, update UI state
      setNodes(nds => {
        const filteredNodes = nds.filter(n => n.id !== actionId)
        return [...filteredNodes, {
          id: 'placeholder-1',
          type: 'placeholder',
          position: { x: 600, y: 190 },
          data: { 
            label: 'Add Action',
            onActionSelect: handleActionSelect
          }
        }]
      })
      
      setEdges(eds => {
        const filteredEdges = eds.filter(e => e.target !== actionId)
        return [...filteredEdges, {
          id: 'edge-placeholder',
          source: 'trigger-1',
          target: 'placeholder-1',
          type: 'custom',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }]
      })
      
      // Clear selected actions and action node state
      setSelectedActions([])
      actionNodeStateRef.current = null

      // Skip expensive refetch for instant UI response
      // await queryClient.invalidateQueries({ 
      //   queryKey: ['automation-info', id],
      //   exact: true,
      //   refetchType: 'all'
      // })

      showToast('success', 'Action removed successfully', true)
    } catch (error) {
      console.error('Error removing action:', error)
      
      // Remove reload prevention
      window.removeEventListener('beforeunload', preventReload)
      
      // Show error toast
      toast.error('Failed to remove action')
      
      // Skip expensive refetch for instant UI response
      // queryClient.invalidateQueries({ queryKey: ['automation-info', id] })
    }
  }, [setNodes, setEdges, saveChanges, queryClient, id, showToast])

  // Handle action selection from modal
  	const handleActionSelect = React.useCallback(async (actionId: string, actionType: 'MESSAGE' | 'PROLYAI', actionName: string, icon: React.ComponentType<any>, config?: any) => {
    try {
      // First check the database state with proper typing
      const currentState = await queryClient.getQueryData(['automation-info', id]) as { data?: AutomationData }
      if (currentState?.data?.listener) {
        toast.error('Please remove the current action before adding a new one.')
        setIsActionModalOpen(false)
        return
      }

      // Show loading toast and prevent page reload
      showToast('loading', 'Adding new action', true)
      window.addEventListener('beforeunload', preventReload)

      // Create new action node with correct structure
      const actionNode: Node = {
        id: actionId,
        type: 'action',
        position: { x: 600, y: 190 },
        data: {
          id: actionId,
          listener: {
            listener: actionType,
            prompt: '',
            message: config?.message || '',
            commentReply: null,
            dmCount: 0,
            commentCount: 0
          }
        }
      }

      // Update nodes and edges
      setNodes(nds => {
        const filteredNodes = nds.filter(n => !n.id.startsWith('placeholder'))
        return [...filteredNodes, actionNode]
      })

      setEdges(eds => {
        const newEdge = {
          id: `edge-${actionId}`,
          source: 'trigger-1',
          target: actionId,
          type: 'custom',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }
        return [...eds.filter(e => !e.target.startsWith('placeholder')), newEdge]
      })

      // Update selected actions and show sidebar
      setSelectedActions([{ id: actionId, name: actionName, icon }])
      setIsTriggerConfigOpen(true)
      actionNodeStateRef.current = actionNode
      
      // Save the action type to the database with correct structure
      await saveChanges({
        listener: {
          type: actionType,
          status: config?.message ? 'CONFIGURED' : 'UNCONFIGURED',
          prompt: '',
          commentReply: null,
          dmCount: 0,
          commentCount: 0
        }
      })

      // Remove reload prevention and show success toast
      window.removeEventListener('beforeunload', preventReload)
      showToast('success', 'Action added successfully', true)
      
      // Close the action modal
      setIsActionModalOpen(false)

      // Skip expensive refetch for instant UI response
      // await queryClient.invalidateQueries({ 
      //   queryKey: ['automation-info', id],
      //   exact: true,
      //   refetchType: 'all'
      // })
    } catch (error) {
      console.error('Error adding action:', error)
      
      // Remove reload prevention
      window.removeEventListener('beforeunload', preventReload)
      
      // Show error toast
      toast.error('Failed to add action')
      
      // Revert UI changes
      setNodes(nds => {
        const filteredNodes = nds.filter(n => n.id !== actionId)
        return [...filteredNodes, {
          id: 'placeholder-1',
          type: 'placeholder',
          position: { x: 600, y: 190 },
          data: { 
            label: 'Add Action',
            onActionSelect: handleActionSelect
          }
        }]
      })
      
      setEdges(eds => {
        const filteredEdges = eds.filter(e => e.target !== actionId)
        return [...filteredEdges, {
          id: 'edge-placeholder',
          source: 'trigger-1',
          target: 'placeholder-1',
          type: 'custom',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }]
      })
      
      setSelectedActions([])
      actionNodeStateRef.current = null
      setIsActionModalOpen(false)
    }
  }, [nodes, selectedActions, setNodes, setEdges, saveChanges, showToast, preventReload, queryClient, id])

  // Add a new function to handle message updates
  const handleMessageUpdate = React.useCallback((actionId: string, message: string) => {
    // Update the node data
    setNodes(nds => nds.map(node => {
      if (node.id === actionId) {
        return {
          ...node,
          data: {
            ...node.data,
            listener: {
              ...node.data.listener,
              message,
              // Also update messageData if it exists to maintain consistency
              messageData: node.data.listener.messageData ? {
                ...node.data.listener.messageData,
                textContent: message,
                type: 'TEXT' as const
              } : {
                type: 'TEXT' as const,
                textContent: message
              }
            }
          }
        }
      }
      return node
    }))

    // Save the updated message to the database
    saveChanges({
      listener: {
        type: 'MESSAGE',
        status: 'CONFIGURED'
      }
    })
  }, [setNodes, saveChanges])

  // Add a new function to handle prompt updates
  const handlePromptUpdate = React.useCallback((actionId: string, prompt: string) => {
    // Update nodes with new prompt
    setNodes(nds => nds.map(node => {
      if (node.id === actionId) {
        return {
          ...node,
          data: {
            ...node.data,
            listener: {
              ...node.data.listener,
              prompt,
              status: 'CONFIGURED'
            }
          }
        }
      }
      return node
    }))

    // Save changes to the database
    saveChanges({
      listener: {
        					type: 'PROLYAI',
        status: 'CONFIGURED',
        prompt
      }
    })
  }, [setNodes, saveChanges])

  // Handle trigger configuration updates
  const handleTriggerConfig = React.useCallback(async (type: string, config: TriggerConfig | null) => {
    // Get existing config from nodes
    const existingNode = nodes.find(node => node.type === 'trigger')

    // Log current state for debugging
    console.log('handleTriggerConfig called with:', { type, config, existingNode })
    
    // If config is null, this is a trigger removal operation
    if (config === null) {
      try {
        console.log('Removing trigger with type:', type)
        
        // First update local state for optimistic UI
        setSelectedTriggers([])
        
        // Update trigger node data
        setNodes(currentNodes => 
          currentNodes.map(node => 
            node.type === 'trigger' 
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    selectedTriggers: [],
                    config: undefined,
                    configurationStatus: 'unconfigured',
                    type: 'New Trigger'
                  }
                }
              : node
          )
        )
        
        // Clear local trigger configuration
        setTriggerConfig(prev => {
          const newState = { ...prev }
          if (type in newState) delete newState[type]
          return newState
        })
        
        // This is the critical fix - the API expects an empty array for trigger removal
        const result = await saveChanges({
          trigger: [] // Pass empty array to remove trigger
        })
        
        if (!result || result.status !== 200) {
          throw new Error('Failed to remove trigger from database')
        }
        
        return true
      } catch (error) {
        console.error('Error removing trigger:', error)
        return false
      }
    }
    
    // Handle the regular trigger configuration flow for non-null config
    // Create a clean configuration object when empty config is passed
    let finalConfig: TriggerConfig
    
    if (!config || config.status === 'unconfigured') {
      // Create empty configuration with proper type structure based on trigger type
      if (type === 'post-comments' || type === 'COMMENT') {
        finalConfig = {
          type: 'all' as const, // Using 'as const' to specify exact type
          keywords: { include: [] },
          replyMessages: [],
          status: 'unconfigured'
        }
      } else {
        // Default empty configuration for other trigger types
        finalConfig = {
          type: 'all' as const,
          keywords: { include: [] },
          replyMessages: [],
          status: 'unconfigured'
        }
      }
    } else {
      // Use the provided config
      finalConfig = config
    }

    // Clone the current nodes for modification
    const newNodes = [...nodes]
    
    // Find trigger node and update it
    const triggerNodeIndex = nodes.findIndex(node => node.type === 'trigger')
    if (triggerNodeIndex >= 0) {
      // Create a new node with updated data
      newNodes[triggerNodeIndex] = {
        ...nodes[triggerNodeIndex],
        data: {
          ...nodes[triggerNodeIndex].data,
          config: finalConfig,
          configurationStatus: getConfigurationStatus(finalConfig, type)
        }
      }
    }

    // Update nodes state
    setNodes(newNodes)
    
    // Update trigger configs in the state
    setTriggerConfig(prev => ({
      ...prev,
      [type]: finalConfig
    }))
      
    // Save changes to database
    try {
      // Convert DM to user-message and COMMENT to post-comments for API consistency
      const apiTriggerType = type === 'DM' ? 'user-message' : 
                             type === 'COMMENT' ? 'post-comments' : 
                             type;
      
      // Format the data according to expected structure (array of triggers)
      await saveChanges({
        trigger: [{
          type: apiTriggerType,
          config: finalConfig
        }]
      })
      return true
    } catch (error) {
      console.error('Error saving trigger configuration:', error)
      return false
    }
  }, [nodes, saveChanges, setNodes])

  // Define the initializeNodesAndEdges function before it's used
  const initializeNodesAndEdges = React.useCallback((data: any) => {
    const automationData = data.data as unknown as Partial<AutomationData>
    const initialNodes: Node[] = []
    const initialEdges: Edge[] = []

    // Initialize selected triggers from saved data
    if (automationData.trigger && automationData.trigger.length > 0) {
      const savedTrigger = automationData.trigger[0]
      console.log('Initializing trigger from data:', savedTrigger)

      // Map API trigger type to UI type with simplified mapping
      let triggerType = savedTrigger.type
      if (triggerType === 'user-message') {
        triggerType = 'DM'
      } else if (triggerType === 'post-comments') {
        triggerType = 'COMMENT'
      }

      const triggerDetails = getTriggerDetails(triggerType)
      console.log('Mapped trigger details:', { 
        originalType: savedTrigger.type, 
        mappedType: triggerType, 
        details: triggerDetails 
      })

      if (triggerDetails) {
        const trigger = {
          id: triggerType,
          name: triggerDetails.name,
          icon: triggerDetails.icon
        }
        
        // Set the selected triggers state
        setSelectedTriggers([trigger])
        
        // Set the selected trigger for configuration with API type mapping
        const mappedTrigger = {
          ...trigger,
          id: trigger.id === 'COMMENT' ? 'post-comments' :
              trigger.id === 'DM' ? 'user-message' :
              trigger.id
        }
        setSelectedTriggerForConfig(mappedTrigger)
      }
    }

    // Add trigger node
    const triggerNode: Node = {
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: {
        type: automationData.trigger?.[0]?.type ?? 'New Trigger',
        keywords: automationData.trigger?.[0]?.keywords ?? [],
        // Use the current selectedTriggers state directly from the component state
        // This ensures we're using the most up-to-date state
        selectedTriggers: automationData.trigger && automationData.trigger.length > 0 && getTriggerDetails(
          automationData.trigger[0].type === 'user-message' ? 'DM' :
          automationData.trigger[0].type === 'post-comments' ? 'COMMENT' :
          automationData.trigger[0].type
        ) ? [{
          id: automationData.trigger[0].type === 'user-message' ? 'DM' :
             automationData.trigger[0].type === 'post-comments' ? 'COMMENT' :
             automationData.trigger[0].type,
          name: getTriggerDetails(
            automationData.trigger[0].type === 'user-message' ? 'DM' :
            automationData.trigger[0].type === 'post-comments' ? 'COMMENT' :
            automationData.trigger[0].type
          )?.name || '',
          icon: getTriggerDetails(
            automationData.trigger[0].type === 'user-message' ? 'DM' :
            automationData.trigger[0].type === 'post-comments' ? 'COMMENT' :
            automationData.trigger[0].type
          )?.icon || (() => null)
        }] : [],
        onTriggerSelect: handleTriggerSelect,
        onTriggerRemove: handleTriggerRemove,
        onActionSelect: handleActionSelect,
        onActionRemove: handleActionRemove,
        isConfigSidebarOpen: isTriggerConfigOpen,
        onConfigSidebarClose: () => setIsTriggerConfigOpen(false),
        onConfigSidebarOpen: () => setIsTriggerConfigOpen(true),
        isTriggerSidebarOpen,
        onTriggerSidebarOpen: () => setIsTriggerSidebarOpen(true),
        onTriggerSidebarClose: () => setIsTriggerSidebarOpen(false),
        onTriggerConfigurationOpen: handleTriggerConfigurationOpen,
        config: automationData.trigger?.[0]?.config,
        configurationStatus: automationData.trigger?.[0]?.config 
          ? getConfigurationStatus(automationData.trigger[0].config as TriggerConfig, automationData.trigger[0].type)
          : 'unconfigured'
      }
    }
    initialNodes.push(triggerNode)

    // Handle action node initialization
    if (automationData.listener) {
      console.log('Initializing action from data:', automationData.listener)
      
      // Create action node
      const actionNode = {
        id: 'action-1',
        type: 'action',
        position: { x: triggerNode.position.x + 600, y: 190 },
        data: {
          id: 'action-1',
          listener: {
            listener: automationData.listener.type, // Use the correct field from database
            prompt: automationData.listener.prompt || '',
            commentReply: automationData.listener.commentReply,
            dmCount: automationData.listener.dmCount,
            commentCount: automationData.listener.commentCount,
            messageData: automationData.listener.messageData
          }
        }
      }
      initialNodes.push(actionNode)
      actionNodeStateRef.current = actionNode

      // Set selected action
      const actionIcon = automationData.listener.type === 'MESSAGE' ? MessageSquare : Bot
      setSelectedActions([{
        id: 'action-1',
        name: automationData.listener.type === 'MESSAGE' ? 'Send Message' : 'AI Assistant',
        icon: actionIcon
      }])

      // Add edge
      initialEdges.push({
        id: 'edge-1',
        source: 'trigger-1',
        target: 'action-1',
        type: 'custom',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      })
    } else {
      // Add placeholder if no action exists
      const placeholderNode: Node = {
        id: 'placeholder-1',
        type: 'placeholder',
        position: { x: 600, y: 190 },
        data: { 
          label: 'Add Action',
          onActionSelect: handleActionSelect
        }
      }
      initialNodes.push(placeholderNode)

      initialEdges.push({
        id: 'edge-placeholder',
        source: 'trigger-1',
        target: 'placeholder-1',
        type: 'custom',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      })
    }

    // Set initial nodes and edges
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [
    handleTriggerSelect,
    handleTriggerRemove,
    handleActionSelect,
    handleActionRemove,
    isTriggerConfigOpen,
    isTriggerSidebarOpen,
    handleTriggerConfigurationOpen,
    setNodes,
    setEdges,
    setSelectedTriggers,
    setSelectedTriggerForConfig,
    setSelectedActions
  ])

  // Initialize flow with data
  React.useEffect(() => {
    if (data && !isInitializedRef.current) {
      // Initialize nodes and edges based on automation data
      initializeNodesAndEdges(data)
      isInitializedRef.current = true
    } else if (data && isInitializedRef.current && nodes.length === 0) {
      // If nodes are empty but we have data, re-initialize
      // This can happen after a trigger is removed and the component re-renders
      console.log('Re-initializing flow with data after nodes were cleared')
      initializeNodesAndEdges(data)
    }
  }, [data, nodes.length, initializeNodesAndEdges])

  // Sync action node state with nodes
  React.useEffect(() => {
    if (actionNodeStateRef.current) {
      const actionNodeExists = nodes.some(node => node.id === actionNodeStateRef.current?.id)
      if (!actionNodeExists) {
        // If the action node was removed, clear the ref
        actionNodeStateRef.current = null
      }
    }
  }, [nodes])

  // Handle node changes
  const onNodesChangeCustom = React.useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
    
    // Ensure action node state persists through changes
    if (actionNodeStateRef.current) {
      const actionNodeExists = changes.every(change => 
        change.type !== 'remove' || change.id !== actionNodeStateRef.current?.id
      )
      
      if (actionNodeExists) {
        setNodes(nds => 
          nds.map(node => 
            node.id === actionNodeStateRef.current?.id ? 
            { ...node, type: 'action', data: actionNodeStateRef.current.data } : 
            node
          )
        )
      }
    }
  }, [onNodesChange, setNodes])

  const onConnect = React.useCallback(
    (params: Connection) => {
      // Only allow one connection from trigger to action or placeholder
      if (params.source && 
          (params.target?.startsWith('placeholder') || params.target?.startsWith('action')) && 
          params.source.startsWith('trigger')) {
        
        if (params.target?.startsWith('placeholder')) {
          // Convert placeholder to action node
          const placeholderNode = nodes.find(n => n.id === params.target)
          if (placeholderNode) {
            const actionNode: Node = {
              id: `action-${nodes.length + 1}`,
              type: 'action',
              position: placeholderNode.position,
              data: {
                listener: {
                  listener: 'MESSAGE',
                  prompt: '',
                  commentReply: null,
                  dmCount: 0,
                  commentCount: 0
                }
              }
            }
            
            actionNodeStateRef.current = actionNode
            setNodes(nds => [
              ...nds.filter(n => n.id !== params.target),
              actionNode
            ])
            
            // Add edge to the new action node
            setEdges(eds => addEdge({
              ...params,
              target: actionNode.id,
              type: 'custom',
              animated: true,
              style: { stroke: '#94a3b8', strokeWidth: 2 }
            }, eds))
          }
        } else {
          // Normal connection between trigger and action
          setEdges(eds => addEdge({
            ...params,
            type: 'custom',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
              width: 20,
              height: 20
            }
          }, eds))
        }
      } else {
        toast.error('Invalid connection. Connect trigger to action only.')
      }
    },
    [nodes, setNodes, setEdges]
  )

  // Handle node click
  const onNodeClick = React.useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    // Open FlowConfigSidebar when clicking on trigger node
    if (node.type === 'trigger') {
      setIsTriggerConfigOpen(true)
    }
  }, [])

  // Sync nodes with selected actions
  React.useEffect(() => {
    const actionNode = nodes.find(n => n.type === 'action')
    const hasSelectedAction = selectedActions.length > 0
    
    // If there's a mismatch between nodes and selected actions, fix it
    if (actionNode && !hasSelectedAction) {
      // Remove orphaned action node
      setNodes(nds => {
        const filteredNodes = nds.filter(n => n.id !== actionNode.id)
        return [...filteredNodes, {
          id: 'placeholder-1',
          type: 'placeholder',
          position: { x: 600, y: 190 },
          data: { 
            label: 'Add Action',
            onActionSelect: handleActionSelect
          }
        }]
      })
      
      // Clean up edges
      setEdges(eds => {
        const filteredEdges = eds.filter(e => e.target !== actionNode.id)
        return [...filteredEdges, {
          id: 'edge-placeholder',
          source: 'trigger-1',
          target: 'placeholder-1',
          type: 'custom',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }]
      })
      
      actionNodeStateRef.current = null
    }
  }, [nodes, selectedActions, setNodes, setEdges])

  // Handle choosing next step from sidebar
  const handleChooseNextStep = () => {
    setIsActionModalOpen(true)
  }

  // Handle sidebar close
  const handleTriggerConfigClose = React.useCallback(() => {
    setIsTriggerConfigOpen(false)
    setIsActionModalOpen(false)
  }, [])

  // Sync nodes with selected triggers
  React.useEffect(() => {
    setNodes(nds => 
      nds.map(node => {
        if (node.type === 'trigger') {
          console.log('Updating trigger node with selectedTriggers:', selectedTriggers);
          return {
            ...node,
            data: {
              ...node.data,
              selectedTriggers,
              onTriggerSelect: handleTriggerSelect,
              onTriggerRemove: handleTriggerRemove,
              onActionSelect: handleActionSelect,
              onActionRemove: handleActionRemove,
              isConfigSidebarOpen: isTriggerConfigOpen,
              onConfigSidebarClose: () => setIsTriggerConfigOpen(false),
              onConfigSidebarOpen: () => setIsTriggerConfigOpen(true),
              isTriggerSidebarOpen,
              onTriggerSidebarOpen: () => setIsTriggerSidebarOpen(true),
              onTriggerSidebarClose: () => setIsTriggerSidebarOpen(false),
              onTriggerConfigurationOpen: handleTriggerConfigurationOpen
            }
          }
        }
        return node
      })
    )
  }, [selectedTriggers, isTriggerSidebarOpen, handleTriggerSelect, handleTriggerRemove, handleTriggerConfigurationOpen])

  const nodeTypes = React.useMemo(() => ({
    trigger: TriggerNode,
    action: (props: any) => (
      <ActionNode 
        {...props} 
        onMessageUpdate={handleMessageUpdate}
        onPromptUpdate={handlePromptUpdate}
      />
    ),
    placeholder: PlaceholderNode
  }), [handleMessageUpdate, handlePromptUpdate])

  const edgeTypes = React.useMemo(() => ({
    custom: CustomEdge,
  }), [])

  // Replace the TriggerConfigurationSidebar with dynamic component
  const TriggerConfigComponent = selectedTriggerForConfig 
    ? getTriggerConfigComponent(selectedTriggerForConfig.id)
    : null

  // Handle trigger configuration open/close
  const handleTriggerConfigurationClose = React.useCallback(() => {
    setIsTriggerConfigurationOpen(false)
  }, [])

  // Persist selected trigger to local storage
  React.useEffect(() => {
    if (selectedTriggers.length > 0) {
      // Store only the necessary information
      const triggerToStore = selectedTriggers.map(trigger => ({
        id: trigger.id,
        name: trigger.name
        // We don't store the icon as it's a React component and can't be serialized
      }));
      localStorage.setItem(`automation-trigger-${id}`, JSON.stringify(triggerToStore));
      console.log('Saved trigger to localStorage:', triggerToStore);
    }
  }, [selectedTriggers, id]);

  // Restore selected trigger from local storage if needed
  React.useEffect(() => {
    if (selectedTriggers.length === 0 && data?.data) {
      try {
        const storedTrigger = localStorage.getItem(`automation-trigger-${id}`);
        if (storedTrigger) {
          const parsedTrigger = JSON.parse(storedTrigger);
          console.log('Found stored trigger in localStorage:', parsedTrigger);
          
          if (parsedTrigger.length > 0) {
            // We need to restore the icon
            const triggerWithIcon = parsedTrigger.map((trigger: { id: string; name: string }) => {
              const triggerDetails = getTriggerDetails(
                trigger.id === 'COMMENT' ? 'COMMENT' :
                trigger.id === 'DM' ? 'DM' :
                trigger.id
              );
              
              if (triggerDetails) {
                return {
                  id: trigger.id,
                  name: trigger.name,
                  icon: triggerDetails.icon
                };
              }
              return null;
            }).filter(Boolean);
            
            if (triggerWithIcon.length > 0) {
              console.log('Restoring trigger from localStorage:', triggerWithIcon);
              setSelectedTriggers(triggerWithIcon);
              
              // Also set the selected trigger for configuration
              const mappedTrigger = {
                ...triggerWithIcon[0],
                id: triggerWithIcon[0].id === 'COMMENT' ? 'post-comments' :
                    triggerWithIcon[0].id === 'DM' ? 'user-message' :
                    triggerWithIcon[0].id
              };
              setSelectedTriggerForConfig(mappedTrigger);
            }
          }
        }
      } catch (error) {
        console.error('Error restoring trigger from localStorage:', error);
      }
    }
  }, [data, id, selectedTriggers.length]);

  // Mobile view component - AutomationFlowBuilderCard
  const MobileFlowBuilderView = React.useMemo(() => {
    const features = [
      {
        key: 'dragDrop',
        icon: <MousePointer size={12} />,
        text: 'Drag & drop interface'
      },
      {
        key: 'visualFlow',
        icon: <Zap size={12} />,
        text: 'Visual flow connections'
      },
      {
        key: 'triggerConfig',
        icon: <Settings size={12} />,
        text: 'Advanced trigger configuration'
      },
      {
        key: 'realTimeTesting',
        icon: <Play size={12} />,
        text: 'Real-time testing'
      }
    ]

    return (
      <div className="w-full h-full flex items-center justify-center p-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-sm mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-xl"
        >
          {/* Content */}
          <div className="relative z-10 space-y-8">
            {/* Header */}
            <div className="space-y-4 text-center">
              <motion.h2 
                className="text-lg font-semibold text-gray-900 tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Automation Flow Builder
              </motion.h2>
              <motion.p 
                className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Create powerful automation workflows with our intuitive visual builder. 
                Design complex processes with simple drag-and-drop actions.
              </motion.p>
            </div>

            {/* Feature Checklist */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 0.5 + index * 0.08, 
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  <FeatureItem
                    icon={feature.icon}
                    text={feature.text}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2"
            >
              <GradientButton onClick={toggleDesktopMode} className="w-full text-sm py-3 flex items-center justify-center gap-2">
                <Monitor size={14} />
                Enable Desktop Mode
              </GradientButton>
            </motion.div>

            {/* Info Text */}
            <motion.p 
              className="text-xs text-gray-500 text-center leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              Desktop mode provides enhanced features and better performance for complex workflows.
            </motion.p>
          </div>
        </motion.div>
      </div>
    )
  }, [toggleDesktopMode])

  return (
    <div className="absolute inset-0">
      {showMobileView ? MobileFlowBuilderView : (
      <ReactFlow
        nodes={memoizedNodes}
        edges={memoizedEdges}
        onNodesChange={onNodesChangeCustom}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
          fitViewOptions={{ padding: 0.1, minZoom: 0.3, maxZoom: 1.5 }}
        className="w-full h-full bg-gray-50"
          minZoom={0.3}
          maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
            width: 20,
            height: 20
          }
        }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={proOptions}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          panOnDrag={true}
          panOnScroll={true}
          panOnScrollSpeed={0.5}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          selectNodesOnDrag={false}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
      >
        <Background 
          color="#64748b"
          gap={20} 
          size={1.5}
          variant={BackgroundVariant.Dots}
          className="opacity-50"
        />
        <Controls 
            className="!left-2 !bottom-2 sm:!left-4 sm:!bottom-4 flex flex-col gap-0.5"
          showInteractive={false}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <MiniMap 
            className="bg-white border shadow-sm !bottom-2 !right-2 sm:!bottom-4 sm:!right-4 hidden sm:block"
          nodeColor="#94a3b8"
          nodeStrokeColor="#64748b"
          nodeStrokeWidth={2}
          maskColor="rgba(240, 240, 240, 0.6)"
            style={{ width: 100, height: 70 }}
          />
          
          {/* Mobile View Toggle - Show when in desktop mode on mobile */}
          {isMobile && forceDesktopMode && (
            <Panel position="top-right" className="m-2">
              <Button
                onClick={toggleDesktopMode}
                variant="outline"
                size="sm"
                className="bg-white border border-gray-300 shadow-sm text-xs px-3 py-2"
              >
                📱 Mobile View
              </Button>
            </Panel>
          )}
      </ReactFlow>
      )}

      {/* Flow Config Sidebar */}
      <FlowConfigSidebar
        isOpen={isTriggerConfigOpen}
        onClose={handleTriggerConfigClose}
        onChooseNextStep={handleChooseNextStep}
        onNewTrigger={handleNewTrigger}
        selectedTriggers={selectedTriggers}
        onTriggerRemove={handleTriggerRemove}
        selectedActions={selectedActions}
        onActionRemove={handleActionRemove}
        showChooseNextStep={selectedActions.length === 0}
        onTriggerConfigurationOpen={handleTriggerConfigurationOpen}
      />

      {/* Action Modal */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onSelect={handleActionSelect}
      />

      {/* Trigger Sidebar */}
      <TriggerSidebar
        isOpen={isTriggerSidebarOpen}
        onClose={() => setIsTriggerSidebarOpen(false)}
        onSelect={handleTriggerSelect}
        selectedTriggers={selectedTriggers}
      />

      {/* Replace the existing TriggerConfigurationSidebar */}
      {TriggerConfigComponent && (
        <TriggerConfigComponent
          isOpen={isTriggerConfigurationOpen}
          onClose={handleTriggerConfigurationClose}
          automationId={id}
          onTriggerConfig={handleTriggerConfig}
        />
      )}
    </div>
  )
}

export default function FlowBuilderWithStyles(props: FlowBuilderProps) {
  return (
    <>
      <FlowBuilder {...props} />
      <style jsx global>{`
        @property --pos-x {
          syntax: '<percentage>';
          initial-value: 11.14%;
          inherits: false;
        }

        @property --pos-y {
          syntax: '<percentage>';
          initial-value: 140%;
          inherits: false;
        }

        @property --spread-x {
          syntax: '<percentage>';
          initial-value: 150%;
          inherits: false;
        }

        @property --spread-y {
          syntax: '<percentage>';
          initial-value: 180.06%;
          inherits: false;
        }

        @property --color-1 {
          syntax: '<color>';
          initial-value: #000;
          inherits: false;
        }

        @property --color-2 {
          syntax: '<color>';
          initial-value: #08012c;
          inherits: false;
        }

        @property --color-3 {
          syntax: '<color>';
          initial-value: #4e1e40;
          inherits: false;
        }

        @property --color-4 {
          syntax: '<color>';
          initial-value: #70464e;
          inherits: false;
        }

        @property --color-5 {
          syntax: '<color>';
          initial-value: #88394c;
          inherits: false;
        }

        @property --border-angle {
          syntax: '<angle>';
          initial-value: 20deg;
          inherits: true;
        }

        @property --border-color-1 {
          syntax: '<color>';
          initial-value: hsla(340, 75%, 60%, 0.2);
          inherits: true;
        }

        @property --border-color-2 {
          syntax: '<color>';
          initial-value: hsla(340, 75%, 40%, 0.75);
          inherits: true;
        }

        @property --stop-1 {
          syntax: '<percentage>';
          initial-value: 37.35%;
          inherits: false;
        }

        @property --stop-2 {
          syntax: '<percentage>';
          initial-value: 61.36%;
          inherits: false;
        }

        @property --stop-3 {
          syntax: '<percentage>';
          initial-value: 78.42%;
          inherits: false;
        }

        @property --stop-4 {
          syntax: '<percentage>';
          initial-value: 89.52%;
          inherits: false;
        }

        @property --stop-5 {
          syntax: '<percentage>';
          initial-value: 100%;
          inherits: false;
        }

        .gradient-button {
          position: relative;
          appearance: none;
          cursor: pointer;
          background: radial-gradient(
            var(--spread-x) var(--spread-y) at var(--pos-x) var(--pos-y),
            var(--color-1) var(--stop-1),
            var(--color-2) var(--stop-2),
            var(--color-3) var(--stop-3),
            var(--color-4) var(--stop-4),
            var(--color-5) var(--stop-5)
          );
          transition:
            --pos-x 0.5s,
            --pos-y 0.5s,
            --spread-x 0.5s,
            --spread-y 0.5s,
            --color-1 0.5s,
            --color-2 0.5s,
            --color-3 0.5s,
            --color-4 0.5s,
            --color-5 0.5s,
            --border-angle 0.5s,
            --border-color-1 0.5s,
            --border-color-2 0.5s,
            --stop-1 0.5s,
            --stop-2 0.5s,
            --stop-3 0.5s,
            --stop-4 0.5s,
            --stop-5 0.5s;
        }

        .gradient-button::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            var(--border-angle),
            var(--border-color-1),
            var(--border-color-2)
          );
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .gradient-button:hover {
          --pos-x: 0%;
          --pos-y: 91.51%;
          --spread-x: 120.24%;
          --spread-y: 103.18%;
          --color-1: #c96287;
          --color-2: #c66c64;
          --color-3: #cc7d23;
          --color-4: #37140a;
          --color-5: #000;
          --border-angle: 190deg;
          --border-color-1: hsla(340, 78%, 90%, 0.1);
          --border-color-2: hsla(340, 75%, 90%, 0.6);
          --stop-1: 0%;
          --stop-2: 8.8%;
          --stop-3: 21.44%;
          --stop-4: 71.34%;
          --stop-5: 85.76%;
        }

        .glass-effect {
          background: rgba(0, 0, 0, 0.1);
          background: repeating-radial-gradient(
            circle at 50% 50%,
            rgb(255 255 255 / 0),
            rgba(255, 255, 255, 0.1) 10px,
            rgb(255 255 255 / 0.05) 31px
          );
          filter: url(#fractal-noise-glass);
          background-size: 6px 6px;
          backdrop-filter: blur(0px);
        }
      `}</style>
    </>
  )
}