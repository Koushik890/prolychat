'use client';

import React from 'react'
import { useParams } from 'next/navigation'
import AutomationsBreadCrumb from '@/components/global/bread-crumbs/automations'
import FlowBuilder from '@/components/global/automations/flow-builder'
import { useAutomationSync } from '@/hooks/use-automations'

interface AutomationClientProps {
  id: string
}

const AutomationClient = ({ id }: AutomationClientProps) => {
  // Initialize the automation sync hook
  useAutomationSync(id)

  const [sidebarWidth, setSidebarWidth] = React.useState<number>(250)
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  React.useEffect(() => {
    // Check initial sidebar state
    const sidebar = document.querySelector('aside') as HTMLElement
    if (sidebar) {
      setSidebarWidth(sidebar.offsetWidth)
    }

    const handleSidebarChange = (event: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarWidth(event.detail.collapsed ? 72 : 250)
    }

    // Add event listener
    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener)
    }
  }, [])

  const headerHeight = isMobile ? 60 : 70

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Header */}
      <AutomationsBreadCrumb id={id} />

      {/* Main Content */}
      <div 
        className="absolute inset-0 transition-[margin-left] duration-300"
        style={{ 
          marginLeft: isMobile ? '0px' : `${sidebarWidth}px`,
          marginTop: `${headerHeight}px`
        }}
      >
        <FlowBuilder id={id} />
      </div>
    </div>
  )
}

export default AutomationClient 