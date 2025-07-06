import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  className?: string
  collapsed?: boolean
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 transition-all duration-300 ease-in-out", className)}>
      {/* Logomark */}
      <Image 
        src="/Prolychat_lm_black.png"
        alt="Prolychat Logomark"
        width={collapsed ? 40 : 48}
        height={collapsed ? 40 : 48}
        className="object-contain transition-all duration-300 ease-in-out"
      />
      {/* Wordmark - only show when not collapsed */}
      {!collapsed && (
        <Image 
          src="/prolychat_bl.png"
          alt="Prolychat"
          width={160}
          height={48}
          className="object-contain transition-all duration-300 ease-in-out"
        />
      )}
    </div>
  )
}
