'use client';

import { z } from 'zod'
import {
  createAutomations,
  deleteKeyword,
  saveKeyword,
  saveListener,
  savePosts,
  saveTrigger,
  removeTrigger,
  updateAutomationName,
} from '@/actions/automations'
import { useMutationData } from './use-mutation-data'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import useZodForm from './use-zod-form'
import { AppDispatch, useAppSelector } from '@/redux/store'
import { useDispatch } from 'react-redux'
import { TRIGGER } from '@/redux/slices/automation'
import { useQueryClient } from '@tanstack/react-query'
import { useQueryUser, useQueryAutomation } from './user-queries'
import { SUBSCRIPTION_PLAN } from '@prisma/client'
import { toast } from 'sonner'

export const useCreateAutomation = (id?: string) => {
  const { isPending, mutate } = useMutationData(
    ['create-automation'],
    async (variables: { id?: string }) => {
      try {
        const result = await createAutomations(variables.id);
        if (!result) {
          throw new Error('No response from server');
        }
        
        if (result.status !== 200) {
          throw new Error(result.data || 'Failed to create automation');
        }
        
        // Get the created automation from the response
        const automation = result.res;
        if (!automation?.id) {
          throw new Error('No automation ID in response');
        }

        return {
          status: 200,
          data: 'Automation created successfully',
          res: {
            id: automation.id,
            name: automation.name || 'Untitled',
            status: 'DRAFT',
            active: false,
            updatedAt: new Date(),
            config: null
          }
        };
      } catch (error) {
        console.error('Error creating automation:', error);
        throw error;
      }
    },
    'user-automations'
  );

  return { isPending, mutate };
};

