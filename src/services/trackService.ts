import { supabase } from '@/integrations/supabase/client';
import { Track, CurriculumLevel, SystemId } from '@/types/multiTenant';

// Fetch all tracks for a specific system
export async function getTracksBySystem(systemId: SystemId): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('target_system', systemId)
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }

  return (data || []) as Track[];
}

// Fetch a single track by ID
export async function getTrackById(trackId: string): Promise<Track | null> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .single();

  if (error) {
    console.error('Error fetching track:', error);
    return null;
  }

  return data as Track;
}

// Fetch all levels for a specific track
export async function getLevelsByTrack(trackId: string): Promise<CurriculumLevel[]> {
  const { data, error } = await supabase
    .from('curriculum_levels')
    .select('*')
    .eq('track_id', trackId)
    .order('sequence_order', { ascending: true });

  if (error) {
    console.error('Error fetching levels:', error);
    return [];
  }

  return (data || []) as CurriculumLevel[];
}

// Fetch levels by system (via tracks)
export async function getLevelsBySystem(systemId: SystemId): Promise<CurriculumLevel[]> {
  const { data, error } = await supabase
    .from('curriculum_levels')
    .select(`
      *,
      track:tracks!inner(*)
    `)
    .eq('tracks.target_system', systemId)
    .eq('tracks.is_published', true)
    .order('sequence_order', { ascending: true });

  if (error) {
    console.error('Error fetching levels by system:', error);
    return [];
  }

  return (data || []) as CurriculumLevel[];
}

// Fetch a single level by ID
export async function getLevelById(levelId: string): Promise<CurriculumLevel | null> {
  const { data, error } = await supabase
    .from('curriculum_levels')
    .select(`
      *,
      track:tracks(*)
    `)
    .eq('id', levelId)
    .single();

  if (error) {
    console.error('Error fetching level:', error);
    return null;
  }

  return data as CurriculumLevel;
}

// Fetch track with all its levels and lesson counts
export async function getTrackWithDetails(trackId: string): Promise<{
  track: Track;
  levels: CurriculumLevel[];
  totalLessons: number;
} | null> {
  const track = await getTrackById(trackId);
  if (!track) return null;

  const levels = await getLevelsByTrack(trackId);

  // Count total lessons across all levels
  const { count, error } = await supabase
    .from('curriculum_lessons')
    .select('*', { count: 'exact', head: true })
    .in('level_id', levels.map(l => l.id));

  if (error) {
    console.error('Error counting lessons:', error);
  }

  return {
    track,
    levels,
    totalLessons: count || 0,
  };
}
