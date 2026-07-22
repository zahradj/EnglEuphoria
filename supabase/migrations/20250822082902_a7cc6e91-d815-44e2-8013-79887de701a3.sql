-- Insert the three A1 Module 1 lessons with enhanced slide content

-- First, let's insert "Greetings and Introductions" lesson
INSERT INTO public.lessons_content (
  title,
  topic, 
  cefr_level,
  module_number,
  lesson_number,
  slides_content,
  duration_minutes,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  difficulty_level,
  metadata
) VALUES (
  'Greetings and Introductions',
  'greetings and introductions',
  'A1',
  1,
  1,
  '{
    "version": "2.0",
    "theme": "mist-blue", 
    "slides": [
      {
        "id": "slide-1",
        "type": "warmup",
        "prompt": "Welcome to Greetings and Introductions!",
        "instructions": "Let'\''s start with an energizing warm-up! Look around and greet your classmates using different ways to say hello!",
        "accessibility": {
          "screenReaderText": "Warm-up greeting activity to start the lesson",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-2",
        "type": "warmup",
        "prompt": "Quick Brain Warm-up",
        "instructions": "Think about what you already know about greetings and introductions. Share one word or idea with a partner!",
        "accessibility": {
          "screenReaderText": "Brain activation exercise about today'\''s topic",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-3",
        "type": "warmup",
        "prompt": "Energy Check!",
        "instructions": "How are you feeling today? Show me with your body! Stand up if you'\''re excited, sit if you'\''re calm, stretch if you'\''re tired!",
        "accessibility": {
          "screenReaderText": "Physical energy check-in activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-4",
        "type": "vocabulary_preview",
        "prompt": "Today'\''s Lesson: Greetings and Introductions",
        "instructions": "Today we will learn about greetings and introductions. By the end of this lesson, you will be able to: greet people politely, introduce yourself, ask for names, say goodbye.",
        "accessibility": {
          "screenReaderText": "Lesson objectives and goals overview",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-5",
        "type": "target_language",
        "prompt": "What We'\''ll Discover Today",
        "instructions": "Key words: hello, hi, goodbye, bye, nice, meet. Grammar focus: My name is.... Get ready for an exciting learning journey!",
        "accessibility": {
          "screenReaderText": "Preview of key vocabulary and grammar",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-6",
        "type": "vocabulary_preview",
        "prompt": "New Vocabulary",
        "instructions": "Let'\''s learn these important words: hello, hi, goodbye, bye, nice, meet, name, pleased. Listen carefully and repeat after me.",
        "accessibility": {
          "screenReaderText": "New vocabulary presentation with pronunciation practice",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-7",
        "type": "vocabulary_preview",
        "prompt": "Vocabulary in Context",
        "instructions": "See examples: '\''Hello, my name is Sarah.'\'' '\''Nice to meet you!'\'' '\''Goodbye, see you tomorrow!'\''",
        "accessibility": {
          "screenReaderText": "Vocabulary words shown in context sentences",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-8",
        "type": "grammar_focus",
        "prompt": "Grammar Focus",
        "instructions": "Today'\''s grammar pattern: My name is.... Look at these examples: '\''My name is Tom.'\'' '\''What is your name?'\'' '\''Nice to meet you, Lisa.'\''",
        "accessibility": {
          "screenReaderText": "Grammar pattern introduction with examples",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-9",
        "type": "sentence_builder",
        "prompt": "Building Sentences",
        "instructions": "Let'\''s build sentences together! Example: Hello + my name is + [name]. Watch how the pieces fit together!",
        "accessibility": {
          "screenReaderText": "Interactive sentence building demonstration",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-10",
        "type": "listening_comprehension",
        "prompt": "Listen and Learn",
        "instructions": "Listen to these examples. Pay attention to pronunciation and how the words sound together.",
        "accessibility": {
          "screenReaderText": "Listening comprehension with pronunciation focus",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-11",
        "type": "pronunciation_shadow",
        "prompt": "Pronunciation Practice",
        "instructions": "Your turn! Repeat after me. Focus on clear pronunciation. Don'\''t worry about being perfect!",
        "accessibility": {
          "screenReaderText": "Student pronunciation practice session",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-12",
        "type": "accuracy_mcq",
        "prompt": "Fill in the Blanks",
        "instructions": "Complete these sentences using our new vocabulary. Choose the best word for each blank!",
        "options": [
          {"id": "1", "text": "Hello, _____ name is Sarah.", "options": ["my", "your", "his"], "correct": "my"},
          {"id": "2", "text": "Nice to _____ you!", "options": ["see", "meet", "know"], "correct": "meet"}
        ],
        "correct": ["my", "meet"],
        "accessibility": {
          "screenReaderText": "Fill-in-the-blank exercise with vocabulary",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-13",
        "type": "picture_choice",
        "prompt": "Match Words and Meanings",
        "instructions": "Connect each word with its correct meaning or picture!",
        "options": [
          {"id": "1", "text": "hello", "image": "greeting", "match": "greeting"},
          {"id": "2", "text": "goodbye", "image": "farewell", "match": "farewell"}
        ],
        "correct": ["greeting", "farewell"],
        "accessibility": {
          "screenReaderText": "Vocabulary matching exercise with visual aids",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-14",
        "type": "transform",
        "prompt": "Sentence Ordering",
        "instructions": "Put these words in the correct order to make sentences!",
        "options": [
          {"id": "1", "words": ["Hello", "my", "name", "is", "Tom"], "correct": "Hello, my name is Tom."}
        ],
        "correct": ["Hello, my name is Tom."],
        "accessibility": {
          "screenReaderText": "Sentence ordering and construction activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-15",
        "type": "error_fix",
        "prompt": "Find and Fix Mistakes",
        "instructions": "These sentences have small errors. Can you spot and fix them?",
        "options": [
          {"id": "1", "incorrect": "Hello, me name is Sarah.", "correct": "Hello, my name is Sarah."}
        ],
        "correct": ["Hello, my name is Sarah."],
        "accessibility": {
          "screenReaderText": "Error identification and correction exercise",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-16",
        "type": "labeling",
        "prompt": "Drag and Drop Practice",
        "instructions": "Drag the correct words to complete these sentences!",
        "accessibility": {
          "screenReaderText": "Interactive drag and drop sentence completion",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-17",
        "type": "controlled_practice",
        "prompt": "Quick Quiz Challenge!",
        "instructions": "Fast-paced quiz time! Answer quickly and have fun!",
        "options": [
          {"id": "1", "question": "How do you say hello?", "options": ["Hello", "Goodbye", "Thank you"], "correct": "Hello"}
        ],
        "correct": ["Hello"],
        "accessibility": {
          "screenReaderText": "Quick-fire quiz with immediate feedback",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-18",
        "type": "controlled_practice",
        "prompt": "Spinning Wheel Q&A",
        "instructions": "Answer the questions that appear! Support each other!",
        "accessibility": {
          "screenReaderText": "Interactive spinning wheel question game",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-19",
        "type": "roleplay_setup",
        "prompt": "Mini Role-Play Setup",
        "instructions": "Role-play: Meet a new classmate! One person says hello and introduces themselves. The other responds politely.",
        "accessibility": {
          "screenReaderText": "Role-play activity preparation and setup",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-20",
        "type": "fluency_sprint",
        "prompt": "Speed Challenge",
        "instructions": "How quickly can you use all the new words in sentences? Go for fluency!",
        "accessibility": {
          "screenReaderText": "Fluency-building speed speaking exercise",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-21",
        "type": "communicative_task",
        "prompt": "Pair Work Practice",
        "instructions": "Work with a partner! Take turns using today'\''s new language!",
        "accessibility": {
          "screenReaderText": "Paired conversation practice activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-22",
        "type": "picture_description",
        "prompt": "Ask and Answer",
        "instructions": "Look at the pictures and ask your partner questions. Use our new vocabulary!",
        "accessibility": {
          "screenReaderText": "Picture-based question and answer activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-23",
        "type": "roleplay_setup",
        "prompt": "Real-Life Role-Play",
        "instructions": "Practice the role-play using everything you'\''ve learned today!",
        "accessibility": {
          "screenReaderText": "Real-life scenario role-play performance",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-24",
        "type": "review_consolidation",
        "prompt": "Today'\''s Key Learning",
        "instructions": "Let'\''s review! New vocabulary: hello, hi, goodbye, bye. Grammar: My name is.... Great job!",
        "accessibility": {
          "screenReaderText": "Lesson summary and key learning review",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-25",
        "type": "exit_check",
        "prompt": "Exit Check & Homework",
        "instructions": "Show me what you learned! Practice using hello in real conversations this week!",
        "accessibility": {
          "screenReaderText": "Final assessment and homework assignment",
          "highContrast": false,
          "largeText": false
        }
      }
    ],
    "durationMin": 60,
    "total_slides": 25,
    "metadata": {
      "CEFR": "A1",
      "module": 1,
      "lesson": 1,
      "targets": ["greet people politely", "introduce yourself", "ask for names", "say goodbye"],
      "weights": {
        "accuracy": 0.6,
        "fluency": 0.4
      }
    }
  }'::jsonb,
  60,
  ARRAY['greet people politely', 'introduce yourself', 'ask for names', 'say goodbye'],
  ARRAY['hello', 'hi', 'goodbye', 'bye', 'nice', 'meet', 'name', 'pleased'],
  ARRAY['My name is...', 'What is your name?', 'Nice to meet you'],
  'beginner',
  jsonb_build_object(
    'isAIGenerated', true,
    'generatedAt', now(),
    'model', 'enhanced-lesson-generator'
  )
);

-- Second, insert "The Alphabet and Spelling Names" lesson
INSERT INTO public.lessons_content (
  title,
  topic, 
  cefr_level,
  module_number,
  lesson_number,
  slides_content,
  duration_minutes,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  difficulty_level,
  metadata
) VALUES (
  'The Alphabet and Spelling Names',
  'alphabet and spelling',
  'A1',
  1,
  2,
  '{
    "version": "2.0",
    "theme": "mist-blue", 
    "slides": [
      {
        "id": "slide-1",
        "type": "warmup",
        "prompt": "Welcome to The Alphabet and Spelling Names!",
        "instructions": "Let'\''s start with an energizing warm-up! Look around and greet your classmates using different ways to say hello!",
        "accessibility": {
          "screenReaderText": "Warm-up greeting activity to start the lesson",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-2",
        "type": "warmup",
        "prompt": "Quick Brain Warm-up",
        "instructions": "Think about what you already know about alphabet and spelling. Share one word or idea with a partner!",
        "accessibility": {
          "screenReaderText": "Brain activation exercise about today'\''s topic",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-3",
        "type": "warmup",
        "prompt": "Energy Check!",
        "instructions": "How are you feeling today? Show me with your body! Stand up if you'\''re excited, sit if you'\''re calm, stretch if you'\''re tired!",
        "accessibility": {
          "screenReaderText": "Physical energy check-in activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-4",
        "type": "vocabulary_preview",
        "prompt": "Today'\''s Lesson: The Alphabet and Spelling Names",
        "instructions": "Today we will learn about alphabet and spelling. By the end of this lesson, you will be able to: spell names correctly, use the alphabet, ask about spelling, write names.",
        "accessibility": {
          "screenReaderText": "Lesson objectives and goals overview",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-5",
        "type": "target_language",
        "prompt": "What We'\''ll Discover Today",
        "instructions": "Key words: letter, spell, alphabet, capital, small, first. Grammar focus: How do you spell...?. Get ready for an exciting learning journey!",
        "accessibility": {
          "screenReaderText": "Preview of key vocabulary and grammar",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-6",
        "type": "vocabulary_preview",
        "prompt": "New Vocabulary",
        "instructions": "Let'\''s learn these important words: letter, spell, alphabet, capital, small, first, last, family. Listen carefully and repeat after me.",
        "accessibility": {
          "screenReaderText": "New vocabulary presentation with pronunciation practice",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-7",
        "type": "vocabulary_preview",
        "prompt": "Vocabulary in Context",
        "instructions": "Examples: '\''How do you spell your name?'\'' '\''My first name starts with a capital letter.'\'' '\''A-B-C are letters.'\''",
        "accessibility": {
          "screenReaderText": "Vocabulary words shown in context sentences",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-8",
        "type": "grammar_focus",
        "prompt": "Grammar Focus",
        "instructions": "Today'\''s grammar pattern: How do you spell...?. Look at these examples: '\''How do you spell Tom? T-O-M.'\'' '\''My first name is Anna. A-N-N-A.'\''",
        "accessibility": {
          "screenReaderText": "Grammar pattern introduction with examples",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-9",
        "type": "sentence_builder",
        "prompt": "Building Sentences",
        "instructions": "Let'\''s build sentences together! Example: How + do you spell + [name]?. Watch how the pieces fit together!",
        "accessibility": {
          "screenReaderText": "Interactive sentence building demonstration",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-10",
        "type": "listening_comprehension",
        "prompt": "Listen and Learn",
        "instructions": "Listen to these examples. Pay attention to pronunciation and how the words sound together.",
        "accessibility": {
          "screenReaderText": "Listening comprehension with pronunciation focus",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-11",
        "type": "pronunciation_shadow",
        "prompt": "Pronunciation Practice",
        "instructions": "Your turn! Repeat after me. Focus on clear pronunciation. Don'\''t worry about being perfect!",
        "accessibility": {
          "screenReaderText": "Student pronunciation practice session",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-12",
        "type": "accuracy_mcq",
        "prompt": "Fill in the Blanks",
        "instructions": "Complete these sentences using our new vocabulary. Choose the best word for each blank!",
        "options": [
          {"id": "1", "text": "How do you _____ your name?", "options": ["spell", "say", "write"], "correct": "spell"},
          {"id": "2", "text": "My _____ name is Tom.", "options": ["first", "last", "full"], "correct": "first"}
        ],
        "correct": ["spell", "first"],
        "accessibility": {
          "screenReaderText": "Fill-in-the-blank exercise with vocabulary",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-13",
        "type": "picture_choice",
        "prompt": "Match Words and Meanings",
        "instructions": "Connect each word with its correct meaning or picture!",
        "options": [
          {"id": "1", "text": "A", "image": "letter-a", "match": "first letter"},
          {"id": "2", "text": "spell", "image": "spelling", "match": "S-P-E-L-L"}
        ],
        "correct": ["first letter", "S-P-E-L-L"],
        "accessibility": {
          "screenReaderText": "Vocabulary matching exercise with visual aids",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-14",
        "type": "transform",
        "prompt": "Sentence Ordering",
        "instructions": "Put these words in the correct order to make sentences!",
        "options": [
          {"id": "1", "words": ["How", "do", "you", "spell", "that"], "correct": "How do you spell that?"}
        ],
        "correct": ["How do you spell that?"],
        "accessibility": {
          "screenReaderText": "Sentence ordering and construction activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-15",
        "type": "error_fix",
        "prompt": "Find and Fix Mistakes",
        "instructions": "These sentences have small errors. Can you spot and fix them?",
        "options": [
          {"id": "1", "incorrect": "How you spell your name?", "correct": "How do you spell your name?"}
        ],
        "correct": ["How do you spell your name?"],
        "accessibility": {
          "screenReaderText": "Error identification and correction exercise",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-16",
        "type": "labeling",
        "prompt": "Drag and Drop Practice",
        "instructions": "Drag the correct words to complete these sentences!",
        "accessibility": {
          "screenReaderText": "Interactive drag and drop sentence completion",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-17",
        "type": "controlled_practice",
        "prompt": "Quick Quiz Challenge!",
        "instructions": "Fast-paced quiz time! Answer quickly and have fun!",
        "options": [
          {"id": "1", "question": "How many letters in '\''cat'\''?", "options": ["2", "3", "4"], "correct": "3"}
        ],
        "correct": ["3"],
        "accessibility": {
          "screenReaderText": "Quick-fire quiz with immediate feedback",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-18",
        "type": "controlled_practice",
        "prompt": "Spinning Wheel Q&A",
        "instructions": "Answer the questions that appear! Support each other!",
        "accessibility": {
          "screenReaderText": "Interactive spinning wheel question game",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-19",
        "type": "roleplay_setup",
        "prompt": "Mini Role-Play Setup",
        "instructions": "Role-play: Help someone spell their name! One person asks for spelling help, the other helps them.",
        "accessibility": {
          "screenReaderText": "Role-play activity preparation and setup",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-20",
        "type": "fluency_sprint",
        "prompt": "Speed Challenge",
        "instructions": "How quickly can you use all the new words in sentences? Go for fluency!",
        "accessibility": {
          "screenReaderText": "Fluency-building speed speaking exercise",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-21",
        "type": "communicative_task",
        "prompt": "Pair Work Practice",
        "instructions": "Work with a partner! Take turns using today'\''s new language!",
        "accessibility": {
          "screenReaderText": "Paired conversation practice activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-22",
        "type": "picture_description",
        "prompt": "Ask and Answer",
        "instructions": "Look at the pictures and ask your partner questions. Use our new vocabulary!",
        "accessibility": {
          "screenReaderText": "Picture-based question and answer activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-23",
        "type": "roleplay_setup",
        "prompt": "Real-Life Role-Play",
        "instructions": "Practice the role-play using everything you'\''ve learned today!",
        "accessibility": {
          "screenReaderText": "Real-life scenario role-play performance",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-24",
        "type": "review_consolidation",
        "prompt": "Today'\''s Key Learning",
        "instructions": "Let'\''s review! New vocabulary: letter, spell, alphabet, capital. Grammar: How do you spell...?. Great job!",
        "accessibility": {
          "screenReaderText": "Lesson summary and key learning review",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-25",
        "type": "exit_check",
        "prompt": "Exit Check & Homework",
        "instructions": "Show me what you learned! Practice using letter in real conversations this week!",
        "accessibility": {
          "screenReaderText": "Final assessment and homework assignment",
          "highContrast": false,
          "largeText": false
        }
      }
    ],
    "durationMin": 60,
    "total_slides": 25,
    "metadata": {
      "CEFR": "A1",
      "module": 1,
      "lesson": 2,
      "targets": ["spell names correctly", "use the alphabet", "ask about spelling", "write names"],
      "weights": {
        "accuracy": 0.6,
        "fluency": 0.4
      }
    }
  }'::jsonb,
  60,
  ARRAY['spell names correctly', 'use the alphabet', 'ask about spelling', 'write names'],
  ARRAY['letter', 'spell', 'alphabet', 'capital', 'small', 'first', 'last', 'family'],
  ARRAY['How do you spell...?', 'My first name is...', 'Capital letter A'],
  'beginner',
  jsonb_build_object(
    'isAIGenerated', true,
    'generatedAt', now(),
    'model', 'enhanced-lesson-generator'
  )
);

-- Third, insert "Numbers 1–20 and Age" lesson
INSERT INTO public.lessons_content (
  title,
  topic, 
  cefr_level,
  module_number,
  lesson_number,
  slides_content,
  duration_minutes,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  difficulty_level,
  metadata
) VALUES (
  'Numbers 1–20 and Age',
  'numbers and age',
  'A1',
  1,
  3,
  '{
    "version": "2.0",
    "theme": "mist-blue", 
    "slides": [
      {
        "id": "slide-1",
        "type": "warmup",
        "prompt": "Welcome to Numbers 1–20 and Age!",
        "instructions": "Let'\''s start with an energizing warm-up! Look around and greet your classmates using different ways to say hello!",
        "accessibility": {
          "screenReaderText": "Warm-up greeting activity to start the lesson",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-2",
        "type": "warmup",
        "prompt": "Quick Brain Warm-up",
        "instructions": "Think about what you already know about numbers and age. Share one word or idea with a partner!",
        "accessibility": {
          "screenReaderText": "Brain activation exercise about today'\''s topic",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-3",
        "type": "warmup",
        "prompt": "Energy Check!",
        "instructions": "How are you feeling today? Show me with your body! Stand up if you'\''re excited, sit if you'\''re calm, stretch if you'\''re tired!",
        "accessibility": {
          "screenReaderText": "Physical energy check-in activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-4",
        "type": "vocabulary_preview",
        "prompt": "Today'\''s Lesson: Numbers 1–20 and Age",
        "instructions": "Today we will learn about numbers and age. By the end of this lesson, you will be able to: count from 1 to 20, ask about age, say your age, use numbers.",
        "accessibility": {
          "screenReaderText": "Lesson objectives and goals overview",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-5",
        "type": "target_language",
        "prompt": "What We'\''ll Discover Today",
        "instructions": "Key words: one, two, three, four, five, age. Grammar focus: I am ... years old. Get ready for an exciting learning journey!",
        "accessibility": {
          "screenReaderText": "Preview of key vocabulary and grammar",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-6",
        "type": "vocabulary_preview",
        "prompt": "New Vocabulary",
        "instructions": "Let'\''s learn these important words: one, two, three, four, five, age, years, old. Listen carefully and repeat after me.",
        "accessibility": {
          "screenReaderText": "New vocabulary presentation with pronunciation practice",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-7",
        "type": "vocabulary_preview",
        "prompt": "Vocabulary in Context",
        "instructions": "Examples: '\''I am ten years old.'\'' '\''She is five.'\'' '\''Count from one to twenty.'\''",
        "accessibility": {
          "screenReaderText": "Vocabulary words shown in context sentences",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-8",
        "type": "grammar_focus",
        "prompt": "Grammar Focus",
        "instructions": "Today'\''s grammar pattern: I am ... years old. Look at these examples: '\''I am twelve years old.'\'' '\''How old are you?'\'' '\''She is fifteen.'\''",
        "accessibility": {
          "screenReaderText": "Grammar pattern introduction with examples",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-9",
        "type": "sentence_builder",
        "prompt": "Building Sentences",
        "instructions": "Let'\''s build sentences together! Example: I am + [number] + years old. Watch how the pieces fit together!",
        "accessibility": {
          "screenReaderText": "Interactive sentence building demonstration",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-10",
        "type": "listening_comprehension",
        "prompt": "Listen and Learn",
        "instructions": "Listen to these examples. Pay attention to pronunciation and how the words sound together.",
        "accessibility": {
          "screenReaderText": "Listening comprehension with pronunciation focus",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-11",
        "type": "pronunciation_shadow",
        "prompt": "Pronunciation Practice",
        "instructions": "Your turn! Repeat after me. Focus on clear pronunciation. Don'\''t worry about being perfect!",
        "accessibility": {
          "screenReaderText": "Student pronunciation practice session",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-12",
        "type": "accuracy_mcq",
        "prompt": "Fill in the Blanks",
        "instructions": "Complete these sentences using our new vocabulary. Choose the best word for each blank!",
        "options": [
          {"id": "1", "text": "I am _____ years old.", "options": ["ten", "tens", "tenth"], "correct": "ten"},
          {"id": "2", "text": "How _____ are you?", "options": ["age", "old", "years"], "correct": "old"}
        ],
        "correct": ["ten", "old"],
        "accessibility": {
          "screenReaderText": "Fill-in-the-blank exercise with vocabulary",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-13",
        "type": "picture_choice",
        "prompt": "Match Words and Meanings",
        "instructions": "Connect each word with its correct meaning or picture!",
        "options": [
          {"id": "1", "text": "five", "image": "number-5", "match": "5"},
          {"id": "2", "text": "ten", "image": "number-10", "match": "10"}
        ],
        "correct": ["5", "10"],
        "accessibility": {
          "screenReaderText": "Vocabulary matching exercise with visual aids",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-14",
        "type": "transform",
        "prompt": "Sentence Ordering",
        "instructions": "Put these words in the correct order to make sentences!",
        "options": [
          {"id": "1", "words": ["I", "am", "ten", "years", "old"], "correct": "I am ten years old."}
        ],
        "correct": ["I am ten years old."],
        "accessibility": {
          "screenReaderText": "Sentence ordering and construction activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-15",
        "type": "error_fix",
        "prompt": "Find and Fix Mistakes",
        "instructions": "These sentences have small errors. Can you spot and fix them?",
        "options": [
          {"id": "1", "incorrect": "I am ten year old.", "correct": "I am ten years old."}
        ],
        "correct": ["I am ten years old."],
        "accessibility": {
          "screenReaderText": "Error identification and correction exercise",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-16",
        "type": "labeling",
        "prompt": "Drag and Drop Practice",
        "instructions": "Drag the correct words to complete these sentences!",
        "accessibility": {
          "screenReaderText": "Interactive drag and drop sentence completion",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-17",
        "type": "controlled_practice",
        "prompt": "Quick Quiz Challenge!",
        "instructions": "Fast-paced quiz time! Answer quickly and have fun!",
        "options": [
          {"id": "1", "question": "What comes after nine?", "options": ["ten", "eleven", "eight"], "correct": "ten"}
        ],
        "correct": ["ten"],
        "accessibility": {
          "screenReaderText": "Quick-fire quiz with immediate feedback",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-18",
        "type": "controlled_practice",
        "prompt": "Spinning Wheel Q&A",
        "instructions": "Answer the questions that appear! Support each other!",
        "accessibility": {
          "screenReaderText": "Interactive spinning wheel question game",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-19",
        "type": "roleplay_setup",
        "prompt": "Mini Role-Play Setup",
        "instructions": "Role-play: Ask about age! One person asks '\''How old are you?'\'' and the other answers with their age.",
        "accessibility": {
          "screenReaderText": "Role-play activity preparation and setup",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-20",
        "type": "fluency_sprint",
        "prompt": "Speed Challenge",
        "instructions": "How quickly can you use all the new words in sentences? Go for fluency!",
        "accessibility": {
          "screenReaderText": "Fluency-building speed speaking exercise",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-21",
        "type": "communicative_task",
        "prompt": "Pair Work Practice",
        "instructions": "Work with a partner! Take turns using today'\''s new language!",
        "accessibility": {
          "screenReaderText": "Paired conversation practice activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-22",
        "type": "picture_description",
        "prompt": "Ask and Answer",
        "instructions": "Look at the pictures and ask your partner questions. Use our new vocabulary!",
        "accessibility": {
          "screenReaderText": "Picture-based question and answer activity",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-23",
        "type": "roleplay_setup",
        "prompt": "Real-Life Role-Play",
        "instructions": "Practice the role-play using everything you'\''ve learned today!",
        "accessibility": {
          "screenReaderText": "Real-life scenario role-play performance",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-24",
        "type": "review_consolidation",
        "prompt": "Today'\''s Key Learning",
        "instructions": "Let'\''s review! New vocabulary: one, two, three, four. Grammar: I am ... years old. Great job!",
        "accessibility": {
          "screenReaderText": "Lesson summary and key learning review",
          "highContrast": false,
          "largeText": false
        }
      },
      {
        "id": "slide-25",
        "type": "exit_check",
        "prompt": "Exit Check & Homework",
        "instructions": "Show me what you learned! Practice using one in real conversations this week!",
        "accessibility": {
          "screenReaderText": "Final assessment and homework assignment",
          "highContrast": false,
          "largeText": false
        }
      }
    ],
    "durationMin": 60,
    "total_slides": 25,
    "metadata": {
      "CEFR": "A1",
      "module": 1,
      "lesson": 3,
      "targets": ["count from 1 to 20", "ask about age", "say your age", "use numbers"],
      "weights": {
        "accuracy": 0.6,
        "fluency": 0.4
      }
    }
  }'::jsonb,
  60,
  ARRAY['count from 1 to 20', 'ask about age', 'say your age', 'use numbers'],
  ARRAY['one', 'two', 'three', 'four', 'five', 'age', 'years', 'old'],
  ARRAY['I am ... years old', 'How old are you?', 'She is ten'],
  'beginner',
  jsonb_build_object(
    'isAIGenerated', true,
    'generatedAt', now(),
    'model', 'enhanced-lesson-generator'
  )
);