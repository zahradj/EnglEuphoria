import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parseAIJson } from "../_shared/aiJson.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { generateInteractiveLessonPrompt } from '../_shared/interactiveLessonPromptTemplate.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      topic, 
      cefrLevel, 
      ageGroup, 
      duration, 
      vocabularyList, 
      grammarFocus, 
      learningObjectives, 
      selectedActivities,
      vocabularyImages,
      introScreen
    } = await req.json();
    
    console.log('Generating interactive lesson:', { topic, cefrLevel, ageGroup });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build comprehensive prompt using new template
    const prompt = generateInteractiveLessonPrompt({
      topic,
      cefrLevel,
      ageGroup,
      duration,
      vocabularyList,
      grammarFocus,
      learningObjectives,
      selectedActivities
    });

    console.log('Calling AI to generate lesson structure...');
    
    let aiData;
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const aiResponse = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-pro',
            messages: [{ role: 'user', content: prompt }],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'interactive_lesson',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    topic: { type: 'string' },
                    totalScreens: { type: 'number' },
                    estimatedMinutes: { type: 'number' },
                    screens: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          screenNumber: { type: 'number' },
                          screenType: { type: 'string' },
                          title: { type: 'string' },
                          content: { type: 'object', additionalProperties: true },
                          durationSeconds: { type: 'number' },
                          xpReward: { type: 'number' }
                        },
                        required: ['screenNumber', 'screenType', 'title', 'content'],
                        additionalProperties: false
                      }
                    },
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
                    },
                    totalXP: { type: 'number' },
                    badgesAvailable: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['title', 'topic', 'totalScreens', 'screens'],
                  additionalProperties: false
                }
              }
            },
            max_completion_tokens: 16000
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI error (attempt ${attempt}):`, errorText);
          if (aiResponse.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          throw new Error(`AI generation failed: ${aiResponse.statusText}`);
        }

        aiData = await aiResponse.json();
        
        if (aiData.error) {
          throw new Error(`AI error: ${aiData.error.message}`);
        }
        
        console.log(`✓ AI generation successful on attempt ${attempt}`);
        break;
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI did not return content');
    }

    console.log(`AI returned ${content.length} characters`);
    
    // Parse JSON with better error handling
    let lessonData;
    try {
      lessonData = parseAIJson(content, "interactive-lesson-generator");
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Content preview (first 500 chars):', content.substring(0, 500));
      console.error('Content preview (last 500 chars):', content.substring(content.length - 500));
      
      // Try to find and fix common JSON issues
      let fixedContent = content
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')  // Fix unquoted keys
        .trim();
      
      // If content doesn't end with }, try to close it
      if (!fixedContent.endsWith('}')) {
        console.log('Attempting to close incomplete JSON...');
        fixedContent += '}';
      }
      
      try {
        lessonData = parseAIJson(fixedContent, "interactive-lesson-generator");
        console.log('Successfully parsed after fixing JSON');
      } catch (fixError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}. Content length: ${content.length}`);
      }
    }
    console.log(`Generated ${lessonData.screens?.length || 0} screens`);
    
    // Validate lesson data
    if (!lessonData.screens || lessonData.screens.length !== 20) {
      console.warn(`Expected 20 screens, got ${lessonData.screens?.length || 0}`);
    }
    
    // Validate content structure for each screen
    lessonData.screens.forEach((screen: any, index: number) => {
      if (!screen.screenType || !screen.title || !screen.content) {
        console.warn(`Screen ${index + 1} missing required fields:`, {
          hasType: !!screen.screenType,
          hasTitle: !!screen.title,
          hasContent: !!screen.content
        });
      }
    });

    // Save to database
    console.log('Saving lesson to database...');
    
    // Process vocabulary images and update screens_data
    const processedScreens = lessonData.screens.map((screen: any) => {
      if (screen.screenType === 'vocabulary' && vocabularyImages) {
        // Add image URLs to vocabulary items
        const updatedContent = { ...screen.content };
        if (updatedContent.vocabulary && Array.isArray(updatedContent.vocabulary)) {
          updatedContent.vocabulary = updatedContent.vocabulary.map((vocabItem: any) => {
            const imageData = vocabularyImages[vocabItem.word];
            if (imageData?.url) {
              return {
                ...vocabItem,
                imageUrl: imageData.url,
                imageSource: imageData.source
              };
            }
            return vocabItem;
          });
        }
        return { ...screen, content: updatedContent };
      }
      return screen;
    });
    
    const { data: savedLesson, error: saveError } = await supabaseClient
      .from('interactive_lessons')
      .insert({
        title: lessonData.title,
        topic,
        cefr_level: cefrLevel,
        age_group: ageGroup,
        duration_minutes: duration,
        vocabulary_list: vocabularyList,
        grammar_focus: grammarFocus,
        learning_objectives: learningObjectives,
        selected_activities: selectedActivities,
        screens_data: processedScreens,
        intro_screen_data: introScreen || { source: 'default' },
        audio_manifest: lessonData.audioManifest || [],
        total_xp: lessonData.totalXP || 0,
        badges_available: lessonData.badgesAvailable || [],
        status: 'active'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Save error:', saveError);
      throw saveError;
    }

    console.log(`Lesson saved with ID: ${savedLesson.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        lesson: savedLesson,
        message: 'Interactive lesson created successfully!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Interactive lesson generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Old prompt function removed - now using generateInteractiveLessonPrompt from shared template
