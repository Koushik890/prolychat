import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-r-4 border-purple-500 animate-spin animation-delay-150"></div>
        <div className="absolute inset-0 rounded-full border-b-4 border-pink-500 animate-spin animation-delay-300"></div>
      </div>
      <h3 className="mt-8 text-xl font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Connecting Instagram...
      </h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm text-center">
        Please wait while we complete your Instagram connection. Do not close this window.
      </p>
    </div>
  );
}