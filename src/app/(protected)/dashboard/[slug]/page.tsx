'use client';

import React, { useRef, useState, useMemo } from 'react';
import { AutomatedActivityCard } from './components/cards/AutomatedActivityCard';
import { PerformanceMetricsCard } from './components/cards/PerformanceMetricsCard';
import { SetupAutoRepliesFeatureCard } from './components/cards/SetupAutoRepliesFeatureCard';
import { AnswerQuestionsFeatureCard } from './components/cards/AnswerQuestionsFeatureCard';
import { ManageContactsFeatureCard } from './components/cards/ManageContactsFeatureCard';
import { useQuery } from '@tanstack/react-query';
import { onUserInfo } from '@/actions/user';
import { format } from 'date-fns';
import { useRouter, useParams } from 'next/navigation';
import { createAutomations, saveTrigger, saveListener } from '@/actions/automations'; 
import { toast } from 'sonner';
import LoaderOne from '@/components/ui/loader-one';
import { useQueryAutomations } from '@/hooks/user-queries';

// Define types for automation objects
interface Trigger {
  id: string;
  type: string;
  status: string;
  automationId: string;
  config: any;
  posts?: any[];
  keywords?: any[];
  replyMessages?: any[];
}

interface Listener {
  id?: string;
  type?: string;
  	actionType?: 'MESSAGE' | 'PROLYAI';
  automationId?: string;
  prompt?: string;
  message?: string;
  dmCount?: number;
  commentCount?: number;
}

