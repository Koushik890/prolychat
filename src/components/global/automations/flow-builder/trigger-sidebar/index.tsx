'use client'

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { InstagramIcon, X, Reply } from 'lucide-react'
import { CommentIcon } from '@/icons/comment-icon'
import { MessageIcon } from '@/icons/message-icon'
import { motion } from 'framer-motion'
import { SIDEBAR_ANIMATIONS, PURPLE_THEME, CLOSE_BUTTON_STYLES, HEADER_STYLES } from '../shared/animation-patterns'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { useTriggerSelection } from '@/hooks/use-trigger-selection'

export interface TriggerSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (triggerId: string, triggerName: string, icon: React.ComponentType<any>) => void
  selectedTriggers: Array<{ id: string; name: string; icon: React.ComponentType<any> }>
}

// Create motion components using motion.create()
const MotionSheetContent = motion.create(SheetContent)
const MotionButton = motion.create('button')

const TRIGGER_OPTIONS = [
  {
    id: 'COMMENT',
    name: 'Post Comments',
    description: 'When someone comments on your post',
    icon: CommentIcon,
    isDisabled: false
  },
  {
    id: 'DM',
    name: 'Direct Message',
    description: 'When someone sends you a DM',
    icon: MessageIcon,
    isDisabled: false
  },
  {
    id: 'REPLY',
    name: 'Comment Reply',
    description: 'When someone replies to a comment',
    icon: Reply,
    isDisabled: true
  }
]

export const TriggerSidebar: React.FC<TriggerSidebarProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedTriggers
}) => {

  
  // Create a memoized version of TRIGGER_OPTIONS with dynamic disabled state
  const dynamicTriggerOptions = React.useMemo(() => {
    return TRIGGER_OPTIONS.map(option => ({
      ...option,
      isDisabled: option.isDisabled || selectedTriggers.some(trigger => trigger.id === option.id)
    }))
  }, [selectedTriggers])

  const { handleTriggerSelect } = useTriggerSelection({
    onSelect,
    onError: (error) => {
      console.error('Failed to select trigger:', error)
      // You could show a toast notification here
    }
  })

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        showCloseButton={false}
        side="right"
        className={cn(
          "p-6 w-[400px] top-0 h-screen z-[60]",
          "bg-white border-gray-200 shadow-xl",
          "border-l"
        )}
        style={{ zIndex: 60 }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded z-10"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-semibold">Select a trigger</SheetTitle>
          <p className="text-sm text-gray-600">Pick one or more events to start this automation</p>
        </SheetHeader>

        <div 
          className="flex flex-col gap-8 relative z-10"
        >
          <div className="flex flex-col gap-4">
            <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2">
              <InstagramIcon className="w-4.5 h-4.5 text-gray-600" />
              INSTAGRAM
            </h4>
            <div className="flex flex-col gap-4">
              {dynamicTriggerOptions.map((option, index) => {
                const isSelected = selectedTriggers.some(trigger => trigger.id === option.id)
                return (
                  <button
                    key={option.id}
                    className={cn(
                      "flex flex-col justify-center gap-1 p-3 rounded-lg transition-all duration-200 text-left w-full relative overflow-hidden",
                      "bg-white border border-gray-200 shadow-sm",
                      !option.isDisabled && "hover:shadow-md hover:border-gray-300",
                      option.isDisabled && "opacity-60 cursor-not-allowed bg-gray-50",
                      isSelected && "bg-purple-50 border-purple-300"
                    )}
                    onClick={() => !option.isDisabled && handleTriggerSelect(option.id, option.name, option.icon)}
                    disabled={option.isDisabled}
                    role="button"
                    aria-disabled={option.isDisabled}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between w-full min-h-[2.25rem]">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                          option.isDisabled 
                            ? "bg-gray-100 border border-gray-200" 
                            : isSelected 
                              ? "bg-purple-100 border border-purple-300"
                              : "bg-purple-50 border border-purple-200"
                        )}>
                          <option.icon className={cn(
                            "w-4 h-4 transition-all duration-200",
                            option.isDisabled 
                              ? "text-gray-400" 
                              : isSelected 
                                ? "text-purple-700" 
                                : "text-purple-600"
                          )} />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className={cn(
                            "text-sm font-medium transition-colors duration-200",
                            option.isDisabled 
                              ? "text-gray-500" 
                              : isSelected 
                                ? "text-purple-800" 
                                : "text-gray-800"
                          )}>{option.name}</span>
                          <span className="text-xs text-gray-500 font-normal truncate">
                            {option.description}
                          </span>
                        </div>
                      </div>
                      {option.isDisabled ? (
                        isSelected ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-700 ml-2 flex-shrink-0" aria-label="Selected">
                            Selected
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-600 ml-2 flex-shrink-0" aria-label="Coming Soon">
                            Coming Soon
                          </span>
                        )
                      ) : isSelected && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-700 ml-2 flex-shrink-0" aria-label="Selected">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 