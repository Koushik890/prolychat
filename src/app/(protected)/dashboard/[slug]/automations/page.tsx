'use client'

import React from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Plus, 
  Calendar, ArrowUpDown, ArrowDownUp, CalendarDays, MoreVertical, Copy, Pencil, Trash2, LoaderCircle, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import LoaderOne from '@/components/ui/loader-one'
import { SearchInput } from '@/components/ui/search-input'
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCreateAutomation } from '@/hooks/use-automations'
import { getAllAutomations, activateAutomation, updateAutomationName, deleteAutomation } from '@/actions/automations'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import CreateAutomation from '@/components/global/create-automation'

interface AutomationData {
  id: string
  name: string
  active: boolean
  createdAt: string | Date
  updatedAt?: string | Date
  userId: string | null
  listener: {
    id: string
    listener: 'OMNIAI' | 'MESSAGE'
    automationId: string
    prompt: string
    commentReply: string | null
    dmCount: number
    commentCount: number
  } | null
  keywords: Array<{
    id: string
    automationId: string | null
    word: string
  }>
}

interface GetAutomationsResponse {
  status: number
  data: AutomationData[]
}

interface CreateAutomationResponse {
  status: number
  data: string
  res: {
    id: string
  }
}

interface Automation {
  id: string
  name: string
  runs: number
  status: 'Live' | 'Draft'
  lastPublished: string
  active: boolean
}

interface SortConfig {
  key: keyof Automation
  direction: 'asc' | 'desc'
}

function getStatusVariant(status: string): 'success' | 'warning' {
  switch (status) {
    case 'Live':
      return 'success'
    case 'Draft':
      return 'warning'
    default:
      return 'warning'
  }
}

function transformAutomation(data: any): Automation {
  return {
    id: data.id,
    name: data.name,
    runs: data.listener ? data.listener.dmCount + data.listener.commentCount : 0,
    status: data.active ? 'Live' : 'Draft',
    lastPublished: new Date(data.updatedAt || data.createdAt).toLocaleDateString(),
    active: data.active
  }
}

