"use client"

import { SidebarLeftIcon } from "@/icons/sidebar-left-icon"
import { SidebarRightIcon } from "@/icons/sidebar-right-icon"

interface SidebarToggleProps {
  isExpanded: boolean
  onToggle: () => void
}

export function SidebarToggle({ isExpanded, onToggle }: SidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-[28px] w-[28px] items-center justify-center rounded-lg transition-all hover:bg-gray-200/60"
      aria-expanded={isExpanded}
      aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isExpanded ? (
        <SidebarLeftIcon className="h-5 w-5 text-gray-600" />
      ) : (
        <SidebarRightIcon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  )
} 