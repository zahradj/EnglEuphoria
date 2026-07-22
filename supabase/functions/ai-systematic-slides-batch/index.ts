import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { parseAIJson } from "../_shared/aiJson.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const SLIDE_PROMPT_TEMPLATE = `
You are an AI assistant creating professional and engaging lesson slides for ESL students. Generate exactly 20-22 interactive slides for this lesson.

**LESSON INFORMATION:**
- Title: {title}
- Topic: {topic}
- CEFR Level: {cefr_level}
- Module: {module_number}, Lesson: {lesson_number}
- Learning Objectives: {learning_objectives}
- Vocabulary Focus: {vocabulary_focus}
- Grammar Focus: {grammar_focus}

**SLIDE STRUCTURE (20-22 slides total):**
1. **Warm-up (2 slides):** Title slide + engaging starter activity
2. **Vocabulary Preview (3 slides):** Introduction, visual matching, interactive practice
3. **Target Language (3 slides):** Grammar explanation, examples, guided practice
4. **Listening Comprehension (2 slides):** Audio activity + comprehension check
5. **Sentence Builder (2 slides):** Drag-and-drop construction activities
6. **Grammar Focus (3 slides):** Deep dive, transformation exercises, error correction
7. **Speaking Practice (2 slides):** Controlled practice + communicative task
8. **Interactive Games (2-3 slides):** Matching, quiz, or drag-drop activities
9. **Wrap-up (1-2 slides):** Review and homework assignment

**CONTENT GUIDELINES:**
- Use simple, kid-friendly language appropriate for {cefr_level} level
- Include detailed image prompts for visual elements
- Make every slide interactive with clear instructions
- Provide teacher notes for facilitation
- Ensure cultural sensitivity and global inclusivity

**INTERACTIVE ELEMENTS TO INCLUDE:**
- Drag-and-drop activities
- Multiple choice questions
- Matching pairs
- Picture descriptions
- Fill-in-the-blank exercises
- Speaking prompts
- Listen-and-respond activities

**OUTPUT FORMAT:**
Return a valid JSON object with this exact structure:

{
  "version": "2.0",
  "theme": "mist-blue",
  "durationMin": 30,
  "metadata": {
    "CEFR": "{cefr_level}",
    "module": {module_number},
    "lesson": {lesson_number},
    "targets": {learning_objectives},
    "weights": {
      "accuracy": 60,
      "fluency": 40
    }
  },
  "slides": [
    {
      "id": "slide-1",
      "type": "warmup",
      "prompt": "Slide title and engaging question or visual",
      "instructions": "Clear instructions for teacher and students",
      "media": {
        "type": "image",
        "imagePrompt": "Detailed description for AI image generation",
        "alt": "Accessibility description"
      },
      "accessibility": {
        "screenReaderText": "Description for screen readers",
        "highContrast": true,
        "largeText": true
      }
    }
  ]
}

**SLIDE TYPES TO USE:**
- warmup, vocabulary_preview, target_language, listening_comprehension
- sentence_builder, grammar_focus, controlled_practice, communicative_task
- match, drag_drop, accuracy_mcq, picture_description, review_consolidation

