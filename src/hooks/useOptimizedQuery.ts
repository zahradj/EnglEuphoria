import { useQuery, UseQueryOptions } from '@tanstack/react-query';

/**
 * Optimized React Query hook with performance best practices
 * - Automatic stale time configuration
 * - Cache time optimization
 * - Refetch on window focus disabled for dashboard data
 */
export function useOptimizedQuery<TData = unknown, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 min
    gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection after 10 min
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: true, // Refetch when reconnecting to network
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    ...options,
  });
}

/**
 * For real-time data that needs frequent updates
 */
export function useRealtimeQuery<TData = unknown, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: 30 * 1000, // 30 seconds - shorter for real-time data
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    ...options,
  });
}
