'use client'

import { useState } from 'react'
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { onUserInfo } from '@/actions/user'
import { onOauthInstagram } from '@/actions/integrations'
import { cn } from '@/lib/utils'
import { ImageWithFallback } from './ImageWithFallback'
import { ProlyChatLogo } from './ProlyChatLogo'
import { InstagramLogo } from './InstagramLogo'
import { ArrowIcon } from './ArrowIcon'
import { MetaProviderLogo } from './MetaProviderLogo'

interface InstagramStatusModalProps {
  isOpen: boolean
  onClose: () => void
  autoTrigger?: boolean // If true, modal was triggered automatically for new users
}

// Custom DialogContent without close button
const CustomDialogContent = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
)

export const InstagramStatusModal = ({ isOpen, onClose, autoTrigger = false }: InstagramStatusModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false)

  // Get user data to check integration status
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: onUserInfo,
  })

  // Check if user has Instagram integration
  const hasIntegration = userData?.status === 200 && userData?.data?.integrations?.some(
    (integration) => integration.name === 'INSTAGRAM'
  )

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await onOauthInstagram('INSTAGRAM')
    } catch (error) {
      console.error('Error connecting Instagram:', error)
      setIsConnecting(false)
    }
  }

  // Prevent modal from closing when clicking outside or pressing escape for auto-triggered modals
  const handleOpenChange = (open: boolean) => {
    if (!open && autoTrigger) {
      // Don't close auto-triggered modals by clicking outside
      return
    }
    if (!open) {
      onClose()
    }
  }

  if (userLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <CustomDialogContent className="max-w-sm mx-auto rounded-3xl">
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="ml-2 text-sm">Loading...</span>
          </div>
        </CustomDialogContent>
      </Dialog>
    )
  }

  // If user already has Instagram connected, close the modal
  if (hasIntegration) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <CustomDialogContent className="max-w-5xl w-full bg-white shadow-sm rounded-[20px] p-0 overflow-hidden border-0">
        <div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col md:flex-row max-w-5xl w-full">
          {/* Left Section */}
          <div className="flex flex-col justify-between md:w-1/2 px-6 mr-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-[36px] text-[#030213] font-semibold leading-tight">
                  Connect Instagram
                </h1>

                <p className="text-[16px] text-[#4B4B5A] leading-relaxed">
                  						Use your Instagram account to connect to {autoTrigger ? 'Prolychat' : 'Prolychat'}.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-6 my-8 scale-125">
                <ProlyChatLogo />
                <ArrowIcon />
                <InstagramLogo />
              </div>
            

              <div className="flex justify-center">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full py-6 px-8 bg-[#7611F7] text-white text-[18px] font-medium rounded-xl hover:bg-[#6610E6] transition-colors shadow-lg hover:shadow-xl"
                >
                  {isConnecting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Connecting...
                    </div>
                  ) : (
                    'Go To Instagram'
                  )}
                </Button>
              </div>

              <p className="text-[14px] text-[#717182] text-center leading-relaxed px-4">
                Log in with Instagram and set your permissions. Once
                						that's done, you're all set to connect to {autoTrigger ? 'Prolychat' : 'Prolychat'}!
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-center space-x-3 scale-110">
                <MetaProviderLogo />
              </div>
              <p className="text-[14px] text-[#717182] mt-3 text-center leading-relaxed">
                						{autoTrigger ? 'Prolychat' : 'Prolychat'} has been certified by Meta as an official
                Tech Provider.
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="md:w-1/2 mt-6 md:mt-0 relative rounded-[20px] bg-[#F9F5FF] p-[5px]">
            <div className="w-full h-full transform perspective-[1000px] rotate-y-2 rotate-x-1 shadow-[0_20px_50px_rgba(118,17,247,0.3)] rounded-[16px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7611F7]/10 to-transparent opacity-70 z-10"></div>
              <ImageWithFallback
                src="/CI_modal.png"
                alt="Connect Instagram"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0">
              <div className="bg-gradient-to-t from-[#7c3aed] via-[#a855f7]/80 to-transparent px-6 pt-12 pb-2 rounded-b-[16px] flex items-end">
                <p className="text-white text-[30px] font-bold leading-[1.3] font-['Inter','Roboto','-apple-system','BlinkMacSystemFont','Segoe_UI',system-ui,sans-serif] tracking-wider text-center">
                  Grow your Instagram audience intelligently
                </p>
              </div>
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  )
} 