export const useEditAutomation = (automationId: string) => {
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isUpdatingRef = useRef(false);
  const lastValueRef = useRef<string>('');

  const enableEdit = () => setEdit(true);
  const disableEdit = useCallback(() => setEdit(false), []);

  const { isPending, mutate } = useMutationData(
    ['update-automation'],
    async (data: { name: string }) => {
      if (!data.name || !data.name.trim()) {
        throw new Error('Name cannot be empty');
      }
      const result = await updateAutomationName(automationId, { name: data.name.trim() });
      if (result.status !== 200) {
        throw new Error(result.data || 'Failed to update name');
      }
      return result;
    },
    'automation-info'
  );

  const handleUpdateName = useCallback((value: string) => {
    if (!value || !value.trim() || isUpdatingRef.current || value.trim() === lastValueRef.current) {
      return;
    }
    
    isUpdatingRef.current = true;
    lastValueRef.current = value.trim();
    
    mutate(
      { name: value.trim() },
      {
        onSuccess: () => {
          disableEdit();
          isUpdatingRef.current = false;
        },
        onError: () => {
          isUpdatingRef.current = false;
          lastValueRef.current = '';
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      }
    );
  }, [mutate, disableEdit]);

  useEffect(() => {
    if (!edit) {
      isUpdatingRef.current = false;
      lastValueRef.current = '';
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node | null)
      ) {
        const value = inputRef.current.value;
        if (value && value.trim()) {
          handleUpdateName(value);
        } else {
          disableEdit();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [edit, handleUpdateName, disableEdit]);

  return {
    edit,
    enableEdit,
    disableEdit,
    inputRef,
    isPending,
    handleUpdateName,
  };
}

// Add this type to define what can be saved
interface AutomationState {
  trigger?: {
    type: string;
    config?: any;
  }[];
  listener?: {
    	type: 'MESSAGE' | 'PROLYAI';
    prompt?: string;
    reply?: string;
  };
  keywords?: string[];
  posts?: {
    postid: string;
    caption?: string;
    media: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROSEL_ALBUM';
  }[];
  name?: string;
  active?: boolean;
}

interface AutomationChanges {
  name?: string
  active?: boolean
  keywords?: string[]
  posts?: any[]
  trigger?: {
    type: string
    config?: {
      status?: string
      type?: string
      keywords?: { include: string[] }
      replyMessages?: string[]
      posts?: any[]
    }
  }[]
  listener?: {
    	type: 'MESSAGE' | 'PROLYAI'
    status?: 'UNCONFIGURED' | 'CONFIGURED' | 'COMPLETED'
    prompt?: string
    commentReply?: string | null
    dmCount?: number
    commentCount?: number
  }
}

// Add this hook to handle auto-saving
export const useAutomationSync = (id: string) => {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const queryClient = useQueryClient()
  const { data: automationData } = useQueryAutomation(id)

  // Helper function to update lastSaved without expensive refetch
  const updateSaveStateAndInvalidate = useCallback(async () => {
    // Update last saved timestamp
    setLastSaved(new Date())
    
    // PERFORMANCE OPTIMIZATION: Skip expensive invalidations for save operations
    // The 2-7 second delay was caused by the findAutomation query refetch
    // Data will be refreshed on next page load or manual refresh
    console.log('Save completed - skipping expensive data refetch for performance')
    
    // Optional: Only invalidate on major state changes (like automation deletion)
    // queryClient.invalidateQueries({ 
    //   queryKey: ['automation-info', id],
    //   exact: true,
    //   refetchType: 'active'
    // })
  }, [id, queryClient])

  const saveChanges = useCallback(async (changes: AutomationChanges) => {
    try {
      setIsSaving(true)
      
      // If we're trying to save a listener without a trigger, save only the listener
      if ('listener' in changes && !changes.trigger) {
        // If listener is undefined or null, we want to remove the listener
        if (changes.listener === undefined || changes.listener === null) {
          try {
            console.log('Attempting to remove listener')
            
            // Make a direct PATCH request to remove the listener
            const response = await fetch(`/api/automations/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ listener: null }),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.message || result.error || 'Failed to remove listener');
            }
            
            await updateSaveStateAndInvalidate()

            return { status: 200, data: 'Listener removed successfully' };
          } catch (error) {
            console.error('Error removing listener:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to remove listener');
          }
        }

        try {
          // Normal listener save logic for non-null listener
          if (!changes.listener.type) {
            throw new Error('Listener type is required');
          }

          const result = await saveListener(
            id, 
            changes.listener.type,
            changes.listener.prompt || '',
            undefined
          );
          
          if (!result) {
            throw new Error('No response received from server');
          }

          if (result.status === 401) {
            throw new Error('Unauthorized - Please check your authentication');
          }

          if (result.status === 404) {
            throw new Error('Could not find automation to save listener');
          }

          if (result.status !== 200) {
            throw new Error(result.data || 'Failed to save listener');
          }

          await updateSaveStateAndInvalidate()

          return { status: 200, data: 'Listener saved successfully' }
        } catch (error) {
          console.error('Error saving listener:', error);
          throw error;
        }
      }

      // Handle trigger removal case
      if (changes.trigger && changes.trigger.length === 0) {
        // Enhanced logging for debugging
        console.log('Trigger removal detected in saveChanges, calling removeTrigger')
        
        try {
          // CRITICAL FIX: Use removeTrigger instead of saveTrigger with empty array
          // This is the correct API function for removing triggers
          const result = await removeTrigger(id)
          
          console.log('Trigger removal result:', result)
          
          if (!result || result.status !== 200) {
            throw new Error(result?.data || 'Failed to remove trigger')
          }
  
          await updateSaveStateAndInvalidate()
  
          return { status: 200, data: 'Trigger removed successfully' }
        } catch (error) {
          console.error('Error in trigger removal:', error)
          throw error
        }
      }

      // Extract trigger type and config from changes
      const triggerType = changes.trigger?.[0]?.type
      const triggerConfig = changes.trigger?.[0]?.config

      if (changes.trigger && !triggerType) {
        throw new Error('No trigger type provided')
      }

      // If we have trigger changes, save them
      if (changes.trigger && triggerType) {
        // Make the actual API call to save trigger configuration
        const result = await saveTrigger(id, [triggerType], triggerConfig)
        
        if (!result || result.status !== 200) {
          throw new Error(result?.data || 'Failed to save changes')
        }
      }

      await updateSaveStateAndInvalidate()

      return { status: 200, data: 'Changes saved successfully' }
    } catch (error) {
      console.error('Error saving changes:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [id, queryClient, automationData, updateSaveStateAndInvalidate])

  const debouncedSave = useCallback((state: AutomationChanges) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveChanges(state)
      } catch (error) {
        // Error is already handled in saveChanges
        console.debug('Debounced save error:', error)
      }
    }, 1000) // Debounce for 1 second
  }, [saveChanges])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Initialize automation with default state if it's new
  useEffect(() => {
    if (!automationData?.data) {
      debouncedSave({
        name: 'Untitled',
        active: false,
        trigger: [],
        listener: undefined
      })
    }
  }, [automationData?.data, debouncedSave])

  return {
    isSaving,
    lastSaved,
    saveChanges,
    debouncedSave
  }
}

// Update useTriggers to use auto-save
export const useTriggers = (id: string) => {
  const types = useAppSelector((state) => state.AutmationReducer.trigger?.types)
  const queryClient = useQueryClient()
  const dispatch: AppDispatch = useDispatch()
  const { data: automationData } = useQueryAutomation(id)
  const { saveChanges } = useAutomationSync(id)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Redux state from database data
  useEffect(() => {
    if (!automationData?.data || isInitialized) return

    console.log('Raw automation data:', automationData.data)
    
    if (automationData.data.trigger && automationData.data.trigger.length > 0) {
      const trigger = automationData.data.trigger[0]
      console.log('Raw trigger data:', trigger)

      // Map API type to UI type with explicit type checking
      let uiType: 'COMMENT' | 'DM'
      let apiType = trigger.type

      // Strict type mapping with validation
      if (apiType === 'user-message' || apiType === 'DM') {
        uiType = 'DM'
        apiType = 'user-message' // Normalize to API type
      } else if (apiType === 'post-comments' || apiType === 'COMMENT') {
        uiType = 'COMMENT'
        apiType = 'post-comments' // Normalize to API type
      } else {
        console.error('Unknown trigger type:', apiType)
        return
      }

      console.log('Mapped trigger types:', { apiType, uiType })

      // Create configuration object
      const config = {
        status: trigger.status || 'unconfigured',
        type: (trigger as any).config?.type || 'all',
        keywords: {
          include: trigger.keywords?.map(k => k.word) || []
        },
        replyMessages: trigger.replyMessages?.map(r => r.message) || [],
        posts: trigger.posts?.map(p => ({
          postId: p.postId,
          mediaType: p.mediaType.toString(),
          mediaUrl: p.mediaUrl,
          caption: p.caption || undefined
        })) || []
      }

      // Determine configuration status based on data presence
      const hasKeywords = config.keywords.include.length > 0
      const hasReplyMessages = config.replyMessages.length > 0
      const hasPosts = config.posts.length > 0

      const status = hasKeywords && hasReplyMessages && hasPosts ? 'complete' as const :
                    hasKeywords || hasReplyMessages || hasPosts ? 'partial' as const :
                    'unconfigured' as const

      const finalConfig = {
        ...config,
        status
      }

      console.log('Created trigger config:', finalConfig)

      // Update Redux state with validated data
      dispatch(TRIGGER({ 
        trigger: { 
          type: uiType,
          types: [uiType],
          config: finalConfig
        } 
      }))

      console.log('Updated Redux state with trigger:', { uiType, config: finalConfig })
      setIsInitialized(true)
    }
  }, [automationData?.data, dispatch, isInitialized])

  // Handle trigger removal with complete cleanup
  const onRemoveTrigger = useCallback(async () => {
    try {
      console.log('Removing trigger')
      
      // Clear Redux state first
      dispatch(TRIGGER({ 
        trigger: { 
          type: undefined,
          types: [],
          config: undefined,
          keywords: [],
          keyword: undefined
        } 
      }))

      // Remove from database with complete cleanup
      await saveChanges({ 
        trigger: [],
        keywords: [],
        posts: []
      })

      // Force immediate refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['automation-info', id],
        exact: true,
        refetchType: 'all'
      })

      toast.success('Trigger removed successfully')
    } catch (error) {
      console.error('Error removing trigger:', error)
      toast.error('Failed to remove trigger')
    }
  }, [dispatch, saveChanges, queryClient, id])

  // Set trigger with proper initialization
  const onSetTrigger = useCallback(async (type: 'COMMENT' | 'DM') => {
    console.log('Setting trigger type:', type)

    // Map UI trigger type to API trigger type with validation
    const apiType = type === 'DM' ? 'user-message' :
                   type === 'COMMENT' ? 'post-comments' :
                   null

    if (!apiType) {
      console.error('Invalid UI trigger type:', type)
      return
    }

    console.log('Mapped to API type:', apiType)

    try {
      // Create fresh configuration with strict typing
      const initialConfig = {
        status: 'unconfigured' as 'unconfigured' | 'partial' | 'complete',
        type: 'all' as 'all' | 'specific' | 'next',
        keywords: { include: [] as string[] },
        replyMessages: [] as string[],
        posts: [] as Array<{
          postId: string;
          mediaType: string;
          mediaUrl: string;
          caption?: string;
        }>
      }

      console.log('Setting initial config:', initialConfig)

      // Update Redux state with fresh configuration
      dispatch(TRIGGER({ 
        trigger: { 
          type,
          types: [type],
          config: initialConfig,
          keywords: [],
          keyword: undefined
        } 
      }))

      console.log('Updated Redux state')

      // Save to database with complete initialization and normalized type
      await saveChanges({
        trigger: [{
          type: apiType, // Always use API type when saving to database
          config: initialConfig
        }],
        keywords: [],
        posts: []
      })

      console.log('Saved to database with normalized type:', apiType)

      // Force immediate refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['automation-info', id],
        exact: true,
        refetchType: 'all'
      })

      console.log('Invalidated queries')
      toast.success('Trigger initialized successfully')
    } catch (error) {
      console.error('Error initializing trigger:', error)
      toast.error('Failed to initialize trigger')

      // Revert Redux state on error
      dispatch(TRIGGER({ 
        trigger: { 
          types: [],
          config: undefined,
          keywords: [],
          keyword: undefined
        } 
      }))
    }
  }, [dispatch, saveChanges, queryClient, id])

  return { 
    types, 
    onSetTrigger,
    onRemoveTrigger,
    isInitialized
  }
}

export const useKeywords = (id: string) => {
  const [keyword, setKeyword] = useState('')
  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setKeyword(e.target.value)

  const { mutate } = useMutationData(
    ['add-keyword'],
    (data: { keyword: string }) => saveKeyword(id, data.keyword),
    'automation-info',
    () => setKeyword('')
  )

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      mutate({ keyword })
      setKeyword('')
    }
  }

  const { mutate: deleteMutation } = useMutationData(
    ['delete-keyword'],
    (data: { id: string }) => deleteKeyword(data.id),
    'automation-info'
  )

  return { keyword, onValueChange, onKeyPress, deleteMutation }
}

export const useAutomationPosts = (id: string) => {
  const [posts, setPosts] = useState<
    {
      postid: string
      caption?: string
      media: string
      mediaType: 'IMAGE' | 'VIDEO' | 'CAROSEL_ALBUM'
    }[]
  >([])
  const queryClient = useQueryClient()

  const onSelectPost = (post: {
    postid: string
    caption?: string
    media: string
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROSEL_ALBUM'
  }) => {
    setPosts((prevItems) => {
      if (prevItems.find((p) => p.postid === post.postid)) {
        return prevItems.filter((item) => item.postid !== post.postid)
      } else {
        return [...prevItems, post]
      }
    })
  }

  const { mutate, isPending } = useMutationData(
    ['attach-posts'],
    () => savePosts(id, posts),
    'automation-info',
    () => {
      // Skip expensive refetch for instant UI response
      // queryClient.invalidateQueries({ queryKey: ['automation-info', id] })
      setPosts([])
    }
  )
  return { posts, onSelectPost, mutate, isPending }
}

export const useAutomationWorkflow = (id: string) => {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const { data: automationData } = useQueryAutomation(id)
  const { saveChanges } = useAutomationSync(id)

  const debouncedSave = useCallback((state: AutomationChanges) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(state)
    }, 1000) // Debounce for 1 second
  }, [saveChanges])

  // Initialize automation with default state if it's new
  useEffect(() => {
    if (!automationData?.data) {
      debouncedSave({
        name: 'Untitled',
        active: false,
        trigger: [],
        listener: undefined
      })
    }
  }, [automationData?.data, debouncedSave])

  return {
    isSaving,
    lastSaved,
    saveChanges: debouncedSave
  }
}

// Update useListener to use auto-save
export const useListener = (id: string) => {
  	const [listener, setListener] = useState<'MESSAGE' | 'PROLYAI' | null>(null)
  const { saveChanges } = useAutomationSync(id)

  const promptSchema = z.object({
    prompt: z.string().min(1),
    message: z.string(),
  })

  const onFormSubmit = useCallback((data: { prompt: string; message: string }) => {
    if (listener) {
      saveChanges({
        listener: {
          type: listener,
          status: 'CONFIGURED',
          prompt: data.prompt
        }
      })
    }
  }, [listener, saveChanges])

  	const onSetListener = useCallback((type: 'PROLYAI' | 'MESSAGE') => {
    setListener(type)
  }, [])

  return { onSetListener, onFormSubmit, listener }
}
