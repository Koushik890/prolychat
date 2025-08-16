"use client"

import * as React from "react"
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MenuItem {
  riveIcon: {
    src: string
    stateMachine: string
  }
  label: string
  hotkey: string
  onClick?: () => void
  // Optional static icon to display instead of Rive animation
  icon?: React.ComponentType<{ className?: string }>
}

interface AnimatedMenuProps {
  items: MenuItem[]
  className?: string
  arrowAlign?: 'left' | 'right' | 'top' | 'bottom'
}

function RiveIcon({ 
  src, 
  stateMachine,
  index,
  activeIndex
}: { 
  src: string
  stateMachine: string
  index: number
  activeIndex: number | null
}) {
  const [hasError, setHasError] = React.useState(false)
  
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: stateMachine,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center
    }),
    autoplay: false,
    onLoadError: () => setHasError(true)
  })

  React.useEffect(() => {
    if (!rive || hasError) return

    if (activeIndex === index) {
      rive.play(stateMachine)
    } else {
      rive.reset()
    }
  }, [activeIndex, index, rive, stateMachine, hasError])

  // Fallback for when Rive animation fails to load
  if (hasError) {
    return (
      <div className="size-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
        <div className="size-2 bg-white rounded-full opacity-90" />
      </div>
    )
  }

  return <RiveComponent className="size-6" />
}

export function AnimatedMenu({ items, className, arrowAlign = 'left' }: AnimatedMenuProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={cn(
        "relative w-[240px]",
        "bg-white/95 backdrop-blur-xl",
        "shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)]",
        "rounded-2xl p-1.5",
        "border border-purple-200/60",
        "ring-1 ring-purple-900/[0.05]",
        className
      )}
    >
      {/* Connection Arrow */}
      <div
        className={cn(
          "absolute w-0 h-0 border-transparent drop-shadow-sm",
          (arrowAlign === 'left' || arrowAlign === 'right') && "top-1/2 -translate-y-1/2 border-t-[8px] border-b-[8px]",
          (arrowAlign === 'top' || arrowAlign === 'bottom') && "left-1/2 -translate-x-1/2 border-l-[8px] border-r-[8px]",
          arrowAlign === 'left' && "-left-2 border-r-[8px] border-r-white/95",
          arrowAlign === 'right' && "-right-2 border-l-[8px] border-l-white/95",
          arrowAlign === 'top' && "-top-2 border-b-[8px] border-b-white/95",
          arrowAlign === 'bottom' && "-bottom-2 border-t-[8px] border-t-white/95",
        )}
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-transparent to-purple-100/40 rounded-2xl pointer-events-none" />
      
      <menu className="relative">
        {items.map((item, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={index < items.length - 1 ? "mb-0.5" : ""}
          >
            <button
              className={cn(
                "h-[42px] rounded-xl flex gap-3 w-full items-center px-3.5",
                "text-[14px] font-medium text-gray-700 font-mona",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40",
                "relative z-10 select-none transition-all duration-200",
                "hover:text-purple-700 cursor-pointer",
                "active:scale-[0.98]"
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={item.onClick}
            >
              <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                {item.icon ? (
                  <item.icon className="size-5 text-purple-600" />
                ) : (
                  <RiveIcon 
                    src={item.riveIcon.src} 
                    stateMachine={item.riveIcon.stateMachine}
                    index={index}
                    activeIndex={hoveredIndex}
                  />
                )}
              </div>
              <span className="flex-1 text-left font-semibold tracking-tight font-mona">
                {item.label}
              </span>
              <span className="text-[12px] font-medium text-gray-400 bg-gray-100/80 px-2 py-1 rounded-md min-w-[24px] text-center font-mona">
                <span className="sr-only font-mona">Hotkey: </span>
                {item.hotkey}
              </span>
            </button>
          </motion.li>
        ))}
        
        <motion.div
          className="absolute left-1.5 right-1.5 h-[42px] bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-200/40 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: hoveredIndex !== null ? 1 : 0,
            scale: hoveredIndex !== null ? 1 : 0.9,
            top: hoveredIndex !== null ? hoveredIndex * 44 : 0,
          }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: 0.15
          }}
        />
      </menu>
    </motion.div>
  )
} 