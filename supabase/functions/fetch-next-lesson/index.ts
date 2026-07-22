import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentProfile {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  current_cefr_level: string;
  last_completed_sequence_prea1: number;
  last_completed_sequence_a1: number;
  last_completed_sequence_a2: number;
  last_completed_sequence_b1: number;
  last_completed_sequence_b2: number;
}

function calculateAgeGroup(dateOfBirth: string | null): string {
  if (!dateOfBirth) return '5-7'; // Default for young learners
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 8) return '5-7';
  if (age < 11) return '8-10';
  return '11+';
}

function getLastCompletedSequence(profile: StudentProfile, cefrLevel: string): number {
  switch (cefrLevel.toLowerCase().replace('-', '')) {
    case 'prea1':
    case 'pre-a1':
      return profile.last_completed_sequence_prea1 || 0;
    case 'a1':
      return profile.last_completed_sequence_a1 || 0;
    case 'a2':
      return profile.last_completed_sequence_a2 || 0;
    case 'b1':
      return profile.last_completed_sequence_b1 || 0;
    case 'b2':
      return profile.last_completed_sequence_b2 || 0;
    default:
      return 0;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { studentId } = await req.json();

    if (!studentId) {
      console.error('[fetch-next-lesson] Missing studentId');
      return new Response(
        JSON.stringify({ error: 'Student ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only the student themself, or an admin/teacher, may fetch this progress data.
    const authHeader = req.headers.get('Authorization') ?? '';
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !caller) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (caller.id !== studentId) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', caller.id);
      const isStaff = (roles ?? []).some((r: any) => r.role === 'admin' || r.role === 'teacher');
      if (!isStaff) {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`[fetch-next-lesson] Fetching next lesson for student: ${studentId}`);

    // 1. Fetch student profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileError) {
      console.error('[fetch-next-lesson] Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch student profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      console.log('[fetch-next-lesson] No profile found, returning default lesson');
      // Return first lesson for new students
      const { data: defaultLesson, error: defaultError } = await supabase
        .from('interactive_lessons')
        .select('*')
        .eq('status', 'published')
        .eq('cefr_level', 'Pre-A1')
        .eq('age_group', '5-7')
        .order('sequence_number', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (defaultError || !defaultLesson) {
        return new Response(
          JSON.stringify({ error: 'No lessons available', lesson: null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ lesson: defaultLesson, isFirstLesson: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Calculate age group
    const ageGroup = calculateAgeGroup(profile.date_of_birth);
    const cefrLevel = profile.current_cefr_level || 'Pre-A1';
    
    console.log(`[fetch-next-lesson] Student age group: ${ageGroup}, CEFR level: ${cefrLevel}`);

    // 3. Get last completed sequence
    const lastCompletedSeq = getLastCompletedSequence(profile, cefrLevel);
    const nextSequence = lastCompletedSeq + 1;
    
    console.log(`[fetch-next-lesson] Last completed: ${lastCompletedSeq}, looking for sequence: ${nextSequence}`);

    // 4. Query for the next lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('interactive_lessons')
      .select('*')
      .eq('status', 'published')
      .eq('cefr_level', cefrLevel)
      .eq('age_group', ageGroup)
      .eq('sequence_number', nextSequence)
      .maybeSingle();

    if (lessonError) {
      console.error('[fetch-next-lesson] Error fetching lesson:', lessonError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch lesson', details: lessonError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lesson) {
      console.log('[fetch-next-lesson] No matching lesson found for sequence', nextSequence);
      
      // Try to find the first available lesson at this level
      const { data: firstLesson } = await supabase
        .from('interactive_lessons')
        .select('*')
        .eq('status', 'published')
        .eq('cefr_level', cefrLevel)
        .eq('age_group', ageGroup)
        .order('sequence_number', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstLesson) {
        return new Response(
          JSON.stringify({ 
            lesson: firstLesson, 
            message: 'Returned first available lesson for this level',
            suggestedSequence: nextSequence
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          lesson: null, 
          message: 'No lessons available for this level and age group',
          level: cefrLevel,
          ageGroup: ageGroup,
          nextSequence: nextSequence
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fetch-next-lesson] Found lesson: ${lesson.title} (seq: ${lesson.sequence_number})`);

    return new Response(
      JSON.stringify({ 
        lesson,
        studentInfo: {
          ageGroup,
          cefrLevel,
          currentSequence: nextSequence,
          lastCompleted: lastCompletedSeq
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[fetch-next-lesson] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
