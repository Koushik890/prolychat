'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Send } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';

interface PerformanceMetricsCardProps {
  className?: string;
  commentsReplied?: number;
  totalComments?: number;
  totalDmResponses?: number;
  commentTriggeredDms?: number;
  userMessageDms?: number;
  isLoading?: boolean;
}

export function PerformanceMetricsCard({ 
  className,
  commentsReplied = 0,
  totalComments = 0,
  totalDmResponses = 0,
  commentTriggeredDms = 0,
  userMessageDms = 0,
  isLoading = false,
}: PerformanceMetricsCardProps) {
  
  // Calculate percentages
  const commentsPercentage = totalComments > 0 ? Math.round((commentsReplied / totalComments) * 100) : 0;

  // Set fixed positions for the gradients (in the middle of each card)
  const mouseX = useMotionValue(150);
  const mouseY = useMotionValue(100);

  // No longer need mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Function kept for compatibility but no longer changes values
  };

  return (
    <div className={cn("h-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6", className)}>
      {/* Comments Metric Card */}
      <div className="relative h-full p-1 rounded-3xl bg-gradient-to-r from-[#00ccb1] via-[#7b61ff] to-[#ffc414] shadow-xl">
        <div className="relative h-full w-full bg-white rounded-[20px] overflow-hidden">
          {/* Glassmorphic overlay effects */}
          <div 
            className="absolute inset-0 rounded-[20px]"
            style={{
              background: 'linear-gradient(to bottom right, rgba(248, 250, 252, 0.6), rgba(241, 245, 249, 0.4))',
              backdropFilter: 'blur(4px)'
            }}
          ></div>
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] rounded-[20px]"></div>
          
          {/* Interactive gradient effect */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  600px circle at ${mouseX}px ${mouseY}px,
                  rgba(255,255,255,0.15),
                  transparent 40%
                )
              `,
            }}
          />

          <div className="relative z-10 p-3 sm:p-4 flex flex-col items-center h-full w-full">
            {/* Header - Fixed height */}
            <div className="text-center mb-2 sm:mb-3 h-10 sm:h-12 flex flex-col justify-center">
              <h3 className="text-slate-800 text-lg sm:text-xl font-semibold leading-tight whitespace-nowrap font-sans" style={{ fontFamily: 'inherit !important' }}>
                Comments
              </h3>
              <p className="text-slate-600 text-xs mt-1">
                On your posts
              </p>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
              {isLoading ? (
                <div className="h-12 sm:h-16 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Number container with fixed height */}
                  <div className="flex flex-col items-center h-12 sm:h-16 justify-center">
                    <div className="text-slate-800 text-4xl sm:text-6xl font-bold leading-none">
                      {commentsReplied}
                    </div>
                  </div>
                  {/* Info container with fixed height */}
                  <div className="h-8 sm:h-10 flex items-start justify-center">
                    <div className="text-slate-500 text-sm font-medium flex gap-2 items-center">
                      out of <span className="text-slate-700">{totalComments}</span> total
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Footer */}
            <div className="w-full mt-auto pt-3 border-t-2 border-slate-300">
              <p className="text-slate-700 text-xs font-medium text-center">
                {isLoading ? "Calculating..." : `${commentsPercentage}% automated response rate`}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Direct Messages Metric Card */}
      <div className="relative h-full p-1 rounded-3xl bg-gradient-to-r from-[#00ccb1] via-[#7b61ff] to-[#ffc414] shadow-xl">
        <div className="relative h-full w-full bg-white rounded-[20px] overflow-hidden">
          {/* Glassmorphic overlay effects */}
          <div 
            className="absolute inset-0 rounded-[20px]"
            style={{
              background: 'linear-gradient(to bottom right, rgba(248, 250, 252, 0.6), rgba(241, 245, 249, 0.4))',
              backdropFilter: 'blur(4px)'
            }}
          ></div>
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] rounded-[20px]"></div>
          
          {/* Interactive gradient effect */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  600px circle at ${mouseX}px ${mouseY}px,
                  rgba(255,255,255,0.15),
                  transparent 40%
                )
              `,
            }}
          />

          <div className="relative z-10 p-3 sm:p-4 flex flex-col items-center h-full w-full">
            {/* Header - Fixed height */}
            <div className="text-center mb-2 sm:mb-3 h-10 sm:h-12 flex flex-col justify-center">
              <h3 className="text-slate-800 text-lg sm:text-xl font-semibold leading-tight whitespace-nowrap font-sans" style={{ fontFamily: 'inherit !important' }}>
                Direct Messages
              </h3>
              <p className="text-slate-600 text-xs mt-1">
                Automated Responses
              </p>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
              {isLoading ? (
                <div className="h-12 sm:h-16 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Number container with fixed height */}
                  <div className="flex flex-col items-center h-12 sm:h-16 justify-center">
                    <div className="text-slate-800 text-4xl sm:text-6xl font-bold leading-none">
                      {totalDmResponses}
                    </div>
                  </div>
                  {/* Info container with fixed height */}
                  <div className="h-10 sm:h-12 flex items-start justify-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={12} className="text-slate-500" />
                          <span className="text-slate-500 text-xs">From comments:</span>
                        </div>
                        <span className="text-slate-800 text-xs font-medium">{commentTriggeredDms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Send size={12} className="text-slate-500" />
                          <span className="text-slate-500 text-xs">Direct responses:</span>
                        </div>
                        <span className="text-slate-800 text-xs font-medium">{userMessageDms}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Footer */}
            <div className="w-full mt-auto pt-3 border-t-2 border-slate-300">
              <p className="text-slate-700 text-xs font-medium text-center">
                {isLoading ? "Calculating..." : "Total automated messages sent"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}