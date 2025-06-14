'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onUserInfo } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'

export default function InstagramFixRedirect() {
  const router = useRouter()
  
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: onUserInfo,
  })

  useEffect(() => {
    if (!isLoading && userData?.data?.id) {
      // Redirect to dashboard where the Instagram modal will handle connection
      router.replace(`/dashboard/${userData.data.id}`)
      }
  }, [isLoading, userData, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">Instagram management is now handled from the dashboard</p>
            </div>
    </div>
  )
} 