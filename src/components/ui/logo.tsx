import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  className?: string
  collapsed?: boolean
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center transition-all duration-300 ease-in-out", className)}>
      <Image 
        src="/logo.png"
        		alt="Prolychat Logo"
        width={collapsed ? 40 : 180}
        height={collapsed ? 40 : 45}
        className="object-contain transition-all duration-300 ease-in-out"
      />
    </div>
  )
}
