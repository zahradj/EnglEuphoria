import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { aiFetch } from "../_shared/aiFetch.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has an allowed role — read from canonical user_roles table (NEVER users.role).
    const allowedRoles = ["admin", "content_creator"];
    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const userRoles = (roleRows || []).map((r: any) => r.role);
    const hasAllowedRole = userRoles.some((r) => allowedRoles.includes(r));

    if (roleError || !hasAllowedRole) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: admin or content_creator role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    const body = await req.json();
    const { action, topic, system, level, level_id, cefr_level, lesson_type, unit_name, level_name, duration_minutes, ai_persona, hub_type, current_stage, previous_slide_count, blueprint, phonics_rule, previous_lesson_data } = body;

    // Default to 60 minutes if not specified
    const lessonDuration = duration_minutes || 60;
    console.log("n8n-bridge request:", { action, topic, system, level, cefr_level, lesson_type, duration_minutes: lessonDuration, current_stage });

    // ── New: 4-Part Sequential PPP Chunk ──────────────────────────────────────
    if (action === "generate-lesson-chunk") {
      if (!lovableApiKey) {
        return new Response(
          JSON.stringify({ error: "AI service not configured. Please add LOVABLE_API_KEY." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const stage = String(current_stage || "foundation");
      const slides = await generateLessonChunk({
        topic, system, level, cefrLevel: cefr_level,
        lessonType: lesson_type, unitName: unit_name, levelName: level_name,
        durationMinutes: lessonDuration, apiKey: lovableApiKey,
        aiPersona: ai_persona, hubType: hub_type,
        phonicsRule: phonics_rule,
        previousLessonData: previous_lesson_data,
        currentStage: stage,
        previousSlideCount: Number(previous_slide_count) || 0,
        blueprint: blueprint || null,
      });
      return new Response(
        JSON.stringify({ status: "success", stage, slides, source: "lovable-ai-chunk" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "generate-lesson") {
      // Try n8n webhook first if configured
      if (n8nWebhookUrl) {
        console.log("Forwarding to n8n webhook:", n8nWebhookUrl);
        
        try {
          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic,
              system,
              level,
              level_id,
              cefr_level,
              lesson_type,
              unit_name,
              level_name,
            }),
          });

          if (n8nResponse.ok) {
            const n8nData = await n8nResponse.json();
            console.log("n8n response received");

            // Check if n8n returned actual lesson data
            if (n8nData.presentation && n8nData.title) {
              return new Response(
                JSON.stringify({ status: "success", data: n8nData, source: "n8n" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
          console.log("n8n did not return valid lesson, falling back to AI");
        } catch (n8nError) {
          console.warn("n8n webhook error:", n8nError);
        }
      }

      // Use Lovable AI to generate the lesson
      if (!lovableApiKey) {
        console.error("LOVABLE_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: "AI service not configured. Please add LOVABLE_API_KEY." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Generating lesson with Lovable AI...");
      
      const lesson = await generateLessonWithAI({
        topic,
        system,
        level,
        cefrLevel: cefr_level,
        lessonType: lesson_type,
        unitName: unit_name,
        levelName: level_name,
        durationMinutes: lessonDuration,
        apiKey: lovableApiKey,
        aiPersona: ai_persona,
        hubType: hub_type,
      });

      return new Response(
        JSON.stringify({ 
          status: "success", 
          data: lesson,
          source: "lovable-ai",
          message: "Generated using Lovable AI"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("n8n-bridge error:", error);
    
    // Handle rate limits
    if (error instanceof Response && error.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle payment required
    if (error instanceof Response && error.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============================================================================
// Lovable AI Lesson Generator
// ============================================================================

interface GenerateParams {
  topic: string;
  system: string;
  level: string;
  cefrLevel: string;
  lessonType?: string;
  unitName?: string;
  levelName?: string;
  durationMinutes: number;
  apiKey: string;
  aiPersona?: string;
  hubType?: string;
}

async function generateLessonWithAI(params: GenerateParams) {
  const { topic, system, level, cefrLevel, lessonType, unitName, levelName, durationMinutes, apiKey, aiPersona, hubType } = params;

  // Calculate slide count based on duration (approximately 1.5 min per slide)
  const slideCount = Math.min(Math.max(Math.ceil(durationMinutes / 1.5), 13), 50);
  const presentationSlides = Math.ceil(slideCount * 0.35); // ~35% for presentation
  const practiceSlides = Math.ceil(slideCount * 0.45);     // ~45% for practice
  const productionSlides = slideCount - presentationSlides - practiceSlides; // remainder for production

  // Build system-specific context
  const systemContext = getSystemContext(system);
  const lessonTypeContext = getLessonTypeContext(lessonType || "Mechanic");

  // Hub-locked persona block — strictly enforces age-appropriate output
  const hubPersonaBlock = aiPersona
    ? `\n\n=== HUB AGE-LOCK (NON-NEGOTIABLE) ===\nActive Hub: ${hubType ?? "unspecified"}\n${aiPersona}\nIf any topic, vocabulary item, or example violates this persona, REPLACE it before emitting the slide.\n=== END HUB AGE-LOCK ===\n`
    : "";

  const systemPrompt = `You are an expert ESL curriculum designer specializing in creating engaging, pedagogically sound INTERACTIVE lessons. 
You create complete PPP (Presentation-Practice-Production) lessons that are classroom-ready with diverse interactive activities.${hubPersonaBlock}

LESSON STRUCTURE FOR ${durationMinutes}-MINUTE LESSON (${slideCount} slides total):
- Presentation Phase: ${presentationSlides} slides
- Practice Phase: ${practiceSlides} slides (MUST include at least 3 different interactive activity types)
- Production Phase: ${productionSlides} slides

SYSTEM CONTEXT:
- Target System: ${systemContext.label} (${systemContext.visualStyle})
- Age Group: ${systemContext.ageGroup}
- Tone: ${systemContext.tone}
- Activity Style: ${systemContext.activities}

LESSON TYPE: ${lessonType || "Mechanic"}
${lessonTypeContext}

CRITICAL INTERACTIVE SLIDE REQUIREMENTS:
1. DRAG_DROP slides MUST have: content.items (array of {text, targetId}), content.targets (array of {id, label})
2. MATCHING slides MUST have: content.pairs (array of {left, right} objects)
3. SORTING slides MUST have: content.categories (array of {name, items})
4. SPINNING_WHEEL slides MUST have: content.segments (array of strings)
5. SENTENCE_BUILDER slides MUST have: content.words (scrambled array), content.correctOrder (correct sequence)
6. QUIZ slides MUST have: content.options (array of {id, text, isCorrect})

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY ${slideCount} slides - no more, no less
2. Include AT LEAST 3 different interactive slide types (drag_drop, matching, sorting, spinning_wheel, sentence_builder)
3. Each slide MUST have all required fields (id, type, title, phase, phaseLabel, content, teacherNotes, durationSeconds)
4. Vocabulary must include accurate IPA pronunciations
5. All JSON must be complete and valid - do not truncate
6. Interactive slides MUST have complete content structure as specified above

Always output valid JSON matching the exact schema provided.`;

  const userPrompt = `Create a complete ${slideCount}-slide ESL lesson (${durationMinutes} minutes) with the following specifications:

LESSON DETAILS:
- Topic: ${topic}
- Level: ${levelName || level} (${cefrLevel})
- Unit: ${unitName || "General"}
- System: ${system}
- Lesson Type: ${lessonType || "Mechanic"}
- Duration: ${durationMinutes} minutes
- Total Slides: ${slideCount}

VOCABULARY REQUIREMENTS (${durationMinutes >= 60 ? "6-8" : "4-5"} words):
- Word with IPA pronunciation (accurate phonetic transcription)
- Clear, age-appropriate definition
- Example sentence using the word in context
- Image prompt suggestion for visual aid

GRAMMAR REQUIREMENTS:
- Clear explanation of the rule
- Pattern formula (e.g., "Subject + verb + object")
- ${durationMinutes >= 60 ? "6" : "4"} example sentences
- 3 common mistakes with corrections

SLIDE STRUCTURE for ${slideCount} slides:

PRESENTATION PHASE (${presentationSlides} slides):
- Slide 1: Title & Warmup (objectives, engaging question)
- Slides 2-${Math.min(presentationSlides - 1, Math.ceil(presentationSlides * 0.7))}: Vocabulary (one word per slide)
- Remaining presentation slides: Grammar Focus (rule, pattern, examples)

PRACTICE PHASE (${practiceSlides} slides):
- controlled_practice slides (fill-in-the-blank exercises with options)
- dialogue slides (age-appropriate conversations with roles)
- speaking slides (guided speaking activities with prompts)
- drag_drop slides (drag items to match with targets, MUST have items array with {text, targetId} and targets array with {id, label})
- matching slides (memory card matching pairs, MUST have pairs array with {left, right} objects)
- sorting slides (categorize items, MUST have categories array with {name, items})
- spinning_wheel slides (random selection wheel, MUST have segments array with strings)
- sentence_builder slides (arrange scrambled words, MUST have words array and correctOrder array)
- listening slides (audio with comprehension questions)
- quiz slides (multiple choice with options array containing {id, text, isCorrect})

PRODUCTION PHASE (${productionSlides} slides):
- production slides (creative tasks with clear instructions)
- Role-play scenario slides
- rewards slide (celebration with badge/stars earned)

REQUIREMENTS:
1. Include teacher notes for each slide with timing suggestions
2. Make content age-appropriate for ${systemContext.ageGroup}
3. ${system === "kids" ? "Use cartoon characters, games, colors, simple language" : ""}
4. ${system === "teen" ? "Reference social media, trending topics, peer interactions" : ""}
5. ${system === "adult" ? "Use professional scenarios, business contexts, formal registers" : ""}`;

  // Define the tool for structured output
  const tools = [
    {
      type: "function",
      function: {
        name: "create_ppp_lesson",
        description: "Create a complete PPP lesson with 13 slides, vocabulary, and grammar content",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Lesson title including topic and level" },
            system: { type: "string", description: "Target system: kids, teen, or adult" },
            cefrLevel: { type: "string", description: "CEFR level code" },
            slideCount: { type: "number", description: `Total number of slides (should be ${slideCount})` },
            estimatedDuration: { type: "number", description: `Lesson duration in minutes (${durationMinutes})` },
            slides: {
              type: "array",
              description: "Array of 13 lesson slides",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: ["title", "warmup", "vocabulary", "grammar", "grammar_focus", "controlled_practice", "dialogue", "dialogue_practice", "speaking", "speaking_practice", "listening", "listening_comprehension", "drag_drop", "matching", "sorting", "spinning_wheel", "sentence_builder", "quiz", "end_quiz", "production", "rewards", "summary"] },
                  title: { type: "string" },
                  phase: { type: "string", enum: ["presentation", "practice", "production"] },
                  phaseLabel: { type: "string" },
                  content: { type: "object", description: "Slide-specific content" },
                  teacherNotes: { type: "string" },
                  durationSeconds: { type: "number" },
                },
                required: ["id", "type", "title", "phase", "phaseLabel", "content", "teacherNotes", "durationSeconds"],
              },
            },
            presentation: {
              type: "object",
              properties: {
                hook_activity: { type: "string" },
                concept_check_questions: { type: "array", items: { type: "string" } },
                vocabulary: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      ipa: { type: "string" },
                      definition: { type: "string" },
                      example: { type: "string" },
                    },
                    required: ["word", "ipa", "definition", "example"],
                  },
                },
                grammar_rule: { type: "string" },
              },
              required: ["hook_activity", "vocabulary", "grammar_rule"],
            },
            practice: {
              type: "object",
              properties: {
                game_mechanic: { type: "string" },
                drill_sentences: { type: "array", items: { type: "string" } },
                exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
              required: ["game_mechanic", "exercises"],
            },
            production: {
              type: "object",
              properties: {
                creative_task: { type: "string" },
                target_output: { type: "string" },
                peer_review: { type: "string" },
              },
              required: ["creative_task", "target_output"],
            },
          },
          required: ["title", "system", "cefrLevel", "slideCount", "slides", "presentation", "practice", "production"],
        },
      },
    },
  ];

  console.log(`Calling Lovable AI Gateway for ${slideCount}-slide lesson...`);

  // Models to try in order - fallback if primary fails
  const modelsToTry = [
    "google/gemini-2.5-flash",      // Primary: stable and reliable
    "google/gemini-3-flash-preview", // Fallback 1: newer but may have issues
    "google/gemini-2.5-pro",         // Fallback 2: more capable but slower
  ];

  let lastError: Error | null = null;
  let aiResponse: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "create_ppp_lesson" } },
          max_tokens: 20000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Model ${model} returned error:`, response.status, errorText);
        
        if (response.status === 429) {
          throw new Response("Rate limit exceeded", { status: 429 });
        }
        if (response.status === 402) {
          throw new Response("Payment required", { status: 402 });
        }
        
        // For 500 errors, try the next model
        if (response.status === 500) {
          lastError = new Error(`Model ${model} returned 500: ${errorText}`);
          continue;
        }
        
        throw new Error(`AI generation failed: ${response.status}`);
      }

      aiResponse = await response.json();
      console.log("AI response received:", JSON.stringify(aiResponse).substring(0, 500));

      // Check if AI Gateway returned an error in the response body
      if (aiResponse.error) {
        console.error(`Model ${model} returned error in body:`, aiResponse.error);
        lastError = new Error(`AI Gateway error: ${aiResponse.error.message || JSON.stringify(aiResponse.error)}`);
        continue; // Try next model
      }

      // Success! Break out of the retry loop
      console.log(`Successfully used model: ${model}`);
      break;
      
    } catch (err) {
      if (err instanceof Response) {
        throw err; // Re-throw rate limit and payment errors
      }
      console.error(`Model ${model} failed:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // If all models failed, throw the last error
  if (!aiResponse || aiResponse.error) {
    throw lastError || new Error("All AI models failed to generate lesson");
  }

  // Extract the tool call result
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
  
  // If no tool call, try to extract from content directly (some models return JSON in content)
  if (!toolCall) {
    const content = aiResponse.choices?.[0]?.message?.content;
    if (content) {
      console.log("Attempting to parse lesson from content...");
      try {
        // Try to extract JSON from the content
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const lessonData = JSON.parse(jsonMatch[0]);
          if (lessonData.slides && lessonData.title) {
            console.log("Successfully parsed lesson from content");
            return lessonData;
          }
        }
      } catch (parseError) {
        console.error("Failed to parse content as JSON:", parseError);
      }
    }
    console.error("Unexpected AI response format:", JSON.stringify(aiResponse).substring(0, 1000));
    throw new Error("AI did not return expected lesson format - no tool call or valid JSON content found");
  }

  if (toolCall.function.name !== "create_ppp_lesson") {
    console.error("Wrong tool called:", toolCall.function.name);
    throw new Error(`AI called wrong tool: ${toolCall.function.name}`);
  }

  const lessonData = JSON.parse(toolCall.function.arguments);
  
  // Validate the generated lesson
  const validationResult = validateLessonData(lessonData, durationMinutes);
  
  console.log(`Lesson validation: score=${validationResult.score}%, isValid=${validationResult.isValid}, errors=${validationResult.errors.length}, warnings=${validationResult.warnings.length}`);

  // Return lesson with validation metadata
  return {
    ...lessonData,
    _validation: validationResult,
  };
}

// ============================================================================
// Server-side Lesson Validation
// ============================================================================

interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'error';
  slideIndex?: number;
}

interface ValidationWarning {
  code: string;
  field: string;
  message: string;
  slideIndex?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
  slideCount: number;
  expectedSlideCount: number;
  phaseCoverage: {
    presentation: number;
    practice: number;
    production: number;
  };
}

const MIN_SLIDES_BY_DURATION: Record<number, number> = {
  30: 15,
  45: 25,
  60: 35,
  90: 50,
};

const REQUIRED_SLIDE_FIELDS = ['id', 'type', 'title', 'phase', 'content'];
const PPP_PHASES = ['presentation', 'practice', 'production'];
const IPA_PATTERN = /^\/[^\/]+\/$|^\[[^\]]+\]$/;
const COMMON_IPA_CHARS = /[æɑɒʌəɪʊeɛɔuiːˈˌŋθðʃʒtʃdʒ]/;

function validateIPA(ipa: string | undefined | null): boolean {
  if (!ipa || typeof ipa !== 'string') return false;
  const trimmed = ipa.trim();
  if (!IPA_PATTERN.test(trimmed)) {
    return COMMON_IPA_CHARS.test(trimmed);
  }
  const inner = trimmed.slice(1, -1);
  return inner.length > 0;
}

function validateLessonData(lessonData: any, durationMinutes: number): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const slides = lessonData?.slides || [];
  const slideCount = slides.length;
  const expectedSlideCount = MIN_SLIDES_BY_DURATION[durationMinutes] || MIN_SLIDES_BY_DURATION[60];

  // Check slide count
  if (slideCount === 0) {
    errors.push({
      code: 'NO_SLIDES',
      field: 'slides',
      message: 'Lesson has no slides',
      severity: 'critical',
    });
  } else if (slideCount < expectedSlideCount * 0.7) {
    errors.push({
      code: 'INSUFFICIENT_SLIDES',
      field: 'slides',
      message: `Expected at least ${expectedSlideCount} slides for ${durationMinutes}-minute lesson, got ${slideCount}`,
      severity: 'error',
    });
  }

  // Validate each slide
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    // Check required fields
    for (const field of REQUIRED_SLIDE_FIELDS) {
      const value = slide[field];
      if (value === undefined || value === null || value === '') {
        if (field === 'id' || field === 'type') {
          errors.push({
            code: `SLIDE_MISSING_${field.toUpperCase()}`,
            field: `slide[${i}].${field}`,
            message: `Slide ${i + 1} is missing required field: ${field}`,
            severity: 'critical',
            slideIndex: i,
          });
        } else {
          errors.push({
            code: `SLIDE_MISSING_${field.toUpperCase()}`,
            field: `slide[${i}].${field}`,
            message: `Slide ${i + 1} is missing: ${field}`,
            severity: 'error',
            slideIndex: i,
          });
        }
      }
    }

    // Check teacher notes
    if (!slide.teacherNotes?.trim()) {
      warnings.push({
        code: 'SLIDE_MISSING_TEACHER_NOTES',
        field: `slide[${i}].teacherNotes`,
        message: `Slide ${i + 1} is missing teacher notes`,
        slideIndex: i,
      });
    }

    // Validate vocabulary in slide content
    const vocabArray = slide.vocabulary || slide.content?.vocabulary;
    if (Array.isArray(vocabArray)) {
      for (const vocab of vocabArray) {
        if (!vocab.word?.trim()) {
          errors.push({
            code: 'VOCAB_MISSING_WORD',
            field: `slide[${i}].vocabulary.word`,
            message: `Slide ${i + 1}: vocabulary word is missing`,
            severity: 'error',
            slideIndex: i,
          });
        }
        if (!vocab.ipa || !validateIPA(vocab.ipa)) {
          errors.push({
            code: 'VOCAB_INVALID_IPA',
            field: `slide[${i}].vocabulary.ipa`,
            message: `Slide ${i + 1}: invalid IPA "${vocab.ipa}" for word "${vocab.word || 'unknown'}"`,
            severity: 'error',
            slideIndex: i,
          });
        }
      }
    }
  }

  // Check PPP phase coverage
  const phaseCounts = { presentation: 0, practice: 0, production: 0 };
  for (const slide of slides) {
    const phase = slide.phase?.toLowerCase();
    if (phase && phase in phaseCounts) {
      phaseCounts[phase as keyof typeof phaseCounts]++;
    }
  }

  const total = slides.length || 1;
  const phaseCoverage = {
    presentation: Math.round((phaseCounts.presentation / total) * 100),
    practice: Math.round((phaseCounts.practice / total) * 100),
    production: Math.round((phaseCounts.production / total) * 100),
  };

  if (phaseCoverage.presentation === 0 && slideCount > 0) {
    errors.push({ code: 'MISSING_PRESENTATION_PHASE', field: 'slides.phase', message: 'No slides for Presentation phase', severity: 'error' });
  }
  if (phaseCoverage.practice === 0 && slideCount > 0) {
    errors.push({ code: 'MISSING_PRACTICE_PHASE', field: 'slides.phase', message: 'No slides for Practice phase', severity: 'error' });
  }
  if (phaseCoverage.production === 0 && slideCount > 0) {
    errors.push({ code: 'MISSING_PRODUCTION_PHASE', field: 'slides.phase', message: 'No slides for Production phase', severity: 'error' });
  }

  // Check lesson-level fields
  if (!lessonData?.title?.trim()) {
    errors.push({ code: 'MISSING_TITLE', field: 'title', message: 'Lesson title is missing', severity: 'critical' });
  }

  // Validate top-level vocabulary
  if (lessonData?.presentation?.vocabulary && Array.isArray(lessonData.presentation.vocabulary)) {
    for (const vocab of lessonData.presentation.vocabulary) {
      if (!vocab.ipa || !validateIPA(vocab.ipa)) {
        errors.push({
          code: 'VOCAB_INVALID_IPA',
          field: 'presentation.vocabulary.ipa',
          message: `Invalid IPA "${vocab.ipa}" for word "${vocab.word || 'unknown'}"`,
          severity: 'error',
        });
      }
    }
  }

  // Calculate completeness score
  const criticalErrors = errors.filter(e => e.severity === 'critical').length;
  const regularErrors = errors.filter(e => e.severity === 'error').length;
  const warningCount = warnings.length;

  let score = 100;
  score -= criticalErrors * 25;
  score -= regularErrors * 10;
  score -= warningCount * 2;

  if (slideCount > 0) {
    const slideRatio = slideCount / expectedSlideCount;
    if (slideRatio < 0.5) score -= 20;
    else if (slideRatio < 0.8) score -= 10;
    else if (slideRatio >= 1) score += 5;
  }

  score = Math.max(0, Math.min(100, score));
  const isValid = criticalErrors === 0 && score >= 50;

  return {
    isValid,
    errors,
    warnings,
    score: Math.round(score),
    slideCount,
    expectedSlideCount,
    phaseCoverage,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getSystemContext(system: string) {
  switch (system) {
    case "kids":
      return {
        label: "Playground",
        visualStyle: "Cartoon / Vibrant",
        ageGroup: "children ages 5-10",
        tone: "playful, encouraging, simple",
        activities: "games, songs, coloring, puppets, movement",
      };
    case "teen":
      return {
        label: "The Academy",
        visualStyle: "Realistic / Social / Modern",
        ageGroup: "teenagers ages 11-17",
        tone: "casual, relatable, engaging",
        activities: "role-play, social media projects, debates, peer work",
      };
    case "adult":
    default:
      return {
        label: "The Hub",
        visualStyle: "Corporate / Minimalist / Professional",
        ageGroup: "adults ages 18+",
        tone: "professional, practical, business-focused",
        activities: "case studies, simulations, presentations, negotiations",
      };
  }
}

function getLessonTypeContext(lessonType: string) {
  switch (lessonType) {
    case "Mechanic":
      return `MECHANIC LESSON FOCUS:
- Heavy emphasis on grammar rules and patterns
- Drill exercises and controlled practice
- Clear explanations of language mechanics
- Multiple examples showing correct usage
- Error correction activities`;

    case "Context":
      return `CONTEXT LESSON FOCUS:
- Reading comprehension activities
- Authentic texts (articles, blog posts, stories)
- Vocabulary in context
- Comprehension questions
- Text analysis and discussion`;

    case "Application":
      return `APPLICATION LESSON FOCUS:
- Speaking and communication activities
- Role-plays and simulations
- Real-world scenarios
- Interactive pair/group work
- Fluency over accuracy`;

    case "Checkpoint":
      return `CHECKPOINT LESSON FOCUS:
- Mission-based assessment
- Creative production task
- Integration of all skills learned
- Portfolio-worthy output
- Self and peer evaluation`;

    default:
      return "";
  }
}

// ============================================================================
// 4-Part Sequential PPP Chunk Generator
// ============================================================================

interface ChunkParams {
  topic: string;
  system: string;
  level: string;
  cefrLevel: string;
  lessonType?: string;
  unitName?: string;
  levelName?: string;
  durationMinutes: number;
  apiKey: string;
  aiPersona?: string;
  hubType?: string;
  phonicsRule?: string;
  previousLessonData?: { title?: string; topic?: string; grammar?: string; vocabulary?: unknown } | null;
  currentStage: string;
  previousSlideCount: number;
  blueprint: any;
}

const STAGE_INSTRUCTIONS: Record<string, { count: string; desc: string; types: string }> = {
  foundation: {
    count: "EXACTLY 3",
    desc: "FOUNDATION (Warm-up): (1) Intro/Title slide with objectives, (2) SPACED-REPETITION REVIEW slide (type: 'review_slide') that gamifies recall of the previous lesson's vocabulary and grammar — if previous_lesson_data is provided, this slide is MANDATORY and must reference those exact words/structures via a drag-drop or matching mini-game. The new theme must logically extend the previous theme without repeating it. (3) Target Vocabulary intro slide with 4-6 words including IPA pronunciation.",
    types: "title, review_slide, warmup, vocabulary",
  },
  mechanics: {
    count: "EXACTLY 3",
    desc: "MECHANICS (Presentation): (a) Visual Grammar explanation slide with rule + pattern formula + 2-3 examples, (b) Phonics/Pronunciation focus slide that STRICTLY OBEYS the active hub phonics_rule, (c) MANDATORY sentence_builder slide — the student must drag scrambled words into a grammatically correct sentence using TODAY's grammar focus (e.g., Subject → Verb → Object). content.words must be the scrambled array; content.correctOrder must be the indices in correct order; provide 2-3 sentences.",
    types: "grammar, grammar_focus, phonics, sentence_builder",
  },
  application: {
    count: "EXACTLY 3 to 4",
    desc: "APPLICATION (Practice): Interactive gamified slides ONLY. Use a mix of drag_drop, sentence_builder, matching, sorting, quiz. At least one MUST be a sentence_builder reinforcing today's syntax. Each slide MUST include FULL game data: drag_drop needs content.items[{text,targetId}] + content.targets[{id,label}]; matching needs content.pairs[{left,right}]; sentence_builder needs content.words + content.correctOrder; quiz needs content.options[{id,text,isCorrect}].",
    types: "drag_drop, matching, sentence_builder, sorting, quiz",
  },
  mastery: {
    count: "EXACTLY 2",
    desc: "MASTERY (Production): (1) Final output task — roleplay, debate or simulation forcing the student to USE everything learned, (2) Lesson Review + Goodbye summary slide with key takeaways.",
    types: "production, summary",
  },
};

async function generateLessonChunk(p: ChunkParams): Promise<any[]> {
  const stageDef = STAGE_INSTRUCTIONS[p.currentStage] || STAGE_INSTRUCTIONS.foundation;
  const sys = getSystemContext(p.system);

  const personaBlock = p.aiPersona
    ? `\n=== HUB AGE-LOCK (NON-NEGOTIABLE) ===\nActive Hub: ${p.hubType ?? "unspecified"}\n${p.aiPersona}\n=== END HUB AGE-LOCK ===\n`
    : "";

  const phonicsBlock = p.phonicsRule
    ? `\n=== PHONICS / PRONUNCIATION RULE (NON-NEGOTIABLE) ===\n${p.phonicsRule}\nYou MUST generate a target_phonics or pronunciation_focus data point that strictly obeys this rule. Any auditory/phonics slide must include a practice activity tailored to this specific phonetic target.\n=== END PHONICS RULE ===\n`
    : "";

  const prevBlock = p.previousLessonData
    ? `\n=== PREVIOUS LESSON (use for spaced repetition) ===\nTitle: ${p.previousLessonData.title || "—"}\nTopic: ${p.previousLessonData.topic || "—"}\nGrammar: ${p.previousLessonData.grammar || "—"}\nVocabulary: ${JSON.stringify(p.previousLessonData.vocabulary || []).substring(0, 400)}\nThe FIRST interactive slide of THIS lesson must be a review_slide that gamifies recall of the items above. The new theme must logically connect to the previous topic without repeating it.\n=== END PREVIOUS LESSON ===\n`
    : "\n(No previous lesson on record — skip the spaced-repetition review slide and go straight to today's vocabulary.)\n";

  const systemPrompt = `You are an expert ESL curriculum designer generating ONE chunk of a ${p.durationMinutes}-minute PPP lesson.${personaBlock}${phonicsBlock}${prevBlock}

CURRENT STAGE: ${p.currentStage.toUpperCase()}
${stageDef.desc}

You will generate ${stageDef.count} slides — NO MORE, NO LESS.
Allowed slide types for this stage: ${stageDef.types}

Each slide must have these fields: id, type, phase, phaseLabel, title, content, teacherNotes, durationSeconds.
Continue numbering: starting slide id = "slide-${p.previousSlideCount + 1}".

Audience: ${sys.ageGroup}. Tone: ${sys.tone}.

CRITICAL RESPONSE FORMAT: Return ONLY a JSON object via the emit_chunk tool with exactly one key "slides" whose value is an array of slide objects. No prose, no markdown, no extra text.`;

  const userPrompt = `Topic: ${p.topic}
Level: ${p.levelName || p.level} (${p.cefrLevel})
Unit: ${p.unitName || "General"}
Lesson Type: ${p.lessonType || "Mechanic"}
${p.blueprint ? `\nBlueprint context:\n${JSON.stringify(p.blueprint).substring(0, 1500)}` : ""}

Generate the ${p.currentStage} chunk now.`;

  const tools = [{
    type: "function",
    function: {
      name: "emit_chunk",
      description: `Emit the ${p.currentStage} slide chunk`,
      parameters: {
        type: "object",
        properties: {
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                phase: { type: "string" },
                phaseLabel: { type: "string" },
                title: { type: "string" },
                content: { type: "object" },
                teacherNotes: { type: "string" },
                durationSeconds: { type: "number" },
              },
              required: ["id", "type", "title", "phase", "content", "teacherNotes"],
            },
          },
        },
        required: ["slides"],
      },
    },
  }];

  const modelsToTry = ["google/gemini-2.5-flash", "google/gemini-2.5-pro"];
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const response = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${p.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "emit_chunk" } },
          max_tokens: 6000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429) throw new Response("Rate limit exceeded", { status: 429 });
        if (response.status === 402) throw new Response("Payment required", { status: 402 });
        lastError = new Error(`Model ${model} returned ${response.status}: ${errText.substring(0, 200)}`);
        continue;
      }

      const ai = await response.json();
      if (ai.error) {
        lastError = new Error(`AI error: ${ai.error.message || JSON.stringify(ai.error)}`);
        continue;
      }
      const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
      let parsed: any = null;
      if (toolCall) {
        try { parsed = JSON.parse(toolCall.function.arguments); } catch (e) {
          lastError = new Error(`Failed to parse tool args: ${(e as Error).message}`);
          continue;
        }
      } else {
        // Fallback: try plain JSON content
        const content = ai.choices?.[0]?.message?.content;
        if (typeof content === "string") {
          const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
          try { parsed = JSON.parse(cleaned); } catch { /* ignore */ }
        }
      }
      if (!parsed) {
        lastError = new Error(`No tool call in ${p.currentStage} chunk response`);
        continue;
      }
      // Robust unwrapping — accept array OR { slides | lesson_plan | data: [...] }
      const slides = Array.isArray(parsed)
        ? parsed
        : (parsed.slides || parsed.lesson_plan || parsed.data || []);
      if (!Array.isArray(slides) || slides.length === 0) {
        console.error(`AI returned valid JSON but no slides for ${p.currentStage}. Raw:`, parsed);
        lastError = new Error(`Empty ${p.currentStage} slide array (keys: ${Object.keys(parsed || {}).join(", ")})`);
        continue;
      }
      return slides.map((s: any, i: number) => ({
        ...s,
        id: s.id || `slide-${p.previousSlideCount + i + 1}`,
      }));
    } catch (err) {
      if (err instanceof Response) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError || new Error(`All models failed for chunk ${p.currentStage}`);
}
