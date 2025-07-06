import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCallback } from "react"

export function Navbar() {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="w-full px-2 py-2 sticky top-0 z-50">
      <nav className="flex items-center rounded-full bg-white/90 backdrop-blur-md border border-[#6F1FB6]/10 px-6 py-3 max-w-[1600px] mx-auto shadow-lg">
        <div className="flex-1">
          <Link href="/" className="flex items-center justify-start">
            <div className="flex items-center justify-center gap-2 -ml-2">
              {/* Logomark */}
              <Image 
                src="/Prolychat_lm_black.png"
                alt="Prolychat Logomark"
                width={42}
                height={42}
                className="object-contain"
                priority
              />
              {/* Wordmark */}
              <Image 
                src="/prolychat_bl.png"
                alt="Prolychat"
                width={140}
                height={42}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-8 max-md:hidden">
            <button onClick={() => scrollToSection("features")} className="text-gray-800 hover:text-[#6F1FB6] font-medium transition-colors whitespace-nowrap">
              Features
            </button>
            <button onClick={() => scrollToSection("pricing")} className="text-gray-800 hover:text-[#6F1FB6] font-medium transition-colors whitespace-nowrap">
              Pricing
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-gray-800 hover:text-[#6F1FB6] font-medium transition-colors whitespace-nowrap">
              Testimonials
            </button>
            <Link href="/privacy-policy" className="text-gray-800 hover:text-[#6F1FB6] font-medium transition-colors whitespace-nowrap">
              Privacy&nbsp;Policy
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <Link href="/sign-in">
            <Button 
              className="rounded-full text-base font-medium px-8 py-2.5 bg-[#6F1FB6] text-white hover:bg-[#6F1FB6]/90 transition-colors shadow-lg hover:shadow-xl border-2 border-transparent hover:border-[#6F1FB6]/30"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  )
}
