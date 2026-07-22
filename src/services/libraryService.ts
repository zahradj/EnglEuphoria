import { supabase } from '@/integrations/supabase/client';
import { LibraryAsset, LessonMaterial, SystemId, SystemTag, AssetFileType } from '@/types/multiTenant';

export interface AssetFilters {
  systemTag?: SystemTag;
  fileType?: AssetFileType;
  tags?: string[];
  minAge?: number;
  maxAge?: number;
  searchQuery?: string;
}

// Fetch assets with optional filters
export async function getLibraryAssets(filters?: AssetFilters): Promise<LibraryAsset[]> {
  let query = supabase
    .from('library_assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.systemTag) {
    query = query.or(`system_tag.eq.${filters.systemTag},system_tag.eq.all`);
  }

  if (filters?.fileType) {
    query = query.eq('file_type', filters.fileType);
  }

  if (filters?.minAge !== undefined) {
    query = query.gte('max_age', filters.minAge);
  }

  if (filters?.maxAge !== undefined) {
    query = query.lte('min_age', filters.maxAge);
  }

  if (filters?.searchQuery) {
    query = query.ilike('title', `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching library assets:', error);
    return [];
  }

  return (data || []) as LibraryAsset[];
}

// Fetch assets for a specific system
export async function getAssetsBySystem(systemId: SystemId): Promise<LibraryAsset[]> {
  const { data, error } = await supabase
    .from('library_assets')
    .select('*')
    .or(`system_tag.eq.${systemId},system_tag.eq.all`)
    .eq('is_teacher_only', false)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching assets by system:', error);
    return [];
  }

  return (data || []) as LibraryAsset[];
}

// Fetch a single asset by ID
export async function getAssetById(assetId: string): Promise<LibraryAsset | null> {
  const { data, error } = await supabase
    .from('library_assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error) {
    console.error('Error fetching asset:', error);
    return null;
  }

  return data as LibraryAsset;
}

// Fetch materials for a specific lesson
export async function getMaterialsByLesson(lessonId: string): Promise<LessonMaterial[]> {
  const { data, error } = await supabase
    .from('lesson_materials')
    .select(`
      *,
      asset:library_assets(*)
    `)
    .eq('lesson_id', lessonId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching lesson materials:', error);
    return [];
  }

  return (data || []) as LessonMaterial[];
}

// Fetch teacher-only assets (requires teacher role)
export async function getTeacherAssets(filters?: AssetFilters): Promise<LibraryAsset[]> {
  let query = supabase
    .from('library_assets')
    .select('*')
    .eq('is_teacher_only', true)
    .order('created_at', { ascending: false });

  if (filters?.systemTag && filters.systemTag !== 'all') {
    query = query.or(`system_tag.eq.${filters.systemTag},system_tag.eq.all`);
  }

  if (filters?.fileType) {
    query = query.eq('file_type', filters.fileType);
  }

  if (filters?.searchQuery) {
    query = query.ilike('title', `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching teacher assets:', error);
    return [];
  }

  return (data || []) as LibraryAsset[];
}

// Get asset counts by file type
export async function getAssetCountsByType(): Promise<Record<AssetFileType, number>> {
  const { data, error } = await supabase
    .from('library_assets')
    .select('file_type');

  if (error) {
    console.error('Error fetching asset counts:', error);
    return {} as Record<AssetFileType, number>;
  }

  const counts: Partial<Record<AssetFileType, number>> = {};
  for (const asset of data || []) {
    const type = asset.file_type as AssetFileType;
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts as Record<AssetFileType, number>;
}
