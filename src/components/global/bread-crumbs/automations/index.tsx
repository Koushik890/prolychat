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
import ClerkAuthState from '@/components/global/clerk-auth-state'
import { HelpDuoToneWhite } from '@/icons'
import { SubscriptionPlan } from '@/components/global/subscription-plan'
import UpgradeCard from '@/components/global/sidebar/upgrade'
import Items from '@/components/global/sidebar/items'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePaths } from '@/hooks/user-nav'
import { useParams } from 'next/navigation'
import ActivateAutomationButton from '@/components/global/activate-automation-button'

type Props = {
  id: string
}

const AutomationsBreadCrumb = ({ id }: Props) => {
  const { data } = useQueryAutomation(id)
  const { edit, enableEdit, inputRef, isPending } = useEditAutomation(id)
  const { latestVariable } = useMutationDataState(['update-automation'])
  const { page } = usePaths()
  const params = useParams()
  const slug = params?.slug as string
  const [sidebarWidth, setSidebarWidth] = React.useState<number>(250)
  const { isSaving, lastSaved } = useAutomationSync(id)

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

  return (
    <div 
      className="fixed top-0 h-[70px] bg-gradient-to-br from-[#f5f5f5] to-[#ffffff] backdrop-blur-md border-b border-gray-200/20 z-50 transition-all duration-300 flex items-center px-6"
      style={{ 
        left: `${sidebarWidth}px`,
        right: '0'
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left: Menu & Breadcrumb */}
        <div className="flex items-center gap-4">
          <span className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1 hover:bg-gray-50/80 rounded-md transition-colors">
                  <Menu className="h-6 w-6 text-gray-900" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
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
                    <Items />
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
              </SheetContent>
            </Sheet>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[24px] font-[600] leading-[24px] font-raleway text-gray-900">
              Automations
            </span>
            <ChevronRight className="h-6 w-6 text-gray-900" />
            <div className="text-[24px] font-[600] leading-[24px] font-raleway text-gray-900">
              {edit ? (
                <Input
                  ref={inputRef}
                  autoFocus
                  defaultValue={latestVariable?.variables?.name || data?.data?.name || 'Untitled'}
                  placeholder={isPending ? latestVariable.variables : 'Add a new name'}
                  className="bg-transparent h-auto outline-none text-[24px] leading-[24px] border-none p-0 font-raleway font-[600] text-center placeholder:text-center text-gray-900"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span>{latestVariable?.variables?.name || data?.data?.name || 'Untitled'}</span>
                  {!edit && (
                    <button
                      onClick={enableEdit}
                      className="p-1 hover:bg-gray-50/80 rounded-md transition-colors"
                    >
                      <PencilIcon className="h-5 w-5 text-gray-900" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-4">
          <p className={cn(
            "text-[14px] font-medium leading-[20px] font-['Plus_Jakarta_Sans'] transition-opacity duration-200",
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