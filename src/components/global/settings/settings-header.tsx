'use client'

import React from 'react'
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

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ 
  userSlug = '',
  title = 'Settings',
  description,
  tabs
}) => {
  const pathname = usePathname()
  
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

  // Define the font family to ensure consistent usage
  const fontFamily = 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Apple Color Emoji", Inter, Roboto, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif'
  
  // Add inline styles to ensure font overrides work
  const headingStyle = {
    fontFamily: fontFamily
  }
  
  return (
    <header className="bg-white/75 backdrop-blur-md mb-6 -mx-8 -mt-8 sticky top-0 z-10" style={{ width: 'calc(100% + 4rem)' }}>
      <div className="px-8 pt-6">
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
                  'py-4 px-1 text-sm font-medium border-b-2 -mb-[2px] whitespace-nowrap font-sans',
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
}

export default SettingsHeader
