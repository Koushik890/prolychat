'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import { onUserInfo } from '@/actions/user'
import { Instagram, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InstagramStatusModal } from './instagram-status-modal'

interface HealthStatus {
  status: 'healthy' | 'warning' | 'expired' | 'invalid' | 'not_connected'
  message: string
  needsRefresh: boolean
  daysUntilExpiration?: number
}

export const InstagramStatusIndicator = () => {
  const [showModal, setShowModal] = useState(false)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)

  // Get user data to check integration status
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: onUserInfo,
  })

  // Check if user has Instagram integration
  const hasIntegration = userData?.status === 200 && userData?.data?.integrations?.some(
    (integration) => integration.name === 'INSTAGRAM'
  )

  // Fetch health status when component mounts and user has integration
  useEffect(() => {
    if (hasIntegration) {
      checkHealthStatus()
      // Set up periodic health checks (every 5 minutes)
      const interval = setInterval(checkHealthStatus, 5 * 60 * 1000)
      return () => clearInterval(interval)
    } else if (userData?.status === 200) {
      // User is loaded but has no integration
      setHealthStatus({
        status: 'not_connected',
        message: 'Instagram not connected',
        needsRefresh: false
      })
    }
  }, [hasIntegration, userData])

  const checkHealthStatus = async () => {
    if (!hasIntegration) return
    
    setIsCheckingHealth(true)
    try {
      const response = await fetch('/api/integrations/instagram/health')
      if (response.ok) {
        const data = await response.json()
        setHealthStatus({
          status: data.status,
          message: data.message,
          needsRefresh: data.needsRefresh,
          daysUntilExpiration: data.daysUntilExpiration
        })
      } else {
        setHealthStatus({
          status: 'invalid',
          message: 'Health check failed',
          needsRefresh: true
        })
      }
    } catch (error) {
      console.error('Error checking health status:', error)
      setHealthStatus({
        status: 'invalid',
        message: 'Connection error',
        needsRefresh: true
      })
    } finally {
      setIsCheckingHealth(false)
    }
  }

  const getStatusIcon = (status?: string) => {
    if (isCheckingHealth) return <Wifi className="w-4 h-4 animate-pulse" />
    
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <Clock className="w-4 h-4" />
      case 'expired':
      case 'invalid': return <AlertCircle className="w-4 h-4" />
      case 'not_connected': return <WifiOff className="w-4 h-4" />
      default: return <Instagram className="w-4 h-4" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
      case 'expired':
      case 'invalid': return 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
      case 'not_connected': return 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    }
  }

  const getTooltipContent = () => {
    if (userLoading) return 'Loading...'
    if (isCheckingHealth) return 'Checking Instagram status...'
    if (healthStatus) return healthStatus.message
    return 'Click to manage Instagram connection'
  }

  const shouldPulse = healthStatus?.status === 'warning' || healthStatus?.status === 'expired' || healthStatus?.status === 'invalid'

  if (userLoading) return null

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setShowModal(true)}
              className={cn(
                "fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-300 z-40",
                getStatusColor(healthStatus?.status),
                shouldPulse && "animate-pulse"
              )}
              size="icon"
            >
              {getStatusIcon(healthStatus?.status)}
              
              {/* Status dot indicator */}
              {healthStatus && (
                <div className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                  healthStatus.status === 'healthy' && "bg-green-500",
                  healthStatus.status === 'warning' && "bg-yellow-500",
                  (healthStatus.status === 'expired' || healthStatus.status === 'invalid') && "bg-red-500",
                  healthStatus.status === 'not_connected' && "bg-gray-400"
                )} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="text-center">
              <p className="font-medium">Instagram Status</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getTooltipContent()}
              </p>
              {healthStatus?.daysUntilExpiration !== undefined && healthStatus.daysUntilExpiration <= 7 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Expires in {healthStatus.daysUntilExpiration} days
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <InstagramStatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        autoTrigger={false}
      />
    </>
  )
} 