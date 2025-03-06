'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pause, Clock, Check, X, User, Flag, Calendar, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

// Add global styles to fix overlay issues
const globalStyles = `
  .contact-modal-open {
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .contact-modal-overlay {
    position: fixed !important;
    inset: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: rgba(0, 0, 0, 0.4) !important;
    backdrop-filter: blur(4px) !important;
    z-index: 50 !important;
  }
`

interface Contact {
  id: string
  avatar: string
  instagramProfilePic?: string
  name: string
  status: 'Subscribed' | 'Unsubscribed'
  subscribed: string
}

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
}

export function ContactModal({ isOpen, onClose, contact }: ContactModalProps) {
  if (!contact) return null

  // Format the username to match the image
  const formattedUsername = `__${contact.name.replace('__', '')}__`
  
  // State for pause automations functionality
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isPausedForever, setIsPausedForever] = useState(false)
  const [pauseEndTime, setPauseEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Add global styles when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Create and inject global styles
      const style = document.createElement('style')
      style.innerHTML = globalStyles
      document.head.appendChild(style)
      
      // Add class to body
      document.body.classList.add('contact-modal-open')
      document.documentElement.classList.add('contact-modal-open')
      
      return () => {
        // Clean up when modal closes
        document.body.classList.remove('contact-modal-open')
        document.documentElement.classList.remove('contact-modal-open')
        style.remove()
      }
    }
  }, [isOpen])
  
  // Track clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Calculate time remaining when a duration is selected
  useEffect(() => {
    if (!selectedOption && !isPausedForever) {
      setTimeRemaining('00:00:00')
      setPauseEndTime(null)
      return
    }
    
    if (isPausedForever) {
      setTimeRemaining('∞')
      setPauseEndTime(null)
      return
    }
    
    const now = new Date()
    let endTime = new Date(now)
    
    // Add selected duration to current time
    switch (selectedOption) {
      case '30 minutes':
        endTime.setMinutes(now.getMinutes() + 30)
        break
      case '1 hour':
        endTime.setHours(now.getHours() + 1)
        break
      case '3 hours':
        endTime.setHours(now.getHours() + 3)
        break
      case '6 hours':
        endTime.setHours(now.getHours() + 6)
        break
      case '12 hours':
        endTime.setHours(now.getHours() + 12)
        break
      case '1 day':
        endTime.setDate(now.getDate() + 1)
        break
      default:
        break
    }
    
    setPauseEndTime(endTime)
    
    // Update countdown timer every second
    const intervalId = setInterval(() => {
      const currentTime = new Date()
      const diff = endTime.getTime() - currentTime.getTime()
      
      if (diff <= 0) {
        clearInterval(intervalId)
        setSelectedOption(null)
        setPauseEndTime(null)
        setTimeRemaining('00:00:00')
        return
      }
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      // Format time remaining
      const formattedHours = hours.toString().padStart(2, '0')
      const formattedMinutes = minutes.toString().padStart(2, '0')
      const formattedSeconds = seconds.toString().padStart(2, '0')
      
      setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    }, 1000)
    
    return () => clearInterval(intervalId)
  }, [selectedOption, isPausedForever])
  
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }
  
  // Handle clicking on a duration option
  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    setIsPausedForever(false)
    setIsDropdownOpen(false)
    console.log(`Selected option: ${option}`)
  }
  
  // Handle the "Pause forever" option
  const handlePauseForever = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    setIsPausedForever(checked)
    if (checked) {
      setSelectedOption(null)
    }
    console.log(`Pause forever: ${checked}`)
  }
  
  // Resume automations
  const handleResumeAutomations = () => {
    setSelectedOption(null)
    setIsPausedForever(false)
    setPauseEndTime(null)
    setTimeRemaining('00:00:00')
    setIsDropdownOpen(false)
    console.log('Resumed automations')
  }
  
  // Get the button text based on current selection
  const getButtonText = () => {
    if (isPausedForever || selectedOption) {
      return timeRemaining
    }
    return 'Pause Automations'
  }
  
  // Format end time to show when automations will resume
  const getFormattedEndTime = () => {
    if (!pauseEndTime) return ''
    
    const hours = pauseEndTime.getHours()
    const minutes = pauseEndTime.getMinutes()
    
    // Format as HH:MM (e.g., 20:00)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  // Generate a random color based on name (for consistent avatar)
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 
      'bg-violet-600', 'bg-rose-600', 'bg-amber-600'
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Get first letter for avatar
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const avatarColor = getAvatarColor(contact.name)
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogPortal>
        <div className="contact-modal-overlay" />
        <DialogContent className="fixed top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 overflow-visible w-[90%] max-w-[600px] rounded-xl shadow-2xl border-0 bg-white z-[1000]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center cursor-pointer z-50 shadow-md hover:bg-gray-700 transition-colors"
          >
            <X size={14} />
          </button>

          <div className="flex flex-col md:flex-row w-full">
            {/* Left panel - Avatar and automation controls */}
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-l-xl w-full md:w-[240px]">
              {/* Avatar */}
              <div className={cn(
                "w-full aspect-square rounded-lg overflow-hidden mb-4 shadow-md", 
                avatarColor
              )}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-5xl font-semibold">
                    {getInitial(contact.name)}
                  </span>
                </div>
              </div>

              {/* Pause/Resume Automations dropdown */}
              <div className="relative w-full" ref={dropdownRef}>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full flex items-center justify-center border border-gray-200 bg-white rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-all",
                    (selectedOption || isPausedForever) 
                      ? "text-amber-600 hover:text-amber-700 border-amber-200" 
                      : "text-gray-700 hover:text-gray-900 hover:border-gray-300"
                  )}
                  onClick={toggleDropdown}
                  type="button"
                >
                  <div className="flex items-center gap-1.5">
                    {(selectedOption || isPausedForever) ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                    <span className="text-xs">{getButtonText()}</span>
                  </div>
                </Button>
                
                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden"
                    style={{ 
                      maxHeight: selectedOption || isPausedForever ? '360px' : '280px',
                      animation: 'fadeIn 0.2s ease-in-out',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {/* Header */}
                    <div className="px-3 py-1.5 border-b border-gray-200 font-semibold text-xs text-gray-800 bg-gray-50 sticky top-0 z-10">
                      {(selectedOption || isPausedForever) ? 'Edit duration' : 'Set duration'}
                    </div>
                    
                    {/* Options */}
                    <div className="bg-white py-0.5 overflow-y-auto">
                      {/* Resume automations (only when paused) */}
                      {(selectedOption || isPausedForever) && (
                        <div 
                          className="flex flex-col px-3 py-2 text-xs cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                          onClick={handleResumeAutomations}
                        >
                          <div className="flex items-center">
                            <Play className="h-3.5 w-3.5 mr-2 text-gray-600" />
                            <span className="flex-1 font-medium text-gray-700 whitespace-nowrap">Resume automations</span>
                          </div>
                          {pauseEndTime && (
                            <div className="text-gray-500 text-[10px] mt-1.5 ml-5">
                              Automations paused until {getFormattedEndTime()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Duration options */}
                      {[
                        '30 minutes',
                        '1 hour',
                        '3 hours',
                        '6 hours',
                        '12 hours',
                        '1 day'
                      ].map((option, index) => (
                        <div
                          key={option}
                          className={cn(
                            "flex items-center px-3 py-1.5 text-xs cursor-pointer border-b border-gray-100",
                            selectedOption === option 
                              ? "bg-blue-50 text-blue-600 font-medium" 
                              : "text-gray-800 hover:bg-gray-50"
                          )}
                          onClick={() => handleOptionClick(option)}
                        >
                          <Clock className={cn(
                            "h-3 w-3 mr-2",
                            selectedOption === option ? "text-blue-500" : "text-gray-500"
                          )} />
                          <span className="flex-1">{option}</span>
                          {selectedOption === option && (
                            <Check className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      ))}
                      
                      {/* Pause forever option */}
                      <div 
                        className={cn(
                          "flex items-center px-3 py-1.5 text-xs cursor-pointer mb-1",
                          isPausedForever 
                            ? "bg-blue-50 text-blue-600 font-medium" 
                            : "text-gray-800 hover:bg-gray-50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isPausedForever}
                          onChange={handlePauseForever}
                          className="mr-2.5 h-3 w-3 cursor-pointer accent-blue-500"
                          onClick={e => e.stopPropagation()}
                        />
                        <span>Pause forever</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel - Contact details */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                  {contact.name}
                </h2>
                <div className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3",
                  contact.status === 'Subscribed' 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                )}>
                  {contact.status}
                </div>
                <p className="text-sm text-gray-500 flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  {formattedUsername}
                </p>
              </div>

              {/* Join date */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-xs font-medium">Joined</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  February 15, 2025
                </p>
              </div>

              {/* Report button only */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-white hover:bg-gray-50 text-red-600 border-gray-200 hover:border-red-200 hover:bg-red-50"
                >
                  <Flag className="h-3.5 w-3.5 mr-1.5" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}