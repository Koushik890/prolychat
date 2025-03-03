'use client'

import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { FormState } from '@/actions/user/account'

interface ToastProps {
  status: 'success' | 'error' | 'idle'
  message: string
  onClose: () => void
}

const toastVariants = cva(
  'fixed bottom-6 right-6 p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all transform z-50 max-w-md',
  {
    variants: {
      status: {
        success: 'bg-white border border-green-200 text-gray-900',
        error: 'bg-white border border-red-200 text-gray-900',
        idle: 'hidden'
      }
    },
    defaultVariants: {
      status: 'idle'
    }
  }
)

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
      className={toastVariants({ status })}
      role="alert"
    >
      <div className={`p-2 rounded-full ${
        status === 'success' ? 'bg-green-50' : 'bg-red-50'
      }`}>
        {status === 'success' ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600" />
        )}
      </div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast
