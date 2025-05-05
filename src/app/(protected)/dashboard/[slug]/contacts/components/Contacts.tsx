'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { SearchInput } from '@/components/ui/search-input'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Filter, Mic, Pause, AlertTriangle, RefreshCw, Users, BellRing, PauseCircle, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContactModal } from './ContactModal'
import { Contact } from '@/types/contact'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip'

// Define keyframes for button animation - enhanced with stronger visual effects
// We'll add this to global.css or a specific CSS module file in a real app
// For now, adding it via style tag for demonstration
const paginationButtonAnimationStyles = `
@keyframes enhanced-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(124, 58, 237, 0.2);
    border-color: rgba(124, 58, 237, 0.5);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.6);
    border-color: rgba(124, 58, 237, 1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(124, 58, 237, 0.2);
    border-color: rgba(124, 58, 237, 0.5);
  }
}

.pagination-button-animated {
  animation: enhanced-pulse 1.5s ease-in-out infinite;
  position: relative;
  border-width: 2px;
  background: linear-gradient(145deg, #f8fafc, #ffffff);
}

.pagination-button-animated:hover {
  animation: none;
  transform: scale(1.2);
  background: white;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.8);
  border-color: rgba(124, 58, 237, 1);
  transition: all 0.3s ease;
}

.pagination-button-animated:disabled {
  animation: none;
  transform: none;
  box-shadow: none;
  border-color: rgba(209, 213, 219, 0.5);
  background: #f9fafb;
}

/* Custom scrollbar utilities */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
`

// Add custom styling for table border radius
const tableStyles = `
  .contacts-table-container {
    border-radius: 0.75rem;
    overflow: hidden;
  }
  
  .contacts-table-container thead tr:first-child th:first-child {
    border-top-left-radius: 0.75rem;
  }
  
  .contacts-table-container thead tr:first-child th:last-child {
    border-top-right-radius: 0.75rem;
  }
  
  .contacts-table-container tbody tr:last-child td:first-child {
    border-bottom-left-radius: 0.75rem;
  }
  
  .contacts-table-container tbody tr:last-child td:last-child {
    border-bottom-right-radius: 0.75rem;
  }
`

/**
 * Generate a deterministic color based on a string (name or ID)
 * Used for avatar fallback background colors
 */
const generateDeterministicColor = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generate a pastel color (lighter and more pleasant for UI)
  const h = hash % 360
  return `hsl(${h}, 70%, 80%)`
}

/**
 * Get avatar source with flexibility for Instagram profile pic integration
 * Uses real Instagram profile images if available, falls back to DiceBear API
 */
