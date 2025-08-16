'use client'
import React from 'react'
import { useQueryAutomation } from '@/hooks/user-queries'
import { Warning } from '@/icons'
import PostButton from './index'

type Props = {
    id: string
}

// Define a type for the trigger object based on the actual structure
type TriggerType = {
    id: string
    type: string
    config?: {
        posts?: Array<{
            postId: string
            mediaType: string
            mediaUrl: string
            caption?: string
        }>
        // Add other config properties as needed
    }
}

const PostNode = ({ id }: Props) => {
    const { data } = useQueryAutomation(id)
    const commentTrigger = data?.data?.trigger?.find((t: any) => t.type === 'COMMENT') as TriggerType | undefined

    // Check if commentTrigger exists and if it has posts in its config
    if (!commentTrigger || !commentTrigger.config?.posts || commentTrigger.config.posts.length > 0) return null

    return (
        <div className="w-full lg:w-10/12 xl:w-6/12 p-5 rounded-xl flex flex-col bg-white/95 gap-y-3 text-gray-900 backdrop-blur-sm border border-black/10 shadow-lg">
            <div className="flex items-center gap-2">
                <Warning />
                <span className="font-mona">Posts...</span>
            </div>
            <PostButton id={id} />
        </div>
    )
}

export default PostNode
