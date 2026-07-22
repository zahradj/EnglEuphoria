import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { requireAuth } from '../_shared/authGuard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define lesson themes per level (10 topics per module, cycling through 6 modules)
const levelThemes = {
  1: [ // A1 - Foundations
    'Greetings and Introductions', 'Numbers and Time', 'Classroom Language', 'Personal Information',
    'Daily Routines', 'Basic Shopping', 'Food and Drink', 'Family Members', 'Colors and Objects', 'Review & Consolidation'
  ],
  2: [ // A2 - Building Communication
    'Family and Relationships', 'Hobbies and Interests', 'Health and Body', 'Shopping and Money',
    'Weather and Seasons', 'Transportation', 'Food Ordering', 'Places in Town', 'Simple Past Events', 'Review & Consolidation'
  ],
  3: [ // B1 - Practical Conversations
    'Travel and Holidays', 'Making Comparisons', 'Future Plans', 'Preferences and Opinions',
    'Invitations and Suggestions', 'Telling Stories', 'Weather Reports', 'Relationships', 'Problem Solving', 'Review & Consolidation'
  ],
  4: [ // B2 - Fluency Development
    'Work and Career', 'Current Events', 'Technology', 'Environmental Issues',
    'Social Problems', 'Media and Entertainment', 'Cultural Differences', 'Health and Lifestyle', 'Education', 'Review & Consolidation'
  ],
  5: [ // C1 - Precision and Nuance
    'Business and Economy', 'Science and Innovation', 'Global Issues', 'Arts and Literature',
    'Politics and Society', 'Psychology and Behavior', 'Ethics and Philosophy', 'Communication Skills', 'Research and Analysis', 'Review & Consolidation'
  ],
  6: [ // C2 - Advanced Communication
    'Academic Writing', 'Professional Presentations', 'Critical Analysis', 'Advanced Grammar',
    'Idiomatic Expressions', 'Debate and Argumentation', 'Literature Analysis', 'Complex Problem Solving', 'Cultural Studies', 'Review & Consolidation'
  ],
  7: [ // C2+ Mastery
    'Business Leadership', 'Academic Research', 'Public Speaking', 'Creative Writing',
    'Cross-Cultural Communication', 'Advanced Negotiations', 'Literary Criticism', 'Professional Development', 'Capstone Projects', 'Review & Consolidation'
  ]
};

const cefrMapping = {
  1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2', 7: 'C2'
};

const difficultyMapping = {
  1: 'beginner', 2: 'elementary', 3: 'intermediate', 4: 'upper-intermediate', 
  5: 'advanced', 6: 'proficiency', 7: 'mastery'
};

function generateLearningObjectives(level: number, topic: string): string[] {
  const baseObjectives = {
    1: [`Use basic ${topic.toLowerCase()} vocabulary`, `Form simple sentences about ${topic.toLowerCase()}`, `Understand basic ${topic.toLowerCase()} concepts`],
    2: [`Describe ${topic.toLowerCase()} in detail`, `Ask and answer questions about ${topic.toLowerCase()}`, `Use past and present tenses correctly`],
    3: [`Express opinions about ${topic.toLowerCase()}`, `Compare and contrast ${topic.toLowerCase()}`, `Use future forms appropriately`],
    4: [`Discuss ${topic.toLowerCase()} fluently`, `Analyze ${topic.toLowerCase()} critically`, `Use conditional structures`],
    5: [`Evaluate ${topic.toLowerCase()} systematically`, `Present complex ideas about ${topic.toLowerCase()}`, `Use advanced vocabulary precisely`],
    6: [`Synthesize information about ${topic.toLowerCase()}`, `Argue persuasively about ${topic.toLowerCase()}`, `Demonstrate stylistic awareness`],
    7: [`Lead discussions on ${topic.toLowerCase()}`, `Create original content about ${topic.toLowerCase()}`, `Master specialized terminology`]
  };
  return (baseObjectives as Record<number, string[]>)[level] || baseObjectives[7];
}

