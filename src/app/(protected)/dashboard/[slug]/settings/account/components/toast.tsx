'use client'

import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { FormState } from '@/actions/user/account'

interface ToastProps {
  status: 'success' | 'error' | 'idle'
  message: string
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ status, message, onClose }) => {
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  if (status === 'idle') return null

  return (
    <div 
      className={`toast ${status}`}
      role="alert"
    >
      <div className="toast-message">
        {status === 'success' ? (
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {message}
          </div>
        ) : (
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {message}
          </div>
        )}
      </div>
      <button 
        onClick={onClose}
        className="toast-close"
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast
