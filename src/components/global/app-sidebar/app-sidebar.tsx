"use client"

import type * as React from "react"
import {
  Settings,
  Users,
  HelpCircle,
  Home,
  Zap
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { UserButton } from "@clerk/nextjs"

import { NavMain } from "./nav-main"
import { SidebarToggle } from "./sidebar-toggle"

interface AppSidebarProps {
  onCollapse?: (collapsed: boolean) => void;
  defaultExpanded?: boolean;
}

export function AppSidebar({ onCollapse, defaultExpanded = true }: AppSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const params = useParams<{ slug: string }>()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    onCollapse?.(isExpanded)
    // Emit custom event for sidebar state change
    const event = new CustomEvent('sidebarStateChange', { 
      detail: { collapsed: !isExpanded }
    })
    window.dispatchEvent(event)
  }, [isExpanded, onCollapse])

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
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

  // Extract the slug from the path (format: /dashboard/{slug}/...)
  const slugMatch = pathname.match(/\/dashboard\/([^/]+)/);
  const userSlug = slugMatch ? slugMatch[1] : '';

  // Handle redirection when directly accessing /settings
  const isDirectSettingsAccess = pathname === '/settings';
  useEffect(() => {
    if (isDirectSettingsAccess && userSlug) {
      router.push(`/dashboard/${userSlug}/settings`);
    }
  }, [isDirectSettingsAccess, userSlug, router]);

  return (
    <aside 
      className={`fixed left-0 top-0 z-20 h-full border-r-[2px] border-gray-300/50 bg-[#fafafa] font-['Plus_Jakarta_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira_Sans','Droid_Sans','Helvetica_Neue',sans-serif] text-base font-medium leading-6 shadow-[0_0_15px_rgba(0,0,0,0.03)] transition-all duration-300 ${
        isExpanded ? "w-[250px]" : "w-[72px]"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section with Divider */}
        <div className="relative h-[70px] overflow-visible">
          <div className={`flex h-full items-center justify-between transition-all duration-300 ${
            isExpanded ? "pr-2 pl-4" : "pr-1 pl-3"
          }`}>
            <div className={`relative transition-all duration-300 ${
              isExpanded ? "h-[40px] w-[110px]" : "h-[24px] w-[24px]"
            }`}>
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className={`rounded-lg object-contain transition-all duration-300 ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
                priority
              />
              <Image
                src="/logo_1.png"
                alt="Collapsed Logo"
                fill
                className={`absolute left-0 top-0 rounded-lg object-contain transition-all duration-300 ${
                  isExpanded ? "opacity-0" : "opacity-100"
                }`}
                priority
              />
            </div>
            <SidebarToggle isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex flex-1 flex-col justify-between overflow-hidden pt-[17px]">
          {/* Main Navigation */}
          <div>
            <div className="space-y-2.5">
              <NavMain items={data.navMain} isExpanded={isExpanded} />
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
                  className={`group relative flex h-[40px] w-[218px] items-center rounded-2xl transition-all ${
                    pathname === '/help'
                      ? "bg-[#e9eded] hover:bg-[#e9eded]"
                      : "hover:bg-[#F2F4F4]"
                  }`}
                >
                  <div className="flex w-full items-center pl-[13px]">
                    <div className="flex w-[24px] items-center justify-center">
                      <HelpCircle className={`h-[20px] w-[20px] ${pathname === '/help' ? 'text-[#282d47]' : 'text-[#8c92a0]'}`} />
                    </div>
                    {isExpanded && (
                      <span className={`truncate pl-[18px] text-[17px] font-medium leading-6 ${pathname === '/help' ? 'text-[#282d47]' : 'text-[#8c92a0]'}`}>
                        Help & Support
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="pb-[17px]">
            {/* Profile Button */}
            <div className="border-t border-gray-200/30 pt-6 mb-4">
              <div className="px-4">
                <div className={`relative flex items-center h-[40px] ${isExpanded ? 'w-[218px]' : 'w-[44px]'} rounded-2xl bg-gradient-to-br from-[#d8d2e9] via-[#e4dff2] to-[#d5cfe6] shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-all hover:from-[#e0daf1] hover:via-[#ece7fa] hover:to-[#dfd9eb] hover:shadow-[0_3px_6px_rgba(0,0,0,0.1)]`}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-white/5 to-transparent pointer-events-none" />
                  <div className="relative flex w-full items-center pl-[13px]">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "h-[24px] w-[24px]"
                        }
                      }}
                    />
                    {isExpanded && (
                      <span className="truncate pl-[18px] text-[17px] font-medium leading-6 text-gray-700">Profile</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Settings Button */}
            <div className="border-t border-gray-200/30 pt-6">
              <div className="px-4">
                <Link
                  href={userSlug ? `/dashboard/${userSlug}/settings/account` : '/settings/account'}
                  className={`relative flex h-[40px] ${isExpanded ? 'w-[218px]' : 'w-[44px]'} items-center rounded-2xl bg-gradient-to-br from-[#d8d2e9] via-[#e4dff2] to-[#d5cfe6] shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-all hover:from-[#e0daf1] hover:via-[#ece7fa] hover:to-[#dfd9eb] hover:shadow-[0_3px_6px_rgba(0,0,0,0.1)]`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-white/5 to-transparent pointer-events-none" />
                  <div className="relative flex w-full items-center pl-[13px]">
                    <div className="flex w-[24px] items-center justify-center">
                      <Settings className="h-[18px] w-[18px] text-gray-600" />
                    </div>
                    {isExpanded && (
                      <span className="truncate pl-[18px] text-[17px] font-medium leading-6 text-gray-700">Settings</span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
} 