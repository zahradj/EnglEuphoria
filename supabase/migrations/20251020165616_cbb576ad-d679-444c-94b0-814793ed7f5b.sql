-- Insert Lesson 1.1: "Hello! My Name Is..." into lessons_content
INSERT INTO lessons_content (
  title,
  topic,
  cefr_level,
  module_number,
  lesson_number,
  slides_content,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  duration_minutes,
  metadata
) VALUES (
  'Hello! My Name Is...',
  'Greetings and Introductions',
  'Pre-A1',
  1,
  1,
  '{
    "version": "2.0",
    "theme": "mist-blue",
    "total_slides": 17,
    "durationMin": 30,
    "metadata": {
      "CEFR": "Pre-A1",
      "module": 1,
      "lesson": 1,
      "targets": ["Greet others using Hello and Goodbye", "Introduce yourself with My name is...", "Recognize letter H sound"],
      "weights": {"accuracy": 60, "fluency": 40}
    },
    "slides": [
      {
        "id": "slide-1",
        "type": "warmup",
        "prompt": "Hello! My Name Is...",
        "instructions": "Play an energetic Hello Song to create excitement. Encourage students to wave and smile.",
        "media": {
          "type": "image",
          "imagePrompt": "Colorful cartoon children from diverse backgrounds waving hello in a sunny classroom, friendly and welcoming, educational illustration style",
          "alt": "Children waving hello in classroom"
        },
        "timeLimit": 180,
        "accessibility": {"screenReaderText": "Welcome to the Hello lesson. Children are waving hello.", "highContrast": true, "largeText": true}
      },
      {
        "id": "slide-2",
        "type": "vocabulary_preview",
        "prompt": "New Words Today",
        "instructions": "Show each flashcard, say the word clearly, have students repeat 3 times",
        "vocabulary": [
          {"word": "hello", "imagePrompt": "Cartoon child waving hello, simple and colorful", "audio": true},
          {"word": "goodbye", "imagePrompt": "Friendly goodbye wave gesture, child-friendly illustration", "audio": true},
          {"word": "name", "imagePrompt": "Name tag with Hello my name is badge, colorful design", "audio": true},
          {"word": "friend", "imagePrompt": "Two children holding hands as friends, diverse and happy", "audio": true},
          {"word": "teacher", "imagePrompt": "Smiling female teacher with glasses in classroom setting", "audio": true}
        ],
        "timeLimit": 300,
        "accessibility": {"screenReaderText": "Five vocabulary words: hello, goodbye, name, friend, teacher"}
      },
      {
        "id": "slide-3",
        "type": "controlled_practice",
        "prompt": "What Is This?",
        "instructions": "Point to each picture and ask What is this? Wait for choral response.",
        "images": [
          {"id": "img-1", "label": "Hello", "imagePrompt": "Hand waving hello gesture"},
          {"id": "img-2", "label": "Goodbye", "imagePrompt": "Hand waving goodbye gesture"},
          {"id": "img-3", "label": "Name", "imagePrompt": "Name tag badge"},
          {"id": "img-4", "label": "Friend", "imagePrompt": "Two smiling friends"}
        ],
        "timeLimit": 240,
        "accessibility": {"screenReaderText": "Point and say activity with four images"}
      },
      {
        "id": "slide-4",
        "type": "drag_drop",
        "prompt": "Match the Words to Pictures",
        "instructions": "Let students take turns at the board or on tablets. Celebrate each success!",
        "pairs": [
          {"word": "hello", "imagePrompt": "Cartoon child waving hello", "id": "pair-1"},
          {"word": "goodbye", "imagePrompt": "Goodbye wave gesture", "id": "pair-2"},
          {"word": "name", "imagePrompt": "Name tag badge", "id": "pair-3"},
          {"word": "friend", "imagePrompt": "Two children as friends", "id": "pair-4"},
          {"word": "teacher", "imagePrompt": "Smiling teacher", "id": "pair-5"}
        ],
        "xpReward": 50,
        "timeLimit": 300,
        "accessibility": {"screenReaderText": "Drag and drop matching game with 5 word-picture pairs"}
      },
      {
        "id": "slide-5",
        "type": "memory",
        "prompt": "Memory Card Game",
        "instructions": "Play in pairs or as a whole class. First to find all pairs wins!",
        "pairs": [
          {"id": "mem-1", "word": "hello", "imagePrompt": "Hello gesture"},
          {"id": "mem-2", "word": "goodbye", "imagePrompt": "Goodbye gesture"},
          {"id": "mem-3", "word": "name", "imagePrompt": "Name tag"},
          {"id": "mem-4", "word": "friend", "imagePrompt": "Friends together"},
          {"id": "mem-5", "word": "teacher", "imagePrompt": "Teacher smiling"},
          {"id": "mem-6", "word": "happy", "imagePrompt": "Smiley face"}
        ],
        "xpReward": 100,
        "timeLimit": 60,
        "accessibility": {"screenReaderText": "Memory card matching game with 6 pairs"}
      },
      {
        "id": "slide-6",
        "type": "sentence_builder",
        "prompt": "Build the Sentence",
        "instructions": "Help students build sentences. Start with guided examples.",
        "targetSentences": [
          {"sentence": "Hello, my name is Emma", "words": ["Hello", "my", "name", "is", "Emma"]},
          {"sentence": "Goodbye, friend", "words": ["Goodbye", "friend"]}
        ],
        "wordBank": ["Hello", "Goodbye", "my", "name", "is", "friend", "teacher"],
        "xpReward": 40,
        "timeLimit": 300,
        "accessibility": {"screenReaderText": "Sentence building activity with word tiles"}
      },
      {
        "id": "slide-7",
        "type": "grammar_focus",
        "prompt": "My name is...",
        "instructions": "Model the pattern clearly. Have each student introduce themselves.",
        "pattern": "My name is [Name]",
        "examples": [
          {"name": "Emma", "imagePrompt": "Girl with ponytail introducing herself", "audio": "My name is Emma"},
          {"name": "Ali", "imagePrompt": "Boy with cap introducing himself", "audio": "My name is Ali"},
          {"name": "Teacher Sarah", "imagePrompt": "Teacher introducing herself", "audio": "My name is Teacher Sarah"}
        ],
        "timeLimit": 240,
        "accessibility": {"screenReaderText": "Grammar pattern: My name is with three examples"}
      },
      {
        "id": "slide-8",
        "type": "controlled_output",
        "prompt": "What is your name?",
        "instructions": "Play dialogue 2x. Then pair students for practice. Walk around listening.",
        "dialogue": [
          {"speaker": "Child 1", "text": "What is your name?", "audio": true},
          {"speaker": "Child 2", "text": "My name is Lily. What is your name?", "audio": true},
          {"speaker": "Child 1", "text": "My name is Max!", "audio": true}
        ],
        "media": {
          "type": "image",
          "imagePrompt": "Two children talking to each other in classroom, speech bubbles visible, friendly educational style",
          "alt": "Two children having a conversation"
        },
        "timeLimit": 300,
        "accessibility": {"screenReaderText": "Question and answer dialogue practice"}
      },
      {
        "id": "slide-9",
        "type": "tpr_phonics",
        "prompt": "Letter H Sound",
        "instructions": "Teach the h sound with physical gesture. Practice words starting with H.",
        "letter": "H",
        "sound": "h",
        "gesture": "Put hand on heart and breathe out h...h...h...",
        "words": ["Hello", "Happy", "Hand"],
        "media": {
          "type": "image",
          "imagePrompt": "Giant letter H with children making h sound gesture, educational phonics illustration, colorful",
          "alt": "Letter H with children demonstrating h sound"
        },
        "timeLimit": 240,
        "accessibility": {"screenReaderText": "Letter H phonics with gesture and example words"}
      },
      {
        "id": "slide-10",
        "type": "picture_choice",
        "prompt": "Find the H Sound",
        "instructions": "Let students come up and click. Reinforce the h sound.",
        "question": "Click on things that start with the h sound",
        "options": [
          {"id": "opt-1", "label": "Hat", "imagePrompt": "Simple colorful hat icon", "isCorrect": true},
          {"id": "opt-2", "label": "House", "imagePrompt": "Simple house icon", "isCorrect": true},
          {"id": "opt-3", "label": "Apple", "imagePrompt": "Red apple icon", "isCorrect": false},
          {"id": "opt-4", "label": "Hello", "imagePrompt": "Hello wave gesture", "isCorrect": true},
          {"id": "opt-5", "label": "Dog", "imagePrompt": "Friendly dog icon", "isCorrect": false},
          {"id": "opt-6", "label": "Happy", "imagePrompt": "Smiley happy face", "isCorrect": true}
        ],
        "xpReward": 40,
        "timeLimit": 240,
        "accessibility": {"screenReaderText": "Find pictures starting with H sound activity"}
      },
      {
        "id": "slide-11",
        "type": "roleplay_setup",
        "prompt": "Meet a New Friend",
        "instructions": "Pair students. They practice the dialogue, then perform for class.",
        "scenario": "You meet a new friend at the playground",
        "dialogueFramework": [
          {"line": "Hello! My name is _____. What is your name?", "speaker": "Student A"},
          {"line": "My name is _____. Nice to meet you!", "speaker": "Student B"},
          {"line": "Nice to meet you too!", "speaker": "Student A"}
        ],
        "media": {
          "type": "image",
          "imagePrompt": "Two children meeting at a colorful playground with swings and slides, greeting each other, friendly illustration",
          "alt": "Children meeting at playground"
        },
        "timeLimit": 300,
        "accessibility": {"screenReaderText": "Role-play activity: meeting a new friend"}
      },
      {
        "id": "slide-12",
        "type": "communicative_task",
        "prompt": "Hello Circle Walk",
        "instructions": "Make it fun and energetic! Play upbeat music.",
        "activity": "Students walk around greeting classmates",
        "steps": [
          "Students stand in circle",
          "Music plays (Hello Song)",
          "When music stops, greet the person nearest",
          "Say: Hello! My name is ___. What is your name?",
          "Repeat 5-6 times"
        ],
        "media": {
          "type": "image",
          "imagePrompt": "Children in a circle playing a greeting game, diverse, happy, educational setting",
          "alt": "Children in greeting circle game"
        },
        "xpReward": 30,
        "timeLimit": 360,
        "accessibility": {"screenReaderText": "Communicative circle walk activity"}
      },
      {
        "id": "slide-13",
        "type": "accuracy_mcq",
        "prompt": "Quick Review Quiz",
        "instructions": "Ask questions enthusiastically. Celebrate correct answers!",
        "questions": [
          {"question": "What do we say when we meet someone?", "options": ["Hello", "Goodbye", "Name"], "correct": 0, "imagePrompt": "Two people meeting and greeting"},
          {"question": "What do we say when we leave?", "options": ["Hello", "Goodbye", "Friend"], "correct": 1, "imagePrompt": "Person waving goodbye"},
          {"question": "What is this?", "options": ["Teacher", "Goodbye", "Name"], "correct": 2, "imagePrompt": "Name tag badge", "contextImage": true}
        ],
        "xpReward": 45,
        "timeLimit": 240,
        "accessibility": {"screenReaderText": "Multiple choice quiz with 3 questions"}
      },
      {
        "id": "slide-14",
        "type": "interactive",
        "prompt": "Simon Says Hello",
        "instructions": "Play traditional Simon Says with greeting vocabulary. Keep it fast and fun!",
        "gameType": "simon_says",
        "commands": [
          {"command": "Simon says... wave hello!", "hasSimonSays": true},
          {"command": "Simon says... say goodbye!", "hasSimonSays": true},
          {"command": "Simon says... point to your name tag!", "hasSimonSays": true},
          {"command": "Wave hello!", "hasSimonSays": false}
        ],
        "media": {
          "type": "image",
          "imagePrompt": "Friendly cartoon character named Simon giving instructions, colorful and fun, child-friendly",
          "alt": "Simon character giving commands"
        },
        "timeLimit": 300,
        "accessibility": {"screenReaderText": "Simon Says game with greeting actions"}
      },
      {
        "id": "slide-15",
        "type": "fluency_sprint",
        "prompt": "Let us Sing Together",
        "instructions": "Sing together with big gestures! Record a video if possible.",
        "songLyrics": [
          "Hello, hello, what is your name?",
          "Hello, hello, what is your name?",
          "My name is [clap], nice to meet you!",
          "My name is [clap], nice to meet you!"
        ],
        "gestures": ["Wave on hello", "Point to self on my name", "Clap on [clap]", "Shake hands on nice to meet you"],
        "media": {
          "type": "image",
          "imagePrompt": "Children singing and dancing with musical notes, classroom setting, joyful and energetic",
          "alt": "Children singing together"
        },
        "timeLimit": 180,
        "accessibility": {"screenReaderText": "Hello song with gestures"}
      },
      {
        "id": "slide-16",
        "type": "exit_check",
        "prompt": "Congratulations! You Did It!",
        "instructions": "Celebrate loudly! Give high-fives. Show the badge they earned.",
        "achievements": {
          "badge": "Hello Master 👋",
          "xpEarned": 250,
          "stars": 3,
          "accomplishments": [
            "You learned 5 new words!",
            "You can say Hello and My name is...",
            "You earned the Hello Master badge!"
          ]
        },
        "media": {
          "type": "image",
          "imagePrompt": "Celebration with confetti, trophy, and happy children jumping, colorful and exciting, achievement illustration",
          "alt": "Celebration scene with achievements"
        },
        "certificate": true,
        "timeLimit": 120,
        "accessibility": {"screenReaderText": "Lesson complete! You earned 250 XP and the Hello Master badge"}
      },
      {
        "id": "slide-17",
        "type": "review_consolidation",
        "prompt": "Homework and Next Steps",
        "instructions": "Explain homework clearly. Send reminder to parents via app.",
        "homework": "Teach your family to say Hello, my name is... in English!",
        "practice": "Greet 3 people at home using English",
        "nextLesson": "Next time: Nice to Meet You!",
        "media": {
          "type": "image",
          "imagePrompt": "Child showing homework to parent at home, encouraging and supportive scene",
          "alt": "Child with parent doing homework"
        },
        "timeLimit": 120,
        "accessibility": {"screenReaderText": "Homework assignment and next lesson preview"}
      }
    ]
  }'::jsonb,
  ARRAY['Greet others using Hello and Goodbye', 'Introduce yourself with My name is...', 'Recognize and pronounce the letter H sound'],
  ARRAY['hello', 'goodbye', 'name', 'friend', 'teacher'],
  ARRAY['My name is...', 'What is your name?'],
  30,
  '{
    "unit_id": "pre-a1-unit-1",
    "ppp_structure": true,
    "has_audio": true,
    "has_images": true,
    "gamification_enabled": true,
    "phonics_focus": "Letter H",
    "age_group": "4-6 years",
    "difficulty": "beginner"
  }'::jsonb
);