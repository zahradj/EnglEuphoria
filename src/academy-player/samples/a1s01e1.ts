// A1-S01-E1 "Who Are You? · Cold Open" — full 60-minute lesson script (Academy cast only).
// Source of truth for the plan: docs/academy-a1s01e1-spec.md and the Academy lesson blueprint (objective, cast, run of show,
// Mission = predict and share an opinion, Release = one-sentence reaction, clue 1 unlocked by answering "Who is Sam?" in your own words).
// Language: the Season's 14 E1 words (all glossed or met in context) plus closed-class words; the only productive language is
// substitution into fixed frames ("Hello, my name is ___. Nice to meet you." / "What is your name?"), never new items.
// Run of show: Check-in 0 · Remember? 1 · The Drop 2 · Notice & Build 3 · Energiser 4 · Mission 5 · Release 6 · Wrap 7.
// No voice clips exist yet (the cast has no voice assigned): every line is silent until recorded clips are added.
import type { SceneScript } from '../scriptTypes';

const PROFILE_GLOSS = { profile: 'your page online: name, picture, friends', odd: 'strange, not normal' };
const EMOJI_SKINS = ['🎮', '🎧', '⚽', '📱'];

export const A1S01E1: SceneScript = {
  lessonId: 'A1-S01-E1',
  level: 'A1',
  title: 'Who Are You? · Cold Open',
  cast: ['Vee', 'Ava', 'Theo'],
  beats: [
    // ── Check-in (5 min) ──────────────────────────────────────────────────────
    { t: 'segment', index: 0 },
    { t: 'bg', id: 'classroom-morning', alt: 'A bright classroom in the morning with desks and a whiteboard' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Hello! I am Vee. Welcome to class.', key: ['Welcome'] },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'happy' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Hello! I am Ava. I am your friend in this class.', key: ['friend', 'class'] },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'neutral' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Hello! I am Theo. Nice to meet you.', key: ['Nice', 'meet'] },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'Now you. What is your name?' },
    {
      t: 'form',
      prompt: 'Your name. Then pick one.',
      fields: [
        { key: 'name', label: 'Name', kind: 'text', placeholder: 'Your name' },
        { key: 'energy', label: 'Pick one', kind: 'choice', options: ['🙂', '😐', '😴'] },
        { key: 'skin', label: 'Pick one', kind: 'choice', options: EMOJI_SKINS },
      ],
    },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Nice to meet you, {name}!', key: ['Nice', 'meet'] },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Welcome to our group, {name}!', key: ['Welcome', 'group'] },
    { t: 'say', who: 'Ava', expr: 'curious', text: 'Is your name nice? Yes! Hello, {name}.' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now we have a story for you.' },

    // ── Remember? (7 min): first lesson, so "what do I already know?" ─────────
    { t: 'segment', index: 1 },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'First, look at the words. Do you know them?' },
    {
      t: 'sort',
      prompt: 'Do you know this word?',
      cards: ['hello', 'welcome', 'name', 'friend', 'new', 'student', 'teacher', 'class', 'meet', 'online', 'nice', 'group'],
      yes: 'I know it',
      no: 'Not yet',
      key: 'known_count',
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice! You know words. Now try the words.' },
    {
      t: 'choice',
      prompt: 'Which word is a person?',
      tests: 'language',
      options: [
        { text: 'hello', correct: false, feedback: 'Hello is a word to say hi. Look for a person.' },
        { text: 'friend', correct: true, feedback: 'Yes! A friend is a person.' },
        { text: 'online', correct: false, feedback: 'Online is not a person. Look again.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'Which word says hi?',
      tests: 'language',
      options: [
        { text: 'class', correct: false, feedback: 'A class is a group of students. Look for a word to say hi.' },
        { text: 'hello', correct: true, feedback: 'Yes! Hello.' },
        { text: 'name', correct: false, feedback: 'Your name is who you are. Look for a word to say hi.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'Nice to ___ you.',
      tests: 'language',
      options: [
        { text: 'friend', correct: false, feedback: 'Nice to friend you? Look again.' },
        { text: 'meet', correct: true, feedback: 'Yes! Nice to meet you.' },
        { text: 'class', correct: false, feedback: 'Nice to class you? Look again.' },
      ],
    },

    {
      t: 'choice',
      prompt: 'I am a new ___.',
      tests: 'language',
      options: [
        { text: 'student', correct: true, feedback: 'Yes! I am a new student.' },
        { text: 'hello', correct: false, feedback: 'I am a new hello? Look again.' },
        { text: 'online', correct: false, feedback: 'I am a new online? Look again.' },
      ],
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice! More words.' },
    {
      t: 'choice',
      prompt: 'Welcome to our ___.',
      tests: 'language',
      options: [
        { text: 'group', correct: true, feedback: 'Yes! Welcome to our group.' },
        { text: 'name', correct: false, feedback: 'Welcome to our name? Look again.' },
        { text: 'meet', correct: false, feedback: 'Welcome to our meet? Look again.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'My ___ is Sam.',
      tests: 'language',
      options: [
        { text: 'name', correct: true, feedback: 'Yes! My name is Sam.' },
        { text: 'class', correct: false, feedback: 'My class is Sam? Look again.' },
        { text: 'friend', correct: false, feedback: 'My friend is Sam? That could be right, but the story says: My name is Sam.' },
      ],
    },

    // ── The Drop (10 min): the mystery ────────────────────────────────────────
    { t: 'segment', index: 2 },
    { t: 'bg', id: 'classroom-morning', alt: 'The classroom; the students look at a phone' },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'Look! A new member is in our class group.', key: ['new', 'member', 'group'] },
    { t: 'say', who: 'Ava', expr: 'curious', text: 'Who is it? I do not know.' },
    {
      t: 'chat',
      title: 'Our class group',
      messages: [
        { who: 'Unknown', label: 'new_friend', text: 'Hello! My name is Sam. I am a new student.' },
        { who: 'Ava', text: 'Hello, Sam! Welcome to our class group.' },
        { who: 'Theo', text: 'Nice to meet you, Sam. Are you in our class?' },
        { who: 'Unknown', label: 'new_friend', text: 'No. I am not in your class. I am online.' },
        { who: 'Ava', text: 'But you are a student? Who are you, Sam?' },
        { who: 'Unknown', label: 'new_friend', text: 'I am a teacher. And a friend. Look at my profile.', gloss: { profile: PROFILE_GLOSS.profile } },
      ],
      reply: {
        prompt: 'What do you say to Sam?',
        options: [
          { text: 'Hello, Sam! Nice to meet you.', correct: true, feedback: 'Yes! A friendly hello.' },
          { text: 'Hello, teacher!', correct: false, feedback: 'Sam says: I am a new student. Say hello to Sam first. Try again!' },
          { text: 'Who is the class?', correct: false, feedback: 'That is not a good question yet. First say hello to Sam!' },
        ],
      },
    },
    { t: 'bg', id: 'phone-profile-closeup', alt: 'A phone screen showing a plain online profile with no picture' },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'Look at the profile. What is odd? Tap ? to find it.', gloss: PROFILE_GLOSS, key: ['profile', 'odd'] },
    {
      t: 'profile',
      title: 'Sam',
      gloss: PROFILE_GLOSS,
      rows: [
        { label: 'Name', value: 'Sam' },
        { label: 'Online', value: 'Yes, now' },
        { label: 'About', value: 'I am a new student. I am a teacher.' },
        { label: 'Class', value: 'No class' },
        { label: 'Friends', value: '1000 friends' },
        { label: 'Group', value: 'Our class group' },
      ],
      hotspots: [
        { row: 2, why: 'A student and a teacher? Sam, who are you?' },
        { row: 3, why: 'Sam is a student. Sam is not in a class!' },
        { row: 4, why: 'Sam is new, but there are 1000 friends!' },
      ],
    },
    {
      t: 'panels',
      layout: 'strip',
      panels: [
        { bg: 'phone-profile-closeup', alt: 'Ava holds up a phone', who: 'Ava', expr: 'curious', bubble: { who: 'Ava', text: 'This is the profile.' }, keyWord: { word: 'profile', meaning: 'your page online: name, picture, friends' } },
        { bg: 'classroom-morning', alt: 'Theo looks at the phone', who: 'Theo', expr: 'thinking', bubble: { who: 'Theo', text: 'Sam is online. But Sam is not in our class.' } },
        { bg: 'classroom-morning', alt: 'Ava looks surprised', who: 'Ava', expr: 'surprised', bubble: { who: 'Ava', text: 'A student and a teacher? Who is Sam?' } },
        { bg: 'classroom-morning', alt: 'Theo smiles', who: 'Theo', expr: 'happy', bubble: { who: 'Theo', text: 'A new friend? Or a mystery?' }, keyWord: { word: 'mystery', meaning: 'a puzzle to solve' } },
        { bg: 'classroom-morning', alt: 'Vee points at the phone', who: 'Vee', expr: 'thinking', bubble: { who: 'Vee', text: 'Look at the clues. Who is Sam?' }, keyWord: { word: 'clues', meaning: 'small pieces of information that help you solve a mystery' } },
      ],
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Questions about the story.' },
    {
      t: 'choice',
      prompt: 'Is Sam in our class?',
      tests: 'story',
      options: [
        { text: 'Yes', correct: false, feedback: 'Look at the chat: Sam says, I am not in your class.' },
        { text: 'No', correct: true, feedback: 'Right! Sam is not in our class.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'Is Sam online?',
      tests: 'story',
      options: [
        { text: 'Yes', correct: true, feedback: 'Right! Sam says: I am online.' },
        { text: 'No', correct: false, feedback: 'Look at the profile: Online, yes, now.' },
      ],
    },
    {
      t: 'match',
      prompt: 'Who says it? Match.',
      pairs: [
        { left: 'Sam', right: 'Look at my profile.' },
        { left: 'Ava', right: 'Who are you, Sam?' },
        { left: 'Theo', right: 'Are you in our class?' },
      ],
    },
    {
      t: 'choice',
      prompt: 'Is Sam a new member of the group?',
      tests: 'story',
      options: [
        { text: 'Yes', correct: true, feedback: 'Right! Sam is a new member.' },
        { text: 'No', correct: false, feedback: 'Vee says: A new member is in our class group.' },
      ],
    },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'Now your idea. Who is Sam?' },
    {
      t: 'choice',
      prompt: 'Who is Sam? Pick one.',
      tests: 'story',
      options: [
        { text: 'A new student', set: { guess: 'a new student' } },
        { text: 'A teacher', set: { guess: 'a teacher' } },
        { text: 'A friend online', set: { guess: 'a friend online' } },
      ],
    },
    {
      t: 'form',
      prompt: 'Say it in your words.',
      fields: [{ key: 'sam_is', label: 'Sam is a', kind: 'text', placeholder: 'friend?' }],
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Yes! This is your first clue.', gloss: { clue: 'a small piece of information that helps you solve a mystery' }, key: ['clue'] },

    // ── Notice & Build (10 min) ───────────────────────────────────────────────
    { t: 'segment', index: 3 },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'Now meet the words from the story.' },
    {
      t: 'flash',
      title: 'People',
      cards: [
        { word: 'student', chunk: 'a new student', pictureId: 'card-student', alt: 'A teenager with a backpack in a classroom' },
        { word: 'teacher', chunk: 'our teacher', pictureId: 'card-teacher', alt: 'A teacher at the whiteboard' },
        { word: 'friend', chunk: 'my friend', pictureId: 'card-friend', alt: 'Two teenagers smiling together' },
        { word: 'class', chunk: 'our class', pictureId: 'card-class', alt: 'Desks and a whiteboard in a classroom' },
      ],
    },
    {
      t: 'flash',
      title: 'Saying hello',
      cards: [
        { word: 'hello', chunk: 'Hello, friend!', pictureId: 'card-hello', alt: 'A teenager waving' },
        { word: 'welcome', chunk: 'Welcome to the group.', pictureId: 'card-welcome', alt: 'An open door and a welcome sign' },
        { word: 'meet', chunk: 'Nice to meet you.', pictureId: 'card-meet', alt: 'Two teenagers shaking hands' },
        { word: 'nice', chunk: 'a nice friend', pictureId: 'card-nice', alt: 'A smiling teenager giving a thumbs up' },
      ],
    },
    {
      t: 'flash',
      title: 'Online',
      cards: [
        { word: 'name', chunk: 'My name is Sam.', pictureId: 'card-name', alt: 'A name tag on a jacket' },
        { word: 'online', chunk: 'Sam is online.', pictureId: 'card-online', alt: 'A phone showing a green online dot' },
        { word: 'group', chunk: 'our class group', pictureId: 'card-group', alt: 'Five teenagers standing together' },
      ],
    },
    {
      t: 'flash',
      title: 'Last three',
      cards: [
        { word: 'new', chunk: 'a new student', pictureId: 'card-new', alt: 'A teenager standing at a classroom door' },
        { word: 'member', chunk: 'a group member', pictureId: 'card-member', alt: 'A teenager joining a group of friends' },
        { word: 'introduce', chunk: 'Introduce your friend.', pictureId: 'card-introduce', alt: 'A teenager presenting a friend to a group' },
      ],
    },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'My name is ___. I am a ___. This is a frame.', gloss: { frame: 'a sentence with a gap that you fill in' }, key: ['name'] },
    {
      t: 'match',
      prompt: 'Match each question with its answer.',
      pairs: [
        { left: 'What is your name?', right: 'My name is Sam.' },
        { left: 'Are you a student?', right: 'Yes, I am a student.' },
        { left: 'Who is Sam?', right: 'Sam is a new member.' },
        { left: 'Hello!', right: 'Hello! Nice to meet you.' },
        { left: 'Are you in our class?', right: 'No, I am not.' },
      ],
    },
    { t: 'build', prompt: 'Sam writes: I am a new student. Build it.', target: 'I am a new student.', extraTiles: ['teacher'], hint: 'Sam says: I am ...' },

    // ── Energiser (4 min, zero stakes) ────────────────────────────────────────
    { t: 'segment', index: 4 },
    { t: 'bg', id: 'classroom-morning', alt: 'The classroom in the morning' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'A quick one! Pick one.' },
    {
      t: 'choice',
      prompt: 'A new friend or a new teacher?',
      tests: 'story',
      options: [{ text: 'A new friend' }, { text: 'A new teacher' }],
    },
    {
      t: 'sort',
      prompt: 'Is it a person?',
      cards: ['teacher', 'hello', 'student', 'online', 'friend', 'name', 'member', 'group'],
      yes: 'A person',
      no: 'Not a person',
      key: 'person_count',
    },
    {
      t: 'match',
      prompt: 'Which word fits the gap?',
      pairs: [
        { left: 'hello', right: '___, Sam!' },
        { left: 'welcome', right: '___ to our group.' },
        { left: 'nice', right: '___ to meet you.' },
        { left: 'name', right: 'My ___ is Sam.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'Find the odd one.',
      tests: 'language',
      options: [
        { text: 'teacher', correct: false, feedback: 'A teacher is a person. Find the word that is not a person.' },
        { text: 'hello', correct: true, feedback: 'Yes! Hello is not a person.' },
        { text: 'student', correct: false, feedback: 'A student is a person. Find the word that is not a person.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'Find the odd one.',
      tests: 'language',
      options: [
        { text: 'hello', correct: false, feedback: 'Hello is a way to say hi. Look for a different word.' },
        { text: 'welcome', correct: false, feedback: 'Welcome is a way to say hi. Look for a different word.' },
        { text: 'friend', correct: true, feedback: 'Yes! A friend is a person.' },
      ],
    },

    // ── Mission (12 min): Take 1 -> feedback -> Take 2, then an opinion ──────
    { t: 'segment', index: 5 },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Mission: you meet Theo. Pick your level.', gloss: { level: 'how hard the mission is', chill: 'easy and relaxed', normal: 'not easy, not hard', push: 'a bit harder' }, key: ['level'] },
    {
      t: 'choice',
      prompt: 'Chill, Normal or Push?',
      tests: 'story',
      options: [
        { text: 'Chill', goto: 'm-chill', set: { dial: 'chill' }, feedback: 'Chill is a good start.' },
        { text: 'Normal', goto: 'm-normal', set: { dial: 'normal' }, feedback: 'Normal. Let us go!' },
        { text: 'Push', goto: 'm-push', set: { dial: 'push' }, feedback: 'Push! Nice.' },
      ],
    },
    { t: 'label', name: 'm-chill' },
    { t: 'say', who: 'Theo', expr: 'neutral', text: 'Hello! I am Theo.' },
    { t: 'build', prompt: 'Take 1. Copy: Hello, my name is Ava.', target: 'Hello, my name is Ava.', extraTiles: ['teacher'] },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice! Now try again, with your name.' },
    { t: 'record', prompt: 'Take 2. Say it with your name.', model: 'Hello, my name is {name}. Nice to meet you.' },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'Now a question for Theo.' },
    { t: 'build', prompt: 'Build the question.', target: 'What is your name?', extraTiles: ['class'], hint: 'Start with What.' },
    { t: 'jump', label: 'm-done' },
    { t: 'label', name: 'm-normal' },
    { t: 'say', who: 'Theo', expr: 'neutral', text: 'Hello! I am Theo.' },
    { t: 'record', prompt: 'Take 1. Say hello to Theo with your name.', model: 'Hello, my name is {name}. Nice to meet you.' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Nice to meet you, {name}!' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice! Now try again, and ask: What is your name?' },
    { t: 'record', prompt: 'Take 2. Add a question for Theo.', model: 'Hello, my name is {name}. What is your name?' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'My name is Theo.' },
    { t: 'jump', label: 'm-done' },
    { t: 'label', name: 'm-push' },
    { t: 'say', who: 'Theo', expr: 'neutral', text: 'Hello! Who is this new student?' },
    { t: 'record', prompt: 'Take 1. Say hello, your name, and ask for his name.', model: 'Hello! My name is {name}. What is your name?' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'I am Theo. Nice to meet you, {name}!' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice! Now try again. Introduce Ava to Theo.' },
    { t: 'record', prompt: 'Take 2. Introduce your friend.', model: 'Theo, this is my friend Ava. Ava, this is Theo.' },
    { t: 'label', name: 'm-done' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Nice to meet you, friend!', key: ['meet'] },
    { t: 'say', who: 'Ava', expr: 'curious', text: 'Hello again! What is your name?' },
    { t: 'record', prompt: 'Answer Ava.', model: 'My name is {name}.' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Nice to meet you, {name}!', key: ['meet'] },
    { t: 'bg', id: 'phone-profile-closeup', alt: 'The phone shows the profile again' },
    {
      t: 'say',
      who: 'Vee',
      expr: 'curious',
      text: 'Now your idea. Who is Sam? I think Sam is a ___.',
      gloss: { think: 'to have an idea', idea: 'what you think' },
      key: ['think', 'idea'],
    },
    { t: 'record', prompt: 'Tell Ava your idea.', model: 'I think Sam is a friend.' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Nice idea, {name}!' },
    { t: 'say', who: 'Theo', expr: 'thinking', text: 'I think Sam is a new friend.' },

    // ── Release (7 min): own profile + a one-sentence reaction ────────────────
    { t: 'segment', index: 6 },
    { t: 'bg', id: 'classroom-evening', alt: 'The classroom in warm evening light' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now make your profile, {name}.', gloss: { profile: PROFILE_GLOSS.profile }, key: ['profile'] },
    {
      t: 'form',
      prompt: 'Your profile.',
      fields: [
        { key: 'role', label: 'I am a', kind: 'choice', options: ['student', 'teacher', 'friend'] },
        { key: 'where', label: 'I am', kind: 'choice', options: ['in a class', 'online'] },
      ],
    },
    {
      t: 'profile',
      title: '{name}',
      gloss: { profile: PROFILE_GLOSS.profile },
      rows: [
        { label: 'Name', value: '{name}' },
        { label: 'About', value: 'I am a {role}.' },
        { label: 'Where', value: 'I am {where}.' },
        { label: 'Group', value: 'Our class group' },
      ],
    },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'A new member! Welcome, {name}.', key: ['member', 'Welcome'] },
    { t: 'record', prompt: 'Say hello to the group. Only you and your teacher hear this.', model: 'Hello! My name is {name}. I am a {role}.' },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'One more. Your idea about Sam.' },
    { t: 'record', prompt: 'One sentence about Sam.', model: 'I think Sam is a friend.' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Nice, {name}!' },

    // ── Wrap (5 min) ──────────────────────────────────────────────────────────
    { t: 'segment', index: 7 },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice work, {name}! Your line: Hello, my name is {name}.' },
    {
      t: 'ticks',
      prompt: 'How was it for you?',
      items: ['I know: hello, student, teacher, friend.', 'I say: Hello, my name is ___.', 'I know who Sam is.'],
    },
    {
      t: 'form',
      prompt: 'Pick one for next time.',
      fields: [{ key: 'skin_next', label: 'Pick one', kind: 'choice', options: EMOJI_SKINS }],
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Homework: say hello to one friend.', gloss: { homework: 'a small job to do after class' }, key: ['Homework'] },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'See you, friend. Nice to meet you again!' },
    { t: 'say', who: 'Ava', expr: 'curious', text: 'Next time, we meet Sam online!', key: ['meet', 'online'] },
    { t: 'end', summary: 'Clue 1 of 8: Sam is a new member of the group, but Sam is not in our class.' },
  ],
};
