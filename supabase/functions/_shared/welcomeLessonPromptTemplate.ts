export interface WelcomeLessonParams {
  lessonNumber?: number;
  mascotName?: string;
}

export const generateWelcomeLessonPrompt = (params: WelcomeLessonParams = {}): string => {
  const lessonNumber = params.lessonNumber || 1;
  const mascotName = params.mascotName || 'Benny';

  return `You are an expert ESL curriculum designer specializing in early childhood education (ages 5-7).

Create a COMPLETE Welcome Lesson for the "Welcome Adventure" unit - the very first lesson young learners experience.

LESSON PARAMETERS:
- CEFR Level: Pre-A1 (Foundation)
- Age Group: 5-7 years old
- Lesson Number: ${lessonNumber}
- Unit: Unit 1 - Welcome Adventure
- Mascot: ${mascotName} the Bear 🐻
- Duration: 25-30 minutes

CRITICAL REQUIREMENTS:
✓ 100% age-appropriate, engaging, and error-free
✓ Ready for immediate classroom use
✓ All content must be concrete and specific (no placeholders)
✓ Focus on building excitement and comfort with English learning
✓ Include detailed image prompts for every visual element
✓ Include audio scripts for all narration and instructions

WELCOME LESSON STRUCTURE - 20 SLIDES:

1. MAGIC BOX REVEAL (Slides 1-3):
   - Slide 1: Title slide with animated magic box
   - Slide 2: Interactive knock-3-times activity (type: "magic_box_reveal")
   - Slide 3: ${mascotName} pops out with celebration!

2. TPR GREETING (Slides 4-6):
   - Slide 4: ${mascotName} waves hello (type: "tpr_interaction", action: "wave")
   - Slide 5: High-five interaction (type: "tpr_interaction", action: "high_five")
   - Slide 6: "Nice to meet you!" with gesture

3. MOOD CHECK-IN (Slides 7-8):
   - Slide 7: "How are you feeling?" introduction
   - Slide 8: Happy Sun ☀️ / Sad Cloud 🌧️ selector (type: "mood_selector")

4. NAME SONG (Slides 9-11):
   - Slide 9: "What's your name?" song introduction
   - Slide 10: Sing-along with lyrics
   - Slide 11: Practice saying names

5. CLASSROOM VOCABULARY (Slides 12-15):
   - Slide 12: "Book" with image and audio
   - Slide 13: "Pencil" with image and audio
   - Slide 14: "Teacher" with image and audio
   - Slide 15: Point-and-say activity

6. SIMPLE ACTIONS (Slides 16-18):
   - Slide 16: "Stand up!" TPR
   - Slide 17: "Sit down!" TPR
   - Slide 18: "Clap your hands!" TPR

7. CELEBRATION (Slides 19-20):
   - Slide 19: Star collection celebration
   - Slide 20: Preview of next lesson + goodbye

OUTPUT FORMAT - Return valid JSON only:

{
  "title": "Welcome Adventure - Meet ${mascotName}!",
  "topic": "First Day Welcome",
  "cefrLevel": "Pre-A1",
  "ageGroup": "5-7",
  "lessonNumber": ${lessonNumber},
  "unitTitle": "Unit 1: Welcome Adventure",
  "durationMinutes": 30,
  "learningObjectives": [
    "Say hello and introduce yourself",
    "Express feelings (happy/sad)",
    "Identify 3 classroom objects",
    "Follow simple TPR commands"
  ],
  "slides": [
    {
      "slideNumber": 1,
      "type": "title",
      "title": "Welcome Adventure!",
      "subtitle": "Let's meet a new friend!",
      "imagePrompt": "Colorful cartoon classroom with sparkles, child-friendly, welcoming atmosphere",
      "audioScript": "Welcome to English class! Are you ready for an adventure?"
    },
    {
      "slideNumber": 2,
      "type": "magic_box_reveal",
      "title": "Magic Box!",
      "instructions": "Knock on the box 3 times!",
      "knocksRequired": 3,
      "imagePrompt": "Golden glowing magic box with sparkles, cartoon style, exciting mystery box",
      "audioScript": "Look! A magic box! Knock knock knock - who's inside?"
    }
    // ... continue for all 20 slides
  ],
  "gamification": {
    "starsPerSlide": 1,
    "totalStarsAvailable": 20,
    "badges": [
      {"id": "first-hello", "name": "First Hello", "icon": "👋", "condition": "Complete greeting section"},
      {"id": "new-friend", "name": "New Friend", "icon": "🐻", "condition": "Meet ${mascotName}"},
      {"id": "super-star", "name": "Super Star", "icon": "⭐", "condition": "Complete all slides"}
    ],
    "celebrationAnimations": ["confetti", "stars", "sparkles"]
  },
  "multimedia": {
    "totalImages": 20,
    "totalAudioFiles": 25,
    "images": [],
    "audioFiles": []
  }
}

Generate the complete Welcome Lesson now with all 20 slides fully detailed.`;
};
