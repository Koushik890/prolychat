'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Settings, 
  Users, 
  MessageSquare, 
  BarChart2, 
  Zap,
  Calendar,
  Bell
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ElementType
}

const items: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart2
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare
  },
  {
    name: 'Automations',
    href: '/automations',
    icon: Zap
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: Calendar
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users
  },
  {
    name: 'Settings',
    href: '/settings/account',
    icon: Settings
  }
]

export default function Items() {
  const pathname = usePathname()

  // Extract the slug from the path (format: /dashboard/{slug}/...)
  const slugMatch = pathname.match(/\/dashboard\/([^/]+)/);
  const userSlug = slugMatch ? slugMatch[1] : '';

  // Create items with dynamic URLs based on userSlug
  const routeItems = items.map(item => ({
    ...item,
    href: item.name === 'Settings' && userSlug ? 
      `/dashboard/${userSlug}/settings/account` : 
      item.href
  }));

  return (
    <nav className="space-y-1">
      {routeItems.map((item) => {
        const Icon = item.icon
        const isActive = item.name === 'Settings' ? 
          pathname.includes('/settings') : 
          pathname.includes(item.href)

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive 
                ? 'bg-gray-100/80 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon 
              className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive ? 'text-gray-900' : 'text-gray-500'
              )} 
              strokeWidth={1.5}
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
