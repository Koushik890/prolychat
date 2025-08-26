import { ReactNode } from 'react';

export interface AutomationTrigger {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
}

export interface AutomationKeyword {
  id: string;
  word: string;
  triggerId: string;
}

export interface AutomationPost {
  id: string;
  postId: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROSEL_ALBUM';
  mediaUrl: string;
  caption?: string;
  triggerId: string;
}

export interface AutomationReplyMessage {
  id: string;
  message: string;
  triggerId: string;
}

export type TriggerConfig = {
  type: 'specific' | 'all' | 'next'
  postId?: string
  mediaUrl?: string
  keywords?: {
    include: string[]
  }
  replyMessages?: string[]
  status?: TriggerConfigurationStatus
  posts?: {
    postId: string
    mediaType: string
    mediaUrl: string
    caption: string | null
  }[]
}

export interface TriggerData {
  id: string
  type: string
  config?: TriggerConfig
  automationId: string | null
  posts?: {
    id: string
    caption: string | null
    postId: string
    mediaType: string
    mediaUrl: string
    triggerId: string
  }[]
  keywords?: {
    id: string
    triggerId: string
    word: string
  }[]
  replyMessages?: {
    id: string
    triggerId: string
    message: string
  }[]
}

export interface AutomationData {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  trigger: TriggerData[]
  listener: any;
}

export interface AutomationAction {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  upgradeRequired?: boolean;
  savedText?: string;
}

export type TriggerConfigurationStatus = 'unconfigured' | 'partial' | 'complete'

export interface CardData {
  image?: string
  title: string
  subtitle: string
  link?: string
  buttonAction?: 'message' | 'ai' | 'website'
  buttonTitle?: string
  button2Link?: string
  button2Action?: 'message' | 'ai' | 'website'
  button2Title?: string
  button3Link?: string
  button3Action?: 'message' | 'ai' | 'website'
  button3Title?: string
}

export interface MessageData {
  id?: string
  listenerId: string
  type: 'TEXT' | 'RICH'
  textContent?: string
  richTitle?: string
  ctaLabel?: string
  ctaAction?: string
  ctaUrl?: string
  cta2Label?: string
  cta2Action?: string
  cta2Url?: string
  cta3Label?: string
  cta3Action?: string
  cta3Url?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ListenerWithMessage {
  id: string
  automationId: string
  type: 'MESSAGE' | 'PROLYAI' | 'CARD'
  status: 'UNCONFIGURED' | 'CONFIGURED' | 'COMPLETED'
  prompt?: string
  message?: string
  commentReply?: string
  dmCount: number
  commentCount: number
  metadata?: any
  createdAt: Date
  updatedAt: Date
  messageData?: MessageData
}