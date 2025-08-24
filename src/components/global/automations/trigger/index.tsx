'use client'
import { useQueryAutomation } from '@/hooks/user-queries'
import React, { useState } from 'react'
import ActiveTrigger from './active-trigger'
import { Separator } from '@/components/ui/separator'
import ThenAction from '../then/then-action'
import TriggerButton from '../trigger-button'
import { AUTOMATION_TRIGGERS } from '@/constants/automation'
import { useTriggers, useAutomationSync } from '@/hooks/use-automations'
import { cn } from '@/lib/utils'
import Keywords from './keywords'
import { Button } from '@/components/ui/button'
import Loader from '../../loader'
import { toast } from 'sonner'

type Props = {
    id: string
}

const Trigger = ({ id }: Props) => {
    const [isPending, setIsPending] = useState(false)
    const { types, onSetTrigger, onRemoveTrigger, isInitialized } = useTriggers(id)
    const { data } = useQueryAutomation(id)
    const { saveChanges } = useAutomationSync(id)

    const handleSaveTrigger = async () => {
        if (!types || types.length === 0) {
            toast.error('Please select at least one trigger type')
            return
        }

        setIsPending(true)
        try {
            // Map UI trigger type to API trigger type
            const apiType = types[0] === 'DM' ? 'user-message' : 'post-comments'
            
            await saveChanges({
                trigger: [{
                    type: apiType,
                    config: {
                        status: 'unconfigured',
                        type: 'all',
                        keywords: { include: [] },
                        replyMessages: [],
                        posts: []
                    }
                }]
            })
            
            toast.success('Trigger created successfully')
        } catch (error) {
            console.error('Error creating trigger:', error)
            toast.error('Failed to create trigger')
        } finally {
            setIsPending(false)
        }
    }

    if (data?.data && data?.data?.trigger.length > 0) {
        return (
            <div className="flex flex-col ga-y-6 items-center">
                <ActiveTrigger
                    type={data.data.trigger[0].type}
                    keywords={data.data.trigger[0].keywords || []}
                />

                {data?.data?.trigger.length > 1 && (
                    <>
                        <div className="relative w-6/12 my-4">
                            <p className="absolute transform  px-2 -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2">
                                or
                            </p>
                            <Separator
                                orientation="horizontal"
                                className="border-muted border-[1px]"
                            />
                        </div>
                        <ActiveTrigger
                            type={data.data.trigger[1].type}
                            keywords={data.data.trigger[1].keywords || []}
                        />
                    </>
                )}

                {!data.data.listener && <ThenAction id={id} />}
            </div>
        )
    }
    return (
        <TriggerButton label="Add Trigger">
            <div className="flex flex-col gap-y-2">
                {AUTOMATION_TRIGGERS.map((trigger) => (
                    <div
                        key={trigger.id}
                        onClick={() => onSetTrigger(trigger.type)}
                        className={cn(
                            'hover:opacity-80 text-white rounded-xl flex cursor-pointer flex-col p-3 gap-y-2',
                            !types?.find((t) => t === trigger.type)
                                ? 'bg-background-80'
                                : 'bg-gradient-to-br from-[#3352CC] font-medium to-[#1C2D70]'
                        )}
                    >
                        <div className="flex gap-x-2 items-center">
                            {trigger.icon}
                            <p className="font-bold">{trigger.label}</p>
                        </div>
                        <p className="text-sm font-light">{trigger.description}</p>
                    </div>
                ))}
                <Keywords id={id} />
                <Button
                    onClick={handleSaveTrigger}
                    disabled={!types || types.length === 0}
                    className="bg-gradient-to-br from-[#3352CC] font-medium text-white to-[#1C2D70]"
                >
                    <Loader state={isPending}>Create Trigger</Loader>
                </Button>
            </div>
        </TriggerButton>
    )
}

export default Trigger