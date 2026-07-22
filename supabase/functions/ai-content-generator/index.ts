import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { parseAIJson } from "../_shared/aiJson.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication + content_creator/admin role to prevent abuse of OpenAI credits
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claims.claims.sub;
    // Check role using service-role client
    const adminClient = createClient(supabaseUrl, supabaseKey);
    const { data: roleRows } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const allowed = (roleRows || []).some((r: any) =>
      r.role === 'admin' || r.role === 'content_creator' || r.role === 'teacher'
    );
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden: content creation requires teacher, content_creator, or admin role' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Request received:', req.method);

    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { 
      type,
      contentType, 
      level,
      cefrLevel, 
      topic, 
      difficultyLevel, 
      learningObjectives,
      duration,
      studentId,
      specificRequirements,
      studentAge,
      isBulkGeneration = false,
      curriculumContext = null,
      objectives = [],
      requirements = ''
    } = requestBody;

    // Use 'type' if available, otherwise fall back to 'contentType'
    const actualContentType = type || contentType;
    const actualLevel = level || cefrLevel;

    console.log('Parsed values:', {
      actualContentType,
      actualLevel,
      topic,
      duration,
      learningObjectives
    });

    if (!actualContentType) {
      console.error('No content type provided in request body');
      throw new Error('Content type is required');
    }

    if (!topic) {
      console.error('No topic provided in request body');
      throw new Error('Topic is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Enhanced prompt generation incorporating 10 neuroscience-based learning principles
    let prompt = '';
    
    // Common neuroscience-based instructions applied to all content types
    const neuroscienceInstructions = `
APPLY THESE 10 NEUROSCIENCE-BASED LEARNING PRINCIPLES:

1. NOVELTY EFFECT: Include unexpected elements, surprise challenges, varied formats, and novel sound effect suggestions
2. PICTURE SUPERIORITY EFFECT: Pair all new vocabulary with vivid images, GIFs, emojis, and color-coded visuals  
3. DUAL CODING: Combine verbal explanations with visual elements, gestures, animations, and multi-sensory input
4. RETRIEVAL PRACTICE: Include mini-quizzes, "teach back" moments, recall questions, and active memory retrieval
5. CHUNKED LEARNING: Break content into 5-8 minute segments with micro-activities between sections
6. TESTING EFFECT: Add frequent low-stakes comprehension checks and "guess before reveal" questions
7. EMOTIONAL ENGAGEMENT: Personalize examples, use roleplay/storytelling, celebration suggestions, and enthusiastic praise
8. GENERATION EFFECT: Let students predict, create examples, and generate their own content
9. INTERLEAVING: Mix topics, alternate between skills (reading/writing/speaking/listening), review older material
10. MULTISENSORY INPUT: Engage multiple senses, include movement, gestures, sounds, visuals, and kinesthetic elements

Make content brain-friendly, engaging, and scientifically optimized for retention and recall.`;

    // Enhanced bulk generation context
    const bulkContext = isBulkGeneration && curriculumContext ? `
BULK CURRICULUM CONTEXT:
- Level: ${curriculumContext.level}
- Week: ${curriculumContext.week}/${curriculumContext.totalWeeks}
- Theme: ${curriculumContext.theme}
- Lesson Number: ${curriculumContext.lessonNumber}
- This is part of a complete A-Z curriculum generation process
- Ensure consistency with previous lessons in this level
- Reference real-world, current events and internet content
- Include cultural integration from multiple English-speaking countries
- Target sentence complexity: ${curriculumContext.level === 'A1' ? '5-8 words' : 
  curriculumContext.level === 'A2' ? '8-12 words' :
  curriculumContext.level === 'B1' ? '12-18 words' :
  curriculumContext.level === 'B2' ? '18-22 words' :
  curriculumContext.level === 'C1' ? '22-25 words' : '25+ words'}
` : '';

    // Generate comprehensive content with ChatGPT including worksheets, activities, images, and vocabulary
    switch (actualContentType) {
      case 'lesson':
      case 'lesson_plan':
        prompt = `Create a comprehensive English lesson package for ${actualLevel} level students including worksheet, interactive activities, vocabulary list with image prompts, and lesson slides.

Topic: ${topic}
Duration: ${duration || 45} minutes
Student Age: ${studentAge || 'Not specified'}
Learning Objectives: ${learningObjectives?.join(', ') || objectives?.join(', ') || 'General language learning'}
Specific Requirements: ${specificRequirements || requirements || 'None'}

${bulkContext}
${neuroscienceInstructions}

RETURN A COMPREHENSIVE JSON OBJECT with these exact keys:

{
  "worksheet": {
    "title": "Printable worksheet title",
    "content": "Complete formatted worksheet with exercises, fill-in-the-blanks, matching activities",
    "answers": "Answer key for all exercises",
    "instructions": "Teacher instructions for the worksheet"
  },
  "activities": {
    "matchPairs": [
      {"id": "1", "left": "English word", "right": "Definition/Translation", "leftImage": "image description", "rightImage": "image description"}
    ],
    "dragDropItems": [
      {"id": "1", "text": "Draggable item", "targetId": "target1", "image": "image description"}
    ],
    "dragDropTargets": [
      {"id": "target1", "text": "Drop zone label", "acceptsItemIds": ["1"], "image": "image description"}
    ],
    "clozeText": "Text with _____ gaps to fill",
    "clozeGaps": [
      {"id": "gap1", "correctAnswers": ["answer1", "answer2"], "options": ["option1", "option2", "option3"]}
    ]
  },
  "vocabulary": [
    {
      "word": "English word",
      "definition": "Clear definition",
      "example": "Example sentence",
      "imagePrompt": "Detailed prompt for AI image generation",
      "pronunciation": "Phonetic pronunciation",
      "partOfSpeech": "noun/verb/adjective/etc"
    }
  ],
  "slides": [
    {
      "id": "slide1",
      "type": "vocabulary_preview",
      "prompt": "Slide content/question",
      "instructions": "Teacher instructions",
      "media": {"type": "image", "imagePrompt": "Image generation prompt"},
      "options": [{"id": "1", "text": "Option", "isCorrect": true}],
      "correct": "correct answer"
    }
  ],
  "lessonPlan": {
    "objectives": ["Learning objective 1", "Learning objective 2"],
    "materials": ["Required materials"],
    "warmUp": "5-minute warm-up activity",
    "presentation": "Main lesson content presentation",
    "practice": "Guided practice activities",
    "production": "Independent practice/assessment",
    "coolDown": "Lesson wrap-up activity"
  }
}

Create 10-15 vocabulary words, 3-5 interactive activities, 8-12 lesson slides, and a comprehensive worksheet.`;
        break;

      case 'worksheet':
        prompt = `Create a comprehensive worksheet package for ${actualLevel} English students with interactive activities and vocabulary.

Topic: ${topic}
Student Age: ${studentAge || 'Not specified'}
Learning Objectives: ${learningObjectives?.join(', ') || 'General practice'}
Specific Requirements: ${specificRequirements || 'None'}

${neuroscienceInstructions}

RETURN A COMPREHENSIVE JSON OBJECT with these exact keys:

{
  "worksheet": {
    "title": "Worksheet title",
    "content": "Complete formatted worksheet with multiple exercise types",
    "answers": "Complete answer key",
    "instructions": "Teacher instructions"
  },
  "activities": {
    "matchPairs": [
      {"id": "1", "left": "Term", "right": "Definition", "leftImage": "image description", "rightImage": "image description"}
    ],
    "dragDropItems": [
      {"id": "1", "text": "Item to drag", "targetId": "target1", "image": "image description"}
    ],
    "dragDropTargets": [
      {"id": "target1", "text": "Drop zone", "acceptsItemIds": ["1"], "image": "image description"}
    ],
    "clozeText": "Text with _____ for students to complete",
    "clozeGaps": [
      {"id": "gap1", "correctAnswers": ["answer"], "options": ["option1", "option2", "option3"]}
    ]
  },
  "vocabulary": [
    {
      "word": "Key vocabulary word",
      "definition": "Clear definition",
      "example": "Example in context",
      "imagePrompt": "Detailed image generation prompt",
      "pronunciation": "Phonetic guide",
      "partOfSpeech": "word type"
    }
  ]
}

Include 8-12 vocabulary words and 3-4 different interactive activities.`;
        break;

      case 'activity':
        prompt = `Create an interactive activity package for ${actualLevel} English students with vocabulary and worksheet components.

Topic: ${topic}
Duration: ${duration || 30} minutes
Student Age: ${studentAge || 'Not specified'}
Learning Objectives: ${learningObjectives?.join(', ') || 'Interactive practice'}
Specific Requirements: ${specificRequirements || 'None'}

${neuroscienceInstructions}

RETURN A COMPREHENSIVE JSON OBJECT with these exact keys:

{
  "activities": {
    "matchPairs": [
      {"id": "1", "left": "Item A", "right": "Item B", "leftImage": "image description", "rightImage": "image description"}
    ],
    "dragDropItems": [
      {"id": "1", "text": "Draggable", "targetId": "target1", "image": "image description"}
    ],
    "dragDropTargets": [
      {"id": "target1", "text": "Target", "acceptsItemIds": ["1"], "image": "image description"}
    ],
    "clozeText": "Complete this text with missing _____",
    "clozeGaps": [
      {"id": "gap1", "correctAnswers": ["word"], "options": ["opt1", "opt2", "opt3"]}
    ]
  },
  "vocabulary": [
    {
      "word": "Activity vocabulary",
      "definition": "Definition",
      "example": "Usage example",
      "imagePrompt": "Image generation prompt",
      "pronunciation": "Pronunciation guide",
      "partOfSpeech": "word class"
    }
  ],
  "worksheet": {
    "title": "Activity worksheet",
    "content": "Practice exercises related to the interactive activities",
    "answers": "Answer key",
    "instructions": "How to use the worksheet"
  }
}

Create 5-7 interactive activities with supporting vocabulary and worksheet.`;
        break;

      case 'quiz':
        prompt = `Create a comprehensive quiz package for ${actualLevel} English learners with interactive elements.

Topic: ${topic}
Duration: ${duration || 20} minutes
Student Age: ${studentAge || 'Not specified'}
Learning Objectives: ${learningObjectives?.join(', ') || 'Assessment of understanding'}

${neuroscienceInstructions}

RETURN A COMPREHENSIVE JSON OBJECT with these exact keys:

{
  "quiz": {
    "title": "Quiz title",
    "questions": [
      {
        "id": "q1",
        "question": "Question text",
        "type": "multiple_choice",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": "Option A",
        "explanation": "Why this is correct",
        "imagePrompt": "Image for question if needed"
      }
    ],
    "scoring": "Scoring guidelines",
    "timeLimit": 20
  },
  "activities": {
    "matchPairs": [
      {"id": "1", "left": "Term", "right": "Answer", "leftImage": "image desc", "rightImage": "image desc"}
    ]
  },
  "vocabulary": [
    {
      "word": "Quiz vocabulary",
      "definition": "Clear definition",
      "example": "Example sentence",
      "imagePrompt": "Image generation prompt",
      "pronunciation": "Pronunciation",
      "partOfSpeech": "word type"
    }
  ]
}

Include 12-15 quiz questions with varied types and supporting vocabulary.`;
        break;

      case 'flashcards':
        prompt = `Create a comprehensive flashcard package for ${actualLevel} English learners with interactive activities.

Topic: ${topic}
Student Age: ${studentAge || 'Not specified'}
Learning Objectives: ${learningObjectives?.join(', ') || 'Vocabulary memorization'}
Specific Requirements: ${specificRequirements || 'None'}

${neuroscienceInstructions}

RETURN A COMPREHENSIVE JSON OBJECT with these exact keys:

{
  "flashcards": [
    {
      "id": "card1",
      "front": "English word/phrase",
      "back": "Definition/translation",
      "example": "Example sentence",
      "imagePrompt": "Image generation prompt for the word",
      "pronunciation": "Phonetic guide",
      "difficulty": 1
    }
  ],
  "activities": {
    "matchPairs": [
      {"id": "1", "left": "Word", "right": "Definition", "leftImage": "image desc", "rightImage": "image desc"}
    ],
    "dragDropItems": [
      {"id": "1", "text": "Word", "targetId": "target1", "image": "image desc"}
    ],
    "dragDropTargets": [
      {"id": "target1", "text": "Definition", "acceptsItemIds": ["1"], "image": "image desc"}
    ]
  },
  "vocabulary": [
    {
      "word": "Flashcard word",
      "definition": "Definition",
      "example": "Example usage",
      "imagePrompt": "Detailed image prompt",
      "pronunciation": "Pronunciation guide",
      "partOfSpeech": "word class"
    }
  ]
}

Create 20-25 flashcards with supporting interactive activities.`;
        break;

      default:
        throw new Error(`Invalid content type: ${actualContentType}. Supported types: worksheet, activity, lesson_plan, quiz, flashcards`);
    }

    console.log('Generating content with OpenAI:', actualContentType, 'for level:', actualLevel);

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
            content: `You are an expert English language curriculum designer, neuroscience-informed pedagogy specialist, and master teacher trainer. 

You understand how the brain learns languages and apply cutting-edge neuroscience research to create highly effective, brain-friendly educational content.

You MUST return a valid JSON object with the exact structure requested. Include:
- Comprehensive worksheets with multiple exercise types
- Interactive activities (match pairs, drag & drop, cloze exercises)
- Rich vocabulary lists with detailed image generation prompts
- Lesson slides when requested
- All content optimized for neuroscience-based learning principles

CRITICAL: Always return valid JSON that exactly matches the requested structure. Include detailed image generation prompts for every visual element to enable AI image creation.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 4000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to generate content');
    }

    let generatedContent;
    try {
      const rawContent = data.choices[0].message.content;
      console.log('Raw GPT response:', rawContent);
      
      // Clean the content if it has markdown code blocks
      const cleanedContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedContent = parseAIJson(cleanedContent, "ai-content-generator");
      
      // Ensure we have the expected structure
      if (!generatedContent.vocabulary) {
        generatedContent.vocabulary = [];
      }
      if (!generatedContent.activities) {
        generatedContent.activities = {};
      }
      
      console.log('Parsed content structure:', Object.keys(generatedContent));
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      // If JSON parsing fails, wrap the content
      generatedContent = {
        type: actualContentType,
        content: data.choices[0].message.content,
        generated_at: new Date().toISOString(),
        vocabulary: [],
        activities: {}
      };
    }

    // Save to adaptive_content table
    const cefrLevelMapping = {
      'beginner': 'A1',
      'intermediate': 'B1', 
      'advanced': 'C1'
    };
    
    const mappedCefrLevel = actualLevel && (cefrLevelMapping as Record<string, string>)[actualLevel] 
      ? (cefrLevelMapping as Record<string, string>)[actualLevel] 
      : actualLevel || 'B1'; // Default to B1 if no level provided

    console.log('Saving to database with CEFR level:', mappedCefrLevel);

    const { data: savedContent, error: saveError } = await supabase
      .from('adaptive_content')
      .insert({
        title: `AI-Generated ${actualContentType}: ${topic}`,
        content_type: actualContentType,
        difficulty_level: difficultyLevel || 5,
        cefr_level: mappedCefrLevel,
        learning_objectives: learningObjectives || [],
        content_data: generatedContent,
        ai_generated: true,
        generation_prompt: prompt,
        tags: [topic, mappedCefrLevel, `difficulty_${difficultyLevel || 5}`],
        estimated_duration: duration || 30,
        is_active: true
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
      throw saveError;
    }

    // Record learning event if student ID provided
    if (studentId) {
      await supabase.from('ai_learning_events').insert({
        student_id: studentId,
        event_type: 'content_generated',
        content_id: savedContent.id,
        event_data: {
          content_type: actualContentType,
          topic,
          difficulty_level: difficultyLevel || 5,
          generation_time: new Date().toISOString()
        }
      });
    }

    console.log('Content generated and saved successfully');

    return new Response(JSON.stringify({ 
      content: savedContent,
      generated_content: generatedContent,
      content_id: savedContent.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-content-generator function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});