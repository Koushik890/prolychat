import Link from "next/link"
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react'
import Image from "next/image"

export function Footer() {
  return (
    <footer className="mt-20 bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col justify-center space-y-4">
          <Link href="/" className="flex items-center justify-center md:justify-start">
            <div className="flex items-center justify-center gap-2">
              {/* Logomark */}
              <Image 
                src="/Prolychat_lm_black.png"
                alt="Prolychat Logomark"
                width={38}
                height={38}
                className="object-contain"
                priority
              />
              {/* Wordmark */}
              <Image 
                src="/prolychat_bl.png"
                alt="Prolychat"
                width={120}
                height={38}
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <p className="text-sm text-gray-600">Automate your Instagram engagement and grow your community.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4">Product</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Features</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Testimonials</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">About Us</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Careers</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4">Connect</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900 flex items-center"><Twitter className="h-4 w-4 mr-2" /> Twitter</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900 flex items-center"><Facebook className="h-4 w-4 mr-2" /> Facebook</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900 flex items-center"><Instagram className="h-4 w-4 mr-2" /> Instagram</Link></li>
            <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900 flex items-center"><Mail className="h-4 w-4 mr-2" /> Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Prolychat. All rights reserved.</p>
      </div>
    </footer>
  )
}
