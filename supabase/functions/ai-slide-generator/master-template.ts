// Master template functions for the AI slide generator

export const MASTER_SLIDE_PROMPT_TEMPLATE = `
You are an AI assistant creating professional and engaging lesson slides for ESL students. Generate exactly 20 interactive slides for this lesson.

**LESSON INFORMATION:**
- Title: {lessonTitle}
- Topic: {lessonTopic}
- CEFR Level: {cefrLevel}
- Age Group: {ageGroup}
- Learning Objectives: {learningObjectives}
- Vocabulary Focus: {vocabularyFocus}
- Grammar Focus: {grammarFocus}

**SLIDE STRUCTURE (20 slides total):**
1. **Warm-up (2 slides):** Title slide + engaging starter activity
2. **Vocabulary Preview (3 slides):** Introduction, visual matching, interactive practice
3. **Target Language (3 slides):** Grammar explanation, examples, guided practice
4. **Listening Comprehension (2 slides):** Audio activity + comprehension check
5. **Sentence Builder (2 slides):** Drag-and-drop construction activities
6. **Grammar Focus (3 slides):** Deep dive, transformation exercises, error correction
7. **Speaking Practice (2 slides):** Controlled practice + communicative task
8. **Interactive Games (2 slides):** Matching, quiz, or drag-drop activities
9. **Wrap-up (1 slide):** Review and homework assignment

**CONTENT GUIDELINES:**
- Use simple, kid-friendly language appropriate for {cefrLevel} level
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
    "CEFR": "{cefrLevel}",
    "module": 1,
    "lesson": 1,
    "targets": ["{learningObjectives}"],
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

**IMAGE PROMPT EXAMPLES:**
- "Colorful illustration of children in a classroom raising hands, cartoon style, educational setting"
- "Simple vector icons showing daily activities: eating, sleeping, playing, studying"
- "Friendly cartoon teacher pointing to a whiteboard with grammar examples"

Generate creative, engaging content that makes learning fun and effective!
`;

export function assemblePromptForLesson(lesson: any): string {
  return MASTER_SLIDE_PROMPT_TEMPLATE
    .replace(/{lessonTitle}/g, lesson.title || 'Untitled Lesson')
    .replace(/{lessonTopic}/g, lesson.topic || 'General English')
    .replace(/{cefrLevel}/g, lesson.cefr_level || 'A1')
    .replace(/{ageGroup}/g, 'Children (6-12 years)')
    .replace(/{learningObjectives}/g, lesson.learning_objectives?.join(', ') || 'Improve English skills')
    .replace(/{vocabularyFocus}/g, lesson.vocabulary_focus?.join(', ') || 'Basic vocabulary')
    .replace(/{grammarFocus}/g, lesson.grammar_focus?.join(', ') || 'Simple grammar');
}

export async function generateSlidesWithMasterTemplate(supabase: any, lesson: any, slideCount: number = 20) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = assemblePromptForLesson(lesson);

  console.log(`Generating ${slideCount} slides with master template for: ${lesson.title}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert ESL curriculum designer. Create comprehensive, engaging lesson slides with clear instructions and interactive elements. Always respond with valid JSON only.' 
        },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  let slidesData;

  try {
    const content = data.choices[0].message.content;
    slidesData = JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', data.choices[0].message.content);
    throw new Error('Failed to parse lesson slides from AI response');
  }

  // Validate and ensure proper structure
  if (!slidesData.slides || !Array.isArray(slidesData.slides)) {
    throw new Error('Invalid slides structure from AI response');
  }

  // Ensure we have the correct metadata
  slidesData.metadata = {
    ...slidesData.metadata,
    CEFR: lesson.cefr_level || 'A1',
    module: lesson.module_number || 1,
    lesson: lesson.lesson_number || 1,
    targets: lesson.learning_objectives || [],
    weights: {
      accuracy: 60,
      fluency: 40
    }
  };

  slidesData.total_slides = slidesData.slides.length;

  console.log(`Successfully generated ${slidesData.slides.length} slides with master template`);

  return slidesData;
}

export async function enrichSlidesWithMedia(supabase: any, slides: any[]) {
  console.log(`Enriching ${slides.length} slides with generated media...`);
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.warn('OpenAI API key not available, skipping media enrichment');
    return;
  }

  let enrichedCount = 0;

  for (const slide of slides) {
    if (slide.media?.imagePrompt && !slide.media.url) {
      try {
        console.log(`Generating image for slide ${slide.id}: ${slide.media.imagePrompt}`);
        
        // Generate image using OpenAI DALL-E
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: slide.media.imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'url'
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageUrl = imageData.data[0]?.url;
          
          if (imageUrl) {
            // Download and store the image in Supabase Storage
            const imageBlob = await fetch(imageUrl).then(r => r.blob());
            const fileName = `slide-${slide.id}-${Date.now()}.png`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('slides-media')
              .upload(fileName, imageBlob, {
                contentType: 'image/png',
                upsert: false
              });

            if (uploadError) {
              console.error(`Failed to upload image for slide ${slide.id}:`, uploadError);
            } else {
              // Get public URL
              const { data: { publicUrl } } = supabase.storage
                .from('slides-media')
                .getPublicUrl(fileName);
              
              slide.media.url = publicUrl;
              enrichedCount++;
              
              console.log(`✓ Generated and stored image for slide ${slide.id}`);
            }
          }
        } else {
          console.error(`Failed to generate image for slide ${slide.id}:`, await imageResponse.text());
        }
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error generating image for slide ${slide.id}:`, error);
      }
    }
  }

  console.log(`Media enrichment complete: ${enrichedCount} images generated and stored`);
}