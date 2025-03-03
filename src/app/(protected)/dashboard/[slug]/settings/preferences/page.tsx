'use client'

import React from 'react'
import SettingsHeader from '@/components/global/settings/settings-header'
import { useParams } from 'next/navigation'

const PreferencesSettingsPage = () => {
  const params = useParams()
  const userSlug = params?.slug as string || ''

  return (
    <>
      <SettingsHeader userSlug={userSlug} />
      <div>
        <h2 className="text-xl font-medium mb-4">User Preferences</h2>
        <div className="bg-white shadow rounded-lg p-6">
          {/* Preferences settings content will go here */}
          <p className="text-gray-500">Notification settings, theme options, and other preferences will be shown here.</p>
        </div>
      </div>
    </>
  )
}

export default PreferencesSettingsPage
