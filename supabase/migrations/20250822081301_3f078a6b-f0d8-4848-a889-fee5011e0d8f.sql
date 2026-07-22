-- Insert A1 Module 1 Lessons with 25 slides each

-- Lesson 1: Greetings and Introductions
INSERT INTO lessons_content (
  id,
  title, 
  topic,
  cefr_level,
  module_number,
  lesson_number,
  duration_minutes,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  difficulty_level,
  slides_content,
  is_active
) VALUES (
  gen_random_uuid(),
  'Greetings and Introductions',
  'Basic social interactions and personal introductions',
  'A1',
  1,
  1,
  30,
  ARRAY['Use basic greetings and farewell expressions', 'Introduce yourself and others', 'Ask and answer simple personal questions'],
  ARRAY['hello', 'hi', 'goodbye', 'bye', 'please', 'thank you', 'name', 'nice to meet you', 'how are you', 'fine'],
  ARRAY['Simple present tense with "be"', 'Personal pronouns (I, you, he, she)', 'Basic question formation with "What"'],
  'beginner',
  '{
    "version": "2.0",
    "theme": "mist-blue",
    "slides": [
      {
        "id": "slide-1",
        "type": "warmup",
        "prompt": "Welcome! Let''s Practice Greetings",
        "instructions": "Wave and say ''Hello!'' to everyone in the class. Try different greetings like ''Hi!'' and ''Good morning!''",
        "accessibility": {"screenReaderText": "Warm-up greeting activity", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-2", 
        "type": "warmup",
        "prompt": "How Are You Feeling?",
        "instructions": "Point to your face and show how you feel: happy, sad, tired, or excited!",
        "accessibility": {"screenReaderText": "Emotional check-in activity", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-3",
        "type": "vocabulary_preview", 
        "prompt": "Today''s Topic: Greetings and Introductions",
        "instructions": "Learning Objectives: Use basic greetings, introduce yourself, ask simple personal questions",
        "accessibility": {"screenReaderText": "Today''s lesson objectives", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-4",
        "type": "target_language",
        "prompt": "Key Greetings We''ll Learn",
        "instructions": "Hello, Hi, Goodbye, Bye, Please, Thank you, Nice to meet you, How are you?",
        "accessibility": {"screenReaderText": "Preview of key greeting vocabulary", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-5",
        "type": "vocabulary_preview",
        "prompt": "Greeting Words",
        "instructions": "Hello = friendly greeting, Hi = casual greeting, Goodbye = formal farewell, Bye = casual farewell. Listen and repeat!",
        "accessibility": {"screenReaderText": "Greeting vocabulary presentation", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-6",
        "type": "vocabulary_preview", 
        "prompt": "Polite Words",
        "instructions": "Please = when asking for something, Thank you = when someone helps you, Nice to meet you = when meeting someone new",
        "accessibility": {"screenReaderText": "Polite expressions vocabulary", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-7",
        "type": "grammar_focus",
        "prompt": "''I am'' and ''You are''",
        "instructions": "I am Sarah. You are a student. Practice: I am + your name",
        "accessibility": {"screenReaderText": "Grammar pattern with be verb", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-8",
        "type": "listening_comprehension",
        "prompt": "Listen to Greetings",
        "instructions": "Listen: ''Hello, I am Tom.'' ''Hi Tom, I am Lisa. Nice to meet you!'' ''Nice to meet you too!''",
        "accessibility": {"screenReaderText": "Listening to greeting dialogues", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-9",
        "type": "sentence_builder",
        "prompt": "Build Greeting Sentences",
        "instructions": "Hello + I am + [your name]. Hi + nice to meet you. How are you + today?",
        "accessibility": {"screenReaderText": "Sentence building with greetings", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-10",
        "type": "pronunciation_shadow",
        "prompt": "Pronunciation Practice", 
        "instructions": "Repeat: HEL-lo, NICE to MEET you, HOW are YOU, THANK you",
        "accessibility": {"screenReaderText": "Pronunciation practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-11",
        "type": "accuracy_mcq",
        "prompt": "Complete the Greeting",
        "instructions": "Fill in: _____, I am John. (Hello/Goodbye) Nice to _____ you. (meet/meat)",
        "accessibility": {"screenReaderText": "Fill in the blanks exercise", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-12",
        "type": "picture_choice",
        "prompt": "Match Greetings to Situations",
        "instructions": "Match: Morning time → Good morning, Meeting someone new → Nice to meet you, Leaving → Goodbye",
        "accessibility": {"screenReaderText": "Matching greetings to contexts", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-13",
        "type": "transform", 
        "prompt": "Make Your Own Introductions",
        "instructions": "Use: Hello + I am + [name] + Nice to meet you. Create 3 different introductions!",
        "accessibility": {"screenReaderText": "Creating personal introductions", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-14",
        "type": "error_fix",
        "prompt": "Fix These Greetings",
        "instructions": "Correct: ''Helo, I are John'' → ''Hello, I am John'' / ''Nice to met you'' → ''Nice to meet you''",
        "accessibility": {"screenReaderText": "Error correction activity", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-15",
        "type": "labeling",
        "prompt": "Drag the Right Words",
        "instructions": "Drag words to complete: [Hello] _____, I [am] _____ Sarah. [Nice] _____ to meet you!",
        "accessibility": {"screenReaderText": "Drag and drop sentence completion", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-16",
        "type": "controlled_practice",
        "prompt": "Greeting Wheel Challenge",
        "instructions": "Spin the wheel! Answer: How do you greet in the morning? How do you say goodbye? How do you introduce yourself?",
        "accessibility": {"screenReaderText": "Interactive spinning wheel quiz", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-17",
        "type": "roleplay_setup",
        "prompt": "Meeting New Friends Role-play",
        "instructions": "Partner A: You''re new in class. Partner B: Welcome the new student. Use all greeting words!",
        "accessibility": {"screenReaderText": "Role-play meeting new people", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-18",
        "type": "controlled_output",
        "prompt": "Rapid Fire Greetings", 
        "instructions": "Quick! Say the right greeting for: 1) Meeting someone new 2) Morning time 3) Saying thank you 4) Leaving class",
        "accessibility": {"screenReaderText": "Rapid response quiz", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-19",
        "type": "fluency_sprint",
        "prompt": "Speed Introduction Challenge",
        "instructions": "How fast can you introduce yourself using: Hello, I am, Nice to meet you, How are you?",
        "accessibility": {"screenReaderText": "Fluency speed practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-20",
        "type": "communicative_task",
        "prompt": "Greeting Circle",
        "instructions": "Walk around! Greet 5 different classmates and introduce yourself to each one.",
        "accessibility": {"screenReaderText": "Interactive greeting practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-21",
        "type": "picture_description",
        "prompt": "Greeting Conversations",
        "instructions": "Look at the pictures. Practice: A: Hello! B: Hi! A: I am ___. B: Nice to meet you!",
        "accessibility": {"screenReaderText": "Picture-based conversation practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-22",
        "type": "roleplay_setup",
        "prompt": "First Day at School Scenario",
        "instructions": "You''re new at school. Greet your teacher and 3 new classmates. Be polite and friendly!",
        "accessibility": {"screenReaderText": "School scenario role-play", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-23",
        "type": "review_consolidation",
        "prompt": "Today''s Greeting Words",
        "instructions": "We learned: Hello, Hi, Goodbye, Bye, Please, Thank you, Nice to meet you, How are you, I am",
        "accessibility": {"screenReaderText": "Vocabulary review", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-24",
        "type": "exit_check",
        "prompt": "Quick Check: Can You Greet?",
        "instructions": "1) How do you say hello? 2) How do you introduce yourself? 3) What do you say when meeting someone new?",
        "accessibility": {"screenReaderText": "Final comprehension check", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-25",
        "type": "review_consolidation",
        "prompt": "Practice at Home",
        "instructions": "Homework: Practice greetings with family. Introduce yourself to 3 new people this week using English!",
        "accessibility": {"screenReaderText": "Homework assignment", "highContrast": false, "largeText": false}
      }
    ],
    "durationMin": 30,
    "total_slides": 25,
    "metadata": {
      "CEFR": "A1",
      "module": 1,
      "lesson": 1,
      "targets": ["Use basic greetings and farewell expressions", "Introduce yourself and others", "Ask and answer simple personal questions"],
      "weights": {"accuracy": 60, "fluency": 40}
    }
  }',
  true
);

-- Lesson 2: The Alphabet and Spelling Names
INSERT INTO lessons_content (
  id,
  title, 
  topic,
  cefr_level,
  module_number,
  lesson_number,
  duration_minutes,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  difficulty_level,
  slides_content,
  is_active
) VALUES (
  gen_random_uuid(),
  'The Alphabet and Spelling Names',
  'English alphabet recognition and spelling personal names',
  'A1',
  1,
  2,
  30,
  ARRAY['Recognize and pronounce all 26 letters', 'Spell names letter by letter', 'Ask for and give spelling of names'],
  ARRAY['letters', 'alphabet', 'spell', 'capital', 'small', 'name', 'first name', 'last name', 'letter', 'how do you spell'],
  ARRAY['Question formation with "How"', 'Imperative for instructions', 'Capital and lowercase letters'],
  'beginner',
  '{
    "version": "2.0",
    "theme": "mist-blue",
    "slides": [
      {
        "id": "slide-1",
        "type": "warmup",
        "prompt": "Alphabet Song Fun!",
        "instructions": "Let''s sing the ABC song together! A-B-C-D-E-F-G... Can you continue?",
        "accessibility": {"screenReaderText": "Alphabet song warm-up", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-2", 
        "type": "warmup",
        "prompt": "Find Your Letter",
        "instructions": "Stand up when you hear the first letter of your name! A... B... C... D...",
        "accessibility": {"screenReaderText": "Letter recognition activity", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-3",
        "type": "vocabulary_preview", 
        "prompt": "Today''s Topic: The Alphabet and Spelling",
        "instructions": "Learning Objectives: Know all 26 letters, spell names, ask for spelling",
        "accessibility": {"screenReaderText": "Lesson objectives about alphabet", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-4",
        "type": "target_language",
        "prompt": "Key Words for Today",
        "instructions": "Letters, Alphabet, Spell, Capital, Small, Name, First name, Last name, How do you spell?",
        "accessibility": {"screenReaderText": "Alphabet vocabulary preview", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-5",
        "type": "vocabulary_preview",
        "prompt": "The English Alphabet",
        "instructions": "26 letters: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z. Listen and repeat each one!",
        "accessibility": {"screenReaderText": "Complete alphabet presentation", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-6",
        "type": "vocabulary_preview", 
        "prompt": "Capital and Small Letters",
        "instructions": "Capital: A B C D E (BIG letters). Small: a b c d e (little letters). Both are important!",
        "accessibility": {"screenReaderText": "Capital and lowercase letters", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-7",
        "type": "grammar_focus",
        "prompt": "Asking About Spelling",
        "instructions": "How do you spell your name? / Can you spell that? / What''s the first letter?",
        "accessibility": {"screenReaderText": "Questions about spelling", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-8",
        "type": "listening_comprehension",
        "prompt": "Listen to Letter Sounds",
        "instructions": "A sounds like ''ay'', B sounds like ''bee'', C sounds like ''see''. Listen carefully to each letter!",
        "accessibility": {"screenReaderText": "Letter pronunciation listening", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-9",
        "type": "sentence_builder",
        "prompt": "Spelling Sentences",
        "instructions": "My name is spelled: T-O-M. How do you spell + your name? The first letter is + [letter]",
        "accessibility": {"screenReaderText": "Building spelling sentences", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-10",
        "type": "pronunciation_shadow",
        "prompt": "Letter by Letter Practice", 
        "instructions": "Repeat slowly: A-B-C-D-E, F-G-H-I-J-K, L-M-N-O-P, Q-R-S-T-U-V-W-X-Y-Z",
        "accessibility": {"screenReaderText": "Alphabet pronunciation practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-11",
        "type": "accuracy_mcq",
        "prompt": "Choose the Right Letter",
        "instructions": "What comes after M? (L/N/O) Which is a capital letter? (a/B/c) What''s the last letter? (Y/Z/X)",
        "accessibility": {"screenReaderText": "Alphabet sequence quiz", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-12",
        "type": "picture_choice",
        "prompt": "Match Letters to Sounds",
        "instructions": "Match: B → ''bee'', C → ''see'', D → ''dee'', F → ''eff'', G → ''gee''",
        "accessibility": {"screenReaderText": "Letter-sound matching", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-13",
        "type": "transform", 
        "prompt": "Spell Common Names",
        "instructions": "Practice spelling: ANNA = A-N-N-A, MIKE = M-I-K-E, SARA = S-A-R-A. Now spell your name!",
        "accessibility": {"screenReaderText": "Name spelling practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-14",
        "type": "error_fix",
        "prompt": "Fix the Spelling",
        "instructions": "Correct: ''JON'' → J-O-H-N, ''SARA'' → S-A-R-A-H, ''MIKE'' → M-I-C-H-A-E-L (if Michael)",
        "accessibility": {"screenReaderText": "Spelling correction activity", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-15",
        "type": "labeling",
        "prompt": "Drag Letters to Spell",
        "instructions": "Drag letters to spell: HELLO = [H][E][L][L][O], THANK = [T][H][A][N][K]",
        "accessibility": {"screenReaderText": "Letter dragging to spell words", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-16",
        "type": "controlled_practice",
        "prompt": "Alphabet Spinning Wheel",
        "instructions": "Spin! Say the letter that comes: Before M, After R, Between F and H, Before Z",
        "accessibility": {"screenReaderText": "Alphabet position wheel game", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-17",
        "type": "roleplay_setup",
        "prompt": "Hotel Check-in Spelling",
        "instructions": "Partner A: Hotel clerk asking for name spelling. Partner B: Guest spelling their name clearly.",
        "accessibility": {"screenReaderText": "Hotel check-in spelling role-play", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-18",
        "type": "controlled_output",
        "prompt": "Speed Spelling Challenge", 
        "instructions": "Quick! Spell these in 10 seconds: YOUR NAME, HELLO, THANK YOU, GOODBYE",
        "accessibility": {"screenReaderText": "Fast spelling challenge", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-19",
        "type": "fluency_sprint",
        "prompt": "Alphabet Race",
        "instructions": "Say the alphabet as fast as you can! Then spell your full name super quickly!",
        "accessibility": {"screenReaderText": "Alphabet fluency race", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-20",
        "type": "communicative_task",
        "prompt": "Name Spelling Circle",
        "instructions": "Walk around and ask 5 people: ''How do you spell your name?'' Write down their answers!",
        "accessibility": {"screenReaderText": "Interactive name spelling practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-21",
        "type": "picture_description",
        "prompt": "Spelling Competition",
        "instructions": "Look at the names on the board. Take turns spelling them out loud: DAVID, MARIA, JAMES, LINDA",
        "accessibility": {"screenReaderText": "Group spelling competition", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-22",
        "type": "roleplay_setup",
        "prompt": "Phone Call Spelling",
        "instructions": "You''re on the phone giving your name and email. Spell everything very clearly!",
        "accessibility": {"screenReaderText": "Phone spelling scenario", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-23",
        "type": "review_consolidation",
        "prompt": "Alphabet Review",
        "instructions": "26 letters: A-Z, Capital and small letters, Spelling names letter by letter, ''How do you spell?''",
        "accessibility": {"screenReaderText": "Alphabet lesson review", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-24",
        "type": "exit_check",
        "prompt": "Can You Spell?",
        "instructions": "1) What comes after P? 2) Spell your first name 3) How do you ask someone to spell their name?",
        "accessibility": {"screenReaderText": "Final spelling assessment", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-25",
        "type": "review_consolidation",
        "prompt": "Spelling Homework",
        "instructions": "Practice: Spell your family members'' names. Write the alphabet 3 times. Ask 3 people how to spell their names!",
        "accessibility": {"screenReaderText": "Alphabet homework assignment", "highContrast": false, "largeText": false}
      }
    ],
    "durationMin": 30,
    "total_slides": 25,
    "metadata": {
      "CEFR": "A1",
      "module": 1,
      "lesson": 2,
      "targets": ["Recognize and pronounce all 26 letters", "Spell names letter by letter", "Ask for and give spelling of names"],
      "weights": {"accuracy": 70, "fluency": 30}
    }
  }',
  true
);

-- Lesson 3: Numbers 1-20 and Age
INSERT INTO lessons_content (
  id,
  title, 
  topic,
  cefr_level,
  module_number,
  lesson_number,
  duration_minutes,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  difficulty_level,
  slides_content,
  is_active
) VALUES (
  gen_random_uuid(),
  'Numbers 1–20 and Age',
  'Counting from 1-20 and talking about age',
  'A1',
  1,
  3,
  30,
  ARRAY['Count from 1 to 20 correctly', 'Ask and answer questions about age', 'Use numbers in simple contexts'],
  ARRAY['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'age', 'old', 'years'],
  ARRAY['Question formation with "How old"', 'Simple present with numbers', 'Plural forms with years'],
  'beginner',
  '{
    "version": "2.0",
    "theme": "mist-blue",
    "slides": [
      {
        "id": "slide-1",
        "type": "warmup",
        "prompt": "Count with Your Fingers!",
        "instructions": "Show numbers with your fingers: 1, 2, 3, 4, 5! Now count to 10 together!",
        "accessibility": {"screenReaderText": "Finger counting warm-up", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-2", 
        "type": "warmup",
        "prompt": "Age Guessing Game",
        "instructions": "Point to someone and guess: ''You are... 20 years old?'' Let them say yes or no!",
        "accessibility": {"screenReaderText": "Age guessing activity", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-3",
        "type": "vocabulary_preview", 
        "prompt": "Today''s Topic: Numbers 1-20 and Age",
        "instructions": "Learning Objectives: Count to 20, ask about age, use numbers in conversation",
        "accessibility": {"screenReaderText": "Numbers lesson objectives", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-4",
        "type": "target_language",
        "prompt": "Numbers We''ll Learn Today",
        "instructions": "1-10: one, two, three, four, five, six, seven, eight, nine, ten + 11-20 and age words!",
        "accessibility": {"screenReaderText": "Number vocabulary preview", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-5",
        "type": "vocabulary_preview",
        "prompt": "Numbers 1-10",
        "instructions": "1=one, 2=two, 3=three, 4=four, 5=five, 6=six, 7=seven, 8=eight, 9=nine, 10=ten",
        "accessibility": {"screenReaderText": "Numbers 1-10 presentation", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-6",
        "type": "vocabulary_preview", 
        "prompt": "Numbers 11-20",
        "instructions": "11=eleven, 12=twelve, 13=thirteen, 14=fourteen, 15=fifteen, 16=sixteen, 17=seventeen, 18=eighteen, 19=nineteen, 20=twenty",
        "accessibility": {"screenReaderText": "Numbers 11-20 presentation", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-7",
        "type": "grammar_focus",
        "prompt": "Talking About Age",
        "instructions": "How old are you? I am 25 years old. She is 30. He is 18 years old. How old is he/she?",
        "accessibility": {"screenReaderText": "Age questions and answers", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-8",
        "type": "listening_comprehension",
        "prompt": "Listen to Numbers",
        "instructions": "Listen: ''I have three books'', ''She is fifteen years old'', ''There are twenty students''",
        "accessibility": {"screenReaderText": "Number listening practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-9",
        "type": "sentence_builder",
        "prompt": "Number Sentences",
        "instructions": "I am + [number] + years old. There are + [number] + books. How old + are you?",
        "accessibility": {"screenReaderText": "Building sentences with numbers", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-10",
        "type": "pronunciation_shadow",
        "prompt": "Number Pronunciation", 
        "instructions": "Repeat: ONE-two-THREE, FOUR-five-SIX, THIR-teen, FOUR-teen, TWEN-ty years OLD",
        "accessibility": {"screenReaderText": "Number pronunciation practice", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-11",
        "type": "accuracy_mcq",
        "prompt": "Choose the Right Number",
        "instructions": "What comes after 12? (11/13/14) How do you say 15? (fifty/fifteen/fiveteen) 10+7=? (seventeen/seventy/seven)",
        "accessibility": {"screenReaderText": "Number recognition quiz", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-12",
        "type": "picture_choice",
        "prompt": "Match Numbers to Pictures",
        "instructions": "Match: 5 fingers → five, 12 eggs → twelve, 20 students → twenty, 18 birthday → eighteen",
        "accessibility": {"screenReaderText": "Number-picture matching", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-13",
        "type": "transform", 
        "prompt": "Create Age Sentences",
        "instructions": "Make sentences: I am ___ years old. My mother is ___ years old. My friend is ___ years old.",
        "accessibility": {"screenReaderText": "Personal age sentences", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-14",
        "type": "error_fix",
        "prompt": "Fix the Number Mistakes",
        "instructions": "Correct: ''I am twenty-five year old'' → ''twenty-five years old'' / ''How age are you?'' → ''How old are you?''",
        "accessibility": {"screenReaderText": "Age expression corrections", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-15",
        "type": "labeling",
        "prompt": "Drag Numbers to Ages",
        "instructions": "Complete: I am [eighteen] years old. She is [twenty]. How old [are] you? [Fifteen] years old.",
        "accessibility": {"screenReaderText": "Age sentence completion", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-16",
        "type": "controlled_practice",
        "prompt": "Number Wheel Challenge",
        "instructions": "Spin! Answer: Count from 1-10, Say a number between 15-20, What''s 10+5?, How old are you?",
        "accessibility": {"screenReaderText": "Number wheel quiz game", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-17",
        "type": "roleplay_setup",
        "prompt": "Birthday Party Role-play",
        "instructions": "Partner A: Ask about everyone''s age at the party. Partner B: Answer and ask back. Use numbers 1-20!",
        "accessibility": {"screenReaderText": "Birthday party age conversations", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-18",
        "type": "controlled_output",
        "prompt": "Fast Number Challenge", 
        "instructions": "Quick! Count: 1-10, then 10-20, then 20-10, then say your age!",
        "accessibility": {"screenReaderText": "Speed counting challenge", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-19",
        "type": "fluency_sprint",
        "prompt": "Number Story Race",
        "instructions": "Tell a story using numbers: ''I have ___ books, ___ friends, and I am ___ years old!''",
        "accessibility": {"screenReaderText": "Number story creation", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-20",
        "type": "communicative_task",
        "prompt": "Age Survey",
        "instructions": "Ask 5 classmates: ''How old are you?'' Write their ages. Find who is oldest and youngest!",
        "accessibility": {"screenReaderText": "Class age survey activity", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-21",
        "type": "picture_description",
        "prompt": "Family Age Talk",
        "instructions": "Look at family photos. Practice: ''My dad is forty. My sister is sixteen. My grandma is seventy.''",
        "accessibility": {"screenReaderText": "Family age descriptions", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-22",
        "type": "roleplay_setup",
        "prompt": "Doctor''s Office Age Check",
        "instructions": "Patient gives personal information including age. Doctor asks: ''How old are you?'' ''Any children? How old?''",
        "accessibility": {"screenReaderText": "Medical appointment age questions", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-23",
        "type": "review_consolidation",
        "prompt": "Numbers and Age Review",
        "instructions": "Numbers 1-20: one to twenty, Age questions: How old are you? I am ___ years old.",
        "accessibility": {"screenReaderText": "Complete numbers review", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-24",
        "type": "exit_check",
        "prompt": "Final Number Check",
        "instructions": "1) Count from 1-20 2) How do you ask someone''s age? 3) Say your age in English",
        "accessibility": {"screenReaderText": "Final numbers assessment", "highContrast": false, "largeText": false}
      },
      {
        "id": "slide-25",
        "type": "review_consolidation",
        "prompt": "Numbers Homework",
        "instructions": "Practice: Count objects at home 1-20. Ask family members their ages in English. Write numbers 1-20 five times!",
        "accessibility": {"screenReaderText": "Numbers practice homework", "highContrast": false, "largeText": false}
      }
    ],
    "durationMin": 30,
    "total_slides": 25,
    "metadata": {
      "CEFR": "A1",
      "module": 1,
      "lesson": 3,
      "targets": ["Count from 1 to 20 correctly", "Ask and answer questions about age", "Use numbers in simple contexts"],
      "weights": {"accuracy": 65, "fluency": 35}
    }
  }',
  true
);