// Detailed AI prompt templates for NovaKid-style interactive lesson content

export const DETAILED_LESSON_PROMPT = `
You are an expert ESL curriculum designer, gamification architect, and interactive content creator building a comprehensive English-learning app.

CHARACTER CONSISTENCY:
Use these character names consistently throughout the lesson: Otis, Alice, Max, Lily, Marco, Ruby, Philip, Ann, Mark, Jacob

SLIDE STRUCTURE - Generate exactly 20-25 slides with this distribution:

1. Character Welcome (1 slide) - Mascot introduction with lesson preview
2. Warmup Discussion (1 slide) - 3-4 open-ended questions with emoji reactions
3. Vocabulary Introduction (3 slides) - 8-12 words with images, pronunciation, emoji reactions
4. Phonics Focus (1 slide) - Target sound with practice words, slow/normal pronunciation
5. Vocabulary Games (2 slides):
   - Speed challenge or matching game
   - Sorting/categorization activity
6. Grammar Introduction (1 slide) - Visual explanation with real examples using characters
7. Grammar Practice (2 slides):
   - Fill-in-the-blank exercises (3-4 questions)
   - Sentence builder with word bank
8. Dialogue Practice (2 slides) - Role-play with character responses, student choices
9. Listening Comprehension (1-2 slides) - Short story with audio + comprehension questions
10. Speaking Practice (1-2 slides) - Guided prompts with examples, mic simulation
11. Interactive Game (2 slides):
    - Spinning wheel activity
    - Challenge/mixed skills
12. End Quiz (2 slides) - 5-8 questions covering vocabulary, grammar, comprehension
13. Review Summary (1 slide) - Key takeaways and lesson wrap-up
14. Rewards Screen (1 slide) - XP earned, badges unlocked, celebration animation

CRITICAL REQUIREMENTS:
- Use character names (Otis, Alice, Max, Lily, Marco, Ruby, Philip, Ann, Mark, Jacob) consistently
- Include real-world references appropriate to the topic and age group
- All vocabulary words MUST have imagePrompts AND emoji reactions (😊😱😴🤩😂😨)
- Dialogue slides MUST have dialogue array with character, text, options, correctOption
- Listening slides MUST have storyText (80-100 words) and questions array (4-5 questions)
- Speaking slides MUST have prompts array with text, example, hints
- Phonics slides MUST have targetSound and practiceWords array (4-6 words)
- Sentence builder MUST have wordBank array and correctSentences array
- Quiz slides MUST have questions array with options and correctAnswer
- Rewards slide MUST have xpReward number and badgesEarned array
- All speaking activities MUST have audioTexts
- Spinning wheel slides MUST include wheelSegments array with 6-8 segments
- Sorting slides MUST include items array and categories array
- Total word count across all prompts: 800-1200 words
- Each slide prompt should be 40-70 words

DIALOGUE SCRIPTS:
Create realistic, age-appropriate conversations:
- Use character names consistently
- Include student response options (2-3 choices)
- Mark correct response with correctOption index
- Natural flow and context
- Example: Otis asks "What's your favorite food?", student chooses from ["Pizza", "Homework", "Books"]

LISTENING COMPREHENSION:
Write engaging 80-100 word stories:
- Use target vocabulary naturally
- Include characters in narratives
- Create clear beginning-middle-end
- Add 4-5 comprehension questions (mix of recall, inference, vocabulary)
- Include audioText for narration

SPEAKING PRACTICE:
Provide scaffolded speaking prompts:
- Clear question or task
- Model answer using characters
- 2-3 helpful hints
- Pronunciation guidance in audioText
- Example: "Tell me about Max's family. Max has a mom, a dad, and a little sister..."

PHONICS PATTERNS:
Focus on sound-spelling relationships:
- Target sound (e.g., /æ/ as in "cat")
- 4-6 practice words containing the sound
- Mouth position hint
- Slow and normal pronunciation in audioText

AUDIO MANIFEST:
List ALL audio files needed in metadata.audioManifest:
[
  {id: "vocab-apple", text: "Apple. A-P-P-L-E. Apple. A round red fruit that grows on trees.", type: "vocabulary"},
  {id: "story-family", text: "[full story narration]", type: "listening"},
  {id: "prompt-speak-1", text: "Tell me about your family", type: "speaking"}
]

Return ONLY valid JSON with this structure:

{
  "title": "Lesson title",
  "topic": "Topic name",
  "cefr_level": "A1/A2/B1/B2/C1/C2",
  "module_number": 1,
  "lesson_number": 1,
  "learning_objectives": ["objective 1", "objective 2", "objective 3"],
  "vocabulary_focus": ["word1", "word2", "word3"],
  "grammar_focus": ["grammar point 1", "grammar point 2"],
  "duration_minutes": 30,
  "slides": [
    // Title Slide
    {
      "id": "slide-1",
      "type": "warmup",
      "prompt": "Welcome to [Topic]!",
      "instructions": "Today we'll learn about [topic]. Get ready for fun!",
      "imagePrompt": "Colorful, engaging illustration showing the lesson topic, cartoon style, educational, child-friendly, bright colors"
    },
    
    // Warmup Discussion Slide
    {
      "id": "slide-2",
      "type": "warmup",
      "prompt": "Let's Talk About [Topic]!",
      "instructions": "Look at the pictures and answer the questions.",
      "questions": [
        "What do you see in the picture? 🤔",
        "Do you like [topic]? Why? 😊",
        "Tell me about your favorite [related item]! 🌟",
        "Have you ever [related experience]? 🎉"
      ],
      "imagePrompt": "Bright, colorful illustration related to the topic with multiple elements to discuss"
    },
    
    // Vocabulary Slides (2 slides with 4-6 words each)
    {
      "id": "slide-vocab-1",
      "type": "vocabulary",
      "prompt": "New Words - Part 1",
      "instructions": "Let's learn some new words! Click each word to hear it.",
      "words": [
        {
          "word": "example",
          "pronunciation": "/ɪɡˈzæm.pəl/",
          "definition": "Short, simple definition",
          "example": "Max likes to eat apples. 🍎",
          "imagePrompt": "Clear, simple illustration of the word concept, cartoon style, bright colors",
          "emoji": "😊"
        }
      ]
    },
    
    // Sorting Activity
    {
      "id": "slide-sort-1",
      "type": "sorting",
      "prompt": "Sort the Items!",
      "instructions": "Drag each item to the correct box. Which category does it belong to?",
      "categories": [
        { "id": "cat-1", "name": "Category 1", "color": "#FF6B6B" },
        { "id": "cat-2", "name": "Category 2", "color": "#4ECDC4" }
      ],
      "items": [
        { "id": "item-1", "text": "apple", "category": "cat-1", "emoji": "🍎" },
        { "id": "item-2", "text": "carrot", "category": "cat-2", "emoji": "🥕" }
      ]
    },
    
    // Spinning Wheel Activity
    {
      "id": "slide-wheel-1",
      "type": "spinning_wheel",
      "prompt": "Spin the Wheel!",
      "instructions": "Click the button to spin! Answer the question you land on.",
      "wheelSegments": [
        { "id": "seg-1", "text": "What's your favorite food?", "color": "#FF6B6B" },
        { "id": "seg-2", "text": "Describe Lily's pet", "color": "#4ECDC4" },
        { "id": "seg-3", "text": "Tell us about Max's family", "color": "#45B7D1" },
        { "id": "seg-4", "text": "What does Alice like to do?", "color": "#96CEB4" },
        { "id": "seg-5", "text": "Where does Otis live?", "color": "#FFEAA7" },
        { "id": "seg-6", "text": "What's Ruby's favorite color?", "color": "#DDA0DD" }
      ]
    },
    
    // Grammar Introduction
    {
      "id": "slide-grammar-1",
      "type": "grammar",
      "prompt": "Grammar: [Pattern Name]",
      "instructions": "Learn this important grammar pattern!",
      "pattern": "Subject + verb + object",
      "rule": "Clear, simple explanation of the grammar rule",
      "examples": [
        { "sentence": "Otis likes apples.", "highlight": ["likes"], "translation": "Translation if needed" },
        { "sentence": "Alice plays soccer.", "highlight": ["plays"] }
      ],
      "exercises": [
        {
          "type": "fill_blank",
          "sentence": "Max ___ pizza.",
          "options": ["like", "likes"],
          "correctAnswer": "likes",
          "feedback": "Great job! 'Likes' is correct! 🎉"
        }
      ]
    },
    
    // Speaking Practice
    {
      "id": "slide-speaking-1",
      "type": "interactive",
      "activityType": "speaking",
      "prompt": "Let's Practice Speaking!",
      "instructions": "Use these prompts to practice speaking. Record yourself!",
      "prompts": [
        {
          "text": "Tell me about Lily's favorite food.",
          "example": "Lily likes pizza. She eats it every Friday with her family.",
          "audioText": "Tell me about Lily's favorite food"
        }
      ]
    }
  ]
}

IMPORTANT VALIDATION RULES:
1. Every vocabulary word MUST have: word, pronunciation, definition, example, imagePrompt, emoji
2. Every grammar slide MUST have: pattern, rule, examples[3-4], exercises[2-3]
3. Dialogue slides MUST have: dialogue array with character, text, options, correctOption
4. Listening slides MUST have: storyText (80-100 words), questions array (4-5 items)
5. Speaking slides MUST have: prompts array with text, example, hints (3-4 prompts)
6. Phonics slides MUST have: targetSound, practiceWords array (4-6 words)
7. Sentence builder MUST have: wordBank array (8-10 words), correctSentences array (2-3 sentences)
8. Quiz slides MUST have: questions array (5-8 questions with options, correctAnswer)
9. Rewards slide MUST have: xpReward (number), badgesEarned array (2-4 badges)
10. Sorting activities MUST have: categories array, items array with correct category assignments
11. Spinning wheel activities MUST have: wheelSegments array with 6-8 segments, each with id, text, color
12. All character examples must use the consistent names: Otis, Alice, Max, Lily, Marco, Ruby, Philip, Ann, Mark, Jacob
13. Include real-world references (actual movie titles, restaurant names, brands) when appropriate
14. All image prompts MUST be at least 20 words
15. metadata MUST include audioManifest array with all audio files

Generate the complete lesson now with ALL fields fully populated.
`;

export function assembleDetailedPrompt(params: {
  topic: string;
  cefrLevel: string;
  moduleNumber: number;
  lessonNumber: number;
  ageGroup: string;
  learningObjectives?: string[];
  customRequirements?: string;
}): string {
  return `${DETAILED_LESSON_PROMPT}

LESSON PARAMETERS:
- Topic: ${params.topic}
- CEFR Level: ${params.cefrLevel}
- Age Group: ${params.ageGroup}
- Module: ${params.moduleNumber}
- Lesson: ${params.lessonNumber}
- Learning Objectives: ${params.learningObjectives?.join(', ') || 'Develop language skills through vocabulary, grammar, and interactive practice'}
${params.customRequirements ? `- Custom Requirements: ${params.customRequirements}` : ''}

Generate 20-25 complete, interactive slides following the exact structure and requirements above. Remember to use character names consistently, include real-world references, and provide FULL data for all interactive components (dialogue arrays, questions, prompts, word banks, etc.)!`;
}
