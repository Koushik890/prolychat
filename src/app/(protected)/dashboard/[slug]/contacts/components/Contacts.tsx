'use client'

import { useState, useMemo } from 'react'
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
import { Check, ChevronDown, ChevronLeft, ChevronRight, Filter, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContactModal } from './ContactModal'

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

interface Contact {
  id: string
  avatar: string
  instagramProfilePic?: string // For future real Instagram profile images
  name: string
  status: 'Subscribed' | 'Unsubscribed'
  subscribed: string
}

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
 * Get avatar source with flexibility for future Instagram profile pic integration
 * Currently uses mock data from DiceBear API
 * Will be able to switch to real Instagram profile pics when backend integration is ready
 */
const getAvatarSource = (contact: Contact): { src: string; fallbackColor: string } => {
  // For future integration: if Instagram profile pic becomes available, use it
  if (contact.instagramProfilePic) {
    return {
      src: contact.instagramProfilePic,
      fallbackColor: generateDeterministicColor(contact.name)
    }
  }
  
  // For now, use DiceBear API for mock avatars
  return {
    src: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(contact.name)}`,
    fallbackColor: generateDeterministicColor(contact.name)
  }
}

// Sample data for demonstration
const contacts: Contact[] = [
  {
    id: '1',
    avatar: '',  // This field is kept for backward compatibility
    name: '__techidentity__',
    status: 'Subscribed',
    subscribed: '11 minutes ago'
  },
  {
    id: '2',
    avatar: '',
    name: 'alex_morgan',
    status: 'Subscribed',
    subscribed: '3 hours ago'
  },
  {
    id: '3',
    avatar: '',
    name: 'sarah_developer',
    status: 'Unsubscribed',
    subscribed: '2 days ago'
  },
  {
    id: '4',
    avatar: '',
    name: 'john_doe',
    status: 'Subscribed',
    subscribed: '1 week ago'
  },
  {
    id: '5',
    avatar: '',
    name: 'emily_smith',
    status: 'Subscribed',
    subscribed: '3 days ago'
  },
  {
    id: '6',
    avatar: '',
    name: 'michael_johnson',
    status: 'Unsubscribed',
    subscribed: '1 month ago'
  },
  {
    id: '7',
    avatar: '',
    name: 'david_wilson',
    status: 'Subscribed',
    subscribed: '2 weeks ago'
  },
  {
    id: '8',
    avatar: '',
    name: 'jessica_brown',
    status: 'Subscribed',
    subscribed: '4 days ago'
  },
  {
    id: '9',
    avatar: '',
    name: 'robert_taylor',
    status: 'Unsubscribed',
    subscribed: '5 days ago'
  },
  {
    id: '10',
    avatar: '',
    name: 'lisa_anderson',
    status: 'Subscribed',
    subscribed: '6 hours ago'
  },
  {
    id: '11',
    avatar: '',
    name: 'james_white',
    status: 'Subscribed',
    subscribed: '7 days ago'
  },
  {
    id: '12',
    avatar: '',
    name: 'olivia_martin',
    status: 'Unsubscribed',
    subscribed: '2 months ago'
  },
  {
    id: '13',
    avatar: '',
    name: 'william_thompson',
    status: 'Subscribed',
    subscribed: '8 hours ago'
  },
  {
    id: '14',
    avatar: '',
    name: 'sophia_clark',
    status: 'Subscribed',
    subscribed: '9 days ago'
  },
  {
    id: '15',
    avatar: '',
    name: 'daniel_lewis',
    status: 'Unsubscribed',
    subscribed: '10 days ago'
  },
  {
    id: '16',
    avatar: '',
    name: 'ava_walker',
    status: 'Subscribed',
    subscribed: '11 days ago'
  },
  {
    id: '17',
    avatar: '',
    name: 'joseph_hall',
    status: 'Subscribed',
    subscribed: '12 hours ago'
  },
  {
    id: '18',
    avatar: '',
    name: 'mia_young',
    status: 'Unsubscribed',
    subscribed: '13 days ago'
  }
]

export function Contacts() {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const itemsPerPage = 6

  // Filter contacts based on search and status
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.status.toLowerCase().includes(searchValue.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'subscribed' && contact.status === 'Subscribed') ||
        (statusFilter === 'unsubscribed' && contact.status === 'Unsubscribed')
      
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

  return (
    <div className="space-y-4 overflow-visible">
      {/* Add the keyframe animation styles to the component */}
      <style dangerouslySetInnerHTML={{ __html: paginationButtonAnimationStyles }} />
      
      {/* Add the table border radius styles */}
      <style dangerouslySetInnerHTML={{ __html: tableStyles }} />
      
      {/* Controls outside of the table, as a separate component */}
      <div className="flex items-center justify-between p-2 overflow-visible">
        <div className="flex items-center gap-x-2">
          <div className="w-full sm:w-[320px]">
            <SearchInput
              placeholder="Search contacts..."
              value={searchValue}
              onChange={setSearchValue}
              className="h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/30"
              onVoiceSearch={handleVoiceSearch}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm flex items-center gap-x-1.5"
              >
                <Filter className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <span>Filter</span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-500/80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[140px] p-1.5 bg-white backdrop-blur-xl border border-gray-200 shadow-[0_0.75rem_1.5rem_rgba(0,0,0,0.1)] rounded-lg"
            >
              <DropdownMenuItem
                onClick={() => setStatusFilter('all')}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors",
                  statusFilter === 'all' && "bg-gray-100 text-gray-900"
                )}
              >
                <span className="truncate">All</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('subscribed')}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors",
                  statusFilter === 'subscribed' && "bg-gray-100 text-gray-900"
                )}
              >
                <span className="truncate">Subscribed</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('unsubscribed')}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors",
                  statusFilter === 'unsubscribed' && "bg-gray-100 text-gray-900"
                )}
              >
                <span className="truncate">Unsubscribed</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Table as a completely separate component */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative z-10 overflow-hidden contacts-table-container">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentContacts.map((contact) => {
                const { src, fallbackColor } = getAvatarSource(contact)
                return (
                  <TableRow 
                    key={contact.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleContactClick(contact)}
                  >
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={src} alt={contact.name} />
                        <AvatarFallback 
                          style={{ backgroundColor: fallbackColor }}
                        >
                          {contact.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {contact.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contact.status === 'Subscribed' 
                            ? 'success' 
                            : 'destructive' 
                        }
                        className={
                          contact.status === 'Subscribed'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }
                      >
                        {contact.status === 'Subscribed' && (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        )}
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {contact.subscribed}
                    </TableCell>
                  </TableRow>
                )
              })}
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

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        contact={selectedContact} 
      />
    </div>
  )
}
