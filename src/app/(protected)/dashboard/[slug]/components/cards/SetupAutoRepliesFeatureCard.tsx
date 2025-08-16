'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SetupAutoRepliesFeatureCardProps {
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  mousePosition: { x: number; y: number };
  isHovered: boolean;
}

export function SetupAutoRepliesFeatureCard({ 
  onMouseMove, 
  onMouseEnter, 
  onMouseLeave, 
  onClick,
  mousePosition,
  isHovered
}: SetupAutoRepliesFeatureCardProps) {
  return (
    <div 
      className="rounded-[20px] overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition-all duration-500 cursor-pointer group min-h-[160px] sm:min-h-[180px] relative" 
      style={{ 
        background: 'linear-gradient(135deg, #ffe8e8 0%, #ffb8c5 30%, #f5b2d8 60%, #e8a6e8 100%)',
        transform: isHovered ? `perspective(1000px) rotateX(${(mousePosition.y - 50) / 30}deg) rotateY(${-(mousePosition.x - 50) / 30}deg)` : 'perspective(1000px) rotateX(0) rotateY(0)',
        transition: isHovered ? 'transform 0.2s ease, box-shadow 0.5s ease' : 'transform 0.5s ease, box-shadow 0.5s ease'
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -inset-[100%] opacity-20 bg-gradient-to-r from-white via-transparent to-white rotate-15 transition-opacity duration-300 group-hover:opacity-30"
          style={{
            transform: isHovered ? `translateX(${(mousePosition.x - 50) / 5}px) translateY(${(mousePosition.y - 50) / 5}px)` : '',
            transition: 'transform 0.2s ease, opacity 0.3s ease'
          }}
        ></div>
      </div>
      
      {/* Dynamic reflection/glare based on mouse position */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
        }}
      ></div>
      

      
      {/* Subtle edge highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[24px]"></div>
      
      {/* Enhanced edge lighting */}
      <div 
        className="absolute inset-0 rounded-[24px] pointer-events-none opacity-30 group-hover:opacity-70 transition-opacity duration-300"
        style={{
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.5)'
        }}
      ></div>
      
      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      {/* Left highlight */}
      <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/30 via-white/20 to-transparent"></div>
      
      <div className="p-6 sm:p-8 h-full flex flex-col relative">
        <div className="relative z-10 flex flex-col h-full">
          <h3 className="text-base sm:text-lg font-bold font-hubot text-gray-800 mb-2 sm:mb-3 group-hover:translate-x-1 transition-transform duration-300 leading-tight">Set-up Auto Replies</h3>
          <p className="text-sm sm:text-base font-mona text-gray-600 mb-auto group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
            Deliver a product lineup through Instagram DM
          </p>
          <div className="flex items-center mt-4 sm:mt-5 text-xs sm:text-sm font-mona text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Quick Automation
          </div>
        </div>
      </div>
    </div>
  );
} 