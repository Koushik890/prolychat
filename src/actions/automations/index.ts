'use server'

import { onCurrentUser } from '../user'
import { findUser } from '../user/queries'
import { formatDate } from '@/lib/utils'
import {
  addKeyWord,
  addListener,
  addPost,
  addTrigger,
  createAutomation,
  deleteKeywordQuery,
  deleteAutomationQuery,
  findAutomation,
  getAutomations,
  updateAutomation,
  deleteTrigger,
} from './queries'
import { client } from '@/lib/prisma'

export const createAutomations = async (id?: string) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    // First find the user in our database
    const dbUser = await findUser(user.data.id)
    if (!dbUser) {
      return { status: 404, data: 'User not found in database' }
    }

    const automation = await createAutomation(dbUser.clerkId, id)
    if (automation) {
      return { 
        status: 200, 
        data: 'Automation created', 
        res: automation 
      }
    }

    return { status: 404, data: 'Oops! something went wrong' }
  } catch (error) {
    console.error('Error in createAutomations:', error);
    return { status: 500, data: error instanceof Error ? error.message : 'Internal server error' }
  }
}

export const getAllAutomations = async () => {
  try {
    const user = await onCurrentUser()
    console.log('Current user status:', user.status)
    
    if (user.status !== 200 || !user.data) {
      console.warn('User authentication failed when loading automations:', user.status)
      return { status: 401, data: [] }
    }

    // Find user in database
    const dbUser = await findUser(user.data.id)
    if (!dbUser) {
      console.warn('User not found in database:', user.data.id)
      return { status: 404, data: [] }
    }

    try {
      const result = await getAutomations(user.data.id)
      
      // If the result is not an array, log and return empty array
      if (!Array.isArray(result)) {
        console.error('Expected array but got:', typeof result, result)
        return { status: 200, data: [] }
      }
      
      if (result.length === 0) {
        console.log('No automations found for user:', user.data.id)
        return { status: 200, data: [] } // Return 200 with empty array for no automations
      }

      // Map automations with null check for each property
      const transformedAutomations = result.map((automation: any) => {
        if (!automation) return null
        
        // Extract fields with safer fallbacks
        const id = automation.id || 'unknown'
        const name = automation.name || 'Untitled'
        const active = !!automation.active
        
        // Get the run count directly from the automation model
        const runCount = typeof automation.runCount === 'number' ? automation.runCount : 0;
        
        // For backward compatibility and debugging, still log DM and comment counts
        const listener = automation.listener || {}
        const dmCount = typeof listener.dmCount === 'number' ? listener.dmCount : 0
        const commentCount = typeof listener.commentCount === 'number' ? listener.commentCount : 0
        
        // Include the listener information needed for accurate metrics calculations
        const listenerInfo = {
          id: listener.id,
          type: listener.type,
          actionType: listener.type, // This is the ACTION_TYPE (MESSAGE or PROLYAI)
          dmCount,
          commentCount
        };
        
        // Include trigger information for determining automation type
        const triggerInfo = Array.isArray(automation.trigger) ? 
          automation.trigger.map((t: any) => ({
            id: t.id,
            type: t.type,
            automationId: t.automationId,
            status: t.status
          })) : [];
        
        // Log the run count for debugging
        console.log(`Automation ${id} (${name}) run calculation:`, { 
          runCount,
          dmCount, 
          commentCount,
          listenerType: listener.type,
          triggerTypes: triggerInfo.map((t: any) => t.type).join(', ')
        });
        
        // Safely handle dates - always use a valid date, never "Never"
        // Use current date as fallback to prevent "Never" from displaying
        const updatedAt = automation.updatedAt instanceof Date ? automation.updatedAt : 
                         (automation.createdAt instanceof Date ? automation.createdAt : new Date())
        
        // Format date with special handling to avoid "Never"
        const lastPublished = formatDate(updatedAt) === 'Never' ? formatDate(new Date()) : formatDate(updatedAt)
        
        return {
          id,
          name,
          runs: runCount,
          status: active ? 'Live' : 'Draft',
          lastPublished,
          active,
          updatedAt,
          listener: listenerInfo,
          trigger: triggerInfo
        }
      }).filter(Boolean) // Remove any null entries
      
      return { status: 200, data: transformedAutomations }
    } catch (dbError) {
      console.error('Database error fetching automations:', dbError)
      return { status: 500, data: [], error: 'Database error' }
    }
  } catch (error) {
    console.error('Error in getAllAutomations:', error)
    return { status: 500, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const getAutomationInfo = async (id: string) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401 }
  }

  try {
    const automation = await findAutomation(id)
    if (automation) return { status: 200, data: automation }

    return { status: 404 }
  } catch (error) {
    return { status: 500 }
  }
}

