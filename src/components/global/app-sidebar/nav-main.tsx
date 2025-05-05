"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
}

interface NavMainProps {
  items: NavItem[]
  isExpanded: boolean
}

export function NavMain({ items, isExpanded }: NavMainProps) {
  const pathname = usePathname()

  return (
    <nav>
      <div className="space-y-3">
        {items.map((item) => {
          const isActive = (pathname && (
            pathname === item.url || 
            (item.title === "Home" && !pathname.includes("/automations") && !pathname.includes("/contacts")) ||
            (item.title === "Automations" && pathname.includes("/automations"))
          )) || false
          return (
            <div key={item.title} className="px-4">
              <Link
                href={item.url}
                className={`group relative flex h-[40px] w-[218px] items-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-[#e9eded] hover:bg-[#e9eded]"
                    : "hover:bg-[#F2F4F4]"
                }`}
              >
                <div className="flex w-full items-center pl-[13px]">
                  <div className="flex w-[24px] items-center justify-center">
                    <item.icon 
                      className={`h-[20px] w-[20px] ${
                        isActive 
                          ? "text-[#282d47]"
                          : "text-[#8c92a0]"
                      }`} 
                    />
                  </div>
                  {isExpanded && (
                    <span className={`truncate pl-[18px] text-[17px] font-medium leading-6 ${isActive ? 'text-[#282d47]' : 'text-[#8c92a0]'}`}>
                      {item.title}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </nav>
  )
} 