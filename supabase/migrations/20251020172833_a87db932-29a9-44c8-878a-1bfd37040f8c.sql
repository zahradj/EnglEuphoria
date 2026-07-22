-- Update Module 1, Lesson 1 for 1-on-1 individual teaching format

UPDATE lessons_content
SET slides_content = jsonb_set(
  jsonb_set(
    jsonb_set(
      slides_content,
      '{metadata}',
      jsonb_build_object(
        'CEFR', 'Pre-A1',
        'module', 1,
        'lesson', 1,
        'format', 'one-on-one',
        'targets', jsonb_build_array(
          'Greet others using Hello and Goodbye',
          'Introduce yourself with My name is...',
          'Recognize letter H sound',
          'Build confidence in speaking English'
        ),
        'weights', jsonb_build_object(
          'accuracy', 50,
          'fluency', 30,
          'confidence', 20
        )
      )
    ),
    '{durationMin}', '35'::jsonb
  ),
  '{slides}',
  jsonb_build_array(
    -- Slide 1: Warmup
    jsonb_build_object(
      'id', 'slide-1',
      'type', 'warmup',
      'prompt', 'Hello! My Name Is...',
      'instructions', 'Play an energetic Hello Song. Encourage the student to wave and smile along with you. Make it interactive and fun!',
      'timeLimit', 180,
      'media', jsonb_build_object(
        'type', 'image',
        'imagePrompt', 'Colorful cartoon children from diverse backgrounds waving hello in a sunny classroom, friendly and welcoming, educational illustration style',
        'alt', 'Children waving hello in classroom'
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Welcome to the Hello lesson. Children are waving hello.',
        'highContrast', true,
        'largeText', true
      ),
      'teacherTips', jsonb_build_array(
        'Model waving and smiling enthusiastically',
        'Encourage student to copy your movements',
        'Make it playful and energetic to build rapport'
      )
    ),
    -- Slide 2: Vocabulary Preview
    jsonb_build_object(
      'id', 'slide-2',
      'type', 'vocabulary_preview',
      'prompt', 'New Words Today',
      'instructions', 'Show each flashcard, model the word clearly. Have the student repeat after you 3 times. Praise correct pronunciation!',
      'timeLimit', 300,
      'vocabulary', jsonb_build_array(
        jsonb_build_object('word', 'hello', 'audio', true, 'imagePrompt', 'Cartoon child waving hello, simple and colorful'),
        jsonb_build_object('word', 'goodbye', 'audio', true, 'imagePrompt', 'Friendly goodbye wave gesture, child-friendly illustration'),
        jsonb_build_object('word', 'name', 'audio', true, 'imagePrompt', 'Name tag with Hello my name is badge, colorful design'),
        jsonb_build_object('word', 'friend', 'audio', true, 'imagePrompt', 'Two children holding hands as friends, diverse and happy'),
        jsonb_build_object('word', 'teacher', 'audio', true, 'imagePrompt', 'Smiling female teacher with glasses in classroom setting')
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Five vocabulary words: hello, goodbye, name, friend, teacher'
      ),
      'teacherTips', jsonb_build_array(
        'Point to yourself when saying each word',
        'Use exaggerated mouth movements for pronunciation',
        'Give immediate positive feedback after each repetition',
        'Track which words need more practice'
      )
    ),
    -- Slide 3: Controlled Practice
    jsonb_build_object(
      'id', 'slide-3',
      'type', 'controlled_practice',
      'prompt', 'What Is This?',
      'instructions', 'Point to each picture and ask "What is this?" Wait for the student''s response. Give immediate feedback and encouragement.',
      'timeLimit', 240,
      'images', jsonb_build_array(
        jsonb_build_object('id', 'img-1', 'label', 'Hello', 'imagePrompt', 'Hand waving hello gesture'),
        jsonb_build_object('id', 'img-2', 'label', 'Goodbye', 'imagePrompt', 'Hand waving goodbye gesture'),
        jsonb_build_object('id', 'img-3', 'label', 'Name', 'imagePrompt', 'Name tag badge'),
        jsonb_build_object('id', 'img-4', 'label', 'Friend', 'imagePrompt', 'Two smiling friends')
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Point and say activity with four images'
      ),
      'teacherTips', jsonb_build_array(
        'Point to images in random order to keep student engaged',
        'If student struggles, give first sound as hint',
        'Celebrate every correct answer enthusiastically'
      )
    ),
    -- Slide 4: Drag & Drop
    jsonb_build_object(
      'id', 'slide-4',
      'type', 'drag_drop',
      'prompt', 'Match the Words to Pictures',
      'instructions', 'Guide the student through matching words to pictures. Let them try independently, then provide hints if needed. Celebrate each match!',
      'timeLimit', 300,
      'xpReward', 50,
      'pairs', jsonb_build_array(
        jsonb_build_object('id', 'pair-1', 'word', 'hello', 'imagePrompt', 'Cartoon child waving hello'),
        jsonb_build_object('id', 'pair-2', 'word', 'goodbye', 'imagePrompt', 'Goodbye wave gesture'),
        jsonb_build_object('id', 'pair-3', 'word', 'name', 'imagePrompt', 'Name tag badge'),
        jsonb_build_object('id', 'pair-4', 'word', 'friend', 'imagePrompt', 'Two children as friends'),
        jsonb_build_object('id', 'pair-5', 'word', 'teacher', 'imagePrompt', 'Smiling teacher')
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Drag and drop matching game with 5 word-picture pairs'
      ),
      'teacherTips', jsonb_build_array(
        'Start with one example together',
        'Let student attempt the rest independently',
        'Provide hints by pointing or saying first letter',
        'Make success sounds for each correct match'
      )
    ),
    -- Slide 5: Memory Game
    jsonb_build_object(
      'id', 'slide-5',
      'type', 'memory',
      'prompt', 'Memory Card Game',
      'instructions', 'Take turns with the student finding matching pairs. Keep score together. Make it collaborative and fun - you''re a team!',
      'timeLimit', 300,
      'xpReward', 100,
      'pairs', jsonb_build_array(
        jsonb_build_object('id', 'mem-1', 'word', 'hello', 'imagePrompt', 'Hello gesture'),
        jsonb_build_object('id', 'mem-2', 'word', 'goodbye', 'imagePrompt', 'Goodbye gesture'),
        jsonb_build_object('id', 'mem-3', 'word', 'name', 'imagePrompt', 'Name tag'),
        jsonb_build_object('id', 'mem-4', 'word', 'friend', 'imagePrompt', 'Friends together'),
        jsonb_build_object('id', 'mem-5', 'word', 'teacher', 'imagePrompt', 'Teacher smiling'),
        jsonb_build_object('id', 'mem-6', 'word', 'happy', 'imagePrompt', 'Smiley face')
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Memory card matching game with 6 pairs'
      ),
      'teacherTips', jsonb_build_array(
        'Make it collaborative, not competitive',
        'Let student flip most cards, you flip occasionally',
        'Count successful matches together: "We found 3 pairs!"',
        'Give hints if student struggles: "I think the teacher card is over there..."',
        'Adjust difficulty: remove pairs if too hard'
      )
    ),
    -- Slide 6: Sentence Builder
    jsonb_build_object(
      'id', 'slide-6',
      'type', 'sentence_builder',
      'prompt', 'Build the Sentence',
      'instructions', 'Model building the first sentence together. Then let the student try independently with support as needed. Use physical word cards if helpful.',
      'timeLimit', 300,
      'xpReward', 40,
      'wordBank', jsonb_build_array('Hello', 'Goodbye', 'my', 'name', 'is', 'friend', 'teacher'),
      'targetSentences', jsonb_build_array(
        jsonb_build_object('sentence', 'Hello, my name is Emma', 'words', jsonb_build_array('Hello', 'my', 'name', 'is', 'Emma')),
        jsonb_build_object('sentence', 'Goodbye, friend', 'words', jsonb_build_array('Goodbye', 'friend'))
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Sentence building activity with word tiles'
      ),
      'teacherTips', jsonb_build_array(
        'Build first sentence together step-by-step',
        'Read each word aloud as you place it',
        'Let student try second sentence alone with hints',
        'Physical word cards work great for tactile learners'
      )
    ),
    -- Slide 7: Grammar Focus
    jsonb_build_object(
      'id', 'slide-7',
      'type', 'grammar_focus',
      'prompt', 'My name is...',
      'pattern', 'My name is [Name]',
      'instructions', 'Model the pattern: "My name is [Teacher''s Name]". Then prompt: "Now you try! My name is...?" Encourage the student to complete the sentence.',
      'timeLimit', 240,
      'examples', jsonb_build_array(
        jsonb_build_object('name', 'Emma', 'audio', 'My name is Emma', 'imagePrompt', 'Girl with ponytail introducing herself'),
        jsonb_build_object('name', 'Ali', 'audio', 'My name is Ali', 'imagePrompt', 'Boy with cap introducing himself'),
        jsonb_build_object('name', 'Teacher Sarah', 'audio', 'My name is Teacher Sarah', 'imagePrompt', 'Teacher introducing herself')
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Grammar pattern: My name is with three examples'
      ),
      'teacherTips', jsonb_build_array(
        'Point to yourself when saying your name',
        'Use clear, slow pronunciation',
        'Encourage student to point to themselves when introducing',
        'Practice 2-3 times for confidence'
      )
    ),
    -- Slide 8: Dialogue Practice
    jsonb_build_object(
      'id', 'slide-8',
      'type', 'controlled_output',
      'prompt', 'What is your name?',
      'instructions', 'Play dialogue 2x. Model both roles with the student. Then switch roles - you ask, student answers, then reverse. Record for playback if possible!',
      'timeLimit', 300,
      'dialogue', jsonb_build_array(
        jsonb_build_object('speaker', 'Child 1', 'text', 'What is your name?', 'audio', true),
        jsonb_build_object('speaker', 'Child 2', 'text', 'My name is Lily. What is your name?', 'audio', true),
        jsonb_build_object('speaker', 'Child 1', 'text', 'My name is Max!', 'audio', true)
      ),
      'media', jsonb_build_object(
        'type', 'image',
        'imagePrompt', 'Two children talking to each other in classroom, speech bubbles visible, friendly educational style',
        'alt', 'Two children having a conversation'
      ),
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Question and answer dialogue practice'
      ),
      'teacherTips', jsonb_build_array(
        'You play Child 1 first, student plays Child 2',
        'Then switch roles',
        'Use different voices for each character to make it fun',
        'Record it so student can hear themselves'
      )
    ),
    -- Slide 9: Phonics
    jsonb_build_object(
      'id', 'slide-9',
      'type', 'phonics',
      'prompt', 'Letter H Sound',
      'instructions', 'Model the /h/ sound and gesture together. Practice as a call-and-response: you say "h-h-hello", student repeats with the gesture.',
      'letter', 'H',
      'sound', '/h/',
      'gesture', 'Put hand on heart and breathe out h...h...h...',
      'words', jsonb_build_array('hello', 'happy', 'house', 'hat'),
      'timeLimit', 240,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Letter H phonics with gesture and example words'
      ),
      'teacherTips', jsonb_build_array(
        'Make the /h/ sound feel like breathing',
        'Do gesture together multiple times',
        'Make it playful - whisper h, loud h, fast h'
      )
    ),
    -- Slide 10: Phonics Words
    jsonb_build_object(
      'id', 'slide-10',
      'type', 'phonics',
      'prompt', 'Words with H',
      'instructions', 'Show each picture one at a time. Ask "What''s this?" Emphasize the /h/ sound. If student struggles, give the first sound as a hint.',
      'words', jsonb_build_array(
        jsonb_build_object('word', 'hello', 'imagePrompt', 'Hello text with waving hand'),
        jsonb_build_object('word', 'happy', 'imagePrompt', 'Happy smiling emoji'),
        jsonb_build_object('word', 'house', 'imagePrompt', 'Simple cartoon house'),
        jsonb_build_object('word', 'hat', 'imagePrompt', 'Colorful hat')
      ),
      'timeLimit', 240,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Four words beginning with H sound'
      ),
      'teacherTips', jsonb_build_array(
        'Emphasize /h/ at start of each word',
        'If student can''t remember, give hint: "It starts with h..."',
        'Repeat each word 2-3 times together'
      )
    ),
    -- Slide 11: Listen & Point
    jsonb_build_object(
      'id', 'slide-11',
      'type', 'listen_point',
      'prompt', 'Listen and Point!',
      'instructions', 'Say words randomly ("Point to hello!" "Show me teacher!"). Student points to the correct picture. Switch roles - let student call out words for you!',
      'words', jsonb_build_array('hello', 'goodbye', 'teacher', 'friend', 'name'),
      'images', jsonb_build_array(
        jsonb_build_object('id', 'lp-1', 'word', 'hello', 'imagePrompt', 'Hello wave'),
        jsonb_build_object('id', 'lp-2', 'word', 'goodbye', 'imagePrompt', 'Goodbye wave'),
        jsonb_build_object('id', 'lp-3', 'word', 'teacher', 'imagePrompt', 'Teacher'),
        jsonb_build_object('id', 'lp-4', 'word', 'friend', 'imagePrompt', 'Friends'),
        jsonb_build_object('id', 'lp-5', 'word', 'name', 'imagePrompt', 'Name tag')
      ),
      'timeLimit', 240,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Listen and point activity with five vocabulary words'
      ),
      'teacherTips', jsonb_build_array(
        'Start slow, then speed up',
        'Switch roles - student becomes teacher!',
        'Make it silly - point to wrong picture on purpose',
        'This builds listening comprehension and confidence'
      )
    ),
    -- Slide 12: Speaking Production
    jsonb_build_object(
      'id', 'slide-12',
      'type', 'speaking_production',
      'prompt', 'Introduce Yourself',
      'instructions', 'Student introduces themselves to you using full sentence: "Hello! My name is [Name]." You respond as different characters (parent, friend, shopkeeper). Make it playful!',
      'task', 'Practice introducing yourself',
      'targetLanguage', jsonb_build_array('Hello!', 'My name is [Name]'),
      'timeLimit', 300,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Speaking production activity for self-introduction'
      ),
      'teacherTips', jsonb_build_array(
        'You play different characters each time',
        'Use different voices: high voice, low voice, funny voice',
        'Respond enthusiastically: "Nice to meet you!"',
        'Repeat 3-4 times with different scenarios'
      )
    ),
    -- Slide 13: Creative Production
    jsonb_build_object(
      'id', 'slide-13',
      'type', 'creative_production',
      'prompt', 'Create a Dialogue',
      'instructions', 'Create a mini dialogue together - student plays themselves, you play a new friend. Write it down, then perform it twice switching roles. Record it!',
      'task', 'Create and perform a greeting dialogue',
      'timeLimit', 360,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Creative dialogue creation and performance activity'
      ),
      'teacherTips', jsonb_build_array(
        'Write dialogue on paper/whiteboard together',
        'Simple is best: 2-3 exchanges max',
        'Perform once, then switch roles',
        'Recording creates a sense of achievement'
      )
    ),
    -- Slide 14: Role-play
    jsonb_build_object(
      'id', 'slide-14',
      'type', 'role_play',
      'prompt', 'Role-Play Time',
      'instructions', 'Choose a scenario together. You take one role, student takes another. Act it out with props or toys. Keep it energetic and fun!',
      'scenarios', jsonb_build_array(
        'Meeting a new friend at the park',
        'First day at school',
        'Meeting a shopkeeper'
      ),
      'timeLimit', 300,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Role-play activity with three scenario options'
      ),
      'teacherTips', jsonb_build_array(
        'Let student choose scenario',
        'Use props: toys, hats, anything fun',
        'Stay in character!',
        'Encourage creativity and confidence'
      )
    ),
    -- Slide 15: Accuracy Quiz
    jsonb_build_object(
      'id', 'slide-15',
      'type', 'accuracy_mcq',
      'prompt', 'Quick Quiz',
      'instructions', 'Student completes the quiz. Review each answer together immediately. Celebrate correct answers, explain any mistakes gently.',
      'questions', jsonb_build_array(
        jsonb_build_object(
          'id', 'q1',
          'question', 'How do you greet someone?',
          'options', jsonb_build_array('Hello', 'Goodbye', 'Name', 'Friend'),
          'correctAnswer', 'Hello'
        ),
        jsonb_build_object(
          'id', 'q2',
          'question', 'Complete: My ___ is Emma',
          'options', jsonb_build_array('name', 'hello', 'goodbye', 'friend'),
          'correctAnswer', 'name'
        ),
        jsonb_build_object(
          'id', 'q3',
          'question', 'What sound does H make?',
          'options', jsonb_build_array('/h/', '/s/', '/m/', '/b/'),
          'correctAnswer', '/h/'
        )
      ),
      'timeLimit', 300,
      'xpReward', 60,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Multiple choice quiz with three questions'
      ),
      'teacherTips', jsonb_build_array(
        'Review each question immediately after answering',
        'Praise effort, not just correct answers',
        'If wrong, explain gently why',
        'This checks understanding, not grades'
      )
    ),
    -- Slide 16: Review
    jsonb_build_object(
      'id', 'slide-16',
      'type', 'review_consolidation',
      'prompt', 'Lesson Review',
      'instructions', 'Quick recap: "What new words did we learn today?" "Can you introduce yourself?" Review the 5 vocabulary words together.',
      'reviewPoints', jsonb_build_array(
        'We learned 5 new words: hello, goodbye, name, friend, teacher',
        'We can introduce ourselves: My name is...',
        'We learned the /h/ sound'
      ),
      'timeLimit', 180,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Lesson review with key learning points'
      ),
      'teacherTips', jsonb_build_array(
        'Ask student to recall words (don''t tell)',
        'Have student introduce themselves one final time',
        'Praise all their hard work!',
        'Ask: "What was your favorite part?"'
      )
    ),
    -- Slide 17: Homework
    jsonb_build_object(
      'id', 'slide-17',
      'type', 'homework',
      'prompt', 'Homework',
      'instructions', 'Explain homework clearly. Have student repeat back what they need to do. Share with parents/guardians if young learner.',
      'tasks', jsonb_build_array(
        'Practice saying "My name is..." to 3 people at home',
        'Draw a picture of a friend and write the word "friend"',
        'Find 3 things that start with H sound'
      ),
      'timeLimit', 120,
      'accessibility', jsonb_build_object(
        'screenReaderText', 'Homework assignment with three tasks'
      ),
      'teacherTips', jsonb_build_array(
        'Explain each task slowly',
        'Have student repeat back instructions',
        'Write homework down for student to take home',
        'Encourage parents to practice together'
      )
    )
  )
)
WHERE id = '57a01c46-c9e3-43e4-870f-a834433bc4ed';

-- Verify the update
SELECT 
  id, 
  title, 
  module_number, 
  lesson_number,
  slides_content->'metadata'->>'format' as format,
  jsonb_array_length(slides_content->'slides') as slide_count,
  slides_content->'metadata'->'weights' as weights
FROM lessons_content 
WHERE id = '57a01c46-c9e3-43e4-870f-a834433bc4ed';