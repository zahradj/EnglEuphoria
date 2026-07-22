// Master Prompt Template for Slide Generation — Scaffolded Mastery Edition
export const MASTER_SLIDE_PROMPT_TEMPLATE = `
You are an AI assistant creating professional and engaging lesson slides for ESL students. Generate exactly 12 interactive slides following the **Scaffolded Mastery (5-Phase "Epic Arc")** structure.

**LESSON INFORMATION:**
- Title: {lessonTitle}
- Topic: {lessonTopic}
- CEFR Level: {cefrLevel}
- Age Group: {ageGroup}
- Learning Objectives: {learningObjectives}
- Vocabulary Focus: {vocabularyFocus}
- Grammar Focus: {grammarFocus}

**MANDATORY 5-PHASE STRUCTURE (12 slides, 30 min):**

Phase 1 — WARM-UP (2 slides, ~2 min):
  1. AI Song / Tap the Beat — high-energy opener to lower the affective filter
  2. Hello Chant / Quick Fire — energize and prime the ears

Phase 2 — PRIME "I Do" (2 slides, ~4 min):
  3. Word #1 — Visual only, NO text. The AI says the word. Student observes.
  4. Word #2 — Visual only, NO text. Color-coded glow (nouns=blue, verbs=green).
  RULE: Use Professional Flat 2.0 isolated vectors on white backgrounds.

Phase 3 — MIMIC "We Do" (2 slides, ~5 min):
  5. Voice record word #1 — Student records, system gives phonetic feedback.
  6. Voice record word #2 — Waveform comparison with master pronunciation.
  RULE: Every Mimic slide MUST have a phoneme target (e.g., /l/, /æ/).

Phase 4 — PRODUCE "You Do" (3 slides, ~8 min):
  7. Mystery Silhouette — Student sees blurred/silhouette image, must recall the word.
  8. Drag & Drop / Interactive activity — Active engagement.
  9. Pop the Word Bubble / Quiz — Speed challenge.
  RULE: A Mimic slide MUST appear before any Produce slide.

Phase 5 — COOL-OFF (3 slides, ~3 min):
  10. Breathing Balloon / Brain Break — No language pressure, motor/relaxation.
  11. Celebration — Accessory reveal or achievement unlock.
  12. Goodbye wave — Session end.

**CONTENT GUIDELINES:**
- Use simple, age-appropriate language for {cefrLevel} level
- Include detailed image prompts using Professional Flat 2.0 style (NO 3D, NO renders)
- Make every slide interactive with clear instructions
- Provide teacher notes for facilitation
- Ensure cultural sensitivity and global inclusivity
- Every unit MUST include a Prime slide and a Mimic slide BEFORE any Production or Quiz slide

**IMAGE PROMPT STYLE:**
- "Professional 2D flat vector of a [subject], side profile, friendly, clean bold lines, solid colors, Engleuphoria Navy accents, white background, no 3D effects"
- NEGATIVE: "No 3D, no render, no depth, no shadows, no gradients, no photorealism"

**OUTPUT FORMAT:**
Return a valid JSON object with this exact structure:

{
  "version": "3.0",
  "theme": "flat-mastery",
  "durationMin": 30,
  "metadata": {
    "CEFR": "{cefrLevel}",
    "module": 1,
    "lesson": 1,
    "targets": ["{learningObjectives}"],
    "weights": {
      "accuracy": 60,
      "fluency": 40
    },
    "masteryPhases": ["warmup", "prime", "mimic", "produce", "cooloff"]
  },
  "slides": [
    {
      "id": "slide-1",
      "type": "warmup",
      "phase": "warmup",
      "phonemeTarget": null,
      "prompt": "Slide title and engaging activity",
      "instructions": "Clear instructions for teacher and students",
      "media": {
        "type": "image",
        "imagePrompt": "Professional 2D flat vector description...",
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
- warmup, prime, mimic, produce, cooloff
- Sub-types: tap_the_beat, voice_record, mystery_silhouette, drag_drop, pop_bubble, breathing_balloon

Generate creative, engaging content that follows the Scaffolded Mastery method!
`;

export const assemblePromptForLesson = (lesson: any): string => {
  return MASTER_SLIDE_PROMPT_TEMPLATE
    .replace(/{lessonTitle}/g, lesson.title || 'Untitled Lesson')
    .replace(/{lessonTopic}/g, lesson.topic || 'General English')
    .replace(/{cefrLevel}/g, lesson.cefr_level || 'A1')
    .replace(/{ageGroup}/g, 'Children (6-12 years)')
    .replace(/{learningObjectives}/g, lesson.learning_objectives?.join(', ') || 'Improve English skills')
    .replace(/{vocabularyFocus}/g, lesson.vocabulary_focus?.join(', ') || 'Basic vocabulary')
    .replace(/{grammarFocus}/g, lesson.grammar_focus?.join(', ') || 'Simple grammar');
};

export const SLIDE_VALIDATION_SCHEMA = {
  type: "object",
  required: ["version", "theme", "durationMin", "metadata", "slides"],
  properties: {
    version: { type: "string", enum: ["2.0", "3.0"] },
    theme: { type: "string", enum: ["mist-blue", "sage-sand", "default", "flat-mastery"] },
    durationMin: { type: "number", minimum: 10, maximum: 60 },
    metadata: {
      type: "object",
      required: ["CEFR", "module", "lesson", "targets", "weights"],
      properties: {
        CEFR: { type: "string" },
        module: { type: "number" },
        lesson: { type: "number" },
        targets: { type: "array", items: { type: "string" } },
        weights: {
          type: "object",
          properties: {
            accuracy: { type: "number", minimum: 0, maximum: 100 },
            fluency: { type: "number", minimum: 0, maximum: 100 }
          }
        }
      }
    },
    slides: {
      type: "array",
      minItems: 10,
      maxItems: 25,
      items: {
        type: "object",
        required: ["id", "type", "prompt"],
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          phase: { type: "string" },
          phonemeTarget: { type: ["string", "null"] },
          prompt: { type: "string", minLength: 10 },
          instructions: { type: "string" },
          media: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["image", "video", "audio"] },
              imagePrompt: { type: "string" },
              alt: { type: "string" }
            }
          }
        }
      }
    }
  }
};
