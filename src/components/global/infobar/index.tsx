'use client'

import React, { useEffect, useState } from 'react'
import { PAGE_BREAD_CRUMBS } from '@/constants/pages'
import { usePaths } from '@/hooks/user-nav'
import { Sheet, SheetTrigger, SheetContent } from '@/components/global/sheet'
import { Menu, Settings, Users, HelpCircle, Home, Zap } from 'lucide-react'
import { NavMain } from '@/components/global/app-sidebar'
import { SidebarToggle } from '@/components/global/app-sidebar/sidebar-toggle'
import Image from 'next/image'
import Link from 'next/link'
import { SidebarProvider } from '@/components/ui/sidebar'
import { EnhancedText } from '@/components/ui/enhanced-typography'
import { UserButton } from "@clerk/nextjs"
import { useParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Props = {
  slug: string
}

const InfoBar = ({ slug }: Props) => {
  const { page } = usePaths()
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page === slug
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const params = useParams<{ slug: string }>()
  const pathname = usePathname()

  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed)
    }
    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener)
    return () => window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener)
  }, [])

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

  const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

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

  // Extract the slug from the path for settings link
  const slugMatch = pathname.match(/\/dashboard\/([^/]+)/);
  const userSlug = slugMatch ? slugMatch[1] : '';

  return currentPage ? (
    <div 
      className={cn(
        "fixed top-0 h-[70px] bg-white/75 backdrop-blur-md border-b border-gray-200/20 z-50 transition-all duration-300",
        "left-0 right-0 px-4",
        "lg:left-[250px]",
        sidebarCollapsed && "lg:left-[72px]"
      )}
    >
      <div className="h-full flex items-center justify-between">
        {/* Left: Menu & Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu - Single implementation with AppSidebar design */}
          <div className="lg:hidden">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
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
                      <span className={`truncate pl-[18px] text-[17px] font-medium font-mona leading-6 ${pathname === '/help' ? 'text-purple-600' : 'text-gray-700'}`}>
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
                                <span className="truncate pl-[18px] text-[17px] font-medium font-mona leading-6 text-purple-600">Settings</span>
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
          
          {/* Page Title */}
          <EnhancedText
            variant="h2"
            gradient
            className="text-2xl font-semibold tracking-tight leading-none py-1.5"
          >
            {page === slug ? 'Dashboard' : capitalizeFirstLetter(page)}
          </EnhancedText>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-[32px] w-[32px]"
              }
            }}
          />
        </div>
      </div>
    </div>
  ) : null
}

export default InfoBar