Generate creative, engaging content that makes learning fun and effective!
`;

interface ProcessingResult {
  processed: number;
  inserted: number;
  skipped: number;
  failed: number;
  details: Array<{
    id: string;
    title: string;
    status: 'inserted' | 'skipped' | 'failed';
    error?: string;
  }>;
}

async function generateSlidesForLesson(lesson: any): Promise<any> {
  const prompt = SLIDE_PROMPT_TEMPLATE
    .replace(/{title}/g, lesson.title || 'Untitled Lesson')
    .replace(/{topic}/g, lesson.topic || 'General English')
    .replace(/{cefr_level}/g, lesson.cefr_level || 'A1')
    .replace(/{module_number}/g, lesson.module_number || 1)
    .replace(/{lesson_number}/g, lesson.lesson_number || 1)
    .replace(/{learning_objectives}/g, JSON.stringify(lesson.learning_objectives || ['Improve English skills']))
    .replace(/{vocabulary_focus}/g, JSON.stringify(lesson.vocabulary_focus || ['Basic vocabulary']))
    .replace(/{grammar_focus}/g, JSON.stringify(lesson.grammar_focus || ['Simple grammar']));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ESL curriculum designer. Generate only valid JSON responses for interactive lesson slides.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 8000,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const slidesData = parseAIJson(content, "ai-systematic-slides-batch");
    
    // Validate the structure
    if (!slidesData.slides || !Array.isArray(slidesData.slides)) {
      throw new Error('Invalid slides structure - missing slides array');
    }
    
    if (slidesData.slides.length < 15 || slidesData.slides.length > 25) {
      throw new Error(`Invalid slide count: ${slidesData.slides.length}. Expected 15-25 slides.`);
    }
    
    // Add total_slides count
    slidesData.total_slides = slidesData.slides.length;
    
    return slidesData;
  } catch (parseError) {
    throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
  }
}

async function processLessonsInBatches(lessons: any[], batchSize: number = 3): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processed: 0,
    inserted: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  for (let i = 0; i < lessons.length; i += batchSize) {
    const batch = lessons.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (lesson) => {
      try {
        result.processed++;
        
        // Check if slides already exist
        if (lesson.slides_content && Object.keys(lesson.slides_content).length > 0) {
          result.skipped++;
          result.details.push({
            id: lesson.id,
            title: lesson.title,
            status: 'skipped'
          });
          return;
        }

        console.log(`Generating slides for lesson: ${lesson.title} (${lesson.id})`);
        
        const slidesData = await generateSlidesForLesson(lesson);
        
        // Save to database
        const { error } = await supabase
          .from('lessons_content')
          .update({ slides_content: slidesData })
          .eq('id', lesson.id);

        if (error) {
          throw new Error(`Database update failed: ${error.message}`);
        }

        result.inserted++;
        result.details.push({
          id: lesson.id,
          title: lesson.title,
          status: 'inserted'
        });
        
        console.log(`✅ Successfully generated slides for: ${lesson.title}`);
        
      } catch (error) {
        result.failed++;
        result.details.push({
          id: lesson.id,
          title: lesson.title,
          status: 'failed',
          error: error.message
        });
        
        console.error(`❌ Failed to generate slides for ${lesson.title}:`, error.message);
      }
    }));
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < lessons.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      level_index,
      module_from,
      module_to,
      lesson_from,
      lesson_to,
      topic_like,
      limit = 50,
      dryRun = false
    } = await req.json();

    // Build query
    let query = supabase
      .from('lessons_content')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (level_index !== undefined) {
      // Map level_index to CEFR levels (assuming 0=A1, 1=A2, etc.)
      const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (level_index < cefrLevels.length) {
        query = query.eq('cefr_level', cefrLevels[level_index]);
      }
    }
    
    if (module_from !== undefined) {
      query = query.gte('module_number', module_from);
    }
    
    if (module_to !== undefined) {
      query = query.lte('module_number', module_to);
    }
    
    if (lesson_from !== undefined) {
      query = query.gte('lesson_number', lesson_from);
    }
    
    if (lesson_to !== undefined) {
      query = query.lte('lesson_number', lesson_to);
    }
    
    if (topic_like) {
      query = query.ilike('topic', `%${topic_like}%`);
    }
    
    query = query.limit(limit);

    const { data: lessons, error } = await query;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No lessons found matching the criteria',
          processed: 0,
          inserted: 0,
          skipped: 0,
          failed: 0,
          details: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({
          message: `Dry run: Found ${lessons.length} lessons that would be processed`,
          lessons: lessons.map(l => ({ id: l.id, title: l.title, module: l.module_number, lesson: l.lesson_number }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting batch processing of ${lessons.length} lessons`);
    
    const result = await processLessonsInBatches(lessons);
    
    console.log(`Batch processing completed: ${result.inserted} inserted, ${result.skipped} skipped, ${result.failed} failed`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-systematic-slides-batch:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});