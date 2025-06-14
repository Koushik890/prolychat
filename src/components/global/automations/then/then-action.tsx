'use client'
import { useListener } from '@/hooks/use-automations'
import React, { useState } from 'react'
import TriggerButton from '../trigger-button'
import { AUTOMATION_LISTENERS } from '@/constants/automation'
import { SubscriptionPlan } from '../../subscription-plan'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Loader from '../../loader'

type Props = {
    id: string
}

const ThenAction = ({ id }: Props) => {
    const [isPending, setIsPending] = useState(false)
    const [formData, setFormData] = useState({
        prompt: '',
        reply: ''
    })
    
    const {
        onSetListener,
        listener: Listener,
        onFormSubmit,
    } = useListener(id)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        try {
            await onFormSubmit({ 
                prompt: formData.prompt, 
                message: formData.reply 
            })
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <TriggerButton label="Then">
            <div className="flex flex-col gap-y-2 ">
                {AUTOMATION_LISTENERS.map((listener) =>
                    		listener.type === 'PROLYAI' ? (
                        <SubscriptionPlan
                            key={listener.type}
                            type="PRO"
                        >
                            <div
                                onClick={() => onSetListener(listener.type)}
                                key={listener.id}
                                className={cn(
                                    Listener === listener.type
                                        ? 'bg-gradient-to-br from-[#3352CC] to-[#1C2D70]'
                                        : 'bg-background-80',
                                    'p-3 rounded-xl flex flex-col gap-y-2 cursor-pointer hover:opacity-80 transition duration-100'
                                )}
                            >
                                <div className="flex gap-x-2 items-center">
                                    {listener.icon}
                                    <p>{listener.label}</p>
                                </div>
                                <p>{listener.description}</p>
                            </div>
                        </SubscriptionPlan>
                    ) : (
                        <div
                            onClick={() => onSetListener(listener.type)}
                            key={listener.id}
                            className={cn(
                                Listener === listener.type
                                    ? 'bg-gradient-to-br from-[#3352CC] to-[#1C2D70]'
                                    : 'bg-background-80',
                                'p-3 rounded-xl flex flex-col gap-y-2 cursor-pointer hover:opacity-80 transition duration-100'
                            )}
                        >
                            <div className="flex gap-x-2 items-center">
                                {listener.icon}
                                <p>{listener.label}</p>
                            </div>
                            <p>{listener.description}</p>
                        </div>
                    )
                )}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-y-2"
                >
                    <Textarea
                        placeholder={
                            						Listener === 'PROLYAI'
                                					? 'Add a prompt that your Proly AI can use...'
                                : 'Add a message you want send to your customers'
                        }
                        name="prompt"
                        value={formData.prompt}
                        onChange={handleInputChange}
                        className="bg-background-80 outline-none border-none ring-0 focus:ring-0"
                    />
                    <Input
                        name="reply"
                        value={formData.reply}
                        onChange={handleInputChange}
                        placeholder="Add a reply for comments (Optional)"
                        className="bg-background-80 outline-none border-none ring-0 focus:ring-0"
                    />
                    <Button className="bg-gradient-to-br w-full from-[#3352CC] font-medium text-white to-[#1C2D70]">
                        <Loader state={isPending}>Add listener</Loader>
                    </Button>
                </form>
            </div>
        </TriggerButton>
    )
}

export default ThenAction