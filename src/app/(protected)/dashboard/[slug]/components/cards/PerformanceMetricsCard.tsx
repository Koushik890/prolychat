'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Send } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { BackgroundGradient } from '@/components/ui/background-gradient';
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
    <div className={cn("h-full grid grid-cols-2 gap-6", className)}>
      {/* Comments Metric Card */}
      <BackgroundGradient 
        className="rounded-3xl overflow-hidden shadow-xl bg-opacity-0 p-0" 
        containerClassName="h-full"
      >
        <div 
          className="relative h-full flex"
        >
          {/* Main background gradient */}
          <div 
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(to bottom right, rgba(240, 240, 255, 0.95), rgba(225, 225, 245, 0.9))',
              backdropFilter: 'blur(8px)'
            }}
          ></div>
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[6px] rounded-3xl"></div>
          
          {/* Subtle edge highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
          
          {/* Enhanced edge lighting */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-70"
            style={{
              boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.4)'
            }}
          ></div>
          
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          
          {/* Left highlight */}
          <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/5 via-white/5 to-transparent"></div>
          
          {/* Interactive gradient effect - now always visible */}
          <motion.div
            className="absolute inset-0 opacity-60"
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

          <div className="relative z-10 p-6 flex flex-col items-center h-full w-full">
            {/* Header - Fixed height */}
            <div className="text-center mb-4 h-14 flex flex-col justify-center">
              <h3 className="text-slate-800 text-xl font-semibold leading-tight whitespace-nowrap font-sans" style={{ fontFamily: 'inherit !important' }}>
                Comments
              </h3>
              <p className="text-slate-600 text-xs mt-1">
                On your posts
              </p>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
              {isLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Number container with fixed height */}
                  <div className="flex flex-col items-center h-20 justify-center">
                    <div className="text-slate-800 text-6xl font-bold leading-none">
                      {commentsReplied}
                    </div>
                  </div>
                  {/* Info container with fixed height */}
                  <div className="h-14 flex items-start justify-center">
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
      </BackgroundGradient>
      
      {/* Direct Messages Metric Card */}
      <BackgroundGradient 
        className="rounded-3xl overflow-hidden shadow-xl bg-opacity-0 p-0" 
        containerClassName="h-full"
      >
        <div 
          className="relative h-full flex"
        >
          {/* Main background gradient */}
          <div 
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(to bottom right, rgba(240, 240, 255, 0.95), rgba(225, 225, 245, 0.9))',
              backdropFilter: 'blur(8px)'
            }}
          ></div>
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[6px] rounded-3xl"></div>
          
          {/* Subtle edge highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
          
          {/* Enhanced edge lighting */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-70"
            style={{
              boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.4)'
            }}
          ></div>
          
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          
          {/* Left highlight */}
          <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/5 via-white/5 to-transparent"></div>
          
          {/* Interactive gradient effect - now always visible */}
          <motion.div
            className="absolute inset-0 opacity-60"
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

          <div className="relative z-10 p-6 flex flex-col items-center h-full w-full">
            {/* Header - Fixed height */}
            <div className="text-center mb-4 h-14 flex flex-col justify-center">
              <h3 className="text-slate-800 text-xl font-semibold leading-tight whitespace-nowrap font-sans" style={{ fontFamily: 'inherit !important' }}>
                Direct Messages
              </h3>
              <p className="text-slate-600 text-xs mt-1">
                Automated Responses
              </p>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
              {isLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Number container with fixed height */}
                  <div className="flex flex-col items-center h-20 justify-center">
                    <div className="text-slate-800 text-6xl font-bold leading-none">
                      {totalDmResponses}
                    </div>
                  </div>
                  {/* Info container with fixed height */}
                  <div className="h-14 flex items-start justify-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={14} className="text-slate-500" />
                          <span className="text-slate-500 text-xs">From comments:</span>
                        </div>
                        <span className="text-slate-800 text-xs font-medium">{commentTriggeredDms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Send size={14} className="text-slate-500" />
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
      </BackgroundGradient>
    </div>
  );
}