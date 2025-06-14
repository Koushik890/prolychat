'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { onOauthInstagram } from '@/actions/integrations';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const handleRetry = async () => {
    await onOauthInstagram('INSTAGRAM');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-red-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Connection Failed
      </h3>
      
      <p className="text-sm text-gray-500 max-w-sm text-center mb-6">
        There was a problem connecting your Instagram account. Please try again.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleRetry}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white"
        >
          Try Again
        </Button>
        
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
} 