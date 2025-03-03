'use client'

import * as React from 'react'
import { ToastNotification } from '@/components/ui/toast-notification'
import { usePathname } from 'next/navigation'

interface ToastContextType {
  showToast: (type: 'loading' | 'success', message?: string, withOverlay?: boolean | string) => void
  hideToast: () => void
  isShowingOverlay: boolean
  affectedNodeId: string | null
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

const GLOBAL_SHEET_STYLE = `
  [data-radix-portal] {
    position: relative;
    z-index: 9998 !important;
  }
`

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [show, setShow] = React.useState(false)
  const [state, setState] = React.useState<'loading' | 'success'>('loading')
  const [message, setMessage] = React.useState<string>('')
  const [showOverlay, setShowOverlay] = React.useState(false)
  const [affectedNodeId, setAffectedNodeId] = React.useState<string | null>(null)
  
  const styleRef = React.useRef<HTMLStyleElement | null>(null)
  
  const isAutomationPage = React.useMemo(() => {
    return pathname?.includes('/automations') || false
  }, [pathname])

  React.useEffect(() => {
    if (showOverlay) {
      if (!styleRef.current) {
        const style = document.createElement('style')
        style.innerHTML = GLOBAL_SHEET_STYLE
        document.head.appendChild(style)
        styleRef.current = style
      }
      
      return () => {
        if (styleRef.current) {
          document.head.removeChild(styleRef.current)
          styleRef.current = null
        }
      }
    }
  }, [showOverlay])

  const showToast = React.useCallback((type: 'loading' | 'success', message?: string, withOverlay?: boolean | string) => {
    setState(type)
    if (message) setMessage(message)
    
    if (typeof withOverlay === 'string') {
      setAffectedNodeId(withOverlay)
      setShowOverlay(true)
    } else {
      const shouldShowOverlay = withOverlay === true || (withOverlay !== false && isAutomationPage)
      setShowOverlay(shouldShowOverlay)
      setAffectedNodeId(null)
    }
    
    setShow(true)
  }, [isAutomationPage])

  const hideToast = React.useCallback(() => {
    setShow(false)
    setShowOverlay(false)
    setAffectedNodeId(null)
  }, [])

  const value = React.useMemo(
    () => ({
      showToast,
      hideToast,
      isShowingOverlay: showOverlay,
      affectedNodeId
    }),
    [showToast, hideToast, showOverlay, affectedNodeId]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastNotification
        show={show}
        state={state}
        loadingText={state === 'loading' ? message || 'Saving changes' : undefined}
        successText={state === 'success' ? message || 'Changes saved' : undefined}
        onHide={hideToast}
        showOverlay={showOverlay}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}