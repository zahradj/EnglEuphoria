// SAMPLE lesson script: A1-S01-E1 "Who Are You? · Cold Open" (Academy cast only).
// Written ONLY with the words this lesson introduces (the Season's E1 list: hello, welcome, name, friend, new, student, teacher,
// class, meet, online, nice, group, member, introduce) plus closed-class words; a few story words are glossed on tap.
// Run of show covered: Check-in (0), The Drop (2), Notice & Build vocabulary (3), Wrap (7).
// No voice clips exist yet (the cast has no voice assigned): every line is silent until recorded clips are added.
import type { SceneScript } from '../scriptTypes';

export const A1S01E1: SceneScript = {
  lessonId: 'A1-S01-E1',
  level: 'A1',
  title: 'Who Are You? · Cold Open',
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  beats: [
    // ── Check-in ──────────────────────────────────────────────────────────────
    { t: 'segment', index: 0 },
    { t: 'bg', id: 'classroom-morning', alt: 'A bright classroom in the morning with desks and a whiteboard' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Hello! Welcome to class.', key: ['Welcome'] },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'happy' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'neutral' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Hello! I am Ava.' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Hello! I am Theo. Nice to meet you.', key: ['Nice', 'meet'] },

    // ── The Drop ──────────────────────────────────────────────────────────────
    { t: 'segment', index: 2 },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'We have a new member in the group.', key: ['new', 'member', 'group'] },
    {
      t: 'chat',
      title: 'Class group',
      messages: [
        { who: 'Unknown', label: 'new_friend', text: 'Hello! My name is Sam. I am a new student.' },
        { who: 'Mia', text: 'Welcome to the group, Sam! Nice to meet you.' },
        { who: 'Theo', text: 'Sam is not in our class.' },
        { who: 'Ava', text: 'Who is Sam?' },
      ],
      reply: {
        prompt: 'Say hello to Sam.',
        options: [
          { text: 'Hello, Sam! Welcome to the group.', correct: true, feedback: 'Yes! A friendly hello.' },
          { text: 'Hello, teacher!', correct: false, feedback: 'Sam is a new member, not the teacher. Try again!' },
          { text: 'Who is the new student?', correct: false, feedback: 'That is a question. First say hello to Sam!' },
        ],
      },
    },
    { t: 'bg', id: 'phone-profile-closeup', alt: 'A phone screen showing a plain online profile with no picture' },
    {
      t: 'panels',
      layout: 'strip',
      panels: [
        { bg: 'phone-profile-closeup', alt: 'Mia holds up her phone', who: 'Mia', expr: 'curious', bubble: { who: 'Mia', text: 'This is the profile.' }, keyWord: { word: 'profile', meaning: 'your page online: name, picture, friends' } },
        { bg: 'classroom-morning', alt: 'Theo looks at the phone', who: 'Theo', expr: 'thinking', bubble: { who: 'Theo', text: 'The name is Sam. Sam is new online.' } },
        { bg: 'classroom-morning', alt: 'Ava looks surprised', who: 'Ava', expr: 'surprised', bubble: { who: 'Ava', text: 'But Sam is not a student in our class.' } },
        { bg: 'classroom-morning', alt: 'Vee smiles and looks at the group', who: 'Vee', expr: 'thinking', bubble: { who: 'Vee', text: 'A mystery! Who is Sam?' }, keyWord: { word: 'mystery', meaning: 'a puzzle to solve' } },
      ],
    },
    {
      t: 'choice',
      prompt: 'Who is Sam?',
      tests: 'story',
      options: [
        { text: 'A new member of the group', correct: true, feedback: 'Right! Sam is a new member of the group.' },
        { text: 'A student in our class', correct: false, feedback: 'Look again: Theo says Sam is not in our class.' },
        { text: 'The teacher', correct: false, feedback: 'Not the teacher. Sam says: I am a new student.' },
      ],
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Yes! This is your first clue.', gloss: { clue: 'a small piece of information that helps you solve a mystery' }, key: ['clue'] },

    // ── Notice & Build: meet the words (sets of four) ─────────────────────────
    { t: 'segment', index: 3 },
    { t: 'say', who: 'Vee', expr: 'curious', text: 'Now meet four words from the story.' },
    {
      t: 'flash',
      title: 'People',
      cards: [
        { word: 'student', chunk: 'a new student', pictureId: 'card-student', alt: 'A teenager with a backpack in a classroom' },
        { word: 'teacher', chunk: 'the teacher', pictureId: 'card-teacher', alt: 'A teacher at the whiteboard' },
        { word: 'friend', chunk: 'my friend', pictureId: 'card-friend', alt: 'Two teenagers smiling together' },
        { word: 'member', chunk: 'a group member', pictureId: 'card-member', alt: 'A teenager joining a group of friends' },
      ],
    },
    {
      t: 'flash',
      title: 'Saying hello',
      cards: [
        { word: 'hello', chunk: 'Hello, friend!', pictureId: 'card-hello', alt: 'A teenager waving' },
        { word: 'welcome', chunk: 'Welcome to the class.', pictureId: 'card-welcome', alt: 'Open door and a welcome sign' },
        { word: 'meet', chunk: 'Nice to meet you.', pictureId: 'card-meet', alt: 'Two teenagers shaking hands' },
        { word: 'introduce', chunk: 'Introduce your friend.', pictureId: 'card-introduce', alt: 'A teenager presenting a friend to a group' },
      ],
    },

    // ── Wrap ──────────────────────────────────────────────────────────────────
    { t: 'segment', index: 7 },
    { t: 'bg', id: 'classroom-evening', alt: 'The classroom in warm evening light' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice! You are in our group now.', key: ['Nice', 'group'] },
    { t: 'say', who: 'Mia', expr: 'curious', text: 'Next time, we meet Sam online!', key: ['meet', 'online'] },
    { t: 'end', summary: 'Clue 1 of 8: Sam is a new member of the group, but Sam is not in our class.' },
  ],
};
