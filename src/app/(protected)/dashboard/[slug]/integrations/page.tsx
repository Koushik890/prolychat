'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function IntegrationsRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params?.slug) {
      // Redirect to the main dashboard
      router.replace(`/dashboard/${params.slug}`)
    }
  }, [params, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">Integration management is now available from the floating Instagram button</p>
      </div>
    </div>
  )
}