function generateVocabulary(level: number, topic: string): string[] {
  const vocabularyBanks = {
    1: ['hello', 'goodbye', 'please', 'thank you', 'yes', 'no', 'good', 'bad'],
    2: ['important', 'interesting', 'difficult', 'easy', 'expensive', 'cheap', 'beautiful', 'ugly'],
    3: ['however', 'although', 'because', 'therefore', 'compare', 'contrast', 'opinion', 'prefer'],
    4: ['nevertheless', 'furthermore', 'consequently', 'significant', 'analyze', 'evaluate', 'perspective', 'approach'],
    5: ['comprehensive', 'sophisticated', 'substantial', 'implications', 'methodology', 'framework', 'paradigm', 'phenomenon'],
    6: ['paradigmatic', 'substantiate', 'corroborate', 'extrapolate', 'synthesize', 'conceptualize', 'articulate', 'scrutinize'],
    7: ['elucidate', 'exemplify', 'substantive', 'nuanced', 'multifaceted', 'comprehensive', 'systematic', 'sophisticated']
  };
  return (vocabularyBanks as Record<number, string[]>)[level] || vocabularyBanks[7];
}

function generateGrammarFocus(level: number): string[] {
  const grammarTopics = {
    1: ['Present simple tense', 'Basic pronouns', 'Articles (a, an, the)'],
    2: ['Past simple tense', 'Present continuous', 'Comparative adjectives'],
    3: ['Future forms', 'Present perfect', 'Modal verbs (can, should, must)'],
    4: ['Conditional sentences', 'Passive voice', 'Relative clauses'],
    5: ['Mixed conditionals', 'Advanced modals', 'Subjunctive mood'],
    6: ['Complex sentence structures', 'Discourse markers', 'Stylistic devices'],
    7: ['Advanced syntax', 'Rhetorical structures', 'Register variation']
  };
  return (grammarTopics as Record<number, string[]>)[level] || grammarTopics[7];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req, { allowedRoles: ['admin'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action = 'seed_420_lessons' } = await req.json();
    console.log(`📚 Bulk lesson generator action: ${action}`);

    if (action === 'clear_seeded_lessons') {
      // Clear lessons that have metadata.level_index (seeded lessons)
      const { error } = await supabase
        .from('lessons_content')
        .delete()
        .not('metadata->level_index', 'is', null);

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Seeded lessons cleared successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'seed_420_lessons') {
      console.log('🌱 Starting to seed 420 systematic lessons...');
      let totalInserted = 0;
      let skipped = 0;

      // Generate lessons for all 7 levels
      for (let level = 1; level <= 7; level++) {
        const cefrLevel = cefrMapping[level];
        const difficulty = difficultyMapping[level];
        const themes = levelThemes[level];
        
        console.log(`📖 Processing Level ${level} (${cefrLevel}) - ${difficulty}`);

        // 6 modules per level, 10 lessons per module = 60 lessons per level
        for (let module = 1; module <= 6; module++) {
          for (let lesson = 1; lesson <= 10; lesson++) {
            const themeIndex = (lesson - 1) % 10;
            const topic = themes[themeIndex];
            const isConsolidation = lesson === 10;
            
            const title = isConsolidation 
              ? `${topic} - Module ${module}`
              : `${topic} - Lesson ${lesson}`;

            // Check if lesson already exists (idempotency)
            const { data: existing } = await supabase
              .from('lessons_content')
              .select('id')
              .eq('cefr_level', cefrLevel)
              .eq('module_number', module)
              .eq('lesson_number', lesson)
              .eq('title', title)
              .single();

            if (existing) {
              skipped++;
              continue;
            }

            const lessonData = {
              title,
              topic,
              cefr_level: cefrLevel,
              module_number: module,
              lesson_number: lesson,
              duration_minutes: 30,
              learning_objectives: generateLearningObjectives(level, topic),
              vocabulary_focus: generateVocabulary(level, topic),
              grammar_focus: generateGrammarFocus(level),
              difficulty_level: difficulty,
              slides_content: {}, // Empty JSON for later slide generation
              is_active: true,
              metadata: {
                level_index: level,
                consolidation: isConsolidation,
                teacher_notes: `Level ${level} lesson focusing on ${topic}. Duration: 30 minutes with 20-25 interactive slides.`
              }
            };

            const { error } = await supabase
              .from('lessons_content')
              .insert(lessonData);

            if (error) {
              console.error(`❌ Error inserting lesson ${title}:`, error);
              throw error;
            }

            totalInserted++;
          }
        }
      }

      console.log(`✅ Lesson seeding complete! Inserted: ${totalInserted}, Skipped: ${skipped}`);

      return new Response(JSON.stringify({
        success: true,
        message: `Successfully seeded ${totalInserted} lessons (skipped ${skipped} duplicates)`,
        stats: {
          total_levels: 7,
          lessons_per_level: 60,
          total_lessons: 420,
          inserted: totalInserted,
          skipped: skipped
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use "seed_420_lessons" or "clear_seeded_lessons"' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in bulk-lesson-generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process bulk lesson operation'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});