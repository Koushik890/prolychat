'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users } from 'lucide-react'

type Keyword = {
  id: string
  word: string
  triggerId: string
}

type ActiveTriggerProps = {
  type: string
  keywords: Keyword[]
}

const ActiveTrigger = ({ type, keywords }: ActiveTriggerProps) => {
  const getTriggerInfo = (triggerType: string) => {
    switch (triggerType) {
      case 'user-message':
        return {
          icon: <MessageSquare className="w-5 h-5" />,
          label: 'Direct Messages',
          description: 'Responds to user direct messages'
        }
      case 'post-comments':
        return {
          icon: <Users className="w-5 h-5" />,
          label: 'Post Comments',
          description: 'Responds to comments on posts'
        }
      default:
        return {
          icon: <MessageSquare className="w-5 h-5" />,
          label: 'Unknown Trigger',
          description: 'Unknown trigger type'
        }
    }
  }

  const triggerInfo = getTriggerInfo(type)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-hubot">
          {triggerInfo.icon}
          {triggerInfo.label}
        </CardTitle>
        <p className="text-sm text-muted-foreground font-mona">
          {triggerInfo.description}
        </p>
      </CardHeader>
      <CardContent>
        {keywords && keywords.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium font-mona">Keywords:</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword.id} variant="secondary" className="font-mona">
                  {keyword.word}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {(!keywords || keywords.length === 0) && (
          <p className="text-sm text-muted-foreground font-mona">
            No keywords configured
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default ActiveTrigger
