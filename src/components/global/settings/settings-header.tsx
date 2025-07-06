'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SettingsTab {
  label: string
  href: string
  active: boolean
}

interface SettingsHeaderProps {
  userSlug?: string
  title?: string
  description?: string
  tabs?: SettingsTab[]
}

const SettingsHeader = React.forwardRef<HTMLElement, SettingsHeaderProps>(({ 
  userSlug = '',
  title = 'Settings',
  description,
  tabs
}, ref) => {
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  
  // Use provided tabs or fall back to default tabs
  const navigationTabs: SettingsTab[] = tabs || [
    {
      label: 'Account',
      href: `/dashboard/${userSlug}/settings/account`,
      active: pathname.includes('/settings/account')
    },
    {
      label: 'Preferences',
      href: `/dashboard/${userSlug}/settings/preferences`,
      active: pathname.includes('/settings/preferences')
    },
    {
      label: 'Payment',
      href: `/dashboard/${userSlug}/settings/payment`,
      active: pathname.includes('/settings/payment')
    }
  ]

  // Update CSS custom property for header height
  useEffect(() => {
    if (headerRef.current) {
      const updateHeaderHeight = () => {
        const height = headerRef.current?.offsetHeight
        if (height) {
          document.documentElement.style.setProperty('--header-height', `${height}px`)
        }
      }
      
      updateHeaderHeight()
      
      // Update on window resize
      window.addEventListener('resize', updateHeaderHeight)
      return () => window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [])

  // Define the font family to ensure consistent usage
  const fontFamily = 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Apple Color Emoji", Inter, Roboto, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif'
  
  // Add inline styles to ensure font overrides work
  const headingStyle = {
    fontFamily: fontFamily
  }
  
  return (
    <header 
      ref={headerRef} 
      className="w-full relative"
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="px-8 pt-6 pb-0 max-w-none">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 font-sans" style={headingStyle}>{title}</h1>
        {description && (
          <p className="text-gray-600 mb-4 font-sans">{description}</p>
        )}
        <nav className="flex space-x-8 border-b border-gray-200/20" aria-label="Settings tabs">
          {navigationTabs.map((tab) => {
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  'py-3 px-1 text-sm font-medium border-b-2 -mb-[2px] whitespace-nowrap font-sans transition-colors duration-200',
                  tab.active
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
                style={headingStyle}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
})

SettingsHeader.displayName = 'SettingsHeader'

export default SettingsHeader
