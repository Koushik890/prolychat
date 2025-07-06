import { saveListenerMessage, deleteListenerMessage, getListenerMessage } from '@/actions/automations/queries'
import { CardData } from '@/types/automation'
import { NextRequest } from 'next/server'

type Context = {
  params: Promise<{
    id: string | string[]
  }>
}

// GET /api/automations/[id]/message - Get message data for an automation
export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { id: paramId } = await params
    const automationId = Array.isArray(paramId) ? paramId[0] : paramId

    if (!automationId) {
      return new Response(
        JSON.stringify({ message: 'Automation ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const messageData = await getListenerMessage(automationId)
    
    return new Response(JSON.stringify({ messageData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error getting message:', error)
    return new Response(
      JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// POST /api/automations/[id]/message - Create or update message data
export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id: paramId } = await params
    const automationId = Array.isArray(paramId) ? paramId[0] : paramId

    if (!automationId) {
      return new Response(
        JSON.stringify({ message: 'Automation ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const body = await request.json()
    const { messageType, data } = body

    if (!messageType || !['TEXT', 'CARD'].includes(messageType)) {
      return new Response(
        JSON.stringify({ message: 'Valid message type (TEXT or CARD) is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (messageType === 'TEXT' && !data?.textContent) {
      return new Response(
        JSON.stringify({ message: 'Text content is required for TEXT messages' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (messageType === 'CARD' && !data?.cardData) {
      return new Response(
        JSON.stringify({ message: 'Card data is required for CARD messages' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const result = await saveListenerMessage(automationId, messageType, data)
    
    if (result.status !== 200) {
      return new Response(
        JSON.stringify({ message: result.data }),
        {
          status: result.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(JSON.stringify({ 
      message: 'Message saved successfully',
      data: result.data 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error saving message:', error)
    return new Response(
      JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// DELETE /api/automations/[id]/message - Delete message data
export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const { id: paramId } = await params
    const automationId = Array.isArray(paramId) ? paramId[0] : paramId

    if (!automationId) {
      return new Response(
        JSON.stringify({ message: 'Automation ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const result = await deleteListenerMessage(automationId)
    
    if (result.status !== 200) {
      return new Response(
        JSON.stringify({ message: result.data }),
        {
          status: result.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(JSON.stringify({ message: 'Message deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return new Response(
      JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
} 