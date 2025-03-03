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
    <section>
      <div className="form-card">
        <div className="form-header">
          <div>
            <h2 className="form-title">Profile Information</h2>
            <p className="form-description">
              Your name appears on your Profile, events you host, and notifications sent to your attendees.
            </p>
          </div>
          <User className="text-gray-400 h-5 w-5" />
        </div>
        
        <form onSubmit={handleSubmit} className="form-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <Input 
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input"
                style={{ 
                  backgroundColor: 'white', 
                  color: '#111827', 
                  border: '1px solid #D1D5DB',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                required
                placeholder="Your first name"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <Input 
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input"
                style={{ 
                  backgroundColor: 'white', 
                  color: '#111827', 
                  border: '1px solid #D1D5DB',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                required
                placeholder="Your last name"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              type="submit"
              className={`form-submit ${!hasChanges || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!hasChanges || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default NameForm
