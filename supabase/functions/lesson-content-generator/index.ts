import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { enrichLesson, decideEnrichmentPublish, type Hub } from "../_shared/lessonEnrichment.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { unitId, lessonIndex, lessonPlan, ageGroup, cefrLevel } = await req.json();
    
    console.log(`Starting lesson content generation for unit ${unitId}, lesson ${lessonIndex}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Generate slide structure with structured output
    console.log('Step 1: Generating enhanced slide structure with gamification...');
    const slidePrompt = buildSlidePrompt(lessonPlan, ageGroup, cefrLevel);
    
    // Retry logic for provider errors - reduced to prevent timeout
    let aiData;
    let lastError;
    const maxRetries = 2; // Reduced from 3 to avoid edge function timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI generation attempt ${attempt}/${maxRetries}...`);
        
        const aiResponse = await aiFetch('https://ai-gateway.internal/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-5-mini', // Reliable for structured output
            messages: [
              {
                role: 'user',
                content: slidePrompt
              }
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'lesson_slides',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    version: { type: 'string' },
                    theme: { type: 'string' },
                    durationMin: { type: 'number' },
                    metadata: {
                      type: 'object',
                      properties: {
                        CEFR: { type: 'string' },
                        module: { type: 'number' },
                        lesson: { type: 'number' },
                        targets: { type: 'array', items: { type: 'string' } },
                        audioManifest: { 
                          type: 'array', 
                          items: { 
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              text: { type: 'string' },
                              type: { type: 'string' }
                            },
                            required: ['id', 'text', 'type'],
                            additionalProperties: false
                          }
                        }
                      },
                      required: ['CEFR', 'module', 'lesson', 'targets'],
                      additionalProperties: false
                    },
                    slides: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          type: { type: 'string' },
                          prompt: { type: 'string' },
                          instructions: { type: 'string' },
                          audioText: { type: 'string' },
                          imagePrompt: { type: 'string' },
                          dialogue: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                character: { type: 'string' },
                                text: { type: 'string' },
                                options: { type: 'array', items: { type: 'string' } },
                                correctOption: { type: 'number' }
                              },
                              required: ['character', 'text'],
                              additionalProperties: false
                            }
                          },
                          questions: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                question: { type: 'string' },
                                options: { type: 'array', items: { type: 'string' } },
                                correctAnswer: { type: 'string' }
                              },
                              required: ['question'],
                              additionalProperties: false
                            }
                          },
                          prompts: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                text: { type: 'string' },
                                example: { type: 'string' },
                                hints: { type: 'array', items: { type: 'string' } }
                              },
                              required: ['text'],
                              additionalProperties: false
                            }
                          },
                          wordBank: { type: 'array', items: { type: 'string' } },
                          correctSentences: { type: 'array', items: { type: 'string' } },
                          targetSound: { type: 'string' },
                          practiceWords: { type: 'array', items: { type: 'string' } },
                          storyText: { type: 'string' },
                          xpReward: { type: 'number' },
                          badgesEarned: { type: 'array', items: { type: 'string' } },
                          wheelSegments: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                text: { type: 'string' },
                                color: { type: 'string' }
                              },
                              required: ['id', 'text', 'color'],
                              additionalProperties: false
                            }
                          }
                        },
                        required: ['id', 'type', 'prompt', 'instructions'],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ['version', 'theme', 'durationMin', 'metadata', 'slides'],
                  additionalProperties: false
                }
              }
            },
            max_completion_tokens: 16384
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI generation error (attempt ${attempt}):`, errorText);
          
          // Handle rate limiting
          if (aiResponse.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a few moments.');
          }
          
          throw new Error(`AI generation failed: ${aiResponse.statusText}`);
        }

        aiData = await aiResponse.json();
        
        // Check for provider errors in the response
        if (aiData.error) {
          console.error(`Provider error (attempt ${attempt}):`, JSON.stringify(aiData.error, null, 2));
          throw new Error(`AI provider error: ${aiData.error.message || 'Unknown provider error'}`);
        }
        
        // Extract from JSON response (using response_format instead of tools)
        const content = aiData.choices?.[0]?.message?.content;
        if (!content) {
          console.error(`No content in response (attempt ${attempt}):`, JSON.stringify(aiData, null, 2));
          throw new Error('AI did not return structured output');
        }
        
        // Success! Break out of retry loop
        console.log(`✓ AI generation successful on attempt ${attempt}`);
        break;
        
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.message.includes('Rate limit') || error.message.includes('not configured')) {
            throw error;
          }
        }
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
        }
        
        // Wait before retrying (fixed delay to prevent timeout)
        const waitTime = 1000; // Fixed 1s delay instead of exponential backoff
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Extract content after successful generation
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI did not return structured output after successful generation');
    }

    // Sanitize: strip markdown code fences and any leading/trailing prose
    let rawText = typeof content === 'string' ? content.trim() : String(content);
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      rawText = rawText.slice(firstBrace, lastBrace + 1);
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', rawText.substring(0, 800));
      throw new Error('AI returned malformed data. Please try generating again.');
    }

    // Robust unwrapping — accept array OR { slides | lesson_plan | data: [...] }
    const slides = Array.isArray(parsedData)
      ? parsedData
      : (parsedData.slides || parsedData.lesson_plan || parsedData.data || []);

    if (!Array.isArray(slides) || slides.length === 0) {
      console.error('AI returned valid JSON, but no slides found. Raw output:', JSON.stringify(parsedData).substring(0, 1000));
      throw new Error(`AI returned an empty or malformed slide array. (response keys: ${Object.keys(parsedData || {}).join(', ') || 'none'})`);
    }

    const slidesData = Array.isArray(parsedData) ? { slides } : parsedData;
    console.log(`Generated ${slides.length} slides`);

    // Step 2: Extract image prompts
    const imagePrompts = slides
      .filter((slide: any) => slide.imagePrompt)
      .reduce((acc: any, slide: any, idx: number) => {
        acc[`slide-${slide.id}`] = slide.imagePrompt;
        return acc;
      }, {});

    console.log(`Extracted ${Object.keys(imagePrompts).length} image prompts`);

    // Step 3: Extract audio scripts
    const audioTexts = slides
      .filter((slide: any) => slide.audioText)
      .reduce((acc: any, slide: any) => {
        acc[`audio-${slide.id}`] = slide.audioText;
        return acc;
      }, {});

    console.log(`Extracted ${Object.keys(audioTexts).length} audio scripts`);

    // Step 4: Use slides without media generation to avoid timeouts
    // Media can be generated later via separate batch jobs
    const enrichedSlides = slides;
    console.log('Skipping media generation for performance - will be added via batch jobs');

    // Step 7: Save to systematic_lessons
    console.log('Step 7: Saving to database...');
    
    // Get or create a curriculum level for this CEFR level
    console.log('Looking for curriculum level:', { cefrLevel, ageGroup });
    
    // Map simple age ranges to database age group formats
    const ageGroupMapping: Record<string, string> = {
      '5-7': 'Young Learners (4-7 years)',
      '8-11': 'Elementary (8-11 years)',
      '12-14': 'Pre-Teen (10-13 years)',
      '15-17': 'Teen (14-17 years)'
    };
    
    const mappedAgeGroup = ageGroupMapping[ageGroup] || ageGroup;
    console.log('Mapped age group:', { original: ageGroup, mapped: mappedAgeGroup });
    
    let curriculumLevelId = null;
    
    // First, try to find by both CEFR level and age group
    const { data: exactMatch } = await supabaseClient
      .from('curriculum_levels')
      .select('id')
      .eq('cefr_level', cefrLevel)
      .eq('age_group', mappedAgeGroup)
      .maybeSingle();
    
    if (exactMatch) {
      curriculumLevelId = exactMatch.id;
      console.log('Found exact match:', curriculumLevelId);
    } else {
      // Try to find by CEFR level only (fallback)
      const { data: cefrMatch } = await supabaseClient
        .from('curriculum_levels')
        .select('id')
        .eq('cefr_level', cefrLevel)
        .limit(1)
        .maybeSingle();
      
      if (cefrMatch) {
        curriculumLevelId = cefrMatch.id;
        console.log('Found CEFR match:', curriculumLevelId);
      } else {
        // Create new level if none exists
        const { data: maxLevel } = await supabaseClient
          .from('curriculum_levels')
          .select('level_order')
          .order('level_order', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        const nextLevelOrder = (maxLevel?.level_order || 0) + 1;
        console.log('Creating new curriculum level with level_order:', nextLevelOrder);
        
        const { data: newLevel, error: createError } = await supabaseClient
          .from('curriculum_levels')
          .insert({
            name: `${cefrLevel} Level (${ageGroup})`,
            cefr_level: cefrLevel,
            age_group: mappedAgeGroup,
            description: `Curriculum for ${cefrLevel} level students aged ${ageGroup}`,
            level_order: nextLevelOrder
          })
          .select('id')
          .single();
        
        if (newLevel) {
          curriculumLevelId = newLevel.id;
          console.log('Created new level:', curriculumLevelId);
        } else {
          console.error('Failed to create curriculum level:', createError);
        }
      }
    }
    
    if (!curriculumLevelId) {
      throw new Error(`Failed to get or create curriculum level for ${cefrLevel} (${ageGroup})`);
    }
    
    console.log('Final curriculum_level_id:', curriculumLevelId);
    
    // Get the next available lesson number for this curriculum level
    const { data: maxLesson } = await supabaseClient
      .from('systematic_lessons')
      .select('lesson_number')
      .eq('curriculum_level_id', curriculumLevelId)
      .order('lesson_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    const nextLessonNumber = (maxLesson?.lesson_number || 0) + 1;
    console.log('Next lesson number:', nextLessonNumber);
    
    // ── Pedagogy Brain enrichment (games + homework + chat quest) ──
    const hub: Hub =
      mappedAgeGroup === "kids" || ageGroup === "kids" ? "playground"
      : mappedAgeGroup === "teens" || ageGroup === "teens" ? "academy"
      : "success";
    const enrichment = enrichLesson({
      hub,
      cefr: cefrLevel,
      lessonIndex: nextLessonNumber,
      unitTheme: lessonPlan.title,
      vocabulary: lessonPlan.targetLanguage?.vocabulary || [],
      grammar: lessonPlan.targetLanguage?.grammar || [],
      slides: enrichedSlides,
    });
    const gate = decideEnrichmentPublish(enrichment);
    console.log(`🧠 Enrichment gate: ok=${gate.ok}`, gate.issues);

    const { data: savedLesson, error: saveError } = await supabaseClient
      .from('systematic_lessons')
      .insert({
        curriculum_level_id: curriculumLevelId,
        lesson_number: nextLessonNumber,
        title: lessonPlan.title,
        topic: lessonPlan.targetLanguage?.vocabulary?.join(', ') || 'General English',
        grammar_focus: lessonPlan.targetLanguage?.grammar?.join(', ') || '',
        vocabulary_set: lessonPlan.targetLanguage?.vocabulary || [],
        communication_outcome: lessonPlan.objectives?.[0] || '',
        lesson_objectives: lessonPlan.objectives || [],
        slides_content: {
          version: slidesData.version,
          theme: slidesData.theme,
          durationMin: slidesData.durationMin,
          slides: enrichedSlides,
        },
        activities: {
          warmUp: lessonPlan.warmUp,
          presentation: lessonPlan.presentation,
          practice: lessonPlan.controlledPractice,
          production: lessonPlan.freerPractice,
          assessment: lessonPlan.assessment,
        },
        gamified_elements: {
          totalSlides: enrichedSlides.length,
          interactiveSlides: enrichment.interactive_count,
          imagesCount: Object.keys(imagePrompts).length,
          audioCount: Object.keys(audioTexts).length,
          // Pedagogy brain packs — consumed by CreatorShell + lesson player
          game_pack: enrichment.game_pack,
          homework_pack: enrichment.homework_pack,
          chat_quest_seed: enrichment.chat_quest_seed,
          enrichment_gate: gate,
        },
        difficulty_level: cefrLevel === 'Pre-A1' ? 1 : cefrLevel === 'A1' ? 2 : cefrLevel === 'A2' ? 3 : 4,
        estimated_duration: 45,
        status: 'active'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Save error:', saveError);
      throw saveError;
    }

    console.log(`Lesson content saved with ID: ${savedLesson.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        lessonId: savedLesson.id,
        totalSlides: enrichedSlides.length,
        imageCount: Object.keys(imagePrompts).length,
        audioCount: Object.keys(audioTexts).length,
        slides: enrichedSlides,
        message: 'Lesson created. Media generation in progress...'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Lesson content generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function buildSlidePrompt(lessonPlan: any, ageGroup: string, cefrLevel: string): string {
  return `You are an expert ESL curriculum designer creating a comprehensive, gamified interactive lesson for ${ageGroup}, ${cefrLevel} level.

LESSON DETAILS:
- Title: ${lessonPlan.title}
- Vocabulary: ${lessonPlan.targetLanguage?.vocabulary?.join(', ')}
- Grammar: ${lessonPlan.targetLanguage?.grammar?.join(', ')}
- Objectives: ${lessonPlan.objectives?.join('; ')}

CRITICAL: Generate exactly 20-25 slides with FULL DATA for all interactive components.

CHARACTER NAMES (use consistently): Otis, Alice, Max, Lily, Marco, Ruby, Philip, Ann, Mark

📋 SLIDE DISTRIBUTION (20-25 total):

SLIDES 1-2: CHARACTER INTRO & WARM-UP
1. type: "character_intro" - Mascot welcome with lesson preview (40 words)
2. type: "warmup" - Engaging discussion with 3-4 emoji questions (50 words)

SLIDES 3-7: VOCABULARY & PHONICS
3-5. type: "vocabulary" - Target words with pronunciation, definition, example, imagePrompt (50 words each)
6. type: "phonics" - Target sound focus with practiceWords array [4-6 words] and targetSound
7. type: "vocabulary_game" - Matching or speed challenge (40 words)

SLIDES 8-10: GRAMMAR
8. type: "grammar_intro" - Rule explanation with 3 examples (60 words)
9. type: "grammar_practice" - Fill-in-blank with questions array (50 words)
10. type: "sentence_builder" - Include wordBank array [8-10 words] and correctSentences array [2-3 sentences]

SLIDES 11-13: DIALOGUE & LISTENING
11. type: "dialogue_practice" - Include dialogue array with character, text, options, correctOption
    Example: [{character: "Otis", text: "Hi! How are you?", options: ["I'm good", "I'm sad"], correctOption: 0}]
12. type: "listening_comprehension" - Include storyText (80 words) and questions array (4 questions)
13. type: "speaking_practice" - Include prompts array with text, example, hints

SLIDES 14-16: INTERACTIVE GAMES
14. type: "spinning_wheel" - Include wheelSegments array with 6 items [{id, text, color}]
15. type: "sorting" OR "matching" - Categorization activity (50 words)
16. type: "challenge" - Mixed skills activity (60 words)

SLIDES 17-20: ASSESSMENT & REWARDS
17-18. type: "end_quiz" - Include questions array (5-6 questions with options and correctAnswer)
19. type: "review" - Lesson summary with key takeaways (50 words)
20. type: "rewards" - Celebration with xpReward (number) and badgesEarned array

🎯 REQUIRED FIELDS BY TYPE:
- dialogue_practice: dialogue array (3-5 exchanges)
- listening_comprehension: storyText (string), questions array
- speaking_practice: prompts array (3-4 prompts with examples)
- phonics: targetSound (string), practiceWords array
- sentence_builder: wordBank array, correctSentences array
- end_quiz: questions array (options, correctAnswer for each)
- spinning_wheel: wheelSegments array (6 items)
- rewards: xpReward (number), badgesEarned array

🎨 EVERY SLIDE MUST HAVE:
- id: "slide-1" through "slide-20" (or up to 25)
- type: appropriate type from above
- prompt: Student-facing content (40-60 words)
- instructions: Teacher guidance (30-50 words)
- audioText: Audio narration script (optional, 20-40 words)
- imagePrompt: Image generation prompt (optional, 20+ words, "Bright colorful cartoon...")

🔊 AUDIO MANIFEST:
In metadata, include audioManifest array with ALL audio files needed:
[{id: "vocab-apple", text: "Apple. A round red fruit.", type: "vocabulary"}, ...]

Return valid JSON with version: "2.0", theme: "mist-blue", durationMin: 45, metadata (CEFR, module, lesson, targets, audioManifest), and slides array.

CRITICAL: You must return ONLY valid, raw JSON. Do NOT wrap the response in markdown blocks. Do not use \`\`\`json or \`\`\` tags. Start immediately with { or [.

CRITICAL RESPONSE FORMAT: You MUST return a single JSON object containing exactly one key named "slides". The value of "slides" must be an array of slide objects. Example: { "slides": [ { "slide_type": "...", "content": {...} } ] }`;
}