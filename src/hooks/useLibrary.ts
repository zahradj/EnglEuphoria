import { useQuery } from '@tanstack/react-query';
import { 
  getLibraryAssets, 
  getAssetsBySystem, 
  getAssetById, 
  getMaterialsByLesson,
  getTeacherAssets,
  getAssetCountsByType,
  AssetFilters
} from '@/services/libraryService';
import { SystemId } from '@/types/multiTenant';

// Hook to get library assets with filters
export function useLibraryAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: ['libraryAssets', filters],
    queryFn: () => getLibraryAssets(filters),
  });
}

// Hook to get assets for a system
export function useAssetsBySystem(systemId: SystemId | undefined) {
  return useQuery({
    queryKey: ['assets', 'system', systemId],
    queryFn: () => getAssetsBySystem(systemId!),
    enabled: !!systemId,
  });
}

// Hook to get a single asset
export function useAsset(assetId: string | undefined) {
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAssetById(assetId!),
    enabled: !!assetId,
  });
}

// Hook to get materials for a lesson
export function useLessonMaterials(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lessonMaterials', lessonId],
    queryFn: () => getMaterialsByLesson(lessonId!),
    enabled: !!lessonId,
  });
}

// Hook to get teacher-only assets
export function useTeacherAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: ['teacherAssets', filters],
    queryFn: () => getTeacherAssets(filters),
  });
}

// Hook to get asset counts by type
export function useAssetCounts() {
  return useQuery({
    queryKey: ['assetCounts'],
    queryFn: getAssetCountsByType,
  });
}
