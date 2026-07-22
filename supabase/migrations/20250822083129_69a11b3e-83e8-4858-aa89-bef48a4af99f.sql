-- Insert the three A1 Module 1 lessons with enhanced slide content
-- Using proper JSON escaping

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
  json_build_object(
    'version', '2.0',
    'theme', 'mist-blue',
    'slides', json_build_array(
      json_build_object(
        'id', 'slide-1',
        'type', 'warmup',
        'prompt', 'Welcome to Greetings and Introductions!',
        'instructions', 'Let''s start with an energizing warm-up! Look around and greet your classmates using different ways to say hello!',
        'accessibility', json_build_object('screenReaderText', 'Warm-up greeting activity to start the lesson', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-2',
        'type', 'warmup',
        'prompt', 'Quick Brain Warm-up',
        'instructions', 'Think about what you already know about greetings and introductions. Share one word or idea with a partner!',
        'accessibility', json_build_object('screenReaderText', 'Brain activation exercise about today''s topic', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-3',
        'type', 'warmup',
        'prompt', 'Energy Check!',
        'instructions', 'How are you feeling today? Show me with your body! Stand up if you''re excited, sit if you''re calm, stretch if you''re tired!',
        'accessibility', json_build_object('screenReaderText', 'Physical energy check-in activity', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-4',
        'type', 'vocabulary_preview',
        'prompt', 'Today''s Lesson: Greetings and Introductions',
        'instructions', 'Today we will learn about greetings and introductions. By the end of this lesson, you will be able to: greet people politely, introduce yourself, ask for names, say goodbye.',
        'accessibility', json_build_object('screenReaderText', 'Lesson objectives and goals overview', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-5',
        'type', 'target_language',
        'prompt', 'What We''ll Discover Today',
        'instructions', 'Key words: hello, hi, goodbye, bye, nice, meet. Grammar focus: My name is.... Get ready for an exciting learning journey!',
        'accessibility', json_build_object('screenReaderText', 'Preview of key vocabulary and grammar', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-6',
        'type', 'vocabulary_preview',
        'prompt', 'New Vocabulary',
        'instructions', 'Let''s learn these important words: hello, hi, goodbye, bye, nice, meet, name, pleased. Listen carefully and repeat after me.',
        'accessibility', json_build_object('screenReaderText', 'New vocabulary presentation with pronunciation practice', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-7',
        'type', 'vocabulary_preview',
        'prompt', 'Vocabulary in Context',
        'instructions', 'See examples: "Hello, my name is Sarah." "Nice to meet you!" "Goodbye, see you tomorrow!"',
        'accessibility', json_build_object('screenReaderText', 'Vocabulary words shown in context sentences', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-8',
        'type', 'grammar_focus',
        'prompt', 'Grammar Focus',
        'instructions', 'Today''s grammar pattern: My name is.... Look at these examples: "My name is Tom." "What is your name?" "Nice to meet you, Lisa."',
        'accessibility', json_build_object('screenReaderText', 'Grammar pattern introduction with examples', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-9',
        'type', 'sentence_builder',
        'prompt', 'Building Sentences',
        'instructions', 'Let''s build sentences together! Example: Hello + my name is + [name]. Watch how the pieces fit together!',
        'accessibility', json_build_object('screenReaderText', 'Interactive sentence building demonstration', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-10',
        'type', 'listening_comprehension',
        'prompt', 'Listen and Learn',
        'instructions', 'Listen to these examples. Pay attention to pronunciation and how the words sound together.',
        'accessibility', json_build_object('screenReaderText', 'Listening comprehension with pronunciation focus', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-11',
        'type', 'pronunciation_shadow',
        'prompt', 'Pronunciation Practice',
        'instructions', 'Your turn! Repeat after me. Focus on clear pronunciation. Don''t worry about being perfect!',
        'accessibility', json_build_object('screenReaderText', 'Student pronunciation practice session', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-12',
        'type', 'accuracy_mcq',
        'prompt', 'Fill in the Blanks',
        'instructions', 'Complete these sentences using our new vocabulary. Choose the best word for each blank!',
        'options', json_build_array(
          json_build_object('id', '1', 'text', 'Hello, _____ name is Sarah.', 'options', json_build_array('my', 'your', 'his'), 'correct', 'my'),
          json_build_object('id', '2', 'text', 'Nice to _____ you!', 'options', json_build_array('see', 'meet', 'know'), 'correct', 'meet')
        ),
        'correct', json_build_array('my', 'meet'),
        'accessibility', json_build_object('screenReaderText', 'Fill-in-the-blank exercise with vocabulary', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-13',
        'type', 'picture_choice',
        'prompt', 'Match Words and Meanings',
        'instructions', 'Connect each word with its correct meaning or picture!',
        'options', json_build_array(
          json_build_object('id', '1', 'text', 'hello', 'image', 'greeting', 'match', 'greeting'),
          json_build_object('id', '2', 'text', 'goodbye', 'image', 'farewell', 'match', 'farewell')
        ),
        'correct', json_build_array('greeting', 'farewell'),
        'accessibility', json_build_object('screenReaderText', 'Vocabulary matching exercise with visual aids', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-14',
        'type', 'transform',
        'prompt', 'Sentence Ordering',
        'instructions', 'Put these words in the correct order to make sentences!',
        'options', json_build_array(
          json_build_object('id', '1', 'words', json_build_array('Hello', 'my', 'name', 'is', 'Tom'), 'correct', 'Hello, my name is Tom.')
        ),
        'correct', json_build_array('Hello, my name is Tom.'),
        'accessibility', json_build_object('screenReaderText', 'Sentence ordering and construction activity', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-15',
        'type', 'error_fix',
        'prompt', 'Find and Fix Mistakes',
        'instructions', 'These sentences have small errors. Can you spot and fix them?',
        'options', json_build_array(
          json_build_object('id', '1', 'incorrect', 'Hello, me name is Sarah.', 'correct', 'Hello, my name is Sarah.')
        ),
        'correct', json_build_array('Hello, my name is Sarah.'),
        'accessibility', json_build_object('screenReaderText', 'Error identification and correction exercise', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-16',
        'type', 'labeling',
        'prompt', 'Drag and Drop Practice',
        'instructions', 'Drag the correct words to complete these sentences!',
        'accessibility', json_build_object('screenReaderText', 'Interactive drag and drop sentence completion', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-17',
        'type', 'controlled_practice',
        'prompt', 'Quick Quiz Challenge!',
        'instructions', 'Fast-paced quiz time! Answer quickly and have fun!',
        'options', json_build_array(
          json_build_object('id', '1', 'question', 'How do you say hello?', 'options', json_build_array('Hello', 'Goodbye', 'Thank you'), 'correct', 'Hello')
        ),
        'correct', json_build_array('Hello'),
        'accessibility', json_build_object('screenReaderText', 'Quick-fire quiz with immediate feedback', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-18',
        'type', 'controlled_practice',
        'prompt', 'Spinning Wheel Q&A',
        'instructions', 'Answer the questions that appear! Support each other!',
        'accessibility', json_build_object('screenReaderText', 'Interactive spinning wheel question game', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-19',
        'type', 'roleplay_setup',
        'prompt', 'Mini Role-Play Setup',
        'instructions', 'Role-play: Meet a new classmate! One person says hello and introduces themselves. The other responds politely.',
        'accessibility', json_build_object('screenReaderText', 'Role-play activity preparation and setup', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-20',
        'type', 'fluency_sprint',
        'prompt', 'Speed Challenge',
        'instructions', 'How quickly can you use all the new words in sentences? Go for fluency!',
        'accessibility', json_build_object('screenReaderText', 'Fluency-building speed speaking exercise', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-21',
        'type', 'communicative_task',
        'prompt', 'Pair Work Practice',
        'instructions', 'Work with a partner! Take turns using today''s new language!',
        'accessibility', json_build_object('screenReaderText', 'Paired conversation practice activity', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-22',
        'type', 'picture_description',
        'prompt', 'Ask and Answer',
        'instructions', 'Look at the pictures and ask your partner questions. Use our new vocabulary!',
        'accessibility', json_build_object('screenReaderText', 'Picture-based question and answer activity', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-23',
        'type', 'roleplay_setup',
        'prompt', 'Real-Life Role-Play',
        'instructions', 'Practice the role-play using everything you''ve learned today!',
        'accessibility', json_build_object('screenReaderText', 'Real-life scenario role-play performance', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-24',
        'type', 'review_consolidation',
        'prompt', 'Today''s Key Learning',
        'instructions', 'Let''s review! New vocabulary: hello, hi, goodbye, bye. Grammar: My name is.... Great job!',
        'accessibility', json_build_object('screenReaderText', 'Lesson summary and key learning review', 'highContrast', false, 'largeText', false)
      ),
      json_build_object(
        'id', 'slide-25',
        'type', 'exit_check',
        'prompt', 'Exit Check & Homework',
        'instructions', 'Show me what you learned! Practice using hello in real conversations this week!',
        'accessibility', json_build_object('screenReaderText', 'Final assessment and homework assignment', 'highContrast', false, 'largeText', false)
      )
    ),
    'durationMin', 60,
    'total_slides', 25,
    'metadata', json_build_object(
      'CEFR', 'A1',
      'module', 1,
      'lesson', 1,
      'targets', json_build_array('greet people politely', 'introduce yourself', 'ask for names', 'say goodbye'),
      'weights', json_build_object('accuracy', 0.6, 'fluency', 0.4)
    )
  )::jsonb,
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

-- Second lesson: Alphabet and Spelling Names
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
  json_build_object(
    'version', '2.0',
    'theme', 'mist-blue',
    'slides', json_build_array(
      json_build_object('id', 'slide-1', 'type', 'warmup', 'prompt', 'Welcome to The Alphabet and Spelling Names!', 'instructions', 'Let''s start with an energizing warm-up! Practice saying the alphabet together!', 'accessibility', json_build_object('screenReaderText', 'Alphabet warm-up activity', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-2', 'type', 'warmup', 'prompt', 'Letter Recognition', 'instructions', 'Point to letters around the room. Can you name them?', 'accessibility', json_build_object('screenReaderText', 'Letter recognition activity', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-3', 'type', 'warmup', 'prompt', 'Spelling Your Name', 'instructions', 'Think about your name. How many letters does it have?', 'accessibility', json_build_object('screenReaderText', 'Name spelling preparation', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-4', 'type', 'vocabulary_preview', 'prompt', 'Today''s Lesson: The Alphabet and Spelling Names', 'instructions', 'Today we will learn to spell names correctly, use the alphabet, ask about spelling, and write names.', 'accessibility', json_build_object('screenReaderText', 'Lesson objectives overview', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-5', 'type', 'target_language', 'prompt', 'Key Learning Today', 'instructions', 'Key words: letter, spell, alphabet, capital, small, first. Grammar: How do you spell...?', 'accessibility', json_build_object('screenReaderText', 'Key vocabulary and grammar preview', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-6', 'type', 'vocabulary_preview', 'prompt', 'New Vocabulary', 'instructions', 'Learn these words: letter, spell, alphabet, capital, small, first, last, family. Repeat after me!', 'accessibility', json_build_object('screenReaderText', 'Vocabulary presentation', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-7', 'type', 'vocabulary_preview', 'prompt', 'Words in Sentences', 'instructions', 'Examples: "How do you spell your name?" "My first name starts with a capital letter." "A-B-C are letters."', 'accessibility', json_build_object('screenReaderText', 'Vocabulary in context', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-8', 'type', 'grammar_focus', 'prompt', 'Asking About Spelling', 'instructions', 'Pattern: "How do you spell...?" Examples: "How do you spell Tom? T-O-M." "My first name is Anna. A-N-N-A."', 'accessibility', json_build_object('screenReaderText', 'Grammar pattern for spelling questions', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-9', 'type', 'sentence_builder', 'prompt', 'Building Questions', 'instructions', 'Build: How + do you spell + [name]? Practice with different names!', 'accessibility', json_build_object('screenReaderText', 'Sentence construction practice', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-10', 'type', 'listening_comprehension', 'prompt', 'Listen to Spelling', 'instructions', 'Listen to names being spelled. Can you write the letters?', 'accessibility', json_build_object('screenReaderText', 'Listening to letter spelling', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-11', 'type', 'pronunciation_shadow', 'prompt', 'Say the Alphabet', 'instructions', 'Practice saying each letter clearly: A-B-C-D-E-F-G...', 'accessibility', json_build_object('screenReaderText', 'Alphabet pronunciation practice', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-12', 'type', 'accuracy_mcq', 'prompt', 'Complete the Sentences', 'instructions', 'Choose the right word for each blank!', 'options', json_build_array(json_build_object('id', '1', 'text', 'How do you _____ your name?', 'options', json_build_array('spell', 'say', 'write'), 'correct', 'spell'), json_build_object('id', '2', 'text', 'My _____ name is Tom.', 'options', json_build_array('first', 'last', 'full'), 'correct', 'first')), 'correct', json_build_array('spell', 'first'), 'accessibility', json_build_object('screenReaderText', 'Fill-in-the-blank with spelling vocabulary', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-13', 'type', 'picture_choice', 'prompt', 'Match Letters', 'instructions', 'Match each letter with its sound or example!', 'accessibility', json_build_object('screenReaderText', 'Letter matching activity', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-14', 'type', 'transform', 'prompt', 'Order the Words', 'instructions', 'Make a question: How + do + you + spell + that = ?', 'accessibility', json_build_object('screenReaderText', 'Sentence ordering for spelling questions', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-15', 'type', 'error_fix', 'prompt', 'Fix the Mistake', 'instructions', 'Wrong: "How you spell your name?" Right: "How do you spell your name?"', 'accessibility', json_build_object('screenReaderText', 'Grammar error correction', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-16', 'type', 'labeling', 'prompt', 'Drag Letters', 'instructions', 'Drag letters to spell names correctly!', 'accessibility', json_build_object('screenReaderText', 'Interactive letter dragging activity', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-17', 'type', 'controlled_practice', 'prompt', 'Quick Letter Quiz', 'instructions', 'How many letters in "cat"? A) 2  B) 3  C) 4', 'accessibility', json_build_object('screenReaderText', 'Letter counting quiz', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-18', 'type', 'controlled_practice', 'prompt', 'Spelling Wheel', 'instructions', 'Spin and spell the name that appears!', 'accessibility', json_build_object('screenReaderText', 'Interactive spelling wheel game', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-19', 'type', 'roleplay_setup', 'prompt', 'Spelling Help Role-Play', 'instructions', 'One person asks for spelling help, the other helps them spell their name.', 'accessibility', json_build_object('screenReaderText', 'Spelling assistance role-play setup', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-20', 'type', 'fluency_sprint', 'prompt', 'Speed Spelling', 'instructions', 'How fast can you spell 5 different names? Go!', 'accessibility', json_build_object('screenReaderText', 'Fast spelling challenge', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-21', 'type', 'communicative_task', 'prompt', 'Partner Spelling', 'instructions', 'Ask your partner to spell their full name. Help each other!', 'accessibility', json_build_object('screenReaderText', 'Partner spelling practice', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-22', 'type', 'picture_description', 'prompt', 'Name Tags', 'instructions', 'Look at the name tags. Ask questions about how to spell each name.', 'accessibility', json_build_object('screenReaderText', 'Name tag spelling questions', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-23', 'type', 'roleplay_setup', 'prompt', 'Real Spelling Situations', 'instructions', 'Practice: "Excuse me, how do you spell your name? I want to write it correctly."', 'accessibility', json_build_object('screenReaderText', 'Real-life spelling scenarios', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-24', 'type', 'review_consolidation', 'prompt', 'What We Learned', 'instructions', 'Review: letter, spell, alphabet, capital letters, and "How do you spell...?" Great progress!', 'accessibility', json_build_object('screenReaderText', 'Lesson review and summary', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-25', 'type', 'exit_check', 'prompt', 'Show What You Know', 'instructions', 'Spell your first name out loud. Ask someone how to spell their name!', 'accessibility', json_build_object('screenReaderText', 'Final spelling demonstration', 'highContrast', false, 'largeText', false))
    ),
    'durationMin', 60,
    'total_slides', 25,
    'metadata', json_build_object('CEFR', 'A1', 'module', 1, 'lesson', 2, 'targets', json_build_array('spell names correctly', 'use the alphabet', 'ask about spelling', 'write names'), 'weights', json_build_object('accuracy', 0.6, 'fluency', 0.4))
  )::jsonb,
  60,
  ARRAY['spell names correctly', 'use the alphabet', 'ask about spelling', 'write names'],
  ARRAY['letter', 'spell', 'alphabet', 'capital', 'small', 'first', 'last', 'family'],
  ARRAY['How do you spell...?', 'My first name is...', 'Capital letter A'],
  'beginner',
  jsonb_build_object('isAIGenerated', true, 'generatedAt', now(), 'model', 'enhanced-lesson-generator')
);

-- Third lesson: Numbers and Age  
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
  json_build_object(
    'version', '2.0',
    'theme', 'mist-blue',
    'slides', json_build_array(
      json_build_object('id', 'slide-1', 'type', 'warmup', 'prompt', 'Welcome to Numbers and Age!', 'instructions', 'Let''s count together! Count from 1 to 10 with me: 1, 2, 3...', 'accessibility', json_build_object('screenReaderText', 'Numbers counting warm-up', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-2', 'type', 'warmup', 'prompt', 'How Old Are You?', 'instructions', 'Think about your age. Show that many fingers!', 'accessibility', json_build_object('screenReaderText', 'Age thinking activity', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-3', 'type', 'warmup', 'prompt', 'Number Hunt', 'instructions', 'Look around the room. Can you find any numbers?', 'accessibility', json_build_object('screenReaderText', 'Number recognition in environment', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-4', 'type', 'vocabulary_preview', 'prompt', 'Today''s Lesson: Numbers 1–20 and Age', 'instructions', 'Today we will count from 1 to 20, ask about age, say your age, and use numbers in sentences.', 'accessibility', json_build_object('screenReaderText', 'Numbers and age lesson objectives', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-5', 'type', 'target_language', 'prompt', 'Key Learning Today', 'instructions', 'Key words: one, two, three, four, five, age, years, old. Grammar: I am ... years old.', 'accessibility', json_build_object('screenReaderText', 'Numbers vocabulary and age grammar preview', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-6', 'type', 'vocabulary_preview', 'prompt', 'Learning Numbers', 'instructions', 'Let''s learn: one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve... up to twenty!', 'accessibility', json_build_object('screenReaderText', 'Numbers 1-20 vocabulary presentation', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-7', 'type', 'vocabulary_preview', 'prompt', 'Numbers in Sentences', 'instructions', 'Examples: "I am ten years old." "She is five." "Count from one to twenty." "How old are you?"', 'accessibility', json_build_object('screenReaderText', 'Numbers in context sentences', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-8', 'type', 'grammar_focus', 'prompt', 'Talking About Age', 'instructions', 'Pattern: "I am ... years old." Examples: "I am twelve years old." "How old are you?" "She is fifteen."', 'accessibility', json_build_object('screenReaderText', 'Age grammar pattern examples', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-9', 'type', 'sentence_builder', 'prompt', 'Building Age Sentences', 'instructions', 'Build: I am + [number] + years old. Try with different ages!', 'accessibility', json_build_object('screenReaderText', 'Age sentence construction practice', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-10', 'type', 'listening_comprehension', 'prompt', 'Listen to Numbers', 'instructions', 'Listen to numbers and ages. Can you write what you hear?', 'accessibility', json_build_object('screenReaderText', 'Numbers and age listening practice', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-11', 'type', 'pronunciation_shadow', 'prompt', 'Say the Numbers', 'instructions', 'Practice saying clearly: one, two, three, four, five... up to twenty!', 'accessibility', json_build_object('screenReaderText', 'Numbers pronunciation practice', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-12', 'type', 'accuracy_mcq', 'prompt', 'Choose the Right Word', 'instructions', 'Complete these sentences!', 'options', json_build_array(json_build_object('id', '1', 'text', 'I am _____ years old.', 'options', json_build_array('ten', 'tens', 'tenth'), 'correct', 'ten'), json_build_object('id', '2', 'text', 'How _____ are you?', 'options', json_build_array('age', 'old', 'years'), 'correct', 'old')), 'correct', json_build_array('ten', 'old'), 'accessibility', json_build_object('screenReaderText', 'Age vocabulary fill-in-the-blank', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-13', 'type', 'picture_choice', 'prompt', 'Match Numbers', 'instructions', 'Match the written number with the digit: five = 5, ten = 10', 'accessibility', json_build_object('screenReaderText', 'Number word to digit matching', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-14', 'type', 'transform', 'prompt', 'Order the Words', 'instructions', 'Make a sentence: I + am + ten + years + old = ?', 'accessibility', json_build_object('screenReaderText', 'Age sentence word ordering', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-15', 'type', 'error_fix', 'prompt', 'Fix the Mistake', 'instructions', 'Wrong: "I am ten year old." Right: "I am ten years old." (Don''t forget the ''s''!)', 'accessibility', json_build_object('screenReaderText', 'Age grammar error correction', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-16', 'type', 'labeling', 'prompt', 'Drag Numbers', 'instructions', 'Drag the right numbers to complete: "I am ___ years old."', 'accessibility', json_build_object('screenReaderText', 'Interactive number dragging for age', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-17', 'type', 'controlled_practice', 'prompt', 'Quick Number Quiz', 'instructions', 'What comes after nine? A) ten  B) eleven  C) eight', 'accessibility', json_build_object('screenReaderText', 'Number sequence quiz', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-18', 'type', 'controlled_practice', 'prompt', 'Age Guessing Game', 'instructions', 'Guess: How old is this person? Use "I think you are ___ years old."', 'accessibility', json_build_object('screenReaderText', 'Age guessing practice game', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-19', 'type', 'roleplay_setup', 'prompt', 'Age Question Role-Play', 'instructions', 'Practice: One person asks "How old are you?" The other answers with their age.', 'accessibility', json_build_object('screenReaderText', 'Age question role-play preparation', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-20', 'type', 'fluency_sprint', 'prompt', 'Speed Counting', 'instructions', 'How fast can you count from 1 to 20? Ready, go!', 'accessibility', json_build_object('screenReaderText', 'Fast counting challenge', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-21', 'type', 'communicative_task', 'prompt', 'Find Someone Who...', 'instructions', 'Find someone who is the same age as you! Ask: "How old are you?"', 'accessibility', json_build_object('screenReaderText', 'Age-finding communication activity', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-22', 'type', 'picture_description', 'prompt', 'Family Ages', 'instructions', 'Look at this family photo. Ask and answer: "How old is the mother/father/child?"', 'accessibility', json_build_object('screenReaderText', 'Family age discussion activity', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-23', 'type', 'roleplay_setup', 'prompt', 'Meeting New People', 'instructions', 'Practice introducing yourself with age: "Hi, I''m Maria. I''m sixteen years old."', 'accessibility', json_build_object('screenReaderText', 'Age introduction role-play', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-24', 'type', 'review_consolidation', 'prompt', 'Numbers We Learned', 'instructions', 'Review: one to twenty, age vocabulary, "I am ... years old," and "How old are you?" Excellent work!', 'accessibility', json_build_object('screenReaderText', 'Numbers and age lesson review', 'highContrast', false, 'largeText', false)),
      json_build_object('id', 'slide-25', 'type', 'exit_check', 'prompt', 'Show Your Numbers', 'instructions', 'Count from 1 to 20. Tell me your age. Ask someone else their age!', 'accessibility', json_build_object('screenReaderText', 'Final numbers and age demonstration', 'highContrast', false, 'largeText', false))
    ),
    'durationMin', 60,
    'total_slides', 25,
    'metadata', json_build_object('CEFR', 'A1', 'module', 1, 'lesson', 3, 'targets', json_build_array('count from 1 to 20', 'ask about age', 'say your age', 'use numbers'), 'weights', json_build_object('accuracy', 0.6, 'fluency', 0.4))
  )::jsonb,
  60,
  ARRAY['count from 1 to 20', 'ask about age', 'say your age', 'use numbers'],
  ARRAY['one', 'two', 'three', 'four', 'five', 'age', 'years', 'old'],
  ARRAY['I am ... years old', 'How old are you?', 'She is ten'],
  'beginner',
  jsonb_build_object('isAIGenerated', true, 'generatedAt', now(), 'model', 'enhanced-lesson-generator')
);