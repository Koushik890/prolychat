'use client'

import React, { useEffect, useState } from 'react'
import { PAGE_BREAD_CRUMBS } from '@/constants/pages'
import { usePaths } from '@/hooks/user-nav'
import { Sheet, SheetTrigger, SheetContent } from '@/components/global/sheet'
import { Menu } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ClerkAuthState from '@/components/global/clerk-auth-state'
import { HelpDuoToneWhite } from '@/icons'
import { SubscriptionPlan } from '@/components/global/subscription-plan'
import UpgradeCard from '@/components/global/upgrade-card'
import { NavMain } from '@/components/global/app-sidebar'
import CreateAutomation from '@/components/global/create-automation'
import { Notifications } from './notifications'
import MainBreadCrumb from '@/components/global/bread-crumbs/main-bread-crumb'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/components/ui/sidebar'
import { EnhancedText } from '@/components/ui/enhanced-typography'
import { UserButton } from "@clerk/nextjs"

type Props = {
  slug: string
}

const InfoBar = ({ slug }: Props) => {
  const { page } = usePaths()
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page === slug
  const [width, setWidth] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setWidth(window.innerWidth)
    
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed)
    }
    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener)
    return () => window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener)
  }, [])

  const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return currentPage ? (
    <div className="fixed top-0 h-[70px] bg-white/75 backdrop-blur-md border-b border-gray-200/20 z-50 transition-all duration-300" style={{ 
      left: currentPage ? (width <= 1024 ? '0' : sidebarCollapsed ? '72px' : '250px') : '0',
      right: '0',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    }}>
      <div className="h-full flex items-center justify-between">
        {/* Left: Menu & Breadcrumb */}
        <div className="flex items-center gap-4">
          <span className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                  <Menu className="h-6 w-6 text-gray-600" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px] p-0">
                <SidebarProvider>
                  <div className="flex flex-col gap-y-5 w-full h-full bg-gradient-to-b from-[#A288F7] via-[#A288F7]/95 to-[#F7C1E4] backdrop-filter backdrop-blur-xl">
                    <div className="flex items-center justify-center transition-all duration-300 mt-4 h-[40px] px-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Logomark */}
                        <Image 
                          src="/Prolychat_lm_black.png"
                          alt="Prolychat Logomark"
                          width={32}
                          height={32}
                          className="object-contain transition-all duration-300"
                        />
                        {/* Wordmark */}
                        <Image 
                          src="/prolychat_bl.png"
                          alt="Prolychat"
                          width={115}
                          height={32}
                          className="object-contain transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col py-3">
                      <NavMain items={[]} isExpanded={true} />
                    </div>
                    <div className="px-16">
                      <Separator
                        orientation="horizontal"
                        className="bg-white/20"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2 px-3">
                      <ClerkAuthState />
                      <Link
                        href={`/dashboard/${slug}/help`}
                        className={cn(
                          "flex items-center gap-x-3 rounded-full p-2.5 transition-all duration-200 hover:bg-white/10",
                          page === 'help' ? "bg-[#8D4AF3] text-white shadow-md" : "text-white/80"
                        )}
                      >
                        <div className="flex items-center justify-center h-9 w-9 ring-2 ring-white/30 rounded-full">
                          <HelpDuoToneWhite />
                        </div>
                        <span className="font-medium">Help</span>
                      </Link>
                    </div>
                    <div className="flex-1" />
                    <SubscriptionPlan type="FREE">
                      <UpgradeCard />
                    </SubscriptionPlan>
                  </div>
                </SidebarProvider>
              </SheetContent>
            </Sheet>
          </span>
          <div className="flex items-center gap-4">
            {width <= 1024 && (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] sm:w-[300px] p-0">
                  <SidebarProvider>
                    <NavMain items={[]} isExpanded={true} />
                  </SidebarProvider>
                </SheetContent>
              </Sheet>
            )}
            <EnhancedText
              variant="h2"
              gradient
              className="text-2xl font-semibold tracking-tight leading-none py-1.5"
            >
              {page === slug ? 'Dashboard' : capitalizeFirstLetter(page)}
            </EnhancedText>
          </div>
        </div>

        {/* Right: Stats & Actions */}
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