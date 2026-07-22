import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[get-dashboard] Request received');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[get-dashboard] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Step 1: Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('[get-dashboard] Auth error:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[get-dashboard] User authenticated:', user.id);

    // Step 2: Get user's current_system from their profile
    // CRITICAL: This comes from the database, NOT from query params (security!)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('current_system, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('[get-dashboard] Profile fetch error:', profileError?.message);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemTag = userProfile.current_system || 'kids'; // Default to 'kids' if not set
    console.log('[get-dashboard] User system:', systemTag);

    // Step 3: THE SECURITY FILTER - Only fetch tracks matching user's system
    // This prevents Kids from seeing Adult content and vice versa
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, name, target_system, description, thumbnail_url, order_index')
      .eq('target_system', systemTag)
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (tracksError) {
      console.error('[get-dashboard] Tracks fetch error:', tracksError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tracks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[get-dashboard] Found tracks:', tracks?.length || 0);

    // Step 4: Fetch curriculum levels for each track
    const { data: levels, error: levelsError } = await supabase
      .from('curriculum_levels')
      .select('id, name, description, cefr_level, age_group, track_id, sequence_order, thumbnail_url')
      .in('track_id', tracks?.map(t => t.id) || [])
      .order('sequence_order', { ascending: true });

    if (levelsError) {
      console.error('[get-dashboard] Levels fetch error:', levelsError.message);
    }

    // Step 5: Fetch units for the user's system
    const { data: units, error: unitsError } = await supabase
      .from('curriculum_units')
      .select('id, title, description, unit_number, cefr_level, age_group, is_published')
      .eq('age_group', systemTag)
      .eq('is_published', true)
      .order('unit_number', { ascending: true });

    if (unitsError) {
      console.error('[get-dashboard] Units fetch error:', unitsError.message);
    }

    console.log('[get-dashboard] Found units:', units?.length || 0);

    // Step 6: Fetch lessons for these units
    const unitIds = units?.map(u => u.id) || [];
    let lessons: any[] = [];
    
    if (unitIds.length > 0) {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('curriculum_lessons')
        .select('id, title, description, unit_id, sequence_order, difficulty_level, duration_minutes, xp_reward, is_published')
        .in('unit_id', unitIds)
        .eq('is_published', true)
        .eq('target_system', systemTag)
        .order('sequence_order', { ascending: true });

      if (lessonsError) {
        console.error('[get-dashboard] Lessons fetch error:', lessonsError.message);
      } else {
        lessons = lessonsData || [];
      }
    }

    console.log('[get-dashboard] Found lessons:', lessons.length);

    // Step 7: Get user's progress for these lessons
    const { data: progress, error: progressError } = await supabase
      .from('student_lesson_progress')
      .select('lesson_id, status, progress_percentage, completed_at')
      .eq('student_id', user.id);

    if (progressError) {
      console.log('[get-dashboard] Progress fetch (may not exist):', progressError.message);
    }

    const progressMap = new Map(
      (progress || []).map(p => [p.lesson_id, p])
    );

    // Step 8: Build the clean response structure
    const tracksWithContent = (tracks || []).map(track => {
      const trackLevels = (levels || []).filter(l => l.track_id === track.id);
      
      return {
        track_id: track.id,
        track_name: track.name,
        theme: getThemeForSystem(systemTag),
        description: track.description,
        thumbnail_url: track.thumbnail_url,
        levels: trackLevels.map(level => ({
          level_id: level.id,
          level_name: level.name,
          cefr_level: level.cefr_level,
          description: level.description,
        }))
      };
    });

    // Build units with lessons
    const unitsWithLessons = (units || []).map(unit => {
      const unitLessons = lessons
        .filter(l => l.unit_id === unit.id)
        .map((lesson, index) => {
          const lessonProgress = progressMap.get(lesson.id);
          let status = 'locked';
          
          if (lessonProgress?.status === 'completed') {
            status = 'completed';
          } else if (index === 0 || (lessons[index - 1] && progressMap.get(lessons[index - 1].id)?.status === 'completed')) {
            status = 'unlocked';
          }

          return {
            lesson_id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            status,
            type: getLessonType(lesson.difficulty_level),
            duration_minutes: lesson.duration_minutes,
            xp_reward: lesson.xp_reward,
            progress_percentage: lessonProgress?.progress_percentage || 0
          };
        });

      return {
        unit_id: unit.id,
        unit_title: unit.title,
        description: unit.description,
        cefr_level: unit.cefr_level,
        map_coordinates: getMapCoordinates(unit.unit_number),
        lessons: unitLessons
      };
    });

    const response = {
      system: systemTag,
      user_id: user.id,
      tracks: tracksWithContent,
      units: unitsWithLessons,
      meta: {
        total_tracks: tracksWithContent.length,
        total_units: unitsWithLessons.length,
        total_lessons: lessons.length,
        fetched_at: new Date().toISOString()
      }
    };

    console.log('[get-dashboard] Response ready, system:', systemTag);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-dashboard] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Get theme based on system
function getThemeForSystem(system: string): string {
  switch (system.toLowerCase()) {
    case 'kids':
      return 'jungle';
    case 'teens':
      return 'adventure';
    case 'adults':
    case 'hub':
      return 'minimal';
    default:
      return 'default';
  }
}

// Helper: Determine lesson type based on content
function getLessonType(difficultyLevel: string): string {
  // This can be expanded based on actual lesson content
  const types = ['video', 'game', 'quiz', 'audio', 'reading'];
  return types[Math.floor(Math.random() * types.length)];
}

// Helper: Generate map coordinates for kids world map
function getMapCoordinates(unitNumber: number): { x: number; y: number } {
  // Create a winding path for the world map
  const baseX = 100;
  const baseY = 250;
  const offsetX = (unitNumber % 2 === 0) ? 150 : -50;
  
  return {
    x: baseX + offsetX + (unitNumber * 50),
    y: baseY - (unitNumber * 80)
  };
}
