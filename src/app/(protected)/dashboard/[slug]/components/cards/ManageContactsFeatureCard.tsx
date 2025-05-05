'use client';

import React from 'react';

interface ManageContactsFeatureCardProps {
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  mousePosition: { x: number; y: number };
  isHovered: boolean;
}

export function ManageContactsFeatureCard({ 
  onMouseMove, 
  onMouseEnter, 
  onMouseLeave, 
  onClick,
  mousePosition,
  isHovered
}: ManageContactsFeatureCardProps) {
  return (
    <div 
      className="rounded-[24px] overflow-hidden backdrop-blur-[14px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 cursor-pointer group min-h-[180px] relative" 
      style={{ 
        background: 'linear-gradient(to right, rgba(45, 168, 85, 0.85), rgba(77, 255, 124, 0.8))',
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
      
      {/* Light refraction effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTAiIGhlaWdodD0iMjEwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii4wNSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlRGlzcGxhY2VtZW50TWFwIGluPSJTb3VyY2VHcmFwaGljIiBzY2FsZT0iMjAiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiLz48L3N2Zz4=')]"></div>
      </div>
      
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
      
      <div className="p-8 h-full flex flex-col relative">
        <div className="relative z-10 flex flex-col h-full">
          <h3 className="text-[16px] font-semibold text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">Manage Contacts</h3>
          <p className="text-sm text-white/80 mb-auto group-hover:text-white transition-colors duration-300">
            Segment and organize your audience
          </p>
          <div className="flex items-center mt-4 text-[11px] text-white/70 group-hover:text-white/90 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Manage Contacts
          </div>
        </div>
      </div>
    </div>
  );
} 