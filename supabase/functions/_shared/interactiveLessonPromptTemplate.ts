/**
 * Universal Master Prompt Template for Interactive Lesson Generation
 * Adapts to different age groups (5-7, 8-11, 12-14, 15-17, 18+) and CEFR levels (Pre-A1 to B2)
 * Generates 20 comprehensive, classroom-ready screens
 */

export interface InteractiveLessonParams {
  topic: string;
  cefrLevel: string;
  ageGroup: string;
  duration: number;
  vocabularyList: string[];
  grammarFocus: string[];
  learningObjectives: string[];
  selectedActivities: string[];
}

export const generateInteractiveLessonPrompt = (params: InteractiveLessonParams): string => {
  const ageGroupNum = parseAgeGroup(params.ageGroup);
  const designGuidelines = getDesignGuidelines(ageGroupNum);
  const contentComplexity = getContentComplexity(params.cefrLevel, ageGroupNum);

  return `You are an expert ESL curriculum designer, child development specialist, educational content creator, gamification expert, and multimedia designer.

Create a COMPLETE, INTERACTIVE, PRODUCTION-READY ESL lesson with EXACTLY 20 screens.

LESSON PARAMETERS:
- Topic: ${params.topic}
- CEFR Level: ${params.cefrLevel}
- Age Group: ${params.ageGroup}
- Duration: ${params.duration} minutes
- Target Vocabulary: ${params.vocabularyList.join(', ')}
- Grammar Focus: ${params.grammarFocus.join(', ') || 'None specified'}
- Learning Objectives: ${params.learningObjectives.join('; ')}
- Selected Activities: ${params.selectedActivities.join(', ')}

${designGuidelines}

${contentComplexity}

CRITICAL REQUIREMENTS:
✓ 100% accurate, age-appropriate, error-free content
✓ Ready for immediate classroom use (no placeholders)
✓ All content must be concrete and specific
✓ Include detailed image prompts for every visual element
✓ Include audio placeholders for all pronunciation, instructions, and narration
✓ Complete game data with correct answers and feedback for all interactive activities

SCREEN DISTRIBUTION (EXACTLY 20 screens):

Screen 1: HOME/WELCOME
{
  "screenType": "home",
  "title": "[Engaging lesson title]",
  "content": {
    "welcomeMessage": "Welcome message from mascot character",
    "mascot": {
      "name": "LearnBot",
      "greeting": "Hi! I'm so excited to learn about [topic] with you today!",
      "imagePrompt": "${designGuidelines.includes('bright') ? 'Cheerful cartoon mascot character' : 'Friendly modern mascot character'}"
    },
    "previewText": "Brief lesson overview",
    "estimatedTime": "${params.duration} minutes"
  },
  "xpReward": 10
}

Screens 2: LEARNING OBJECTIVES
{
  "screenType": "vocabulary_preview",
  "title": "What We'll Learn Today",
  "content": {
    "objectives": ${JSON.stringify(params.learningObjectives)},
    "vocabularyPreview": ${JSON.stringify(params.vocabularyList.slice(0, 5))},
    "motivationalText": "By the end of this lesson, you'll be able to...",
    "imagePrompt": "Educational illustration showing lesson goals"
  },
  "xpReward": 10
}

Screens 3-6: VOCABULARY SCREENS (4 screens, 2-3 words each)
Each vocabulary screen MUST include:
{
  "screenType": "vocabulary",
  "title": "Learn New Words",
  "content": {
    "words": [
      {
        "word": "[target word]",
        "ipa": "/phonetic pronunciation using IPA/",
        "partOfSpeech": "noun|verb|adjective|adverb",
        "definition": "${contentComplexity.includes('simple') ? 'Simple 5-8 word definition' : 'Clear, concise definition'}",
        "examples": [
          "Example sentence 1 using the word naturally",
          "Example sentence 2 in different context",
          "Example sentence 3 showing usage"
        ],
        "relatedWords": ["synonym1", "synonym2", "word family member"],
        "imagePrompt": "Detailed description: [clear subject, style, context, suitable for ${params.ageGroup}]",
        "audioPlaceholder": "audio/vocab/[word].mp3",
        "pronunciationHints": "Tips for difficult sounds (if applicable)"
      }
    ],
    "practicePrompt": "Try using these words in your own sentences!"
  },
  "durationSeconds": 90,
  "xpReward": 30
}

Screens 7-8: GRAMMAR FOCUS (2 screens)
{
  "screenType": "grammar_focus",
  "title": "[Grammar Point Title]",
  "content": {
    "grammarRule": {
      "ruleTitle": "${params.grammarFocus[0] || 'Present Simple'}",
      "explanation": "Clear explanation with examples",
      "visualPattern": "Subject + verb + object",
      "examples": [
        "I eat breakfast every day.",
        "She reads books in the evening.",
        "They play soccer on weekends.",
        "We study English together.",
        "He works at a hospital."
      ]
    },
    "practiceExercises": [
      {
        "type": "fill-in-blank",
        "question": "My sister ___ to school every day.",
        "options": ["go", "goes", "going", "went"],
        "correctAnswer": "goes",
        "feedback": "Correct! We use 'goes' with 'he/she/it' in present simple.",
        "hint": "Think about the subject 'sister' - is it singular or plural?"
      },
      {
        "type": "error-correction",
        "question": "They plays football every Saturday.",
        "correctSentence": "They play football every Saturday.",
        "feedback": "Good catch! 'They' takes the base form of the verb.",
        "hint": "Look at the subject 'they' - what verb form should follow?"
      },
      {
        "type": "sentence-building",
        "prompt": "Build a sentence about your daily routine",
        "wordBank": ["I", "every", "morning", "breakfast", "eat"],
        "correctOrder": ["I", "eat", "breakfast", "every", "morning"],
        "feedback": "Perfect sentence structure!"
      },
      {
        "type": "transformation",
        "question": "Change to negative: She likes pizza.",
        "correctAnswer": "She doesn't like pizza.",
        "feedback": "Excellent! Remember to use 'doesn't' + base verb."
      }
    ]
  },
  "xpReward": 40
}

Screens 9-11: INTERACTIVE GAME SCREENS (3 screens from selected activities)
Generate screens from these types: ${params.selectedActivities.join(', ')}

For MATCHING game:
{
  "screenType": "matching",
  "title": "Match the Pairs!",
  "content": {
    "instructions": "Drag each word to match its picture",
    "pairs": [
      {
        "id": 1,
        "word": "[vocabulary word]",
        "imagePrompt": "Clear illustration of [word]",
        "correctMatch": 1
      }
    ],
    "feedback": {
      "correct": "Perfect match! You got it right!",
      "incorrect": "Not quite! Try again - think about the meaning.",
      "hints": ["Look at the picture carefully", "Think about what the word means"]
    },
    "timeLimit": 120,
    "soundEffects": ["correct.mp3", "incorrect.mp3", "complete.mp3"]
  },
  "xpReward": 50
}

For DRAG & DROP game:
{
  "screenType": "drag_drop",
  "title": "Sort the Items",
  "content": {
    "instructions": "Drag each item to the correct category",
    "categories": [
      { "id": "cat1", "label": "Category 1", "color": "blue" },
      { "id": "cat2", "label": "Category 2", "color": "green" }
    ],
    "items": [
      { "id": "item1", "text": "[item]", "correctCategory": "cat1", "imagePrompt": "illustration" }
    ],
    "correctAnswers": {
      "cat1": ["item1", "item2"],
      "cat2": ["item3", "item4"]
    },
    "feedback": {
      "allCorrect": "Amazing! All items are in the right place!",
      "someCorrect": "Good try! Check the items in [category].",
      "hints": ["Think about which items belong together"]
    }
  },
  "xpReward": 50
}

For SPINNING WHEEL game:
{
  "screenType": "spinning_wheel",
  "title": "Spin and Answer!",
  "content": {
    "instructions": "Spin the wheel and answer the question",
    "segments": [
      {
        "id": 1,
        "question": "How do you say [word] in a sentence?",
        "answer": "Example answer",
        "points": 20,
        "color": "blue"
      }
    ],
    "spinAnimation": true,
    "celebrationOnComplete": true
  },
  "xpReward": 40
}

For SORTING game:
{
  "screenType": "sorting",
  "title": "Sort the Words",
  "content": {
    "instructions": "Put each word in the correct box",
    "boxes": [
      { "label": "Box 1", "color": "blue" },
      { "label": "Box 2", "color": "green" }
    ],
    "items": ["item1", "item2", "item3", "item4"],
    "correctPlacements": {
      "Box 1": ["item1", "item2"],
      "Box 2": ["item3", "item4"]
    }
  },
  "xpReward": 40
}

Screen 12: DIALOGUE PRACTICE
{
  "screenType": "dialogue_practice",
  "title": "Let's Practice a Conversation",
  "content": {
    "context": "Scenario description (e.g., 'At the park with friends')",
    "characters": [
      {
        "name": "Emma",
        "role": "student",
        "avatar": "girl-avatar",
        "personality": "friendly"
      },
      {
        "name": "Tom",
        "role": "student",
        "avatar": "boy-avatar",
        "personality": "curious"
      }
    ],
    "dialogueLines": [
      {
        "character": "Emma",
        "line": "Hi Tom! What are you doing this weekend?",
        "audioPlaceholder": "audio/dialogue/emma_1.mp3",
        "emotion": "happy"
      },
      {
        "character": "Tom",
        "line": "I'm going to visit my grandmother. How about you?",
        "audioPlaceholder": "audio/dialogue/tom_1.mp3",
        "emotion": "neutral"
      }
    ],
    "rolePlayOptions": [
      "Continue the conversation",
      "Change one character's response",
      "Add your own line"
    ],
    "vocabularyHighlights": ${JSON.stringify(params.vocabularyList.slice(0, 5))}
  },
  "xpReward": 50
}

Screen 13: SPEAKING PRACTICE
{
  "screenType": "speaking_practice",
  "title": "Practice Speaking",
  "content": {
    "activities": [
      {
        "type": "repetition",
        "prompt": "Repeat after the speaker",
        "sentences": [
          {
            "text": "My family is very important to me.",
            "audioPlaceholder": "audio/speaking/sentence_1.mp3",
            "pronunciationHints": "Stress: FAM-i-ly, im-POR-tant"
          }
        ]
      },
      {
        "type": "guided-response",
        "prompt": "Answer the question using complete sentences",
        "question": "Tell me about your family.",
        "exampleAnswer": "I have a mother, a father, and one sister.",
        "tips": "Use the vocabulary words we learned!"
      }
    ],
    "recordingEnabled": true,
    "feedbackType": "encouraging"
  },
  "xpReward": 50
}

Screen 14: LISTENING COMPREHENSION
{
  "screenType": "listening_comprehension",
  "title": "Listen Carefully",
  "content": {
    "storyTitle": "A Day with My Family",
    "storyText": "Write a 120-180 word engaging story using target vocabulary and grammar...",
    "audioPlaceholder": "audio/listening/story_full.mp3",
    "preListeningQuestions": [
      "What do you think this story is about?",
      "Who might be in this story?"
    ],
    "questions": [
      {
        "id": 1,
        "question": "Who is the main character?",
        "type": "multiple-choice",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "feedback": "That's right! The story is about..."
      }
    ],
    "imagePrompts": [
      "Scene 1 illustration",
      "Scene 2 illustration"
    ]
  },
  "xpReward": 50
}

Screen 15: READING COMPREHENSION
{
  "screenType": "reading",
  "title": "Read the Story",
  "content": {
    "storyTitle": "[Different story from listening]",
    "storyText": "120-180 word story with target grammar and vocabulary...",
    "comprehensionQuestions": [
      {
        "question": "What happened first in the story?",
        "type": "multiple-choice",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A"
      }
    ],
    "discussionPrompts": [
      "Have you ever experienced something similar?",
      "What would you do in this situation?"
    ]
  },
  "xpReward": 40
}

Screen 16: SENTENCE BUILDER
{
  "screenType": "sentence_builder",
  "title": "Build Sentences",
  "content": {
    "challenges": [
      {
        "prompt": "Create a sentence about your daily routine",
        "wordBank": ["I", "every", "day", "breakfast", "eat", "morning", "in", "the"],
        "correctSentences": [
          "I eat breakfast every morning.",
          "Every morning I eat breakfast."
        ],
        "hints": ["Start with 'I'", "What do you do in the morning?"]
      }
    ]
  },
  "xpReward": 40
}

Screens 17-18: QUIZ SCREENS (2 screens, 4-5 questions each)
{
  "screenType": "end_quiz",
  "title": "Quiz Time!",
  "content": {
    "questions": [
      {
        "id": 1,
        "question": "Which sentence is correct?",
        "type": "multiple-choice",
        "options": [
          "My sister go to school.",
          "My sister goes to school.",
          "My sister going to school.",
          "My sister goed to school."
        ],
        "correctAnswer": "My sister goes to school.",
        "feedback": "Perfect! Remember: he/she/it + verb+s",
        "points": 20
      }
    ],
    "passingScore": 70,
    "showScoreBreakdown": true
  },
  "xpReward": 60
}

Screen 19: BADGE/REWARD SCREEN
{
  "screenType": "rewards",
  "title": "Amazing Work!",
  "content": {
    "badgesEarned": [
      {
        "id": "vocab-master",
        "name": "Vocabulary Master",
        "icon": "🏆",
        "description": "Learned all the new words!",
        "rarity": "gold"
      }
    ],
    "celebrationMessage": "You did an incredible job today!",
    "statsShown": {
      "totalXP": 500,
      "questionsAnswered": 25,
      "accuracy": 92
    },
    "celebrationAnimation": "confetti"
  },
  "xpReward": 100
}

Screen 20: LESSON COMPLETE
{
  "screenType": "celebration",
  "title": "Lesson Complete! 🎉",
  "content": {
    "summaryMessage": "You've completed the lesson on ${params.topic}!",
    "keyTakeaways": [
      "You learned ${params.vocabularyList.length} new vocabulary words",
      "You practiced ${params.grammarFocus.join(' and ')}",
      "You completed ${params.selectedActivities.length} interactive activities"
    ],
    "nextSteps": "Keep practicing these words and try using them in real conversations!",
    "reviewOption": true,
    "shareOption": true
  },
  "xpReward": 50
}

AUDIO MANIFEST:
Create comprehensive audioManifest array with entries for:
- All vocabulary word pronunciations: { "id": "vocab_[word]", "text": "[word]", "type": "vocabulary" }
- All vocabulary example sentences
- All dialogue lines with character attribution
- Story narration for listening/reading
- Grammar example sentences
- Quiz questions (optional)
- Instruction prompts for activities

XP & GAMIFICATION:
- Total XP available: 700-800 points
- XP distribution: Welcome (10), Objectives (10), Vocabulary (30×4=120), Grammar (40×2=80), Games (40-50×3=135), Dialogue (50), Speaking (50), Listening (50), Reading (40), Sentence Builder (40), Quiz (60×2=120), Rewards (100), Complete (50)
- Badges to earn: "Vocabulary Master", "Grammar Guru", "Conversation Star", "Quiz Champion", "Perfect Attendance"

IMPORTANT: Generate VALID JSON ONLY. No explanations, no markdown wrappers. Return properly formatted JSON that can be parsed directly.`;
};

