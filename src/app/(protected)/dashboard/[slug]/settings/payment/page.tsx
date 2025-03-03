'use client'

import React from 'react'
import SettingsHeader from '@/components/global/settings/settings-header'
import { useParams } from 'next/navigation'
import Billing from '@/components/global/billing'

const PaymentSettingsPage = () => {
  const params = useParams()
  const userSlug = params?.slug as string || ''

  return (
    <>
      <SettingsHeader userSlug={userSlug} />
      <div>
        {/* Use the existing Billing component */}
        <Billing />
      </div>
    </>
  )
}

export default PaymentSettingsPage