export default function AutomationsPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [searchValue, setSearchValue] = React.useState('')
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'lastPublished', direction: 'desc' })
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(3)
  const [automations, setAutomations] = React.useState<Automation[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isNavigating, setIsNavigating] = React.useState(false)
  const { isPending: isCreating, mutate: createAutomation } = useCreateAutomation()

  // Fetch automations
  const fetchAutomations = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const rawResponse = await getAllAutomations()
      const response = rawResponse as unknown as GetAutomationsResponse
      if (response.status === 200) {
        setAutomations(response.data.map(transformAutomation))
      } else {
        toast.error('Failed to load automations')
      }
    } catch (error) {
      toast.error('Error loading automations')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAutomations()
  }, [fetchAutomations])

  // Handle automation creation
  const handleCreateAutomation = async () => {
    try {
      setIsNavigating(true) // Start our custom loading state
      createAutomation({ id: undefined }, {
        onSuccess: async (data: any) => {
          // Check if we have a valid automation ID
          const automationId = data?.res?.id;
          if (!automationId) {
            setIsNavigating(false) // Clear loading state on error
            toast.error('Failed to create automation: No automation ID received');
            return;
          }

          try {
            // Navigate to the automation workflow page
            await router.push(`/dashboard/${params.slug}/automations/${automationId}`);
            
            // Update local state only after successful navigation
            setAutomations(prev => [
              {
                id: automationId,
                name: 'Untitled',
                runs: 0,
                status: 'Draft',
                lastPublished: 'Never',
                active: false
              },
              ...prev
            ]);
          } catch (error) {
            setIsNavigating(false) // Clear loading state on error
            console.error('Error during navigation:', error);
            toast.error('Failed to navigate to the new automation');
          }
        },
        onError: (error: any) => {
          setIsNavigating(false) // Clear loading state on error
          console.error('Error creating automation:', error);
          toast.error('Failed to create automation: ' + (error.message || 'Network or server error'));
        }
      });
    } catch (error) {
      setIsNavigating(false) // Clear loading state on error
      console.error('Error in create automation handler:', error);
      toast.error('Failed to create automation: Unexpected error');
    }
  };

  // Handle automation activation
  const handleActivation = async (id: string, currentState: boolean) => {
    try {
      const result = await activateAutomation(id, !currentState)
      if (result.status === 200) {
        toast.success(result.data)
        fetchAutomations()
      } else {
        toast.error(result.data)
      }
    } catch (error) {
      toast.error('Error updating automation status')
    }
  }

  // Handle automation rename
  const handleRename = async (id: string, newName: string) => {
    try {
      const result = await updateAutomationName(id, { name: newName })
      if (result.status === 200) {
        toast.success('Automation renamed successfully')
        fetchAutomations()
      } else {
        toast.error(result.data)
      }
    } catch (error) {
      toast.error('Error renaming automation')
    }
  }

  // Handle automation deletion
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteAutomation(id)
      if (result.status === 200) {
        toast.success(result.data)
        // Remove the deleted automation from the state
        setAutomations(prev => prev.filter(automation => automation.id !== id))
      } else {
        toast.error(result.data)
      }
    } catch (error) {
      console.error('Error deleting automation:', error)
      toast.error('Failed to delete automation')
    }
  }

  // Filter automations based on search
  const filteredAutomations = React.useMemo(() => {
    return automations.filter(automation =>
      automation.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      automation.status.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [automations, searchValue])

  // Sort automations
  const sortedAutomations = React.useMemo(() => {
    const sorted = [...filteredAutomations].sort((a, b) => {
      if (sortConfig.key === 'runs') {
        return sortConfig.direction === 'asc' ? a.runs - b.runs : b.runs - a.runs
      }
      
      const aValue = String(a[sortConfig.key])
      const bValue = String(b[sortConfig.key])
      
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    })
    return sorted
  }, [filteredAutomations, sortConfig])

  // Paginate automations
  const paginatedAutomations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAutomations.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAutomations, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedAutomations.length / itemsPerPage)

  const handleSort = (key: keyof Automation) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleVoiceSearch = () => {
    // This would be implemented with a voice recognition API
    console.log('Voice search clicked')
  }

  return (
    <div className="w-full pt-[49px]">
      <div className="flex-none px-6 py-6 relative">
        {(isCreating || isNavigating) && (
          <div className="fixed top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <LoaderOne />
              <p className="text-gray-400 font-medium">Creating automation...</p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-full sm:w-[320px]">
              <SearchInput
                placeholder="Search automations..."
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
                  className="h-10 px-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm min-w-[120px]"
                >
                  <span>Sort by</span>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-500/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[140px] p-1.5 bg-white backdrop-blur-xl border border-gray-200 shadow-[0_0.75rem_1.5rem_rgba(0,0,0,0.1)] rounded-lg"
              >
                <DropdownMenuItem
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                  <span className="truncate">Name</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort('lastPublished')}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <CalendarDays className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                  <span className="truncate">Last Published</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort('runs')}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <LoaderCircle className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                  <span className="truncate">Number of Runs</span>
                </DropdownMenuItem>
                <div className="h-px my-1.5 bg-gray-100" />
                <DropdownMenuItem
                  onClick={() => setSortConfig(c => ({ ...c, direction: 'asc' }))}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                  <span className="truncate">Ascending</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortConfig(c => ({ ...c, direction: 'desc' }))}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                >
                  <ArrowDownUp className="h-4 w-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                  <span className="truncate">Descending</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CreateAutomation 
            onClick={handleCreateAutomation}
            disabled={isCreating || isNavigating}
            className="shadow-lg"
          />
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {selectedRows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 px-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm min-w-[120px]"
                  >
                    <span>Bulk Actions</span>
                    <ChevronDown className="ml-2 h-4 w-4 text-gray-500/80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[140px] p-1.5 bg-white backdrop-blur-xl border border-gray-200 shadow-[0_0.75rem_1.5rem_rgba(0,0,0,0.1)] rounded-lg"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      // Handle duplicate action
                      selectedRows.forEach(async (id) => {
                        await createAutomation(id)
                      })
                      setSelectedRows([])
                      toast.success('Automations duplicated successfully')
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                  >
                    <Copy className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        // Create an array of promises for all delete operations
                        const deletePromises = selectedRows.map(async (id) => {
                          const response = await deleteAutomation(id);
                          if (response.status !== 200) {
                            throw new Error(`Failed to delete automation ${id}: ${response.data}`);
                          }
                          return response;
                        });

                        // Wait for all deletions to complete
                        const results = await Promise.allSettled(deletePromises);

                        // Count successful and failed operations
                        const successful = results.filter(r => r.status === 'fulfilled').length;
                        const failed = results.filter(r => r.status === 'rejected').length;

                        // Clear selection
                        setSelectedRows([]);

                        // Show appropriate toast message
                        if (failed === 0) {
                          toast.success(`Successfully deleted ${successful} automation${successful !== 1 ? 's' : ''}`);
                        } else if (successful === 0) {
                          toast.error('Failed to delete automations');
                        } else {
                          toast.warning(`Deleted ${successful} automation${successful !== 1 ? 's' : ''}, but ${failed} failed`);
                        }

                        // Refresh the automations list
                        const response = await getAllAutomations();
                        if (response.status === 200) {
                          setAutomations(response.data.map(transformAutomation));
                        }
                      } catch (error) {
                        console.error('Error in bulk delete:', error);
                        toast.error('Failed to delete automations');
                      }
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-red-500 hover:text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600 rounded-md cursor-pointer mt-1 border-t border-gray-200 transition-colors"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {selectedRows.length > 0 && (
              <span className="text-sm text-gray-600">
                Selected Automations: {selectedRows.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Table */}
      <div className="flex-1 px-6 min-h-0 overflow-y-auto">
        <div className="rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl shadow-[0_0_2rem_rgba(0,0,0,0.04)] overflow-hidden ring-1 ring-black/[0.05]">
        <Table>
          <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-300 bg-gradient-to-b from-gray-50/90 via-gray-50/50 to-transparent">
                <TableHead className="w-[60px] text-center">
                <Checkbox 
                  checked={selectedRows.length === paginatedAutomations.length} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(paginatedAutomations.map(a => a.id))
                    } else {
                      setSelectedRows([])
                    }
                  }}
                    aria-label="Select all"
                    className="border-gray-300 data-[state=checked]:bg-primary/90 data-[state=checked]:border-primary/30"
                />
              </TableHead>
                <TableHead className="w-[250px] pl-4 font-medium text-gray-700">Name</TableHead>
                <TableHead className="w-[120px] pl-8 font-medium text-gray-700">Status</TableHead>
                <TableHead className="w-[120px] text-right pl-8 pr-8 font-medium text-gray-700">Runs</TableHead>
                <TableHead className="w-[180px] pl-8 font-medium text-gray-700">Modified</TableHead>
                <TableHead className="w-[80px] pl-8"></TableHead>
            </TableRow>
          </TableHeader>
            <TableBody className="divide-y divide-gray-300 [&_tr:hover]:bg-gray-50/50">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary/60" />
                  </TableCell>
                </TableRow>
              ) : paginatedAutomations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-b from-gray-50 to-white shadow-sm border border-gray-200 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-gray-400 transition-transform group-hover:scale-110 duration-200" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm text-gray-500/90">No automations found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAutomations.map((automation) => (
              <TableRow 
                    key={automation.id} 
                    className="group hover:bg-gradient-to-r hover:from-gray-50/90 hover:via-gray-50/50 hover:to-transparent cursor-pointer transition-all duration-200 even:bg-gray-50/30"
                    onClick={() => router.push(`/dashboard/${params.slug}/automations/${automation.id}`)}
                  >
                    <TableCell className="text-center relative" onClick={(e) => e.stopPropagation()}>
                      <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-gray-300/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Checkbox 
                        checked={selectedRows.includes(automation.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                            setSelectedRows([...selectedRows, automation.id])
                      } else {
                            setSelectedRows(selectedRows.filter(id => id !== automation.id))
                      }
                    }}
                        aria-label={`Select ${automation.name}`}
                        className="border-gray-300 data-[state=checked]:bg-primary/90 data-[state=checked]:border-primary/30"
                  />
                </TableCell>
                    <TableCell className="font-medium pl-4 text-gray-900">{automation.name}</TableCell>
                    <TableCell className="pl-8">
                  <Badge 
                        variant={getStatusVariant(automation.status)}
                    className={cn(
                          "px-3 py-0.5 text-xs font-medium transition-all duration-200 shadow-[0_0_0.75rem_rgba(0,0,0,0.08)]",
                          automation.status === 'Live' && "bg-green-50 text-green-700 group-hover:bg-green-50 border-green-200 group-hover:border-green-300 group-hover:shadow-[0_0_1rem_rgba(0,200,0,0.15)]",
                          automation.status === 'Draft' && "bg-yellow-50 text-yellow-700 group-hover:bg-yellow-50 border-yellow-200 group-hover:border-yellow-300 group-hover:shadow-[0_0_1rem_rgba(200,150,0,0.15)]"
                        )}
                      >
                        {automation.status}
                  </Badge>
                </TableCell>
                    <TableCell className="text-right pl-8 pr-8 text-gray-600 tabular-nums font-medium">{automation.runs}</TableCell>
                    <TableCell className="pl-8 text-gray-500">{automation.lastPublished}</TableCell>
                    <TableCell className="pl-8 relative" onClick={(e) => e.stopPropagation()}>
                      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-gray-300/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400/80 hover:text-gray-600 group-hover:text-gray-900 transition-all duration-200 hover:bg-gray-100"
                      >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                          className="w-[160px] p-1.5 bg-white backdrop-blur-xl border border-gray-200 shadow-[0_0.75rem_1.5rem_rgba(0,0,0,0.1)] rounded-lg"
                    >
                      <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/${params.slug}/automations/${automation.id}`)}
                            className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                          >
                            <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                            <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                            onClick={() => handleActivation(automation.id, automation.active)}
                            className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors"
                          >
                            <Copy className="mr-2 h-4 w-4 text-gray-500" />
                            <span>Set to {automation.active ? 'Draft' : 'Live'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                            onClick={() => handleDelete(automation.id)}
                            className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-red-500 hover:text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600 rounded-md cursor-pointer mt-1 border-t border-gray-200 transition-colors"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
        {!isLoading && paginatedAutomations.length > 0 && (
          <div className="py-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedAutomations.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedAutomations.length)} of{' '}
            {sortedAutomations.length} results
          </p>
          <div className="relative h-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-8 w-[160px] px-3 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 gap-1.5 focus-visible:ring-1 focus-visible:ring-primary/30"
                  aria-label="Items per page"
                >
                  <span className="text-sm font-medium text-gray-900">{itemsPerPage}</span>
                  <div className="w-px h-4 mx-1.5 bg-gray-200" />
                  <span className="text-sm">per page</span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-gray-500/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                alignOffset={0}
                sideOffset={4}
                className="w-[160px] p-1.5 bg-white border border-gray-200 shadow-sm rounded-lg"
              >
                {[3, 5, 10, 20].map((value) => (
                  <DropdownMenuItem 
                    key={value}
                    className={cn(
                      "flex items-center justify-between gap-2.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 data-[highlighted]:bg-gray-100/80 data-[highlighted]:text-gray-900 rounded-md cursor-pointer transition-colors",
                      itemsPerPage === value && "bg-gray-100/80 text-gray-900"
                    )}
                    onClick={() => {
                      setItemsPerPage(value)
                      setCurrentPage(1)
                    }}
                  >
                    <span className="truncate">{value} per page</span>
                    {itemsPerPage === value && (
                      <div className="h-4 w-4 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
              <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
              </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 text-gray-600 hover:text-gray-900"
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
  )
}