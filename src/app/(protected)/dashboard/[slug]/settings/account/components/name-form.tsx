'use client'

import React, { useState, useEffect } from 'react'
import { User, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateUserName, FormState, UserNameUpdateData } from '@/actions/user/account'
import { useUser } from '@clerk/nextjs'
import { fontFamily } from '../constants'

interface NameFormProps {
  initialFirstName: string
  initialLastName: string
  onSuccess: (state: FormState) => void
}

const NameForm: React.FC<NameFormProps> = ({ 
  initialFirstName, 
  initialLastName,
  onSuccess
}) => {
  const { user, isLoaded } = useUser()
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Keep form in sync with Clerk user data when it changes
  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || initialFirstName)
      setLastName(user.lastName || initialLastName)
    }
  }, [isLoaded, user, initialFirstName, initialLastName])
  
  const hasChanges = firstName !== initialFirstName || lastName !== initialLastName
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return
    
    setIsSubmitting(true)
    try {
      const formData: UserNameUpdateData = {
        firstName,
        lastName
      }
      
      const result = await updateUserName(formData)
      
      // If successful, also update the Clerk UI immediately 
      if (result.status === 'success' && user) {
        user.update({
          firstName,
          lastName
        }).catch(error => {
          console.error('Error updating Clerk user data on client:', error)
        })
      }
      
      onSuccess(result)
    } catch (error) {
      console.error('Error updating name:', error)
      onSuccess({ 
        status: 'error', 
        message: 'An unexpected error occurred' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <section className="font-sans">
      <div className="flex items-center gap-2">
        <h2 
          className="text-xl font-semibold text-gray-900 mb-1 font-sans tracking-tight"
          style={{ fontFamily }}
        >Profile Information</h2>
      </div>
      <p className="text-gray-600 mb-3 font-sans text-base leading-relaxed" style={{ fontSize: '16px' }}>
        Your name appears on your Profile, events you host, and notifications sent to your attendees.
      </p>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                First Name
              </label>
              <Input 
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 font-medium p-2 text-sm font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Your first name"
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Last Name
              </label>
              <Input 
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 font-medium p-2 text-sm font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Your last name"
              />
            </div>
          </div>
          
          <div>
            <Button 
              type="submit"
              variant="outline" 
              size="sm" 
              className={`gap-2 font-medium font-sans rounded-lg transition-colors ${
                hasChanges 
                  ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700' 
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
              disabled={!hasChanges || isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default NameForm
