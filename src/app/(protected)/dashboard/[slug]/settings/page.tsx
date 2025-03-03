'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page({ params }: { params: { slug: string } }) {
  const router = useRouter()
  
  useEffect(() => {
    // Immediate redirect to avoid any content flash
    router.replace(`/dashboard/${params.slug}/settings/account`)
  }, [params.slug, router])
  
  // Return an empty div with no styling or content
  // This minimizes anything that could be rendered before the redirect
  return null
}