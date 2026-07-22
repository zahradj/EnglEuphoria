import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardLesson {
  lesson_id: string;
  title: string;
  description: string;
  status: 'locked' | 'unlocked' | 'completed';
  type: string;
  duration_minutes: number;
  xp_reward: number;
  progress_percentage: number;
}

export interface DashboardUnit {
  unit_id: string;
  unit_title: string;
  description: string;
  cefr_level: string;
  map_coordinates: { x: number; y: number };
  lessons: DashboardLesson[];
}

export interface DashboardTrack {
  track_id: string;
  track_name: string;
  theme: string;
  description: string;
  thumbnail_url: string | null;
  levels: Array<{
    level_id: string;
    level_name: string;
    cefr_level: string;
    description: string;
  }>;
}

export interface DashboardResponse {
  system: string;
  user_id: string;
  tracks: DashboardTrack[];
  units: DashboardUnit[];
  meta: {
    total_tracks: number;
    total_units: number;
    total_lessons: number;
    fetched_at: string;
  };
}

async function fetchDashboard(): Promise<DashboardResponse> {
  const { data, error } = await supabase.functions.invoke('get-dashboard');
  
  if (error) {
    console.error('[useDashboardCurriculum] Error:', error);
    throw new Error(error.message || 'Failed to fetch dashboard');
  }
  
  return data as DashboardResponse;
}

export function useDashboardCurriculum() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard-curriculum'],
    queryFn: fetchDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
