'use client'

import React from 'react'
import './settings.css'

interface SettingsLayoutProps {
  children: React.ReactNode
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <div className="settings-section">
      {children}
    </div>
  )
}

export default SettingsLayout