function parseAgeGroup(ageGroup: string): number {
  const match = ageGroup.match(/(\d+)/);
  return match ? parseInt(match[1]) : 12;
}

function getDesignGuidelines(age: number): string {
  if (age <= 11) {
    return `DESIGN GUIDELINES FOR KIDS (Ages 5-11):
- Use bright, vibrant colors and playful design
- Large, clear fonts (18-24px)
- Simple, cartoon-style illustrations
- Bouncy animations and sound effects
- Visible mascot character throughout for encouragement
- Short sentences and simple vocabulary
- Lots of visual support and images`;
  } else if (age <= 17) {
    return `DESIGN GUIDELINES FOR TEENS (Ages 12-17):
- Modern, cool design with softer color palette
- Medium fonts (16-20px)
- Relatable, contemporary illustrations
- Smooth, moderate animations
- Mascot appears for key moments
- Conversational tone
- Mix of visual and text content`;
  } else {
    return `DESIGN GUIDELINES FOR ADULTS (Ages 18+):
- Professional, clean design
- Standard fonts (14-18px)
- Realistic or abstract illustrations
- Minimal, subtle animations
- Mascot for major achievements only
- Formal yet friendly tone
- More text-based content with supporting visuals`;
  }
}

function getContentComplexity(cefrLevel: string, age: number): string {
  const isYoung = age <= 11;
  
  if (cefrLevel.startsWith('Pre-A') || cefrLevel === 'A1') {
    return `CONTENT COMPLEXITY (Beginner - ${cefrLevel}):
- Very simple, basic vocabulary (100-200 most common words)
- Present simple tense focus
- Short sentences (5-8 words)
- Concrete, everyday topics
- Heavy use of images and demonstrations
- Repetition and drilling
${isYoung ? '- Extra visual support and game-based activities' : '- Some reading and writing tasks'}`;
  } else if (cefrLevel === 'A2') {
    return `CONTENT COMPLEXITY (Elementary - A2):
- Common vocabulary (500-1000 words)
- Present simple, present continuous, past simple
- Medium sentences (8-12 words)
- Familiar topics (family, hobbies, daily routine)
- Mix of visual and text
- Some independent practice
${isYoung ? '- Interactive stories and games' : '- More writing and discussion prompts'}`;
  } else if (cefrLevel === 'B1') {
    return `CONTENT COMPLEXITY (Intermediate - B1):
- Broader vocabulary (1500-2000 words)
- Multiple tenses, conditionals, passive voice
- Longer sentences (12-15 words)
- Abstract and concrete topics
- Text-heavy with supporting images
- Independent tasks and critical thinking
${isYoung ? '- Challenge-based activities' : '- Essays and presentations'}`;
  } else {
    return `CONTENT COMPLEXITY (Upper-Intermediate - B2):
- Advanced vocabulary (3000+ words)
- Complex grammar structures
- Academic and professional language
- Longer, detailed explanations
- Less visual support, more text
- Analysis and synthesis tasks
- Real-world applications`;
  }
}