const getAvatarSource = (contact: Contact): { src: string; fallbackColor: string } => {
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

// Replace initialContacts with empty array
const initialContacts: Contact[] = []

export function Contacts() {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 6

  // Fetch contacts from API and set up automatic background refresh
  useEffect(() => {
    fetchContacts()
    
    // Set up polling to refresh contacts data every 5 seconds (reduced from 10 seconds)
    const pollingInterval = setInterval(() => {
      fetchContacts(true) // Pass true to indicate this is a background refresh
    }, 5000) // 5 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(pollingInterval)
  }, [])

  // Extract this function from the useEffect for reusability
  const fetchContacts = async (isBackgroundRefresh = false) => {
    try {
      // Only show loading state on initial load, not during refreshes
      if (!isBackgroundRefresh && contacts.length === 0) {
        setLoading(true)
      } else if (isBackgroundRefresh) {
        setRefreshing(true)
      }
      
      const response = await fetch('/api/contacts')
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error fetching contacts:', errorData)
        setError(`Error loading contacts: ${errorData.error || 'Unknown error'}`)
        return
      }
      
      const data = await response.json()
      
      if (data.contacts) {
        // Transform API data to match the component's expected format
        const formattedContacts = data.contacts.map((contact: any) => ({
          id: contact.id,
          avatar: '',
          name: contact.name,
          username: contact.username,
          profilePictureUrl: contact.profilePictureUrl,
          status: contact.status as 'Subscribed' | 'Paused' | 'Report',
          subscribed: formatTimeAgo(new Date(contact.subscribed)),
          pauseDuration: contact.pauseDuration,
          isPausedForever: contact.isPausedForever,
          pauseEndTime: contact.pauseEndTime ? new Date(contact.pauseEndTime) : null
        }))
        
        setContacts(formattedContacts)
        
        // Clear any previous error state
        if (error) {
          setError(null)
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      // Only set error if we don't have contacts to show
      if (contacts.length === 0) {
        setError('Failed to load contacts. Please try again later.')
      }
    } finally {
      // Make sure loading is set to false
      if (!isBackgroundRefresh) {
        setLoading(false)
      }
      // Always reset refreshing state
      setRefreshing(false)
    }
  }

  // Helper function to format time ago string
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
  }
  
  // Filter contacts based on search and status
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // First filter by search term
      const matchesSearch = contact.name.toLowerCase().includes(searchValue.toLowerCase())
      
      // Then filter by status
      const matchesStatus = 
        statusFilter === 'all' ? true : 
        statusFilter === 'subscribed' ? contact.status === 'Subscribed' : 
        statusFilter === 'paused' ? contact.status === 'Paused' :
        statusFilter === 'report' ? contact.status === 'Report' : false
      
      return matchesSearch && matchesStatus
    })
  }, [contacts, searchValue, statusFilter])
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage))
  }, [filteredContacts, itemsPerPage])
  
  // Get current page items
  const currentContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredContacts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredContacts, currentPage, itemsPerPage])

  const handleVoiceSearch = () => {
    // This would be implemented with a voice recognition API
    console.log('Voice search clicked')
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  // Handler for when a contact's status is updated
  const handleContactUpdate = async (updatedContact: Contact) => {
    try {
      // Update local state immediately for responsive UI
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === updatedContact.id ? updatedContact : contact
        )
      )
      
      // Call API to persist the change
      const response = await fetch(`/api/contacts/${updatedContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updatedContact.status,
          pauseDuration: updatedContact.pauseDuration,
          isPausedForever: updatedContact.isPausedForever,
          pauseEndTime: updatedContact.pauseEndTime,
        }),
      })
      
      if (!response.ok) {
        // If API call fails, revert the local state change
        console.error('Failed to update contact on server')
        
        // Refresh contacts from server to ensure UI is in sync - with background refresh flag
        fetchContacts(true)
      }
    } catch (error) {
      console.error('Error updating contact:', error)
      // Refresh contacts from server to ensure UI is in sync - with background refresh flag
      fetchContacts(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex-none relative">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between px-6 py-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-full sm:w-[320px]">
              <SearchInput
                placeholder="Search contacts..."
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/30"
                onVoiceSearch={handleVoiceSearch}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm w-[180px]"
                >
                  <span>Filter</span>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-500/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[180px] p-1.5 bg-white backdrop-blur-xl border border-gray-200 shadow-[0_0.75rem_1.5rem_rgba(0,0,0,0.1)] rounded-lg"
              >
                <DropdownMenuItem 
                  onClick={() => setStatusFilter('all')}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <div className="w-5 flex items-center">
                    {statusFilter === 'all' ? (
                      <Check className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    ) : (
                      <Users className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </div>
                  <span>All Contacts</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter('Subscribed')}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <div className="w-5 flex items-center">
                    {statusFilter === 'Subscribed' ? (
                      <Check className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    ) : (
                      <BellRing className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </div>
                  <span>Subscribed</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter('Paused')}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <div className="w-5 flex items-center">
                    {statusFilter === 'Paused' ? (
                      <Check className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    ) : (
                      <PauseCircle className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </div>
                  <span>Paused</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter('Report')}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <div className="w-5 flex items-center">
                    {statusFilter === 'Report' ? (
                      <Check className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </div>
                  <span>Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      
        {/* Add the keyframe animation styles to the component */}
        <style dangerouslySetInnerHTML={{ __html: paginationButtonAnimationStyles }} />
        
        {/* Add the table border radius styles */}
        <style dangerouslySetInnerHTML={{ __html: tableStyles }} />
        
        {/* Table as a completely separate component */}
        <div className="px-6 pb-6">
          {loading && contacts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative z-10 overflow-hidden contacts-table-container">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(3).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="py-3">
                          <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : error && contacts.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-red-500 p-4 rounded-md border border-red-200 bg-red-50 max-w-md">
                <h3 className="font-semibold mb-2">Error</h3>
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative z-10 overflow-hidden contacts-table-container">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentContacts.map((contact) => (
                      <TableRow 
                        key={contact.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleContactClick(contact)}
                      >
                        <TableCell className="py-3">
                          <Avatar className="h-9 w-9 bg-primary/10" style={{ backgroundColor: getAvatarSource(contact).fallbackColor }}>
                            <AvatarImage src={getAvatarSource(contact).src} alt={contact.name} className="object-cover" />
                            <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="py-3 text-gray-900 font-medium">
                          {contact.name}
                        </TableCell>
                        <TableCell className="py-3 text-gray-600">
                          {contact.username ? `@${contact.username}` : '—'}
                        </TableCell>
                        <TableCell className="py-3">
                          {contact.status === 'Subscribed' && (
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-1.5" strokeWidth={2} />
                              <span className="text-green-600 text-sm">Subscribed</span>
                            </div>
                          )}
                          {contact.status === 'Paused' && (
                            <div className="flex items-center">
                              <Pause className="h-4 w-4 text-amber-500 mr-1.5" strokeWidth={2} />
                              <span className="text-amber-600 text-sm">Paused</span>
                            </div>
                          )}
                          {contact.status === 'Report' && (
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-1.5" strokeWidth={2} />
                              <span className="text-red-600 text-sm">Report</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-gray-500">
                          {contact.subscribed}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "h-8 w-8 text-gray-600 hover:text-gray-900 bg-white border-gray-200 pagination-button-animated",
                      currentPage === 1 && "pointer-events-none opacity-50"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "h-8 w-8 text-gray-600 hover:text-gray-900 bg-white border-gray-200 pagination-button-animated",
                      currentPage === totalPages && "pointer-events-none opacity-50"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        contact={selectedContact}
        onContactUpdate={handleContactUpdate}
      />
    </div>
  )
}
