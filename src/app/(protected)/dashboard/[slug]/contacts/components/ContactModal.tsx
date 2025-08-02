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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Contact } from '@/types/contact'

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

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onContactUpdate: (updatedContact: Contact) => void
}

export function ContactModal({ isOpen, onClose, contact: initialContact, onContactUpdate }: ContactModalProps) {
  if (!initialContact) return null
  
  // Local copy of contact that can be updated within the component
  const [contact, setContact] = useState<Contact>(initialContact)

  // State for automation dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(
    contact.pauseDuration || null
  )
  const [pauseEndTime, setPauseEndTime] = useState<Date | null>(
    contact.pauseEndTime || null
  )
  const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00')
  const [customDuration, setCustomDuration] = useState<string>('')
  const [isCustomDuration, setIsCustomDuration] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update local contact state when parent contact prop changes
  useEffect(() => {
    if (initialContact) {
      setContact(initialContact)
      setSelectedOption(initialContact.pauseDuration || null)
      setPauseEndTime(initialContact.pauseEndTime ? new Date(initialContact.pauseEndTime) : null)
      
      // Initialize timeRemaining for paused contacts with existing duration
      updateTimeRemaining(initialContact)
    }
  }, [initialContact])

  // Check if pause has already expired on mount or when pause end time changes
  useEffect(() => {
    // Only check if contact is in paused state
    if (contact.status === 'Paused' && contact.pauseEndTime) {
      const endTime = new Date(contact.pauseEndTime)
      const now = new Date()
      
      // If pause end time is in the past, update status
      if (endTime <= now) {
        const updatedContact = {
          ...contact,
          status: 'Subscribed' as const,
          pauseDuration: null,
          pauseEndTime: null
        }
        setContact(updatedContact)
        setSelectedOption(null)
        setPauseEndTime(null)
        setTimeRemaining('00:00:00')
        onContactUpdate(updatedContact)
      }
    }
  }, [contact.status, contact.pauseEndTime])

  // Function to update time remaining display - extracted for reuse
  const updateTimeRemaining = (currentContact: Contact) => {
    if (currentContact.status === 'Paused') {
      // Handle 'Forever' pause specially
      if (currentContact.isPausedForever) {
        setTimeRemaining('Paused forever')
        return
      }
      
      // Otherwise calculate time remaining for normal pause durations
      if (currentContact.pauseEndTime) {
        const endTime = new Date(currentContact.pauseEndTime)
        const now = new Date()
        const diff = endTime.getTime() - now.getTime()
        
        if (diff > 0) {
          // Calculate hours, minutes, seconds
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          
          // Format time remaining
          const formattedHours = hours.toString().padStart(2, '0')
          const formattedMinutes = minutes.toString().padStart(2, '0')
          const formattedSeconds = seconds.toString().padStart(2, '0')
          
          setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
        } else {
          // Timer expired, reset status
          setTimeRemaining('00:00:00')
          if (currentContact.status === 'Paused') {
            const expiredContact = {
              ...currentContact,
              status: 'Subscribed' as const,
              pauseDuration: null,
              pauseEndTime: null,
              isPausedForever: false
            }
            // Update the local contact state as well
            setContact(expiredContact)
            setSelectedOption(null)
            setPauseEndTime(null)
            onContactUpdate(expiredContact)
          }
        }
      }
    } else {
      setTimeRemaining('00:00:00')
    }
  }

  // Reset state when contact changes
  useEffect(() => {
    if (contact) {
      setSelectedOption(contact.pauseDuration || null)
      setPauseEndTime(contact.pauseEndTime || null)
      setIsCustomDuration(false)
      setCustomDuration('')
    }
  }, [contact.status, contact.pauseDuration, contact.pauseEndTime])

  // Add/remove body class to prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('contact-modal-open')
    } else {
      document.body.classList.remove('contact-modal-open')
    }

    return () => {
      document.body.classList.remove('contact-modal-open')
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
    // Don't proceed if contact is not paused or has no end time and is not paused forever
    if (contact.status !== 'Paused' || (!contact.pauseEndTime && !contact.isPausedForever)) {
      return () => {}; // No cleanup needed
    }
    
    // If paused forever, set the special text and exit
    if (contact.isPausedForever) {
      setTimeRemaining('Paused forever')
      return () => {}; // No need for countdown timer
    }
    
    let endTime: Date
    if (pauseEndTime) {
      endTime = new Date(pauseEndTime)
    } else if (contact.pauseEndTime) {
      endTime = new Date(contact.pauseEndTime)
    } else {
      return () => {}; // No valid end time, so no timer needed
    }
    
    // Initial calculation
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    
    if (diff <= 0) {
      // Already expired
      setTimeRemaining('00:00:00')
      
      // Ensure subscription is resumed
      const updatedContact = {
        ...contact,
        status: 'Subscribed' as const,
        pauseDuration: null,
        pauseEndTime: null,
        isPausedForever: false
      }
      setContact(updatedContact)
      setSelectedOption(null)
      setPauseEndTime(null)
      onContactUpdate(updatedContact)
      
      return () => {};
    }
    
    // Immediately calculate and display time remaining
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')
    
    setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    
    // Update countdown timer every second
    const intervalId = setInterval(() => {
      const currentTime = new Date()
      const currentDiff = endTime.getTime() - currentTime.getTime()
      
      if (currentDiff <= 0) {
        clearInterval(intervalId)
        // Reset the pause state and update the contact
        setSelectedOption(null)
        setPauseEndTime(null)
        setTimeRemaining('00:00:00')
        setIsCustomDuration(false)
        setCustomDuration('')
        
        // Update the contact status
        if (contact) {
          const updatedContact = {
            ...contact,
            status: 'Subscribed' as const,
            pauseDuration: null,
            pauseEndTime: null,
            isPausedForever: false
          }
          // Ensure we update both local state and parent
          setContact(updatedContact)
          onContactUpdate(updatedContact)
        }
      } else {
        // Update time remaining display
        const hours = Math.floor(currentDiff / (1000 * 60 * 60))
        const minutes = Math.floor((currentDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((currentDiff % (1000 * 60)) / 1000)
        
        const formattedHours = hours.toString().padStart(2, '0')
        const formattedMinutes = minutes.toString().padStart(2, '0')
        const formattedSeconds = seconds.toString().padStart(2, '0')
        
        setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
      }
    }, 1000)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [contact, selectedOption, pauseEndTime, onContactUpdate])

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }
  
  // Handle custom duration change
  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, '')
    setCustomDuration(value)
  }

  // Handle custom duration submit
  const handleCustomDurationSubmit = () => {
    if (!customDuration || parseInt(customDuration) <= 0) return
    
    // Parse the custom duration value
    const durationValue = parseInt(customDuration)
    
    // Set custom duration as selected option
    const option = `${durationValue} minutes`
    setSelectedOption(option)
    setIsCustomDuration(false)
    setIsDropdownOpen(false)
    
    // Calculate end time
    const now = new Date()
    const endTime = new Date(now)
    endTime.setMinutes(now.getMinutes() + durationValue)
    
    // Set the pause end time in state
    setPauseEndTime(endTime)
    
    // Create updated contact
    const updatedContact = {
      ...contact,
      status: 'Paused' as const,
      pauseDuration: option,
      pauseEndTime: endTime
    }
    
    // Update time remaining immediately
    const diff = endTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')
    
    setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    
    // Update both parent and local state
    setContact(updatedContact)
    onContactUpdate(updatedContact)
  }

  // Handle option selection
  const handleOptionClick = (option: string) => {
    // If this is the custom option, show custom input
    if (option === 'custom') {
      setIsCustomDuration(true)
      return
    }
    
    // Handle all other duration options
    setIsCustomDuration(false)
    setSelectedOption(option)
    
    // Calculate new pause end time based on option
    const now = new Date()
    let newEndTime: Date | null = null
    
    // Handle 'Forever' option specially
    if (option === 'Forever') {
      // Set far future date (essentially forever)
      const farFuture = new Date()
      farFuture.setFullYear(farFuture.getFullYear() + 100) // 100 years in the future
      newEndTime = farFuture
    } else {
      // For all other options, calculate duration
      let minutes = 0
      
      // Parse the option to get minutes
      if (option.includes('minute')) {
        minutes = parseInt(option.split(' ')[0])
      } else if (option.includes('hour')) {
        minutes = parseInt(option.split(' ')[0]) * 60
      } else if (option.includes('day')) {
        minutes = parseInt(option.split(' ')[0]) * 24 * 60
      }
      
      // Calculate new end time
      if (minutes > 0) {
        newEndTime = new Date(now.getTime() + minutes * 60 * 1000)
      }
    }
    
    // Update pause end time
    setPauseEndTime(newEndTime)
    
    // Update contact with new pause details
    if (contact) {
      const updatedContact = {
        ...contact,
        status: 'Paused' as const,
        pauseDuration: option,
        pauseEndTime: newEndTime,
        isPausedForever: option === 'Forever'
      }
      
      // Update local state
      setContact(updatedContact)
      
      // Update parent component
      onContactUpdate(updatedContact)
    }
    
    // Close dropdown
    setIsDropdownOpen(false)
  }
  
  // Handle main action button click (pause/resume/approve)
  const handleMainActionClick = () => {
    if (contact) {
      // Handle Resume (when currently paused)
      if (contact.status === 'Paused') {
        // Resume automation
        const updatedContact = {
          ...contact,
          status: 'Subscribed' as const,
          pauseDuration: null,
          pauseEndTime: null,
          isPausedForever: false
        }
        
        // Update local state
        setContact(updatedContact)
        setSelectedOption(null)
        setPauseEndTime(null)
        setTimeRemaining('00:00:00')
        setIsCustomDuration(false)
        setCustomDuration('')
        
        // Update parent component
        onContactUpdate(updatedContact)
      } 
      // Handle Pause (when currently subscribed)
      else if (contact.status === 'Subscribed') {
        // Open dropdown to select pause duration
        toggleDropdown()
      } 
      // Handle Approve (when currently reported)
      else if (contact.status === 'Report') {
        // Set to subscribed
        const updatedContact = {
          ...contact,
          status: 'Subscribed' as const
        }
        
        // Update local state
        setContact(updatedContact)
        
        // Update parent component
        onContactUpdate(updatedContact)
      }
    }
  }
  
  // Handle report button click
  const handleReportClick = () => {
    if (contact) {
      const updatedContact = {
        ...contact,
        status: 'Report' as const
      }
      
      // Update local state
      setContact(updatedContact)
      
      // Update parent component
      onContactUpdate(updatedContact)
    }
  }

  // Get the button text based on current selection
  const getButtonText = () => {
    // First check the actual contact status from props before local state
    // This ensures we always reflect the most current status
    if (contact.status === 'Subscribed') {
      return 'Pause subscription'
    }
    
    // If paused forever, show that text
    if (contact.status === 'Paused' && contact.isPausedForever) {
      return 'Paused forever'
    }
    
    // If we have a time remaining from a pause duration, show it
    if (timeRemaining && timeRemaining !== '00:00:00' && (selectedOption || contact.pauseDuration)) {
      return `Paused: ${timeRemaining}`
    }
    
    return contact.status === 'Paused' ? 'Resume subscription' : 'Approve Contact'
  }
  
  // Format end time to show when automations will resume
  const getFormattedEndTime = () => {
    // If paused forever, show special message
    if (contact.isPausedForever) {
      return 'Automations paused indefinitely'
    }
    
    if (!pauseEndTime) return ''
    
    const now = new Date()
    const diff = pauseEndTime.getTime() - now.getTime()
    
    // If pause has already ended
    if (diff <= 0) {
      return 'Automations active'
    }
    
    // Show relative time for short durations
    if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
      const hours = pauseEndTime.getHours()
      const minutes = pauseEndTime.getMinutes()
      return `Resumes at ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    // Show date for longer durations
    const month = pauseEndTime.toLocaleString('default', { month: 'short' })
    const day = pauseEndTime.getDate()
    const time = pauseEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `Resumes on ${month} ${day} at ${time}`
  }

  // Get status details based on contact status
  const getStatusDetails = () => {
    switch(contact.status) {
      case 'Subscribed':
        return {
          icon: <Check className="text-green-500 w-4 h-4" />,
          label: 'Subscribed',
          color: 'text-green-600',
          bg: 'bg-green-50',
          actionIcon: <Pause className="w-4 h-4 mr-2" />,
          actionText: 'Pause subscription',
          actionColor: 'bg-amber-50 text-amber-700 hover:bg-amber-100'
        }
      case 'Paused':
        return {
          icon: <Pause className="text-amber-500 w-4 h-4" />,
          label: 'Paused',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          actionIcon: <Play className="w-4 h-4 mr-2" />,
          actionText: 'Resume subscription',
          actionColor: 'bg-green-50 text-green-700 hover:bg-green-100'
        }
      case 'Report':
        return {
          icon: <Flag className="text-red-500 w-4 h-4" />,
          label: 'Report',
          color: 'text-red-600',
          bg: 'bg-red-50',
          actionIcon: <Check className="w-4 h-4 mr-2" />,
          actionText: 'Approve Contact',
          actionColor: 'bg-green-50 text-green-700 hover:bg-green-100'
        }
      default:
        return {
          icon: <Check className="text-green-500 w-4 h-4" />,
          label: 'Unknown',
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          actionIcon: <Check className="w-4 h-4 mr-2" />,
          actionText: 'Subscribe',
          actionColor: 'bg-green-50 text-green-700 hover:bg-green-100'
        }
    }
  }
  
  const statusDetails = getStatusDetails()

  /**
   * Get avatar source with flexibility for Instagram profile pic integration
   * Uses real Instagram profile images if available, falls back to initials
   */
  const getAvatarSource = (contact: Contact): { src: string; fallbackColor: string } => {
    // Generate a deterministic color based on the contact name
    const generateDeterministicColor = (name: string): string => {
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      // Generate a pastel color (lighter and more pleasant for UI)
      const h = hash % 360
      return `hsl(${h}, 70%, 80%)`
    }

    // Use Instagram profile picture URL if available
    if (contact.profilePictureUrl) {
      // Check if it's a valid URL
      if (contact.profilePictureUrl.startsWith('http')) {
        // Use our proxy endpoint to avoid CORS issues with Instagram's CDN
        const proxyUrl = `/api/proxy/instagram-image?url=${encodeURIComponent(contact.profilePictureUrl)}`
        return {
          src: proxyUrl,
          fallbackColor: generateDeterministicColor(contact.name)
        }
      }
      
      // If somehow we have an invalid URL, use the default
      return {
        src: 'https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png',
        fallbackColor: generateDeterministicColor(contact.name)
      }
    }
    
    // Legacy field for backwards compatibility
    if (contact.instagramProfilePic) {
      // Also proxy the legacy field
      const proxyUrl = `/api/proxy/instagram-image?url=${encodeURIComponent(contact.instagramProfilePic)}`
      return {
        src: proxyUrl,
        fallbackColor: generateDeterministicColor(contact.name)
      }
    }
    
    // Fallback to DiceBear API for mock avatars
    return {
      src: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(contact.name)}`,
      fallbackColor: generateDeterministicColor(contact.name)
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
    >
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <DialogPortal>
        <DialogOverlay className="contact-modal-overlay" />
        <DialogContent 
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-[440px] max-w-[95vw] overflow-hidden"
        >
          {/* Modal content */}
          <div className="relative">
            {/* Close button */}
            <button 
              onClick={onClose} 
              className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Contact info */}
            <div className="flex flex-col">
              <div className="flex flex-col items-center p-6">
                {/* Avatar */}
                <Avatar 
                  className="w-44 h-44 rounded-md mb-4"
                  style={{ backgroundColor: getAvatarSource(contact).fallbackColor }}
                >
                  <AvatarImage 
                    src={getAvatarSource(contact).src} 
                    alt={contact.name} 
                    className="object-cover rounded-md"
                  />
                  <AvatarFallback className="text-7xl font-bold text-white rounded-md">
                    {contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1 font-mona">{contact.name}</h1>
                
                <div className="flex items-center gap-1 text-green-600 mb-2">
                  {statusDetails.icon}
                  <span className="font-mona">{statusDetails.label}</span>
                </div>
                
                {/* Pause status indicator */}
                {contact.status === 'Paused' && (
                  <div className="flex flex-col items-center mb-2">
                    <div className="flex items-center gap-1.5 text-amber-600 text-sm mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mona">Automations paused temporarily</span>
                    </div>
                    {pauseEndTime && (
                      <div className="text-xs text-gray-500 font-mona">
                        {getFormattedEndTime()}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-mona">{contact.username ? `@${contact.username}` : '—'}</span>
                </div>
                
                <div className="flex items-center mb-6 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-mona">Joined February 15, 2025</span>
                </div>
                
                <div className="flex flex-col w-full space-y-3">
                  {/* Primary action button with dropdown */}
                  <div className="relative w-full" ref={dropdownRef}>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full flex items-center justify-center py-5",
                        // If we have a selected option, use amber color
                        selectedOption || (contact.status === 'Paused' && contact.pauseDuration)
                          ? "text-amber-600 hover:text-amber-700 border-amber-200 bg-amber-50"
                          : contact.status === 'Subscribed'
                            ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                            : contact.status === 'Paused'
                              ? "text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                              : contact.status === 'Report'
                                ? "text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                                : "text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                      )}
                      onClick={handleMainActionClick}
                    >
                      <div className="flex items-center gap-1.5">
                        {contact.status === 'Subscribed' ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : contact.status === 'Paused' ? (
                          timeRemaining && timeRemaining !== '00:00:00' && (selectedOption || contact.pauseDuration) ? (
                            <Clock className="h-4 w-4 mr-2" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )
                        ) : (selectedOption) ? (
                          <Clock className="h-4 w-4 mr-2" />
                        ) : (
                          statusDetails.actionIcon
                        )}
                        <span>{getButtonText()}</span>
                      </div>
                    </Button>
                    
                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                      <div 
                        className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden"
                        style={{ 
                          maxHeight: isCustomDuration ? '420px' : selectedOption ? '360px' : '280px',
                          animation: 'fadeIn 0.2s ease-in-out',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        {/* Header */}
                        <div className="px-3 py-1.5 border-b border-gray-200 font-semibold text-xs text-gray-800 bg-gray-50 sticky top-0 z-10">
                          {selectedOption ? 'Edit duration' : 'Set duration'}
                        </div>
                        
                        {/* Options */}
                        <div className="bg-white py-0.5 overflow-y-auto">
                          {/* Resume button (only when paused) */}
                          {(contact.status === 'Paused' || selectedOption) && (
                            <div 
                              className="flex flex-col px-3 py-2 text-xs cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                              onClick={() => {
                                // Create updated contact with Subscribed status
                                const updatedContact = {
                                  ...contact,
                                  status: 'Subscribed' as const,
                                  pauseDuration: null,
                                  pauseEndTime: null
                                }
                                
                                // Update local state immediately
                                setContact(updatedContact)
                                setSelectedOption(null)
                                setPauseEndTime(null)
                                setTimeRemaining('00:00:00')
                                setIsCustomDuration(false)
                                setCustomDuration('')
                                
                                // Close dropdown
                                setIsDropdownOpen(false)
                                
                                // Update parent component
                                onContactUpdate(updatedContact)
                              }}
                            >
                              <div className="flex items-center">
                                <Play className="h-3 w-3 mr-2 text-green-600" />
                                <span className="text-green-600 font-medium">Resume automation</span>
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5 ml-5">
                                Contact will start receiving messages again
                              </div>
                            </div>
                          )}
                          
                          {/* Duration options (only when not Reported) */}
                          {[
                            '30 minutes',
                            '1 hour',
                            '3 hours',
                            '6 hours',
                            '12 hours',
                            '1 day',
                            'Forever',
                            'custom'
                          ].map((option) => (
                            <div
                              key={option}
                              className={cn(
                                "flex items-center px-3 py-1.5 text-xs cursor-pointer border-b border-gray-100",
                                selectedOption === option && !isCustomDuration
                                  ? "bg-blue-50 text-blue-600 font-medium" 
                                  : option === 'custom' && isCustomDuration
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-800 hover:bg-gray-50"
                              )}
                              onClick={() => handleOptionClick(option)}
                            >
                              <Clock className={cn(
                                "h-3 w-3 mr-2",
                                (selectedOption === option && !isCustomDuration) || (option === 'custom' && isCustomDuration)
                                  ? "text-blue-500" 
                                  : "text-gray-500"
                              )} />
                              <span className="flex-1">{option === 'custom' ? 'Custom duration' : option}</span>
                              {selectedOption === option && !isCustomDuration && (
                                <Check className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          ))}
                          
                          {/* Custom duration input */}
                          {isCustomDuration && (
                            <div className="flex flex-col px-3 py-3 text-xs border-b border-gray-100 bg-blue-50">
                              <div className="flex items-center mb-2">
                                <Clock className="h-3 w-3 mr-2 text-blue-500" />
                                <span className="text-blue-600 font-medium">Enter custom duration</span>
                              </div>
                              <div className="ml-5 flex flex-col">
                                <div className="flex items-center mb-3">
                                  <input
                                    type="text"
                                    value={customDuration}
                                    onChange={handleCustomDurationChange}
                                    placeholder="Enter minutes"
                                    className="w-24 px-2 py-1.5 text-xs border border-blue-300 rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800"
                                    autoFocus
                                  />
                                  <span className="text-blue-600">minutes</span>
                                </div>
                                <div className="flex items-center">
                                  <button
                                    onClick={() => setIsCustomDuration(false)}
                                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded mr-2 hover:bg-gray-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleCustomDurationSubmit}
                                    className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                    disabled={!customDuration || parseInt(customDuration) <= 0}
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Only show Report button if contact is not already reported */}
                  {contact.status !== 'Report' && (
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center py-5 text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                      onClick={handleReportClick}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report account
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}