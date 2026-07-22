export interface LessonGenerationParams {
  topic: string;
  phonicsFocus: string;
  lessonNumber: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives?: string[];
}

export const generateEarlyLearnerPrompt = (params: LessonGenerationParams): string => {
  return `You are an expert ESL curriculum designer, phonics specialist, child development expert, educational content creator, gamification expert, and multimedia designer.

Create a COMPLETE, INTERACTIVE, GAMIFIED ESL lesson for children aged 5-7 (Early Learners / Foundation Level).

LESSON PARAMETERS:
- Topic: ${params.topic}
- Phonics Focus: ${params.phonicsFocus}
- Lesson Number: ${params.lessonNumber}
- Difficulty: ${params.difficultyLevel}
- Learning Objectives: ${params.learningObjectives?.join(', ') || 'Develop foundational English skills through phonics, vocabulary, and interactive practice'}

CRITICAL REQUIREMENTS:
✓ 100% accurate, age-appropriate, error-free
✓ Ready for immediate classroom use
✓ All content must be concrete and specific (no placeholders)
✓ Include detailed image prompts for every visual element
✓ Include audio scripts for all pronunciation, instructions, and narration

LESSON STRUCTURE - 7 MANDATORY COMPONENTS:

1. PHONICS / LETTER SOUNDS:
   - Focus on: ${params.phonicsFocus}
   - Include a phonics song/chant with complete lyrics
   - Create 4 distinct activities:
     a) Drag-and-drop: Match letters to pictures (6 items)
     b) Listening exercise: "Which word has the sound?" (5 questions)
     c) Blending game: Combine letters to form words (5 words)
     d) Sound matching game (6 pairs)
   - Provide detailed image prompts (colorful, cartoon-style, child-friendly)
   - Include audio scripts for letter sounds, words, and instructions

2. GRAMMAR PRACTICE:
   - Focus on 2 age-appropriate grammar points (e.g., singular/plural, is/are, simple present)
   - Activities:
     a) Gap-fill with visual cues (5 exercises)
     b) Error spotting with pictures (4 exercises)
     c) Guided sentence creation (4 exercises)
   - Include adaptive hints for each exercise
   - Provide image prompts for visual support

3. VOCABULARY PRACTICE:
   - 10 new words related to ${params.topic}
   - For each word provide:
     * Simple definition (max 8 words)
     * Phonetic pronunciation
     * Example sentence using the word
     * Detailed image prompt (colorful, engaging, clear subject)
   - Activities:
     a) Matching words with pictures (10 pairs)
     b) Interactive flashcards
     c) Word maps showing relationships
     d) Mini-dialogue using 5+ vocabulary words

4. SPEAKING PRACTICE:
   - 3 speaking activities:
     a) Repetition drill: 5 model sentences with pronunciation guides
     b) Role-play: Scenario with clear instructions and 6-line dialogue
     c) Simple discussion: 4 guided questions
   - Provide complete model dialogues with audio scripts
   - Include visual support image prompts
   - Award 5 stars per completed activity

5. WRITING PRACTICE:
   - 4 progressive activities:
     a) Copy words: 5 vocabulary words to trace and write
     b) Label images: 4 images with words to write
     c) Complete sentences: 4 sentences with blanks
     d) Write simple sentences: 2-3 sentences about the topic
   - Include visual aids with detailed image prompts
   - Provide scaffolding and example answers

6. READING PRACTICE:
   - Write a SHORT story (120-150 words) using target vocabulary and grammar
   - Story must be engaging, age-appropriate, with clear beginning-middle-end
   - Pre-reading: 3 prediction questions, list 6 key vocabulary words
   - During reading: 5 comprehension questions (multiple choice, 4 options each)
   - Post-reading: Summary prompt, 2 personal connection questions, drawing activity
   - Provide 4-5 image prompts for story illustrations
   - Include complete audio narration script

7. LISTENING PRACTICE:
   - Create listening content (100-120 words, different from reading story)
   - Pre-listening: 2 activation questions, preview 5 key vocabulary words
   - While listening:
     a) 4 comprehension questions
     b) Fill-in-the-blank activity (5 blanks)
     c) Ordering/sequencing activity (4 items)
   - Post-listening: Summary prompt, 2 discussion questions, retell activity
   - Provide complete audio script
   - Include 2 supporting image prompts

GAMIFICATION:
- Total stars available: 35-40
- Define 3 badges students can earn (e.g., "Phonics Star", "Word Master", "Speaking Champion")
- Include 7 encouragement messages (e.g., "Great job!", "You're amazing!", "Keep going!")
- Add celebration animations for milestones

MULTIMEDIA REQUIREMENTS:
Generate detailed prompts for:
- 30-35 IMAGES: Use format "Bright, colorful cartoon illustration of [subject], child-friendly style, simple clear shapes, no text, suitable for ages 5-7, educational setting"
- 35-40 AUDIO SCRIPTS: Format "[Clear, friendly child narrator voice] [script text]"

IMPORTANT: Output valid JSON ONLY. No explanations, no markdown. Structure:

{
  "title": "Lesson ${params.lessonNumber}: [Creative Title]",
  "topic": "${params.topic}",
  "phonicsFocus": "${params.phonicsFocus}",
  "lessonNumber": ${params.lessonNumber},
  "difficultyLevel": "${params.difficultyLevel}",
  "learningObjectives": ["objective 1", "objective 2", "objective 3"],
  "durationMinutes": 30,
  "components": {
    "phonics": { ... },
    "grammar": { ... },
    "vocabulary": { ... },
    "speaking": { ... },
    "writing": { ... },
    "reading": { ... },
    "listening": { ... }
  },
  "multimedia": {
    "totalImages": 32,
    "totalAudioFiles": 38,
    "images": [{"id": "img-1", "prompt": "...", "purpose": "phonics-letter-a", "generationStatus": "pending"}],
    "audioFiles": [{"id": "audio-1", "text": "...", "type": "instruction", "generationStatus": "pending"}],
    "generationProgress": 0
  },
  "gamification": {
    "rewards": {
      "starsPerActivity": 5,
      "totalStarsAvailable": 40,
      "badges": [{"id": "badge-1", "name": "Phonics Star", "icon": "⭐", "condition": "Complete all phonics activities"}]
    },
    "adaptiveFeatures": {
      "difficultyAdjustment": true,
      "hintsEnabled": true,
      "encouragementMessages": ["Great job!", "You're amazing!"]
    },
    "celebrationAnimations": ["confetti", "stars", "sparkles"]
  }
}

Generate the complete, accurate lesson now.`;
};
