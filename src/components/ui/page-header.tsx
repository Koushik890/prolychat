import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-x-3">
          {actions}
        </div>
      )}
    </div>
  )
}
