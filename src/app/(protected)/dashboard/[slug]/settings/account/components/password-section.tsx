'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { KeyRound, Eye, EyeOff, Lock } from 'lucide-react'
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
    <section>
      <div className="form-card">
        <div className="form-header">
          <div>
            <h2 className="form-title">Password & Security</h2>
            <p className="form-description">
              Secure your account with a strong password for better protection.
            </p>
          </div>
          <Lock className="text-gray-400 h-5 w-5" />
        </div>
        
        <div className="form-content">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              {errors.general && (
                <div className="p-3 rounded bg-red-50 border border-red-100 text-red-600 text-sm">
                  {errors.general}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <Button
                  onClick={handleCancelEdit}
                  className="provider-action disconnect w-full sm:w-auto"
                  type="button"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  className="form-submit w-full sm:w-auto sm:min-w-[140px]"
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-gray-500">
                  Change your password or enable additional authentication methods.
                </p>
                {success && (
                  <p className="text-green-600 text-sm mt-2">{success}</p>
                )}
              </div>
              <Button
                onClick={handleChangePassword}
                className="form-submit w-full sm:w-auto sm:min-w-[140px]"
                type="button"
              >
                Change Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PasswordSection
