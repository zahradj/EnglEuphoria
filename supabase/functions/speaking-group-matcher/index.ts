import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { student_id, preferred_time, create_new_group = false } = await req.json();

    // Get student's speaking profile
    const { data: profile } = await supabase
      .from('student_speaking_profiles')
      .select('*')
      .eq('student_id', student_id)
      .single();

    if (!profile) {
      // Create default profile if doesn't exist
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', student_id)
        .single();

      if (user) {
        await supabase
          .from('student_speaking_profiles')
          .insert({
            student_id,
            current_cefr_level: 'A2', // Default level
            confidence_level: 'medium',
            preferred_topics: ['general', 'culture'],
            speaking_goals: ['fluency', 'vocabulary']
          });
      }
    }

    const studentLevel = profile?.current_cefr_level || 'A2';

    if (create_new_group) {
      // Create a new group for this student
      const { data: newGroup, error } = await supabase
        .from('speaking_groups')
        .insert({
          group_name: `${studentLevel} Speaking Practice Group`,
          cefr_level: studentLevel,
          max_participants: 6,
          session_duration: 45,
          topic_category: 'general',
          created_by: student_id
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create group: ${error.message}`);
      }

      // Add student as first participant
      await supabase
        .from('speaking_group_participants')
        .insert({
          group_id: newGroup.id,
          student_id
        });

      return new Response(JSON.stringify({
        recommended_groups: [newGroup],
        created_new_group: true,
        message: 'Created new group for your level!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find suitable existing groups
    const { data: suitableGroups } = await supabase
      .from('speaking_groups')
      .select(`
        *,
        speaking_group_participants!inner(count)
      `)
      .eq('cefr_level', studentLevel)
      .eq('is_active', true)
      .lt('current_participants', 6) // Not full
      .order('current_participants', { ascending: false }); // Prefer fuller groups

    // Also check adjacent levels for better matching
    const adjacentLevels = getAdjacentLevels(studentLevel);
    const { data: adjacentGroups } = await supabase
      .from('speaking_groups')
      .select('*')
      .in('cefr_level', adjacentLevels)
      .eq('is_active', true)
      .lt('current_participants', 6)
      .limit(3);

    // Score and rank groups
    const allGroups = [...(suitableGroups || []), ...(adjacentGroups || [])];
    const scoredGroups = allGroups.map(group => ({
      ...group,
      compatibility_score: calculateCompatibilityScore(group, profile),
      reasons: getMatchingReasons(group, profile)
    }));

    // Sort by compatibility score
    const recommendedGroups = scoredGroups
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 5);

    console.log(`Found ${recommendedGroups.length} suitable groups for student ${student_id} at ${studentLevel} level`);

    return new Response(JSON.stringify({
      recommended_groups: recommendedGroups,
      student_level: studentLevel,
      available_time_slots: generateTimeSlots()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in speaking-group-matcher:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getAdjacentLevels(level: string): string[] {
  const levels = ['Pre-A1', 'A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2'];
  const currentIndex = levels.indexOf(level);
  
  const adjacent = [];
  if (currentIndex > 0) adjacent.push(levels[currentIndex - 1]);
  if (currentIndex < levels.length - 1) adjacent.push(levels[currentIndex + 1]);
  
  return adjacent;
}

function calculateCompatibilityScore(group: any, profile: any): number {
  let score = 100;

  // Level match bonus
  if (group.cefr_level === profile?.current_cefr_level) {
    score += 50;
  } else {
    score += 20; // Adjacent level penalty
  }

  // Group size preference (4-5 participants is optimal)
  if (group.current_participants >= 3 && group.current_participants <= 5) {
    score += 30;
  } else if (group.current_participants === 2) {
    score += 20;
  } else {
    score += 10;
  }

  // Topic category match
  if (profile?.preferred_topics?.includes(group.topic_category)) {
    score += 25;
  }

  // Recent activity bonus
  const daysSinceCreation = Math.floor((Date.now() - new Date(group.created_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreation <= 7) {
    score += 15; // New groups get priority
  }

  return Math.min(score, 200); // Cap at 200
}

function getMatchingReasons(group: any, profile: any): string[] {
  const reasons = [];

  if (group.cefr_level === profile?.current_cefr_level) {
    reasons.push('Perfect level match');
  } else {
    reasons.push('Compatible level');
  }

  if (group.current_participants >= 3 && group.current_participants <= 5) {
    reasons.push('Optimal group size');
  } else if (group.current_participants === 2) {
    reasons.push('Small, intimate group');
  } else if (group.current_participants === 1) {
    reasons.push('You would be the second member');
  }

  if (profile?.preferred_topics?.includes(group.topic_category)) {
    reasons.push('Matches your interests');
  }

  if (group.session_duration === 45) {
    reasons.push('Standard session length');
  }

  return reasons;
}

function generateTimeSlots(): string[] {
  const slots = [];
  const now = new Date();
  
  // Generate next 7 days of time slots
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    
    // Common speaking practice times (avoiding very early/late hours)
    const times = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'];
    
    for (const time of times) {
      const slot = `${date.toISOString().split('T')[0]}T${time}:00`;
      slots.push(slot);
    }
  }
  
  return slots;
}