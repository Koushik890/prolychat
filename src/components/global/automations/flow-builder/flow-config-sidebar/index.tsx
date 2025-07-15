'use client'

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, Zap, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { SIDEBAR_ANIMATIONS, PURPLE_THEME, CLOSE_BUTTON_STYLES, HEADER_STYLES } from '../shared/animation-patterns'
import { cn } from '@/lib/utils'

interface FlowConfigSidebarProps {
  isOpen: boolean
  onClose: () => void
  onChooseNextStep: () => void
  onNewTrigger: () => void
  selectedTriggers: Array<{ id: string; name: string; icon: React.ComponentType<any> }>
  onTriggerRemove: (triggerId: string) => void
  selectedActions: Array<{ id: string; name: string; icon: React.ComponentType<any> }>
  onActionRemove: (actionId: string) => void
  showChooseNextStep?: boolean
  onTriggerConfigurationOpen?: (trigger: { id: string; name: string; icon: React.ComponentType<any> }) => void
}

const MotionSheetContent = motion.create(SheetContent)

export const FlowConfigSidebar: React.FC<FlowConfigSidebarProps> = ({
  isOpen,
  onClose,
  onChooseNextStep,
  onNewTrigger,
  selectedTriggers,
  onTriggerRemove,
  selectedActions,
  onActionRemove,
  showChooseNextStep,
  onTriggerConfigurationOpen,
}) => {
  // Handle close with cleanup
  const handleClose = React.useCallback(() => {
    onClose()
  }, [onClose])

  const handleTriggerClick = (trigger: { id: string; name: string; icon: React.ComponentType<any> }) => {
    if (onTriggerConfigurationOpen) {
      onTriggerConfigurationOpen(trigger)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <MotionSheetContent
        showCloseButton={false}
        side="right"
        className={cn(
          'p-6 w-[420px] top-0 h-screen flex flex-col overflow-hidden',
          PURPLE_THEME.glassBackground,
          PURPLE_THEME.shadow,
          PURPLE_THEME.border,
          "border-l"
        )}
        {...SIDEBAR_ANIMATIONS.slideIn}
      >
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 pointer-events-none rounded-l-2xl",
          PURPLE_THEME.gradientOverlay
        )} />
        
        <button 
          type="button"
          onClick={handleClose} 
          className={cn(CLOSE_BUTTON_STYLES.base, "group")}
          aria-label="Close sidebar"
        >
          <X className={CLOSE_BUTTON_STYLES.icon} />
          <span className="sr-only">Close</span>
        </button>
        
        <SheetHeader className={HEADER_STYLES.container}>
          <SheetTitle className={HEADER_STYLES.title}>Configure Triggers</SheetTitle>
          <p className={HEADER_STYLES.subtitle}>Set up your automation triggers and next steps</p>
        </SheetHeader>

        <motion.div 
          className="flex flex-col gap-8 relative z-10"
          {...SIDEBAR_ANIMATIONS.contentFadeIn}
        >
          {/* When Section */}
          <div className="flex flex-col gap-4">
            <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2">
              <Zap className="w-4.5 h-4.5 text-gray-600" />
              WHEN
            </h4>
            <div className="flex flex-col gap-3">
              {selectedTriggers.map((trigger, index) => (
                <motion.div
                  key={trigger.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer",
                    "bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/40 hover:border-purple-300/60"
                  )}
                  {...SIDEBAR_ANIMATIONS.staggeredItem(index)}
                  onClick={() => handleTriggerClick(trigger)}
                  {...SIDEBAR_ANIMATIONS.scaleOnHover}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center">
                      <trigger.icon className="w-4.5 h-4.5 text-purple-700" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-purple-800">{trigger.name}</span>
                    </div>
                  </div>
                  <button 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-white/80 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTriggerRemove(trigger.id)
                    }}
                    aria-label={`Remove ${trigger.name} trigger`}
                  >
                    <X className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                  </button>
                </motion.div>
              ))}
            </div>
            {selectedTriggers.length === 0 && (
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-11 border-2 border-dashed border-purple-300/50 bg-purple-50/30 hover:bg-purple-100/50 hover:border-purple-400/70 rounded-xl transition-all duration-300 text-purple-700 hover:text-purple-800 font-semibold relative overflow-hidden"
                )}
                onClick={onNewTrigger}
              >
                <span className="relative z-10">+ New Trigger</span>
              </Button>
            )}
          </div>

          {/* Then Section */}
          <div className="flex flex-col gap-4">
            <h4 className="flex items-center gap-3 text-xs font-semibold text-gray-600 tracking-wider py-2">
              THEN
            </h4>
            <div className="flex flex-col gap-3">
              {selectedActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                    "bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/40 hover:border-purple-300/60"
                  )}
                  {...SIDEBAR_ANIMATIONS.staggeredItem(index)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center">
                      <action.icon className="w-4.5 h-4.5 text-purple-700" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-purple-800">{action.name}</span>
                    </div>
                  </div>
                  <button 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-white/80 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all duration-200"
                    onClick={() => onActionRemove(action.id)}
                    aria-label={`Remove ${action.name} action`}
                  >
                    <X className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                  </button>
                </motion.div>
              ))}
            </div>
            {showChooseNextStep && (
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-11 border-2 border-dashed border-purple-300/50 bg-purple-50/30 hover:bg-purple-100/50 hover:border-purple-400/70 rounded-xl transition-all duration-300 text-purple-700 hover:text-purple-800 font-semibold"
                )}
                onClick={onChooseNextStep}
              >
                <span>Choose Next Step</span>
              </Button>
            )}
          </div>
        </motion.div>
      </MotionSheetContent>
    </Sheet>
  )
} 