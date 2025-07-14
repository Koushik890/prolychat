import { getAllAutomations, getAutomationInfo, getProfilePosts } from '@/actions/automations'
import { onUserInfo } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'

export const useQueryAutomations = () => {
    return useQuery({
        queryKey: ['user-automations'],
        queryFn: getAllAutomations,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

export const useQueryAutomation = (id: string) => {
    return useQuery({
        queryKey: ['automation-info', id],
        queryFn: () => getAutomationInfo(id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true
    })
}

export const useQueryUser = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: onUserInfo,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export const useQueryAutomationPosts = () => {
    const fetchPosts = async () => await getProfilePosts()
    return useQuery({
      queryKey: ['instagram-media'],
      queryFn: fetchPosts,
      staleTime: 15 * 60 * 1000, // 15 minutes (was 5 minutes)
      gcTime: 60 * 60 * 1000, // 1 hour (was 30 minutes)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch on component mount if data exists
      refetchOnReconnect: false, // Don't refetch on network reconnect
      // Use cached data while fetching fresh data in background
      refetchInterval: 20 * 60 * 1000, // Automatically refresh every 20 minutes in background
    })
  }