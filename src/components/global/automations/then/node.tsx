'use client'
import React from 'react'
import { useQueryAutomation } from '@/hooks/user-queries'
import ThenAction from './then-action'
import { Warning } from '@/icons'

type Props = {
    id: string
}

const ThenNode = ({ id }: Props) => {
    const { data } = useQueryAutomation(id)

    if (data?.data?.trigger.length === 0) return null

    return (
        <div className="w-full lg:w-10/12 xl:w-6/12 p-5 rounded-xl flex flex-col bg-white/95 gap-y-3 text-gray-900 backdrop-blur-sm border border-black/10 shadow-lg">
            <div className="flex items-center gap-2">
                <Warning />
                <span className="font-mona">Then...</span>
            </div>
            <ThenAction id={id} />
        </div>
    )
}

export default ThenNode