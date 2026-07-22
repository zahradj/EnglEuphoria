import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CEFR level distributions (total 308 lessons)
const CEFR_DISTRIBUTIONS = {
  'Pre-A1': { lessons: 35, modules: 7 },   // 5 lessons per module
  'A1': { lessons: 40, modules: 8 },       // 5 lessons per module  
  'A1+': { lessons: 40, modules: 8 },      // 5 lessons per module
  'A2': { lessons: 45, modules: 9 },       // 5 lessons per module
  'A2+': { lessons: 45, modules: 9 },      // 5 lessons per module
  'B1': { lessons: 48, modules: 8 },       // 6 lessons per module
  'B1+': { lessons: 30, modules: 6 },      // 5 lessons per module
  'B2': { lessons: 25, modules: 5 }        // 5 lessons per module
};

const MODULE_THEMES = {
  'Pre-A1': [
    'First Steps: Greetings and Self-Introduction',
    'Family and Me: Basic Personal Information', 
    'My Day: Daily Activities and Time',
    'Food and Drinks: Basic Needs',
    'Home Sweet Home: Places and Locations',
    'Colors and Numbers: Basic Concepts',
    'Body and Health: Basic Vocabulary'
  ],
  'A1': [
    'Getting to Know You: Personal Details',
    'Daily Routines: Present Simple Mastery',
    'Shopping and Money: Practical Transactions',
    'Weather and Seasons: Describing the World',
    'Transportation: Getting Around',
    'Hobbies and Free Time: Personal Interests',
    'Past and Present: Basic Time Concepts',
    'Future Plans: Simple Future Forms'
  ],
  'A1+': [
    'Travel Basics: Planning a Trip',
    'Work and Jobs: Professional Vocabulary',
    'Health and Body: Medical Basics',
    'Clothing and Fashion: Personal Style',
    'Education and Learning: School Topics',
    'Technology in Daily Life: Digital Basics',
    'Culture and Traditions: Social Awareness',
    'Emergency Situations: Practical Help'
  ],
  'A2': [
    'Relationships and People: Social Connections',
    'Past Experiences: Past Tenses Mastery',
    'Making Comparisons: Comparative Structures',
    'Giving Advice: Modal Verbs for Suggestions',
    'Entertainment and Media: Leisure Activities',
    'Environment and Nature: World Awareness',
    'Problems and Solutions: Practical Skills',
    'Dreams and Ambitions: Future Aspirations',
    'Cultural Differences: Global Perspectives'
  ],
  'A2+': [
    'Advanced Travel: International Experiences',
    'Work Skills: Professional Development',
    'Health and Fitness: Lifestyle Choices',
    'Money and Finance: Personal Economics',
    'Technology and Innovation: Modern Life',
    'Social Issues: Community Awareness',
    'Learning Strategies: Educational Growth',
    'Personal Growth: Self-Improvement',
    'Global Communication: Cross-Cultural Skills'
  ],
  'B1': [
    'Effective Communication: Advanced Speaking',
    'Critical Thinking: Analyzing Information',
    'Professional Skills: Workplace English',
    'Academic Success: Study Strategies',
    'Cultural Intelligence: Global Citizenship',
    'Problem-Solving: Practical Applications',
    'Media Literacy: Information Processing',
    'Leadership and Teamwork: Collaborative Skills'
  ],
  'B1+': [
    'Advanced Grammar: Complex Structures',
    'Presentation Skills: Public Speaking',
    'Negotiation: Persuasive Communication',
    'Research Skills: Information Gathering',
    'Creative Expression: Artistic Communication',
    'Digital Literacy: Online Communication'
  ],
  'B2': [
    'Professional Presentations: Advanced Speaking',
    'Academic Writing: Research and Analysis',
    'Cross-Cultural Communication: Global Skills',
    'Critical Media Analysis: Information Evaluation',
    'Advanced Problem-Solving: Complex Situations'
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create a new generation job
    const { data: job, error: jobError } = await supabase
      .from('content_generation_jobs')
      .insert({
        job_type: 'systematic_curriculum_batch',
        total_items: 308,
        metadata: {
          description: 'Generating complete systematic curriculum with 308 lessons across 8 CEFR levels',
          cefr_distributions: CEFR_DISTRIBUTIONS
        }
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      throw jobError;
    }

    console.log('Starting systematic curriculum generation, job ID:', job.id);

    // Start background generation
    generateCurriculumInBackground(job.id, supabase);

    return new Response(JSON.stringify({
      success: true,
      job_id: job.id,
      message: 'Systematic curriculum generation started',
      total_lessons: 308
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in systematic curriculum batch:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateCurriculumInBackground(jobId: string, supabase: any) {
  try {
    // Update job status to running
    await supabase
      .from('content_generation_jobs')
      .update({ status: 'running' })
      .eq('id', jobId);

    // Ensure CEFR levels exist
    await ensureCEFRLevels(supabase);

    let totalProcessed = 0;
    let totalFailed = 0;

    // Generate lessons for each CEFR level
    for (const [cefrLevel, distribution] of Object.entries(CEFR_DISTRIBUTIONS)) {
      console.log(`Processing ${cefrLevel}: ${distribution.lessons} lessons in ${distribution.modules} modules`);
      
      const themes = MODULE_THEMES[cefrLevel as keyof typeof MODULE_THEMES];
      const lessonsPerModule = Math.floor(distribution.lessons / distribution.modules);
      
      for (let moduleIndex = 0; moduleIndex < distribution.modules; moduleIndex++) {
        const theme = themes[moduleIndex];
        const moduleLessons = moduleIndex === distribution.modules - 1 
          ? distribution.lessons - (moduleIndex * lessonsPerModule) // Last module gets remaining lessons
          : lessonsPerModule;

        for (let lessonIndex = 1; lessonIndex <= moduleLessons; lessonIndex++) {
          try {
            await generateSingleLesson(supabase, cefrLevel, moduleIndex + 1, lessonIndex, theme);
            totalProcessed++;
            
            // Update progress every 5 lessons
            if (totalProcessed % 5 === 0) {
              const progressPercentage = (totalProcessed / 308) * 100;
              await supabase
                .from('content_generation_jobs')
                .update({ 
                  processed_items: totalProcessed,
                  failed_items: totalFailed,
                  progress_percentage: progressPercentage
                })
                .eq('id', jobId);
            }

            // Rate limiting: wait 2 seconds between lessons
            await new Promise(resolve => setTimeout(resolve, 2000));

          } catch (error) {
            console.error(`Failed to generate lesson ${lessonIndex} in module ${moduleIndex + 1} for ${cefrLevel}:`, error);
            totalFailed++;
          }
        }
      }
    }

    // Mark job as completed
    await supabase
      .from('content_generation_jobs')
      .update({ 
        status: 'completed',
        processed_items: totalProcessed,
        failed_items: totalFailed,
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`Curriculum generation completed. Processed: ${totalProcessed}, Failed: ${totalFailed}`);

  } catch (error) {
    console.error('Error in background generation:', error);
    
    // Mark job as failed
    await supabase
      .from('content_generation_jobs')
      .update({ 
        status: 'failed',
        error_details: (error as Error).message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

async function ensureCEFRLevels(supabase: any) {
  const cefrLevels = [
    { name: 'Pre-A1', cefr_level: 'Pre-A1', age_group: 'Young Learners', description: 'Complete beginners', level_order: 1 },
    { name: 'A1', cefr_level: 'A1', age_group: 'Elementary', description: 'Breakthrough or beginner', level_order: 2 },
    { name: 'A1+', cefr_level: 'A1+', age_group: 'Elementary', description: 'High beginner', level_order: 3 },
    { name: 'A2', cefr_level: 'A2', age_group: 'Elementary', description: 'Waystage or elementary', level_order: 4 },
    { name: 'A2+', cefr_level: 'A2+', age_group: 'Elementary', description: 'High elementary', level_order: 5 },
    { name: 'B1', cefr_level: 'B1', age_group: 'Intermediate', description: 'Threshold or intermediate', level_order: 6 },
    { name: 'B1+', cefr_level: 'B1+', age_group: 'Intermediate', description: 'High intermediate', level_order: 7 },
    { name: 'B2', cefr_level: 'B2', age_group: 'Upper-Intermediate', description: 'Vantage or upper intermediate', level_order: 8 }
  ];

  for (const level of cefrLevels) {
    const { error } = await supabase
      .from('curriculum_levels')
      .upsert(level, { onConflict: 'cefr_level' });
    
    if (error) {
      console.error(`Error upserting level ${level.cefr_level}:`, error);
    }
  }
}

async function generateSingleLesson(supabase: any, cefrLevel: string, moduleNumber: number, lessonNumber: number, theme: string) {
  // Get the curriculum level ID
  const { data: levelData, error: levelError } = await supabase
    .from('curriculum_levels')
    .select('id')
    .eq('cefr_level', cefrLevel)
    .single();

  if (levelError) {
    throw new Error(`Could not find curriculum level for ${cefrLevel}`);
  }

  // Generate lesson metadata using OpenAI
  const lessonData = await generateLessonWithAI(cefrLevel, moduleNumber, lessonNumber, theme);

  // Insert the lesson
  const { error: insertError } = await supabase
    .from('systematic_lessons')
    .insert({
      curriculum_level_id: levelData.id,
      lesson_number: ((moduleNumber - 1) * 10) + lessonNumber, // Unique lesson number
      title: lessonData.title,
      topic: lessonData.topic,
      learning_objective: lessonData.learning_objective,
      communication_outcome: lessonData.communication_outcome,
      grammar_focus: lessonData.grammar_focus,
      vocabulary: lessonData.vocabulary,
      estimated_duration: lessonData.estimated_duration,
      difficulty: lessonData.difficulty,
      status: 'draft',
      slides_content: null // Will be generated later when user requests slides
    });

  if (insertError) {
    throw insertError;
  }

  console.log(`Generated lesson: ${lessonData.title} (${cefrLevel}, Module ${moduleNumber}, Lesson ${lessonNumber})`);
}

async function generateLessonWithAI(cefrLevel: string, moduleNumber: number, lessonNumber: number, theme: string) {
  const prompt = `Create a comprehensive ESL lesson for ${cefrLevel} level students.

Module ${moduleNumber}: ${theme}
Lesson ${lessonNumber}

Requirements:
- Age-appropriate for ${cefrLevel} level
- Focus on practical, real-life communication
- Balance all skills: grammar, reading, writing, listening, speaking
- Include accuracy and fluency components
- Should be engaging and interactive

Please provide a JSON response with these fields:
{
  "title": "Engaging lesson title (max 60 characters)",
  "topic": "Specific topic focus (max 40 characters)", 
  "learning_objective": "What students will learn (max 150 characters)",
  "communication_outcome": "What students will be able to communicate (max 150 characters)",
  "grammar_focus": "Main grammar points covered (max 100 characters)",
  "vocabulary": ["array", "of", "8-12", "key", "vocabulary", "words"],
  "estimated_duration": 45,
  "difficulty": 3
}

Make it practical and immediately useful for real communication.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse AI response');
    
  } catch (error) {
    console.error('Error generating lesson with AI:', error);
    
    // Fallback lesson data
    return {
      title: `${theme} - Lesson ${lessonNumber}`,
      topic: theme.split(':')[0],
      learning_objective: `Master key concepts in ${theme.toLowerCase()}`,
      communication_outcome: `Communicate effectively about ${theme.toLowerCase()}`,
      grammar_focus: `${cefrLevel} level grammar structures`,
      vocabulary: ["communication", "practice", "learn", "speak", "understand", "improve", "express", "develop"],
      estimated_duration: 45,
      difficulty: cefrLevel.includes('A1') ? 2 : cefrLevel.includes('A2') ? 3 : 4
    };
  }
}