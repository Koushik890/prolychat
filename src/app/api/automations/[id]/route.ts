import { getAutomationInfo, updateAutomationName } from '@/actions/automations';
import { client } from '@/lib/prisma';
import { Trigger } from '@prisma/client';

type Context = {
  params: Promise<{
    id: string | string[];
  }>;
};

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id: paramId } = await params;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!id) {
      return new Response(JSON.stringify({ message: 'Automation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await getAutomationInfo(id);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET /api/automations/[id]:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const { id: paramId } = await params;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!id) {
      return new Response(JSON.stringify({ message: 'Automation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const result = await updateAutomationName(id, body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in POST /api/automations/[id]:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id: paramId } = await params;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!id) {
      return new Response(JSON.stringify({ message: 'Automation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    console.log('Received update request with body:', JSON.stringify(body, null, 2));
    
    // Handle listener removal
    if (body.listener === null) {
      try {
        // First check if the automation exists and has a listener
        const automation = await client.automation.findUnique({
          where: { id },
          include: { listener: true }
        });

        if (!automation) {
          return new Response(JSON.stringify({ message: 'Automation not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // If there's a listener, delete it
        if (automation.listener) {
          await client.listener.delete({
            where: { id: automation.listener.id }
          });
        }

        // Get the updated automation state
        const updatedAutomation = await client.automation.findUnique({
          where: { id },
          include: {
            trigger: {
              include: {
                posts: true,
                keywords: true,
                replyMessages: true
              }
            },
            listener: true
          }
        });

        return new Response(JSON.stringify(updatedAutomation), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error removing listener:', error);
        return new Response(
          JSON.stringify({ 
            message: 'Failed to remove listener',
            error: error instanceof Error ? error.message : 'Unknown error'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Handle other updates
    const updateData: any = {
      ...(body.name && { name: body.name }),
      ...(body.active !== undefined && { active: body.active }),
      // Always update the timestamp when any changes are made
      updatedAt: new Date(),
    };

    // Handle listener updates (create/update)
    if (body.listener) {
      updateData.listener = {
        upsert: {
          create: {
            type: body.listener.type,
            status: body.listener.message ? 'CONFIGURED' : 'UNCONFIGURED',
            prompt: body.listener.prompt || null,
            message: body.listener.message || null,
            commentReply: body.listener.commentReply || null,
            dmCount: body.listener.dmCount || 0,
            commentCount: body.listener.commentCount || 0
          },
          update: {
            type: body.listener.type,
            status: body.listener.message ? 'CONFIGURED' : 'UNCONFIGURED',
            prompt: body.listener.prompt || null,
            message: body.listener.message || null,
            commentReply: body.listener.commentReply || null,
            dmCount: body.listener.dmCount || 0,
            commentCount: body.listener.commentCount || 0
          }
        }
      };
    }

    // Perform the update
    const result = await client.automation.update({
      where: { id },
      data: updateData,
      include: {
        trigger: {
          include: {
            posts: true,
            keywords: true,
            replyMessages: true
          }
        },
        listener: true
      }
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in PATCH /api/automations/[id]:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 