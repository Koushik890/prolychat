'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sheet, SheetTrigger, SheetContent } from '@/components/global/sheet'
import { Menu, Settings, Users, HelpCircle, Home, Zap } from 'lucide-react'
import { NavMain } from '@/components/global/app-sidebar'
import { SidebarToggle } from '@/components/global/app-sidebar/sidebar-toggle'
import Image from 'next/image'
import { SidebarProvider } from '@/components/ui/sidebar'

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
  const params = useParams<{ slug: string }>()
  const headerRef = useRef<HTMLElement>(null)
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  
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

  // Mobile-specific toggle function - closes Sheet when collapsed
  const handleMobileToggle = () => {
    if (mobileSidebarExpanded) {
      // If currently expanded, collapse by closing the sheet
      setMobileSheetOpen(false)
    } else {
      // If currently collapsed, expand 
      setMobileSidebarExpanded(true)
    }
  }

  // Handle sheet state changes
  useEffect(() => {
    // When sheet opens, always start expanded
    if (mobileSheetOpen) {
      setMobileSidebarExpanded(true)
    }
  }, [mobileSheetOpen])

  // Navigation data matching AppSidebar structure
  const navigationData = {
    navMain: [
      {
        title: "Home",
        url: `/dashboard/${params.slug}`,
        icon: Home,
      },
      {
        title: "Automations",
        url: `/dashboard/${params.slug}/automations`,
        icon: Zap,
      },
      {
        title: "Contacts",
        url: `/dashboard/${params.slug}/contacts`,
        icon: Users,
      },
    ],
  }

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
        {/* Mobile Navigation - Only visible on mobile */}
        <div className="lg:hidden mb-4">
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className={`p-0 transition-all duration-300 ${mobileSidebarExpanded ? 'w-[250px]' : 'w-[72px]'} [&>button]:hidden`}>
              <div className={`flex h-full flex-col bg-slate-50 border-r border-slate-200 font-mona text-base font-medium leading-6 transition-all duration-300 ${mobileSidebarExpanded ? 'w-[250px]' : 'w-[72px]'}`}>
                {/* Logo Section with Toggle */}
                <div className="relative h-[70px] overflow-visible">
                  <div className={`flex h-full items-center transition-all duration-300 ${
                    mobileSidebarExpanded ? "pr-2 pl-4" : "pr-1 pl-3"
                  }`}>
                    {/* Logo Container - Centered */}
                    <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
                      mobileSidebarExpanded ? "h-[40px]" : "h-[28px]"
                    }`}>
                      <div className="flex items-center gap-2">
                        {/* Logomark - always visible */}
                        <Image
                          src="/Prolychat_lm_orange.png"
                          alt="Prolychat Logomark"
                          width={mobileSidebarExpanded ? 38 : 28}
                          height={mobileSidebarExpanded ? 38 : 28}
                          className="object-contain transition-all duration-300"
                          priority
                        />
                        {/* Wordmark - only visible when expanded */}
                        {mobileSidebarExpanded && (
                          <Image
                            src="/Prolychat_og_sb.png"
                            alt="Prolychat"
                            width={110}
                            height={38}
                            className="object-contain transition-all duration-300"
                            priority
                          />
                        )}
                      </div>
                    </div>
                    {/* Toggle Button - Always on the right */}
                    <div className="flex-shrink-0">
                      <SidebarToggle isExpanded={mobileSidebarExpanded} onToggle={handleMobileToggle} />
                    </div>
                  </div>
                </div>

                {/* Navigation Sections */}
                <div className="flex flex-1 flex-col justify-between overflow-hidden pt-[17px]">
                  {/* Main Navigation */}
                  <div>
                    <div className="space-y-2.5">
                      <SidebarProvider>
                        <NavMain items={navigationData.navMain} isExpanded={mobileSidebarExpanded} />
                      </SidebarProvider>
                    </div>
                    <div className="flex flex-col">
                      {/* Divider below Contacts */}
                      <div className="relative mt-[44px] px-4">
                        <div className="absolute left-4 right-4 h-[1px] bg-gradient-to-r from-gray-300/40 via-gray-400/60 to-gray-300/40" />
                      </div>
                      {/* Help & Support Section */}
                      <div className="mt-6 px-4">
                        <Link
                          href="/help"
                          className={`group relative flex h-[40px] ${mobileSidebarExpanded ? 'w-[218px]' : 'w-[44px]'} items-center rounded-2xl transition-all ${
                            pathname === '/help'
                              ? "bg-purple-600/20 hover:bg-purple-600/25"
                              : "hover:bg-gray-700/60"
                          }`}
                        >
                          <div className="flex w-full items-center pl-[13px]">
                            <div className="flex w-[24px] items-center justify-center">
                                                    <HelpCircle className={`h-[20px] w-[20px] ${pathname === '/help' ? 'text-purple-600' : 'text-gray-600'}`} />
                    </div>
                    {mobileSidebarExpanded && (
                      <span className={`truncate pl-[18px] text-[17px] font-medium leading-6 ${pathname === '/help' ? 'text-purple-600' : 'text-gray-700'}`}>
                                Help & Support
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="pb-[17px]">
                    <div className="border-t border-gray-300/40 pt-6">
                      <div className="px-4">
                        <Link
                          href={userSlug ? `/dashboard/${userSlug}/settings/account` : '/settings/account'}
                                                      className={`relative flex h-[40px] ${mobileSidebarExpanded ? 'w-[218px]' : 'w-[44px]'} items-center rounded-2xl bg-gradient-to-br from-purple-600/15 via-purple-500/10 to-purple-600/15 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:from-purple-600/20 hover:via-purple-500/15 hover:to-purple-600/20 hover:shadow-[0_3px_12px_rgba(0,0,0,0.12)]`}
                        >
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none" />
                          <div className="relative flex w-full items-center pl-[13px]">
                            <div className="flex w-[24px] items-center justify-center">
                              <Settings className="h-[18px] w-[18px] text-purple-600" />
                            </div>
                            {mobileSidebarExpanded && (
                              <span className="truncate pl-[18px] text-[17px] font-medium leading-6 text-purple-600">Settings</span>
                            )}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

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
