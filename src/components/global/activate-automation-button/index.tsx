import { Loader2, Power } from 'lucide-react'
import React from 'react'
import { useQueryAutomation } from '@/hooks/user-queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activateAutomation } from '@/actions/automations'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/toast-context'
import { ShimmerButton } from '@/components/magicui/shimmer-button'

type Props = {
  id: string
}

interface ActivationResult {
  status: number
  data: string
}

const ActivateAutomationButton = ({ id }: Props) => {
  const { data: automationData, isLoading: isQueryLoading } = useQueryAutomation(id)
  const queryClient = useQueryClient()
  const { showToast, hideToast } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: (state: boolean) => activateAutomation(id, state),
    onMutate: async (newState: boolean) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['automation-info', id] })

      // Snapshot the previous value
      const previousAutomationData = queryClient.getQueryData(['automation-info', id])

      // Optimistically update to the new value
      queryClient.setQueryData(['automation-info', id], (old: any) => ({
        ...old,
        data: {
          ...old.data,
          active: newState,
        },
      }))
      
      showToast('loading', newState ? 'Activating automation...' : 'Deactivating automation...')

      return { previousAutomationData }
    },
    onSuccess: (result: ActivationResult, newState: boolean) => {
        hideToast()
        showToast('success', result.data)
        // Invalidate queries on success to refetch the fresh data
        queryClient.invalidateQueries({ queryKey: ['automation-info', id] })
        queryClient.invalidateQueries({ queryKey: ['user-automations'] })
    },
    onError: (err: Error, newState: boolean, context?: { previousAutomationData: any }) => {
      // Rollback to the previous value on error
      if (context?.previousAutomationData) {
        queryClient.setQueryData(['automation-info', id], context.previousAutomationData)
      }
      hideToast()
      showToast('error', err.message || 'Failed to update automation status')
    },
    onSettled: () => {
      // Invalidate again to be sure we have the latest data
      // queryClient.invalidateQueries({ queryKey: ['automation-info', id] })
    },
  })

  const isActive = automationData?.data?.active
  const status = isActive ? 'Live' : 'Draft'
  const statusColor = isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'

  const handleActivation = () => {
    if (isQueryLoading) return // Do not allow activation if initial data is not loaded yet
    const newState = !isActive
    mutate(newState)
  }
  
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <Badge 
        variant="secondary"
        className={cn(
          "px-1.5 py-0.5 sm:px-3 sm:py-1 border text-xs sm:text-sm",
          statusColor
        )}
      >
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className={cn(
            "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
            isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
          )} />
          <span className="font-mona">{status}</span>
        </div>
      </Badge>
      <ShimmerButton
        disabled={isPending || isQueryLoading}
        onClick={handleActivation}
        className={cn(
          "min-w-[80px] sm:min-w-[120px] lg:min-w-[140px] ml-1 sm:ml-2",
          isActive 
            ? "bg-gradient-to-r from-red-500 to-red-600" 
            : "bg-gradient-to-r from-green-500 to-green-600"
        )}
        shimmerColor="rgba(255, 255, 255, 0.3)"
      >
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {isPending ? (
            <Loader2 className="animate-spin w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
          ) : (
            <>
              <Power className={cn(
                "w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform text-white",
                isActive ? "" : "rotate-180"
              )} />
              <span className="whitespace-pre-wrap text-center text-xs sm:text-sm font-medium leading-none tracking-tight text-white lg:text-lg font-mona">
                {isActive ? 'Deactivate' : 'Activate'}
              </span>
            </>
          )}
        </div>
      </ShimmerButton>
    </div>
  )
}

export default ActivateAutomationButton
