'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { X } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToastNotificationProps extends Omit<HTMLMotionProps<"div">, "children"> {
  state: 'loading' | 'success' | 'error'
  loadingText?: string
  successText?: string
  errorText?: string
  show: boolean
  onHide?: () => void
  showOverlay?: boolean
}

const springConfig = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
  mass: 1,
}

export function ToastNotification({
  state = 'loading',
  loadingText = 'Saving changes',
  successText = 'Changes saved',
  errorText = 'Something went wrong',
  show,
  onHide,
  className,
  showOverlay = false,
  ...props
}: ToastNotificationProps) {
  React.useEffect(() => {
    if ((state === 'success' || state === 'error') && show) {
      const timer = setTimeout(() => {
        onHide?.()
      }, state === 'error' ? 3000 : 2000) // Hide errors after 3 seconds, success after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [state, show, onHide])

  // When overlay is shown, disable scrolling on the body
  React.useEffect(() => {
    if (show && showOverlay) {
      // Save the current overflow style
      const originalOverflow = document.body.style.overflow
      // Prevent scrolling
      document.body.style.overflow = 'hidden'
      
      // Return a cleanup function to restore the original overflow style
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [show, showOverlay])

  return (
    <AnimatePresence>
      {show && (
        <>
          {showOverlay && (
            <motion.div
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={state === 'success' ? onHide : undefined}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'all'
              }}
            />
          )}
          <motion.div
            className={cn(
              'fixed left-1/2 top-24 z-[10000] -translate-x-1/2',
              'inline-flex h-10 items-center justify-center overflow-hidden rounded-full',
              'bg-white dark:bg-gray-800',
              'border border-black/[0.08] dark:border-white/[0.08]',
              'shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)]',
              'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]',
              className,
            )}
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={springConfig}
            {...props}
          >
            <div className="flex h-full items-center justify-between px-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {state === 'loading' && (
                    <>
                      <Spinner size="sm" color="slate" />
                      <div className="text-[13px] font-medium leading-tight whitespace-nowrap">
                        {loadingText}
                      </div>
                    </>
                  )}
                  {state === 'success' && (
                    <>
                      <div className="p-0.5 bg-emerald-500/10 dark:bg-emerald-500/25 rounded-[99px] shadow-sm border border-emerald-500/20 dark:border-emerald-500/25 justify-center items-center gap-1.5 flex overflow-hidden">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <div className="text-[13px] font-normal leading-tight whitespace-nowrap">
                        {successText}
                      </div>
                    </>
                  )}
                  {state === 'error' && (
                    <>
                      <div className="p-0.5 bg-red-500/10 dark:bg-red-500/25 rounded-[99px] shadow-sm border border-red-500/20 dark:border-red-500/25 justify-center items-center gap-1.5 flex overflow-hidden">
                        <X className="w-3.5 h-3.5 text-red-600 dark:text-red-500" strokeWidth={3} />
                      </div>
                      <div className="text-[13px] font-normal leading-tight whitespace-nowrap">
                        {errorText}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}