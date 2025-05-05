import { mistralAI } from '@/lib/mistral'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Strips markdown formatting from text 
 */
const stripMarkdown = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove bold/italic markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/__(.*?)__/g, '$1')     // Bold with underscore
    .replace(/_(.*?)_/g, '$1')       // Italic with underscore
    
    // Keep headers but remove the # symbols
    .replace(/#{1,6}\s+(.*?)(?:\n|$)/g, '$1\n')
    
    // Remove code blocks but keep content
    .replace(/```(?:.*?)\n([\s\S]*?)```/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    
    // Keep link text but remove URL
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    
    // Keep list items but convert to plain text
    .replace(/^\s*[-*+]\s+(.*?)(?:\n|$)/gm, '• $1\n')
    .replace(/^\s*(\d+)[\.)]\s+(.*?)(?:\n|$)/gm, '$1. $2\n')
    
    // Remove any remaining markdown characters
    .replace(/[\\`~^{}[\]<>]/g, '');
};

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    // Add explicit character limit instructions to the prompt
    const limitedPrompt = prompt || 'Generate a short, engaging social media reply notifying the user that their requested details have been sent via direct message. Ensure the response is concise (under 500 characters), friendly, and varied in phrasing while including a clear call to action and a relevant emoji. Avoid repetitive wording across different responses.'

    const response = await mistralAI.agents.complete({
      agentId: "ag:6b3eeca6:20250207:social-media-comment-reply-automation-assistant:0f3e8528",
      messages: [
        {
          role: 'user',
          content: limitedPrompt + " IMPORTANT: Keep your response under 1000 characters to fit within Instagram's message limit. DO NOT use markdown formatting like bold (**), italic (*), or other special formatting characters."
        }
      ],
    })

    let generatedMessage = response.choices[0].message.content
    
    // Strip any markdown that might be in the AI response
    generatedMessage = stripMarkdown(generatedMessage);
    console.log('AI generated message after markdown stripping, length:', generatedMessage.length)
    
    // We're no longer truncating since we're handling long messages with chunking in the send functions
    // Instead just log if the message is long so we can monitor
    if (generatedMessage.length > 1000) {
      console.log(`Warning: AI generated a message with ${generatedMessage.length} characters (over 1000 limit). The message will be split when sent.`)
    }

    return NextResponse.json({ message: generatedMessage })
  } catch (error) {
    console.error('Error generating AI response:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
} 