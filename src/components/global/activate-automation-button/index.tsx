import { Loader2, Power } from 'lucide-react'
import React from 'react'
import { useQueryAutomation } from '@/hooks/user-queries'
import { useMutationData } from '@/hooks/use-mutation-data'
import { activateAutomation } from '@/actions/automations'
import { useQueryClient } from '@tanstack/react-query'
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
  const { data } = useQueryAutomation(id)
  const queryClient = useQueryClient()
  const { showToast, hideToast } = useToast()
  const [optimisticState, setOptimisticState] = React.useState<boolean | null>(null)

  const { mutate, isPending } = useMutationData(
    ['activate', id],
    async (data: { state: boolean }) => {
      console.log('Activating automation:', { id, newState: data.state })
      const result = await activateAutomation(id, data.state)
      if (result.status !== 200) {
        console.error('Activation failed:', result)
        throw new Error(result.data)
      }
      return result
    },
    'automation-info',
    () => {
      queryClient.invalidateQueries({ queryKey: ['automation-info', id] })
      queryClient.invalidateQueries({ queryKey: ['user-automations'] })
    }
  )

  // Use optimistic state if available, otherwise fall back to server state
  const isActive = optimisticState !== null ? optimisticState : data?.data?.active
  const status = isActive ? 'Live' : 'Draft'
  const statusColor = isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'

  const handleActivation = React.useCallback(async () => {
    const newState = !isActive
    console.log('Handling activation:', { currentState: isActive, newState })
    
    // Show loading toast with overlay
    showToast(
      'loading',
      newState ? 'Activating automation' : 'Deactivating automation',
      true
    )
    
    try {
      const result = await new Promise<ActivationResult>((resolve, reject) => {
        mutate(
          { state: newState },
          {
            onSuccess: (data) => resolve(data as ActivationResult),
            onError: (error) => reject(error)
          }
        )
      })
      
      if (result.status === 200) {
        // Update state only after successful activation/deactivation
        setOptimisticState(newState)
        // Show success toast with overlay
        showToast('success', result.data, true)
      }
    } catch (error) {
      hideToast()
      console.error('Activation error:', error)
      // Use the toast notification component for error state
      showToast('loading', error instanceof Error ? error.message : 'Failed to update automation status', true)
    }
  }, [isActive, mutate, showToast, hideToast])

  // Reset optimistic state when server data changes
  React.useEffect(() => {
    setOptimisticState(null)
  }, [data?.data?.active])

  return (
    <div className="flex items-center gap-3">
      <Badge 
        variant="secondary"
        className={cn(
          "px-3 py-1 border",
          statusColor
        )}
      >
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
          )} />
          {status}
        </div>
      </Badge>
      <ShimmerButton
        disabled={isPending}
        onClick={handleActivation}
        className={cn(
          "min-w-[140px] ml-2",
          isActive 
            ? "bg-gradient-to-r from-red-500 to-red-600" 
            : "bg-gradient-to-r from-green-500 to-green-600"
        )}
        shimmerColor="rgba(255, 255, 255, 0.3)"
      >
        <div className="flex items-center justify-center gap-2">
          {isPending ? (
            <Loader2 className="animate-spin w-5 h-5 text-white" />
          ) : (
            <>
              <Power className={cn(
                "w-5 h-5 transition-transform text-white",
                isActive ? "" : "rotate-180"
              )} />
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
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
