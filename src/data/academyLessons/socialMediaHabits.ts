import type { Slide } from '@/pages/AcademyDemo';

/**
 * Academy Hub — preloaded 60-minute lesson
 * Topic: "Social Media & Daily Habits" (A2 / B1, teens)
 * 38 slides across 7 blocks + bonus.
 */
export const SOCIAL_MEDIA_LESSON: { id: string; title: string; level: string; durationMin: number; slides: Slide[] } = {
  id: 'social-media-habits',
  title: 'Social Media & Daily Habits',
  level: 'A2 / B1',
  durationMin: 60,
  slides: [
    // ── BLOCK 1 — WARM-UP (3) ─────────────────────────────────────────────
    { type: 'intro', block: 'warmup', title: 'Social Media & Daily Habits', subtitle: 'A2 / B1 · 60 min · Talk about how we live online' },
    { type: 'opinion', block: 'warmup', prompt: 'Do you use your phone every day? When was the last time you put it down for 24 hours?' },
    { type: 'poll', block: 'warmup', prompt: 'How many hours a day do you spend on social media?', options: [
      { label: 'Under 1 hour', pct: 12 },
      { label: '1–3 hours', pct: 38 },
      { label: '3–5 hours', pct: 32 },
      { label: '5+ hours', pct: 18 },
    ]},

    // ── BLOCK 2 — VOCABULARY (5) ──────────────────────────────────────────
    { type: 'vocab', block: 'vocab', word: 'scroll', definition: 'to move your finger up or down on a screen', example: 'I scroll through TikTok before bed.' },
    { type: 'vocab', block: 'vocab', word: 'post', definition: 'to share something online', example: 'She posts a photo every weekend.' },
    { type: 'vocab', block: 'vocab', word: 'spend time', definition: 'to use time on something', example: 'I spend time on YouTube every day.' },
    { type: 'vocab', block: 'vocab', word: 'check', definition: 'to look at something quickly', example: 'I check my messages in the morning.' },
    { type: 'vocab', block: 'vocab', word: 'upload', definition: 'to put a file or photo on the internet', example: 'He uploads a new video every Friday.' },

    // matching + quick check
    { type: 'matching', block: 'vocab', prompt: 'Match each word with its meaning.', pairs: [
      { left: 'scroll',  right: 'move your finger on a screen' },
      { left: 'post',    right: 'share something online' },
      { left: 'check',   right: 'look at something quickly' },
      { left: 'upload',  right: 'put a file on the internet' },
    ]},
    { type: 'multiple', block: 'vocab', question: 'Which sentence uses “upload” correctly?', options: [
      'I upload my coffee in the morning.',
      'She uploaded a photo to Instagram.',
      'He uploads tired after school.',
    ], answer: 'She uploaded a photo to Instagram.' },

    // ── BLOCK 3 — READING + LISTENING (5) ─────────────────────────────────
    { type: 'reading_passage', block: 'reading', title: "Alex's Online Day",
      passage: "Hi, I'm Alex. I spend three hours online every day. In the morning I check my notifications and scroll through Instagram. After school I post photos with my friends and watch short videos. I think social media is fun, but sometimes I use my phone too much and I forget to do my homework." },
    { type: 'listening', block: 'reading', prompt: 'Listen to Alex describe his evening, then answer the questions.',
      transcript: "In the evening I usually watch videos for one hour. After that I message my friends, upload a quick story, and then I go to sleep around eleven. On weekends I spend even more time online." },
    { type: 'multiple', block: 'reading', question: 'How many hours does Alex spend online each day?', options: ['One hour', 'Three hours', 'Five hours'], answer: 'Three hours' },
    { type: 'truefalse', block: 'reading', statement: 'Alex thinks he sometimes uses his phone too much.', answer: true },
    { type: 'opinion', block: 'reading', prompt: "Is Alex's habit healthy? Why or why not? Give one reason." },

    // ── BLOCK 4 — GRAMMAR (5) ─────────────────────────────────────────────
    { type: 'grammar_pattern', block: 'grammar', title: 'Present simple — verb + s', rows: [
      { a: 'I post photos.',     b: 'He posts photos.' },
      { a: 'You check the app.', b: 'She checks the app.' },
      { a: 'We upload videos.',  b: 'It uploads videos.' },
    ], rule: 'For he / she / it, add -s (or -es) to the verb.' },
    { type: 'intro', block: 'grammar', title: 'The Rule', subtitle: 'Add -s to the verb when the subject is he, she, or it.' },
    { type: 'multiple', block: 'grammar', question: 'Which sentence is correct?', options: [
      'She use Instagram every day.',
      'She uses Instagram every day.',
      'She using Instagram every day.',
    ], answer: 'She uses Instagram every day.' },
    { type: 'error_detection', block: 'grammar', prompt: 'Tap the word with the mistake.', sentence: 'He check his phone every five minutes.', wrongIndex: 1 },
    { type: 'correction', block: 'grammar', prompt: 'Fix the sentence.', wrong: 'My sister post photos every day.', answer: 'My sister posts photos every day.' },

    // ── BLOCK 5 — CONTROLLED PRACTICE (6) ─────────────────────────────────
    { type: 'fill_blank', block: 'practice', prompt: 'Complete with the correct verb form.', before: 'He', after: '(check) his phone before breakfast.', answer: 'checks' },
    { type: 'multiple', block: 'practice', question: 'She ___ a new photo every weekend.', options: ['post', 'posts', 'posting'], answer: 'posts' },
    { type: 'sentence_builder', block: 'practice', prompt: 'Build the sentence.', words: ['photos', 'I', 'on', 'post', 'Instagram'], answer: ['I', 'post', 'photos', 'on', 'Instagram'] },
    { type: 'sentence_builder', block: 'practice', prompt: 'Put the words in order.', words: ['often', 'videos', 'She', 'uploads'], answer: ['She', 'often', 'uploads', 'videos'] },
    { type: 'matching', block: 'practice', prompt: 'Match the subject to the correct verb form.', pairs: [
      { left: 'I',    right: 'post' },
      { left: 'She',  right: 'posts' },
      { left: 'They', right: 'check' },
      { left: 'He',   right: 'checks' },
    ]},
    { type: 'truefalse', block: 'practice', statement: '"He scroll every night." is grammatically correct.', answer: false },

    // ── BLOCK 6 — INTERACTIVE (8) ─────────────────────────────────────────
    { type: 'debate_scale', block: 'interactive', prompt: 'Social media has more positive than negative effects on teenagers.' },
    { type: 'speaking_task', block: 'interactive', prompt: 'Speed challenge — 10 seconds. Say one full sentence using "spend time".' },
    { type: 'role_play', block: 'interactive', title: 'Role play — meeting a new classmate',
      lineA: 'Hi! Which apps do you use the most?',
      lineB: 'I use ____ a lot. I spend about ____ hours a day on it. And you?' },
    { type: 'question', block: 'interactive', prompt: 'Real-life situation: your friend posts a photo of you that you don\'t like. What do you say?', placeholder: 'Hey, could you…' },
    { type: 'question', block: 'interactive', prompt: 'Guess the word: "I do this every morning to see new messages and photos."', placeholder: 'It is…' },
    { type: 'error_detection', block: 'interactive', prompt: 'Find the mistake.', sentence: 'My brother spend hours on YouTube every day.', wrongIndex: 2 },
    { type: 'debate_scale', block: 'interactive', prompt: 'Schools should ban phones during class.' },
    { type: 'speaking_task', block: 'interactive', prompt: 'Mini speaking challenge — say two sentences about your own social media habits.' },

    // ── BLOCK 7 — SPEAKING OUTPUT (4) ─────────────────────────────────────
    { type: 'speaking_task', block: 'speaking', prompt: 'Talk for 60 seconds about how you use social media.', starters: ['I use…', 'I usually…', 'My favourite app is…'] },
    { type: 'speaking_task', block: 'speaking', prompt: "Now describe a friend or family member's social media habits.", starters: ['My friend uses…', 'They post…', 'They spend…'] },
    { type: 'speaking_task', block: 'speaking', prompt: 'Free speaking — no support. Tell us about your perfect day with NO phone.' },
    { type: 'reflection', block: 'speaking', prompt: 'How did this lesson feel? What was easy, what was hard?' },

    // ── BONUS (4) ─────────────────────────────────────────────────────────
    { type: 'debate_scale', block: 'speaking', prompt: 'BONUS: Influencers have a real job.' },
    { type: 'multiple', block: 'speaking', question: 'BONUS quiz: Which verb fits best? "She ____ a story every morning."', options: ['upload', 'uploads', 'uploading'], answer: 'uploads' },
    { type: 'opinion', block: 'speaking', prompt: 'BONUS group discussion: What is one rule you would create for healthy phone use?' },
    { type: 'reflection', block: 'speaking', prompt: 'Wrap-up: write one new word and one new sentence you learned today.' },
  ],
};
