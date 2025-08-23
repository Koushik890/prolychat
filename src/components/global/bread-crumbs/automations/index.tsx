'use client'
import { ChevronRight, Menu, PencilIcon } from 'lucide-react'
import React from 'react'
import { useQueryAutomation } from '@/hooks/user-queries'
import { useEditAutomation, useAutomationSync } from '@/hooks/use-automations'
import { useMutationDataState } from '@/hooks/use-mutation-data'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from '@/components/ui/separator'
import { Settings, Users, HelpCircle, Home, Zap } from 'lucide-react'
import { NavMain } from '@/components/global/app-sidebar'
import { SidebarToggle } from '@/components/global/app-sidebar/sidebar-toggle'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePaths } from '@/hooks/user-nav'
import { useParams, usePathname } from 'next/navigation'
import ActivateAutomationButton from '@/components/global/activate-automation-button'
import { SidebarProvider } from '@/components/ui/sidebar'

type Props = {
  id: string
}

const AutomationsBreadCrumb = ({ id }: Props) => {
  const { data } = useQueryAutomation(id)
  const { edit, enableEdit, inputRef, isPending, handleUpdateName } = useEditAutomation(id)
  const { latestVariable } = useMutationDataState(['update-automation'])
  const { page } = usePaths()
  const params = useParams()
  const slug = params?.slug as string
  const pathname = usePathname()
  const [sidebarWidth, setSidebarWidth] = React.useState<number>(250)
  const { isSaving, lastSaved } = useAutomationSync(id)
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = React.useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false)

  React.useEffect(() => {
    if (edit && inputRef.current) {
      inputRef.current.select()
    }
  }, [edit])

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
  React.useEffect(() => {
    // When sheet opens, always start expanded
    if (mobileSheetOpen) {
      setMobileSidebarExpanded(true)
    }
  }, [mobileSheetOpen])

  // Function to format the last saved time
  const getLastSavedText = () => {
    if (isSaving) return 'Saving...'
    if (!lastSaved) return ''
    
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 5) return 'Changes saved'
    if (seconds < 60) return `Saved ${seconds} seconds ago`
    
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Saved ${minutes} minute${minutes === 1 ? '' : 's'} ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Saved ${hours} hour${hours === 1 ? '' : 's'} ago`
    
    return `Saved ${Math.floor(hours / 24)} days ago`
  }

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

  return (
    <div 
      className="fixed top-0 h-[60px] sm:h-[70px] bg-gradient-to-br from-[#f5f5f5] to-[#ffffff] backdrop-blur-md border-b border-gray-200/20 z-50 transition-all duration-300 flex items-center px-4 sm:px-6"
      style={{ 
        left: `${sidebarWidth}px`,
        right: '0'
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left: Menu & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <span className="lg:hidden">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <button className="p-1 hover:bg-gray-50/80 rounded-md transition-colors">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className={`p-0 transition-all duration-300 ${mobileSidebarExpanded ? 'w-[250px]' : 'w-[72px]'}`}>
                <div className={`flex h-full flex-col bg-[#fafafa] border-r-[2px] border-gray-300/50 font-mona text-base font-medium leading-6 transition-all duration-300 ${mobileSidebarExpanded ? 'w-[250px]' : 'w-[72px]'}`}>
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
                            src="/Prolychat_lm_black.png"
                            alt="Prolychat Logomark"
                            width={mobileSidebarExpanded ? 38 : 28}
                            height={mobileSidebarExpanded ? 38 : 28}
                            className="object-contain transition-all duration-300"
                            priority
                          />
                          {/* Wordmark - only visible when expanded */}
                          {mobileSidebarExpanded && (
                            <Image
                              src="/prolychat_bl.png"
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
                          <div className="absolute left-4 right-4 h-[1px] bg-gradient-to-r from-gray-300/35 via-gray-300/55 to-gray-300/35" />
                        </div>
                        {/* Help & Support Section */}
                        <div className="mt-6 px-4">
                          <Link
                            href="/help"
                            className={`group relative flex h-[40px] ${mobileSidebarExpanded ? 'w-[218px]' : 'w-[44px]'} items-center rounded-2xl transition-all ${
                              pathname === '/help'
                                ? "bg-[#e9eded] hover:bg-[#e9eded]"
                                : "hover:bg-[#F2F4F4]"
                            }`}
                          >
                            <div className="flex w-full items-center pl-[13px]">
                              <div className="flex w-[24px] items-center justify-center">
                                <HelpCircle className={`h-[20px] w-[20px] ${pathname === '/help' ? 'text-[#282d47]' : 'text-[#8c92a0]'}`} />
                              </div>
                              {mobileSidebarExpanded && (
                                <span className={`truncate pl-[18px] text-[17px] font-medium leading-6 font-mona ${pathname === '/help' ? 'text-[#282d47]' : 'text-[#8c92a0]'}`}>
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
                      <div className="border-t border-gray-200/30 pt-6">
                        <div className="px-4">
                          <Link
                            href={userSlug ? `/dashboard/${userSlug}/settings/account` : '/settings/account'}
                            className={`relative flex h-[40px] ${mobileSidebarExpanded ? 'w-[218px]' : 'w-[44px]'} items-center rounded-2xl bg-gradient-to-br from-[#d8d2e9] via-[#e4dff2] to-[#d5cfe6] shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-all hover:from-[#e0daf1] hover:via-[#ece7fa] hover:to-[#dfd9eb] hover:shadow-[0_3px_6px_rgba(0,0,0,0.1)]`}
                          >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-white/5 to-transparent pointer-events-none" />
                            <div className="relative flex w-full items-center pl-[13px]">
                              <div className="flex w-[24px] items-center justify-center">
                                <Settings className="h-[18px] w-[18px] text-gray-600" />
                              </div>
                              {mobileSidebarExpanded && (
                                <span className="truncate pl-[18px] text-[17px] font-medium leading-6 text-gray-700 font-mona">Settings</span>
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
          </span>
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <span className="text-xs sm:text-sm lg:text-lg font-semibold leading-tight font-hubot text-gray-900 flex-shrink-0">
              Automations
            </span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-gray-900 flex-shrink-0" />
            <div className="text-sm sm:text-lg lg:text-xl font-semibold leading-tight font-hubot text-gray-900 min-w-0 flex-1">
              {edit ? (
                <Input
                  ref={inputRef}
                  autoFocus
                  defaultValue={latestVariable?.variables?.name || data?.data?.name || 'Untitled'}
                  placeholder={isPending ? latestVariable.variables : 'Add a new name'}
                  className="bg-transparent h-auto outline-none text-sm sm:text-lg lg:text-xl leading-tight border-none p-0 font-hubot font-semibold text-center placeholder:text-center text-gray-900 max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value;
                      if (value && value.trim()) {
                        handleUpdateName(value);
                      }
                    }
                    if (e.key === 'Escape') {
                      inputRef.current?.blur();
                    }
                  }}
                />
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  <span className="truncate max-w-[120px] sm:max-w-none" title={latestVariable?.variables?.name || data?.data?.name || 'Untitled'}>
                    {latestVariable?.variables?.name || data?.data?.name || 'Untitled'}
                  </span>
                  {!edit && (
                    <button
                      onClick={enableEdit}
                      className="p-1 hover:bg-gray-50/80 rounded-md transition-colors flex-shrink-0"
                    >
                      <PencilIcon className="h-2 w-2 sm:h-3 sm:w-3 lg:h-5 lg:w-5 text-gray-900" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
          <p className={cn(
            "text-xs sm:text-sm font-medium leading-tight font-mona transition-opacity duration-200 hidden lg:block",
            isSaving ? "text-gray-500" : "text-gray-900",
            !lastSaved && "opacity-0"
          )}>
            {getLastSavedText()}
          </p>
          <ActivateAutomationButton id={id} />
        </div>
      </div>
    </div>
  )
}

export default AutomationsBreadCrumb