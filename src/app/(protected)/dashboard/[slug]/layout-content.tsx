'use client';

import InfoBar from '@/components/global/infobar'
import { AppSidebar } from '@/components/global/app-sidebar'
import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import '@/app/globals.css'
import { SidebarProvider } from '@/components/ui/sidebar'
import { GridPattern } from '@/components/ui/grid-pattern'
import { usePathname } from 'next/navigation'
import { ToastProvider } from '@/contexts/toast-context'

interface ContentProps {
  children: React.ReactNode
  slug: string
}

export const DashboardLayoutContent = ({ children, slug }: ContentProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathname = usePathname();

  const handleSidebarCollapse = React.useCallback((expanded: boolean) => {
    setIsCollapsed(!expanded);
  }, []);

  const showGridPattern = !pathname.includes('/automations/');
  const isPaymentSettingsPage = pathname.includes('/settings/payment');
  // Check if we're on the contacts page to prevent unnecessary scrolling
  const isContactsPage = pathname.includes('/contacts');
  
  // Set data-path attribute on body for CSS targeting
  useEffect(() => {
    document.body.setAttribute('data-path', pathname);
    
    // Handle overflow directly
    if (isContactsPage) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.removeAttribute('data-path');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [pathname, isContactsPage]);

  return (
    <ToastProvider>
      <div className={cn(
        "min-h-screen relative no-scrollbar", 
        (isPaymentSettingsPage || isContactsPage) && "overflow-hidden"
      )}>
        <div className="absolute inset-0 no-scrollbar" style={{ backgroundColor: '#f5f5f5' }} />
        {showGridPattern && (
          <GridPattern 
            className="absolute inset-0 opacity-30 mix-blend-multiply"
            width={24}
            height={24}
            strokeDasharray="2 2"
            style={{
              mask: 'linear-gradient(to bottom, transparent, black)',
              WebkitMask: 'linear-gradient(to bottom, transparent, black)'
            }}
          />
        )}
        <div className="flex min-h-screen relative no-scrollbar">
          <div className="fixed left-0 top-0 h-full z-50 no-scrollbar">
            <SidebarProvider>
              <AppSidebar 
                onCollapse={handleSidebarCollapse}
                defaultExpanded={!isCollapsed}
              />
            </SidebarProvider>
          </div>
          <main 
            className={cn(
              "flex-1 min-h-screen w-full transition-all duration-300 no-scrollbar",
              isCollapsed ? "pl-[72px]" : "pl-[250px]",
              (isPaymentSettingsPage || isContactsPage) && "overflow-hidden"
            )}
            style={isPaymentSettingsPage ? { height: '100vh' } : isContactsPage ? { height: '100vh', overflow: 'hidden' } : {}}
          >
            <InfoBar slug={slug} />
            <div className={cn(
              "p-8 no-scrollbar", 
              isPaymentSettingsPage && "settings-section",
              isContactsPage && "overflow-visible"
            )}
            style={isContactsPage ? { overflow: 'hidden' } : {}}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}; 