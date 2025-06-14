'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { InstagramStatusModal } from './instagram-status-modal';
import { InstagramStatusIndicator } from './instagram-status-indicator';
import { useQuery } from '@tanstack/react-query';
import { onUserInfo } from '@/actions/user';

export const InstagramConnectionChecker = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [shouldCheckConnection, setShouldCheckConnection] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  
  // Paths that don't require Instagram connection checking
  const excludedPaths = [
    '/callback/instagram',
    '/dashboard/callback/instagram',
  ];
  
  // Get user data to check integration status
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: onUserInfo,
  });

  // Check if user has Instagram integration
  const hasIntegration = userData?.status === 200 && userData?.data?.integrations?.some(
    (integration) => integration.name === 'INSTAGRAM'
  );
  
  // Check if we should perform the Instagram connection check based on current path
  useEffect(() => {
    const isExcludedPath = excludedPaths.some(path => pathname.includes(path));
    setShouldCheckConnection(!isExcludedPath);
  }, [pathname]);

  // Show auto modal for new users without Instagram integration
  useEffect(() => {
    if (!userLoading && shouldCheckConnection && userData?.status === 200 && !hasIntegration) {
      // Small delay to ensure smooth UX
      const timer = setTimeout(() => {
        setShowAutoModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userLoading, shouldCheckConnection, userData, hasIntegration]);
  
  if (!shouldCheckConnection) {
    return <>{children}</>;
  }
  
  return (
    <>
      {children}
      
      {/* Status indicator - always visible when connection should be checked */}
      <InstagramStatusIndicator />
      
      {/* Auto modal for users without Instagram connection */}
      <InstagramStatusModal
        isOpen={showAutoModal}
        onClose={() => setShowAutoModal(false)}
        autoTrigger={true}
      />
    </>
  );
};

export default InstagramConnectionChecker; 