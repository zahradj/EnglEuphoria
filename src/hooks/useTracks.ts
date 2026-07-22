import { useQuery } from '@tanstack/react-query';
import { 
  getTracksBySystem, 
  getTrackById, 
  getLevelsByTrack, 
  getLevelsBySystem,
  getLevelById,
  getTrackWithDetails
} from '@/services/trackService';
import { SystemId } from '@/types/multiTenant';

// Hook to get tracks for a system
export function useTracks(systemId: SystemId | undefined) {
  return useQuery({
    queryKey: ['tracks', systemId],
    queryFn: () => getTracksBySystem(systemId!),
    enabled: !!systemId,
  });
}

// Hook to get a single track
export function useTrack(trackId: string | undefined) {
  return useQuery({
    queryKey: ['track', trackId],
    queryFn: () => getTrackById(trackId!),
    enabled: !!trackId,
  });
}

// Hook to get levels for a track
export function useLevelsByTrack(trackId: string | undefined) {
  return useQuery({
    queryKey: ['levels', 'track', trackId],
    queryFn: () => getLevelsByTrack(trackId!),
    enabled: !!trackId,
  });
}

// Hook to get levels for a system
export function useLevelsBySystem(systemId: SystemId | undefined) {
  return useQuery({
    queryKey: ['levels', 'system', systemId],
    queryFn: () => getLevelsBySystem(systemId!),
    enabled: !!systemId,
  });
}

// Hook to get a single level
export function useLevel(levelId: string | undefined) {
  return useQuery({
    queryKey: ['level', levelId],
    queryFn: () => getLevelById(levelId!),
    enabled: !!levelId,
  });
}

// Hook to get track with full details
export function useTrackWithDetails(trackId: string | undefined) {
  return useQuery({
    queryKey: ['trackDetails', trackId],
    queryFn: () => getTrackWithDetails(trackId!),
    enabled: !!trackId,
  });
}