interface Automation {
  id: string;
  name?: string;
  runs?: number;
  status?: string;
  lastPublished?: string;
  active?: boolean;
  updatedAt?: Date;
  listener?: Listener;
  trigger?: Trigger[];
}

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const { data: userInfo } = useQuery({
    queryKey: ['user-profile'],
    queryFn: onUserInfo,
  });

  // Fetch automation data to calculate metrics
  const { data: automationsData, isLoading: isLoadingAutomations } = useQueryAutomations();

  // Calculate performance metrics from automation data
  const performanceMetrics = useMemo(() => {
    if (!automationsData?.data || !Array.isArray(automationsData.data)) {
      return {
        commentsReplied: 0,
        totalComments: 0,
        totalDmResponses: 0,
        commentTriggeredDms: 0,
        userMessageDms: 0
      };
    }

    console.log('Raw automations data for metrics:', automationsData.data);

    // Initialize metrics
    let totalDmResponses = 0;
    let commentTriggeredDms = 0;
    let userMessageDms = 0;
    let commentsReplied = 0;
    let totalComments = 0;

    // Track automations that have already had their comment counts included
    const commentCountedAutomations = new Set<string>();

    // Look through raw automation data to find listener types and counts
    try {
      if (Array.isArray(automationsData.data)) {
        // Process each automation
        automationsData.data.forEach((automation: any) => {
          if (!automation || typeof automation.runs !== 'number' || automation.runs === 0) {
            return;
          }

          // For accurate metrics, we need access to the automation triggers and listener
          const hasRuns = automation.runs > 0;
          
          // Check for invalid data structures and provide fallbacks
          if (!hasRuns) {
            return; // Skip automations with no runs
          }
          
          console.log(`Processing automation metrics for ${automation.id} (${automation.name})`, {
            runs: automation.runs,
            active: automation.active,
            triggerInfo: automation.trigger,
            listenerInfo: automation.listener
          });
          
          // Extract the trigger types even if we don't have the full trigger objects
          const triggerTypes = Array.isArray(automation.trigger) 
            ? automation.trigger.map((t: any) => t.type) 
            : [];
          
          // Determine if this is a comment trigger
          const hasCommentTrigger = triggerTypes.includes('post-comments');
          
          // Determine if this is a direct message trigger
          const hasDmTrigger = triggerTypes.includes('user-message');
          
          // Get listener type - for metrics calculation we care about MESSAGE or PROLYAI
          const actionType = automation.listener?.actionType;
          const isMsgAction = actionType === 'MESSAGE';
          const isOmniAction = actionType === 'PROLYAI';
          
          console.log(`Automation action types:`, {
            name: automation.name,
            hasCommentTrigger,
            hasDmTrigger,
            actionType,
            isMsgAction,
            isOmniAction
          });
          
          // Handle COMMENT automation (automation that replies to post comments)
          if (hasCommentTrigger && (!actionType || actionType === 'COMMENT')) {
            // Count comment replies - one automation run = one comment replied to
            commentsReplied += automation.runs;
            totalComments += automation.runs;
            console.log(`Added ${automation.runs} to commentsReplied (total: ${commentsReplied})`);
            
            // Mark this automation as having its comment count already included
            if (automation.id) {
              commentCountedAutomations.add(automation.id);
            }
          }
          
          // Handle DM automation triggered by comments
          else if (hasCommentTrigger && (isMsgAction || isOmniAction)) {
            // Count DMs triggered by comments
            commentTriggeredDms += automation.runs;
            totalDmResponses += automation.runs;
            console.log(`Added ${automation.runs} to commentTriggeredDms (total: ${commentTriggeredDms})`);
            
            // Also check if this automation replies to comments as well
            if (automation.listener && typeof automation.listener.commentCount === 'number' && automation.listener.commentCount > 0) {
              commentsReplied += automation.listener.commentCount;
              totalComments += automation.listener.commentCount;
              console.log(`Also added ${automation.listener.commentCount} to commentsReplied from listener commentCount (total: ${commentsReplied})`);
              
              // Mark this automation as having its comment count already included
              if (automation.id) {
                commentCountedAutomations.add(automation.id);
              }
            }
          }
          
          // Handle DM automation triggered by direct messages
          else if (hasDmTrigger && (isMsgAction || isOmniAction)) {
            // Count DMs triggered by direct messages
            userMessageDms += automation.runs;
            totalDmResponses += automation.runs;
            console.log(`Added ${automation.runs} to userMessageDms (total: ${userMessageDms})`);
          }
          
          // Handle edge cases and mixed trigger types
          else if (automation.runs > 0) {
            // We have runs but can't clearly categorize the automation
            // Use listener dmCount and commentCount to help categorize
            const dmCount = automation.listener?.dmCount || 0;
            const commentCount = automation.listener?.commentCount || 0;
            
            console.log(`Using listener counts to categorize automation:`, {
              dmCount,
              commentCount,
              runs: automation.runs
            });
            
            // If only DM counts, categorize as DM responses
            if (dmCount > 0 && commentCount === 0) {
              // Default to evenly split between comment-triggered and direct message DMs
              commentTriggeredDms += Math.floor(automation.runs * 0.4);
              userMessageDms += Math.ceil(automation.runs * 0.6);
              totalDmResponses += automation.runs;
            }
            // If only comment counts, categorize as comment replies 
            else if (commentCount > 0 && dmCount === 0) {
              commentsReplied += automation.runs;
              totalComments += automation.runs;
            }
            // If both or neither, make best guess based on name
            else {
              if (automation.name?.toLowerCase().includes('comment')) {
                commentsReplied += automation.runs;
                totalComments += automation.runs;
                console.log(`Based on name, added ${automation.runs} to comments`);
              }
              else if (automation.name?.toLowerCase().includes('dm') || 
                      automation.name?.toLowerCase().includes('message')) {
                // Split between comment triggered and direct message based 
                const commentPortion = Math.floor(automation.runs * 0.4);
                const dmPortion = automation.runs - commentPortion;
                
                commentTriggeredDms += commentPortion;
                userMessageDms += dmPortion;
                totalDmResponses += automation.runs;
                console.log(`Based on name, split ${automation.runs} between comment-triggered (${commentPortion}) and direct (${dmPortion}) DMs`);
              }
              else {
                // Most generic split for unknown automations
                const dmPortion = Math.floor(automation.runs * 0.6);
                const commentPortion = automation.runs - dmPortion;
                
                // For DMs, split between comment-triggered and direct message based
                commentTriggeredDms += Math.floor(dmPortion * 0.4);
                userMessageDms += Math.ceil(dmPortion * 0.6);
                totalDmResponses += dmPortion;
                
                commentsReplied += commentPortion;
                totalComments += commentPortion;
                console.log(`Generic allocation: ${dmPortion} to DMs, ${commentPortion} to comments`);
              }
            }
          }
        });
      }
      
      // Final check: review all automations and ensure commentCount is properly reflected
      // This ensures any automation that has commentCount is counted, regardless of categorization
      automationsData.data.forEach((automation: any) => {
        if (automation && automation.id && automation.listener && 
            typeof automation.listener.commentCount === 'number' && 
            automation.listener.commentCount > 0) {
          
          // Skip if this automation's comment count was already added
          if (!commentCountedAutomations.has(automation.id)) {
            console.log(`Adding explicit commentCount ${automation.listener.commentCount} for automation ${automation.id} (${automation.name})`);
            commentsReplied += automation.listener.commentCount;
            totalComments += automation.listener.commentCount;
            
            // Mark as counted now
            commentCountedAutomations.add(automation.id);
          }
        }
      });
      
      console.log('Final performance metrics:', {
        commentsReplied,
        totalComments,
        totalDmResponses,
        commentTriggeredDms,
        userMessageDms
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }

    return {
      commentsReplied,
      totalComments,
      totalDmResponses,
      commentTriggeredDms,
      userMessageDms
    };
  }, [automationsData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = userInfo?.data?.firstname || '';
  const today = new Date();
  const dayAndDate = format(today, 'EEEE, MMMM d');

  const [mousePositions, setMousePositions] = useState({
    card1: { x: 0, y: 0 },
    card2: { x: 0, y: 0 },
    card3: { x: 0, y: 0 }
  });
  const [hoverStates, setHoverStates] = useState({
    card1: false,
    card2: false,
    card3: false
  });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePositions(prev => ({
      ...prev,
      [cardId]: {
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100
      }
    }));
  };
  
  const handleMouseEnter = (cardId: string) => {
    setHoverStates(prev => ({
      ...prev,
      [cardId]: true
    }));
  };
  
  const handleMouseLeave = (cardId: string) => {
    setHoverStates(prev => ({
      ...prev,
      [cardId]: false
    }));
  };

  const handleManageContacts = () => {
    router.push(`/dashboard/${params?.slug}/contacts`);
  };

  const handleSetupAutoReplies = async () => {
    try {
      setIsCreating(true);
      // Create a new automation
      const response = await createAutomations(undefined);
      
      if (response.status !== 200 || !response.res?.id) {
        toast.error('Failed to create automation: ' + (response.data || 'Unknown error'));
        setIsCreating(false);
        return;
      }
      
      const automationId = response.res.id;
      
      // Set the trigger to "post-comments" automatically
      const triggerResponse = await saveTrigger(automationId, ['post-comments'], {
        status: 'unconfigured',
        type: 'all',
        keywords: { include: [] },
        replyMessages: []
      });
      
      if (triggerResponse.status !== 200) {
        console.warn('Failed to set trigger automatically:', triggerResponse.data);
        // Continue anyway, as we've at least created the automation
      }
      
      // Navigate to the new automation page
      await router.push(`/dashboard/${params?.slug}/automations/${automationId}`);
    } catch (error) {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsCreating(false);
    }
  };

  const handleAnswerQuestionsWithAI = async () => {
    try {
      setIsCreating(true);
      // Create a new automation
      const response = await createAutomations(undefined);
      
      if (response.status !== 200 || !response.res?.id) {
        toast.error('Failed to create automation: ' + (response.data || 'Unknown error'));
        setIsCreating(false);
        return;
      }
      
      const automationId = response.res.id;
      
      // Set up a default trigger (required for the flow-builder)
      const triggerResponse = await saveTrigger(automationId, ['user-message'], {
        status: 'unconfigured',
        type: 'all',
        keywords: { include: [] },
        replyMessages: []
      });
      
      if (triggerResponse.status !== 200) {
        console.warn('Failed to set default trigger:', triggerResponse.data);
      }
      
              // Set up the PROLYAI listener with an empty prompt to start
        const listenerResponse = await saveListener(automationId, 'PROLYAI', '');
      
      if (listenerResponse.status !== 200) {
        console.warn('Failed to set AI assistant automatically:', listenerResponse.data);
        // Continue anyway, as we've at least created the automation
      }
      
      // Navigate to the new automation page
      await router.push(`/dashboard/${params?.slug}/automations/${automationId}`);
    } catch (error) {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full pt-[49px]">
      {isCreating && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderOne />
            <p className="text-gray-400 font-medium">Creating automation...</p>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <h2 className="block w-[1200px] h-[20px] mb-1 text-center text-[16px] font-medium leading-[20px] font-['Plus_Jakarta_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Helvetica,Arial,sans-serif] text-[#282d47]">
          {dayAndDate}
        </h2>
        <h1 className="block w-[1200px] h-[40px] m-0 p-0 text-center text-[32px] font-medium leading-[40px] font-['Plus_Jakarta_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Helvetica,Arial,sans-serif] text-[#282d47]">
          {getGreeting()}, {firstName}
        </h1>
      </div>
      
      <div className="mt-8 flex justify-center">
        <div className="w-[1200px] flex flex-col">
          {/* Feature Cards Grid - Positioned right after greeting */}
          <div className="grid grid-cols-3 gap-6 pl-[8px] mb-8">
            <SetupAutoRepliesFeatureCard
              onMouseMove={(e) => handleMouseMove(e, 'card1')}
              onMouseEnter={() => handleMouseEnter('card1')}
              onMouseLeave={() => handleMouseLeave('card1')}
              onClick={handleSetupAutoReplies}
              mousePosition={mousePositions.card1}
              isHovered={hoverStates.card1}
            />

            <AnswerQuestionsFeatureCard
              onMouseMove={(e) => handleMouseMove(e, 'card2')}
              onMouseEnter={() => handleMouseEnter('card2')}
              onMouseLeave={() => handleMouseLeave('card2')}
              onClick={handleAnswerQuestionsWithAI}
              mousePosition={mousePositions.card2}
              isHovered={hoverStates.card2}
            />

            <ManageContactsFeatureCard
              onMouseMove={(e) => handleMouseMove(e, 'card3')}
              onMouseEnter={() => handleMouseEnter('card3')}
              onMouseLeave={() => handleMouseLeave('card3')}
              onClick={handleManageContacts}
              mousePosition={mousePositions.card3}
              isHovered={hoverStates.card3}
            />
          </div>

          {/* Automated Activity Chart - Positioned below the feature cards */}
          <div className="w-full pl-[8px]">
            <div className="grid grid-cols-[minmax(0,1fr)_450px] gap-0">
              <div className="pr-6 w-full">
                <AutomatedActivityCard className="h-full w-full" />
              </div>
              <div>
                <PerformanceMetricsCard 
                  className="h-full" 
                  commentsReplied={performanceMetrics.commentsReplied}
                  totalComments={performanceMetrics.totalComments}
                  totalDmResponses={performanceMetrics.totalDmResponses}
                  commentTriggeredDms={performanceMetrics.commentTriggeredDms}
                  userMessageDms={performanceMetrics.userMessageDms}
                  isLoading={isLoadingAutomations}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}