export const updateAutomationName = async (
  automationId: string,
  data: {
    name?: string
    active?: boolean
    automation?: string
  }
) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    if (!data || typeof data !== 'object') {
      console.error('Invalid data payload:', { automationId, data });
      return { status: 400, data: 'Invalid data payload' };
    }

    if (!data.name || typeof data.name !== 'string') {
      console.error('Invalid name in payload:', { automationId, data });
      return { status: 400, data: 'Name is required and must be a string' };
    }

    const update = await updateAutomation(automationId, {
      name: data.name.trim()
    });

    if (update) {
      return { status: 200, data: 'Automation successfully updated' }
    }

    console.error('Failed to update automation:', { automationId, data })
    return { status: 404, data: 'Oops! could not find automation' }
  } catch (error) {
    console.error('Error updating automation:', error instanceof Error ? error.message : 'Unknown error', { automationId, data })
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const saveListener = async (
  autmationId: string,
  listener: 'PROLYAI' | 'MESSAGE',
  prompt: string,
  message?: string
) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    const create = await addListener(autmationId, listener, prompt, message)
    if (create) return { status: 200, data: 'Listener created' }
    return { status: 404, data: 'Cant save listener' }
  } catch (error) {
    console.error('Error saving listener:', error)
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const saveTrigger = async (automationId: string, trigger: string[], config?: any) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    console.log('Saving trigger with config:', JSON.stringify({ automationId, trigger, config }, null, 2))
    
    // Validate the configuration structure
    if (config) {
      // Ensure keywords is properly formatted as an array
      if (config.keywords && typeof config.keywords === 'object' && 'include' in config.keywords) {
        // Convert from UI format (keywords: { include: [] }) to DB format (keywords: [])
        config.keywords = config.keywords.include || []
      }
      
      // Ensure posts are properly formatted
      if (config.posts && Array.isArray(config.posts)) {
        // Make sure all required fields are present in each post
        config.posts = config.posts.map((post: { postId?: string; id?: string; mediaType: string; mediaUrl?: string; media_url?: string; caption?: string | null }) => ({
          postId: post.postId || post.id,
          mediaType: post.mediaType,
          mediaUrl: post.mediaUrl || post.media_url,
          caption: post.caption || null
        }))
      }
    }
    
    const create = await addTrigger(automationId, trigger, config)
    if (create.status === 200) {
      console.log('Trigger saved successfully:', create)
      return { status: 200, data: 'Trigger saved' }
    }
    
    console.error('Failed to save trigger:', create)
    return { status: create.status || 404, data: create.data || 'Cannot save trigger' }
  } catch (error) {
    console.error('Error saving trigger:', error instanceof Error ? error.message : 'Unknown error', { automationId, trigger, config })
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const removeTrigger = async (automationId: string) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    const result = await deleteTrigger(automationId)
    if (result) return { status: 200, data: 'Trigger removed' }
    return { status: 404, data: 'Cannot remove trigger' }
  } catch (error) {
    console.error('Error removing trigger:', error)
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const saveKeyword = async (automationId: string, keyword: string) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    const create = await addKeyWord(automationId, keyword)

    if (create) return { status: 200, data: 'Keyword added successfully' }

    return { status: 404, data: 'Cannot add this keyword' }
  } catch (error) {
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const deleteKeyword = async (id: string) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    const deleted = await deleteKeywordQuery(id)
    if (deleted)
      return {
        status: 200,
        data: 'Keyword deleted',
      }
    return { status: 404, data: 'Keyword not found' }
  } catch (error) {
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const getProfilePosts = async () => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401 }
  }

  try {
    const profile = await findUser(user.data.id)
    const posts = await fetch(
      `${process.env.INSTAGRAM_BASE_URL}/me/media?fields=id,caption,media_url,thumbnail_url,media_type,timestamp&limit=10&access_token=${profile?.integrations[0].token}`
    )
    const parsed = await posts.json()
    if (parsed) {
      // Transform the response to use thumbnail_url for videos
      const transformedData = {
        ...parsed,
        data: parsed.data.map((post: any) => ({
          ...post,
          media_url: post.media_type === 'VIDEO' && post.thumbnail_url ? post.thumbnail_url : post.media_url
        }))
      }
      return { status: 200, data: transformedData }
    }
    console.log('🔴 Error in getting posts')
    return { status: 404 }
  } catch (error) {
    console.log('🔴 server side Error in getting posts ', error)
    return { status: 500 }
  }
}

export const savePosts = async (
  autmationId: string,
  posts: {
    postid: string
    caption?: string
    media: string
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROSEL_ALBUM'
  }[]
) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    const create = await addPost(autmationId, posts)

    if (create) return { status: 200, data: 'Posts attached' }

    return { status: 404, data: 'Automation not found' }
  } catch (error) {
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const activateAutomation = async (id: string, state: boolean) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    const update = await updateAutomation(id, { active: state })
    if (update)
      return {
        status: 200,
        data: `Automation is now ${state ? 'Live' : 'Draft'}`,
      }
    return { status: 404, data: 'Automation not found' }
  } catch (error) {
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const deleteAutomation = async (id: string) => {
  const user = await onCurrentUser()
  if (user.status !== 200 || !user.data) {
    return { status: 401, data: 'Unauthorized' }
  }

  try {
    const deleted = await deleteAutomationQuery(id)
    if (deleted) {
      return {
        status: 200,
        data: 'Automation deleted successfully'
      }
    }
    return { status: 404, data: 'Automation not found' }
  } catch (error) {
    console.error('Error deleting automation:', error)
    return { status: 500, data: 'Failed to delete automation' }
  }
}