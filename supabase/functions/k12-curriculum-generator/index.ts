import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openaiApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, batchSize = 20 } = await req.json();
    
    console.log('🏗️ K12 Curriculum Generator request:', { action, batchSize });

    if (action === 'generate_full_curriculum') {
      return await generateFullK12Curriculum(supabase, batchSize);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use generate_full_curriculum' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in K12 curriculum generator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateFullK12Curriculum(supabase: any, batchSize: number) {
  console.log('🎓 Starting full K12 curriculum generation (324 lessons)...');
  
  try {
    // Get curriculum levels
    const { data: levels, error: levelsError } = await supabase
      .from('curriculum_levels')
      .select('*')
      .order('level_order');
    
    if (levelsError) throw new Error(`Failed to fetch levels: ${levelsError.message}`);
    
    const k12Levels = levels.filter(level => 
      ['Pre-A1', 'A1', 'A2', 'B1'].includes(level.cefr_level)
    );
    
    if (k12Levels.length === 0) {
      // Create K12 levels if they don't exist
      await createK12Levels(supabase);
      return await generateFullK12Curriculum(supabase, batchSize);
    }

    let totalGenerated = 0;
    const errors = [];

    // Generate for each level
    for (const level of k12Levels) {
      console.log(`📚 Generating curriculum for ${level.cefr_level} (${getAgeGroup(level.cefr_level)})...`);
      
      const modules = getModulesForLevel(level.cefr_level);
      
      for (let moduleNum = 1; moduleNum <= 9; moduleNum++) {
        const moduleTheme = modules[moduleNum - 1];
        
        // Generate 9 lessons per module
        for (let lessonNum = 1; lessonNum <= 9; lessonNum++) {
          try {
            const lessonData = await generateK12Lesson(
              level, 
              moduleNum, 
              lessonNum, 
              moduleTheme
            );
            
            const { error: insertError } = await supabase
              .from('systematic_lessons')
              .insert(lessonData);
            
            if (insertError) {
              throw new Error(`Insert failed: ${insertError.message}`);
            }
            
            totalGenerated++;
            console.log(`✅ Generated: ${level.cefr_level} M${moduleNum}L${lessonNum} - ${lessonData.title}`);
            
          } catch (error) {
            console.error(`❌ Failed to generate lesson ${level.cefr_level} M${moduleNum}L${lessonNum}:`, error);
            errors.push(`${level.cefr_level} M${moduleNum}L${lessonNum}: ${error.message}`);
          }
          
          // Rate limiting
          if (totalGenerated % batchSize === 0) {
            console.log(`⏳ Processed ${totalGenerated} lessons, pausing...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }

    console.log(`🎉 K12 curriculum generation complete! Generated ${totalGenerated} lessons.`);

    return new Response(
      JSON.stringify({
        success: true,
        total_generated: totalGenerated,
        levels_created: k12Levels.length,
        modules_per_level: 9,
        lessons_per_module: 9,
        expected_total: 324,
        errors: errors,
        message: `Successfully generated ${totalGenerated}/324 lessons for the 1:1 Kids Program`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ K12 curriculum generation failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate K12 curriculum',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createK12Levels(supabase: any) {
  const k12Levels = [
    {
      name: 'Early Learners',
      cefr_level: 'Pre-A1',
      age_group: '4-6',
      description: 'First words and simple sentences for young children',
      level_order: 1,
      xp_required: 0,
      estimated_hours: 60
    },
    {
      name: 'Beginning English',
      cefr_level: 'A1',
      age_group: '6-9',
      description: 'Basic English communication for children',
      level_order: 2,
      xp_required: 500,
      estimated_hours: 80
    },
    {
      name: 'Elementary English',
      cefr_level: 'A2',
      age_group: '9-12',
      description: 'Building confidence in English conversations',
      level_order: 3,
      xp_required: 1200,
      estimated_hours: 100
    },
    {
      name: 'Intermediate English',
      cefr_level: 'B1',
      age_group: '12-15',
      description: 'Independent English communication for teens',
      level_order: 4,
      xp_required: 2000,
      estimated_hours: 120
    }
  ];

  for (const level of k12Levels) {
    const { error } = await supabase
      .from('curriculum_levels')
      .insert(level);
    
    if (error && !error.message.includes('duplicate')) {
      throw new Error(`Failed to create level ${level.cefr_level}: ${error.message}`);
    }
  }
}

async function generateK12Lesson(level: any, moduleNum: number, lessonNum: number, moduleTheme: string) {
  const sentencePatterns = getSentencePatternsForLevel(level.cefr_level, moduleNum);
  const vocabulary = getVocabularyForTheme(moduleTheme, level.cefr_level);
  
  const lessonData = {
    curriculum_level_id: level.id,
    lesson_number: (moduleNum - 1) * 9 + lessonNum,
    title: `${level.cefr_level} M${moduleNum}L${lessonNum}: ${moduleTheme} - ${sentencePatterns[0]}`,
    topic: moduleTheme,
    grammar_focus: sentencePatterns[0],
    vocabulary_set: vocabulary,
    communication_outcome: `Use ${sentencePatterns[0].toLowerCase()} to talk about ${moduleTheme.toLowerCase()}`,
    lesson_objectives: [
      `Build sentences using ${sentencePatterns[0]}`,
      `Use vocabulary about ${moduleTheme.toLowerCase()}`,
      `Speak confidently about ${moduleTheme.toLowerCase()}`
    ],
    slides_content: await generateK12SlidesContent(level, moduleTheme, sentencePatterns, vocabulary),
    activities: [],
    gamified_elements: {
      sticker_rewards: true,
      progress_tracking: true,
      celebration_moments: 3
    },
    is_review_lesson: lessonNum === 9,
    prerequisite_lessons: [],
    difficulty_level: getDifficultyLevel(level.cefr_level),
    estimated_duration: getEstimatedDuration(level.cefr_level),
    status: 'published'
  };

  return lessonData;
}

function getAgeGroup(cefrLevel: string): string {
  const ageGroups = {
    'Pre-A1': '4-6',
    'A1': '6-9', 
    'A2': '9-12',
    'B1': '12-15'
  };
  return ageGroups[cefrLevel as keyof typeof ageGroups] || '6-9';
}

function getModulesForLevel(cefrLevel: string): string[] {
  const modules = {
    'Pre-A1': ['Me & My Family', 'Colors & Toys', 'Animals', 'Food', 'My House', 'My Body', 'Weather', 'School Things', 'Review'],
    'A1': ['Daily Routines', 'Places', 'Hobbies', 'Clothes', 'Time & Days', 'Likes/Dislikes', 'Holidays', 'Travel', 'Review'],
    'A2': ['Past Stories', 'Future Plans', 'Describing People/Places', 'Health', 'Shopping', 'Directions', 'Media', 'Projects', 'Review'], 
    'B1': ['Opinions', 'Problem Solving', 'Study Skills', 'Technology', 'Environment', 'Culture', 'Narrative Writing', 'Presentations', 'Review']
  };
  return modules[cefrLevel as keyof typeof modules] || modules['A1'];
}

function getSentencePatternsForLevel(cefrLevel: string, moduleNum: number): string[] {
  const patterns = {
    'Pre-A1': ['I am...', 'This is...', 'I like...', 'There is...', 'I can...', 'It is...', 'I have...', 'Where is...?', 'Review patterns'],
    'A1': ['I do...', 'I have...', 'I can...', 'She/He is...', 'We go...', 'I like/don\'t like...', 'When do you...?', 'How often...?', 'Mixed practice'],
    'A2': ['I went...', 'I will...', 'bigger than...', 'I gave him...', 'If I...', 'I looked up...', 'I was doing...', 'I have been...', 'Complex patterns'],
    'B1': ['I have done...', 'I am doing...', 'The person who...', 'You should...', 'However,...', 'Therefore,...', 'Although...', 'In my opinion...', 'Advanced patterns']
  };
  return patterns[cefrLevel as keyof typeof patterns] || patterns['A1'];
}

function getVocabularyForTheme(theme: string, cefrLevel: string): string[] {
  // Simplified vocabulary generation - in production this would be more sophisticated
  const baseWords = theme.toLowerCase().split(' ').slice(0, 2);
  const levelMultiplier = { 'Pre-A1': 3, 'A1': 4, 'A2': 5, 'B1': 6 }[cefrLevel] || 4;
  
  return Array.from({ length: levelMultiplier }, (_, i) => `${baseWords[0]}_word_${i + 1}`);
}

async function generateK12SlidesContent(level: any, theme: string, patterns: string[], vocabulary: string[]) {
  // Generate slides using new K12 schema
  const slides = [];
  const ageGroup = getAgeGroup(level.cefr_level);
  const isEarlyAge = ageGroup.includes('4-6');
  
  // Warmup slide
  slides.push({
    id: 'slide-1',
    type: 'warmup',
    prompt: `Let's talk about ${theme}!`,
    instructions: `Spend 60 seconds discussing ${theme} with pictures.`,
    media: { type: 'image', url: 'placeholder-warmup.jpg', alt: `${theme} picture` },
    timeLimit: 60,
    accessibility: { largeText: isEarlyAge }
  });
  
  // Add more slides following the 10-12 slide blueprint...
  // This is simplified for the demo
  
  return {
    version: '2.0',
    theme: 'mist-blue',
    slides: slides,
    durationMin: getEstimatedDuration(level.cefr_level),
    metadata: {
      CEFR: level.cefr_level,
      module: 1,
      lesson: 1,
      targets: patterns,
      weights: { accuracy: 60, fluency: 40 }
    }
  };
}

function getDifficultyLevel(cefrLevel: string): number {
  const levels = { 'Pre-A1': 1, 'A1': 2, 'A2': 3, 'B1': 4 };
  return levels[cefrLevel as keyof typeof levels] || 2;
}

function getEstimatedDuration(cefrLevel: string): number {
  const durations = { 'Pre-A1': 25, 'A1': 30, 'A2': 35, 'B1': 40 };
  return durations[cefrLevel as keyof typeof durations] || 30;
}