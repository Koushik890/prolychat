'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { fontFamily } from '../constants'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

const inputStyle = {
  backgroundColor: 'white',
  color: '#1f2937' // text-gray-900 equivalent
}

const inputClassName = "w-full pr-10 bg-white text-gray-900 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"

const PasswordSection: React.FC = () => {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const handleChangePassword = async () => {
    if (isEditing) {
      try {
        // Validate the passwords
        const validation = passwordSchema.safeParse(formData)
        if (!validation.success) {
          const formattedErrors: Record<string, string> = {}
          validation.error.errors.forEach(error => {
            formattedErrors[error.path[0]] = error.message
          })
          setErrors(formattedErrors)
          return
        }
        
        setIsLoading(true)
        setErrors({})
        
        if (!user) {
          setErrors({ general: 'User not authenticated' })
          setIsLoading(false)
          return
        }
        
        // Update the user's password
        await user.updatePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
        
        setSuccess('Password updated successfully')
        setIsEditing(false)
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setIsLoading(false)
      } catch (error) {
        console.error("Error updating password:", error)
        setErrors({ general: 'Failed to update password. Please check your current password and try again.' })
        setIsLoading(false)
      }
    } else {
      setIsEditing(true)
      setErrors({})
      setSuccess('')
    }
  }
  
  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  return (
    <section className="font-sans mt-10">
      <h2 
        className="text-xl font-semibold text-gray-900 mb-1 font-sans tracking-tight"
        style={{ fontFamily }}
      >Password & Security</h2>
      <p className="text-gray-600 mb-3 font-sans leading-relaxed" style={{ fontSize: '16px' }}>
        Secure your account with a strong password for better protection.
      </p>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg mt-1">
              <KeyRound className="h-5 w-5 text-indigo-600" />
            </div>
            <div className={isEditing ? 'w-full pr-4' : ''}>
              <h3 
                className="font-medium text-gray-900 font-sans tracking-tight"
                style={{ fontFamily }}
              >Account Password</h3>
              
              {isEditing ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={inputClassName}
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={inputClassName}
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={inputClassName}
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  {errors.general && (
                    <p className="text-red-500 text-xs">{errors.general}</p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-gray-500 mt-1 font-sans leading-relaxed" style={{ fontSize: '16px' }}>
                    Set a strong password to secure your account. We recommend using a password manager.
                  </p>
                  {success && (
                    <p className="text-green-600 text-xs mt-1">{success}</p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg font-sans"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                <span>Cancel</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 bg-white border-gray-200 ${isEditing ? 'text-indigo-600' : 'text-gray-800'} font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg font-sans`}
              onClick={handleChangePassword}
              disabled={isLoading}
            >
              <KeyRound className="h-4 w-4 text-indigo-500" />
              <span>{isLoading ? 'Loading...' : (isEditing ? 'Save' : 'Change')}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PasswordSection
