import type { SeasonArc } from './types';

/**
 * Hand-written Pre-A1 Season arcs (skill academy-season-arc), keyed by Pre-A1 Season id. Pre-A1 is reading-first (owner 2026-10-15):
 * activate what the student knows, sounds and blending, reading a line and a real-looking message, a word bank kept from the reading.
 * The chapters follow each episode's objective and clue in preA1.ts; no chapter asks for language the student has not met.
 */
export const PRE_A1_ARCS: Record<string, SeasonArc> = {
  'PA1-S01': {
    essentialQuestion: 'How can I say hello, say my name and read it on the wall?',
    chapters: [
      { title: 'The wall wakes up', question: 'Whose name starts with A on the Name Wall?', step: 'Recognise: hear hello and the letters A to G, no production' },
      { title: 'Yes, no, and first sounds', question: 'Which sounds do the names on the wall start with?', step: 'Controlled: say yes and no, hear s and a' },
      { title: 'Spell and blend', question: 'How do I spell my name and blend at, sat, pat, tap?', step: 'Controlled: spell, then blend with t and p' },
      { title: 'Say hello to Theo', question: 'How do I say hello and ask how a name is spelled?', step: 'Guided: a short hello dialogue with Theo' },
      { title: 'Read the wall', question: 'What do five short lines on the wall say?', step: 'More input: read five short lines and match each to its picture' },
      { title: 'My name, my skin', question: 'Can I read and build my name and a friend\'s name?', step: 'Free choice: my own name in the skin I chose' },
      { title: 'Remix: name check', question: 'Can I mix letters, sounds and hello without help?', step: 'Fluency on known language only: four decodable words and the hello chunk' },
      { title: 'My Name Wall', question: 'How can I say hello, say my name and read it on the wall?', step: 'Release: build the Name Wall with my name and three friends\' names, read and said' },
    ],
  },
  'PA1-S02': {
    essentialQuestion: 'How can I read and say what things are on my phone screen?',
    chapters: [
      { title: 'A message arrives', question: 'What does the phone message say when its first letters are missing?', step: 'Recognise: hear i and n and blend in, it, pin, tin' },
      { title: 'Swap the first sound', question: 'Which two words swap their first sound?', step: 'Controlled: hear m and d and blend mat, man, dad, did' },
      { title: 'This is a...', question: 'How do I say what is in a photo with This is a ___?', step: 'Controlled: say the chunk and swap the word' },
      { title: 'Is it a map?', question: 'How do I ask and answer about a blurry photo with Theo?', step: 'Guided: yes/no questions with a partner' },
      { title: 'Read the caption', question: 'What do five short lines say under the photo?', step: 'More input: read five lines and match each to its picture' },
      { title: 'My photo, my caption', question: 'Can I build and read three words of my own?', step: 'Free choice: my own words in the skin I chose' },
      { title: 'Remix: every message', question: 'Can I read all eight sounds, the chunk and the sight words without help?', step: 'Fluency on known language only' },
      { title: 'My phone album', question: 'How can I read and say what things are on my phone screen?', step: 'Release: six labelled things, each read and said' },
    ],
  },
  'PA1-S03': {
    essentialQuestion: 'How can I read and say numbers, my age and a phone number?',
    chapters: [
      { title: 'Locker 7 is open', question: 'Whose locker is open, and what are the numbers 0 to 10?', step: 'Recognise: read and hear the numbers 0 to 10' },
      { title: 'Thirteen or thirty?', question: 'How do I tell 13 from 30 and read 11 to 20?', step: 'Controlled: say and hear the teens against the tens' },
      { title: 'How old are you?', question: 'How do I say my age and ask how old someone is?', step: 'Controlled: say the chunk with my own age' },
      { title: 'The lost digit', question: 'How do I say and write a phone number one digit at a time?', step: 'Guided: say, hear and write a number with a partner' },
      { title: 'The locker list', question: 'What does a list of names, ages and numbers tell me?', step: 'More input: read a locker list and find who has locker 20' },
      { title: 'My own locker', question: 'Can I make a number card of my own?', step: 'Free choice: my own numbers in the skin I chose' },
      { title: 'Remix: every locker', question: 'Can I mix numbers, ages and the sounds from Seasons 1 and 2 without help?', step: 'Fluency on known language only' },
      { title: 'My locker card', question: 'How can I read and say numbers, my age and a phone number?', step: 'Release: my locker card, said to a friend' },
    ],
  },
  'PA1-S04': {
    essentialQuestion: 'How can I read labels and say what things are in my bag?',
    chapters: [
      { title: 'The unlabelled bag', question: 'What is in the bag whose labels are missing?', step: 'Recognise: hear o and c and blend cap, cat, cot, on' },
      { title: 'Swapped labels', question: 'Which two labels swapped their first sounds?', step: 'Controlled: hear b and g and blend big, bag, dog, bin' },
      { title: 'A or an?', question: 'How do I choose a or an: It is a bag, It is an apple?', step: 'Controlled: pick the right word and say the chunk' },
      { title: 'What is it?', question: 'How do I ask and answer What is it? when Theo cannot find his phone?', step: 'Guided: a short question-and-answer with a partner' },
      { title: 'The red bag list', question: 'Who owns the red bag, according to a six-line list?', step: 'More input: read six lines and match them to pictures' },
      { title: 'My bag, my skin', question: 'Can I label my own bag?', step: 'Free choice: my own labels in the skin I chose' },
      { title: 'Remix: the spill', question: 'Can I sort the spilled bag using twelve sounds, a/an and the labels?', step: 'Fluency on known language only' },
      { title: 'My label sheet', question: 'How can I read labels and say what things are in my bag?', step: 'Release: eight things, each labelled, read and said' },
    ],
  },
  'PA1-S05': {
    essentialQuestion: 'How can I read and say where people are from on the world map?',
    chapters: [
      { title: 'A pin with no name', question: 'Which person belongs to the nameless pin on the map?', step: 'Recognise: hear e and u and blend hen, run, bus, red' },
      { title: 'Names swapped', question: 'Which two people swapped their names?', step: 'Controlled: hear h and r and blend hat, hit, ran, rug' },
      { title: 'I am from...', question: 'How do I say I am from ___ and He / She is from ___?', step: 'Controlled: say the chunk for me and for others' },
      { title: 'Where are you from?', question: 'How do I ask a new student where they are from?', step: 'Guided: ask and answer with a partner' },
      { title: 'The missing fact', question: 'What does a three-sentence profile say, and which fact is missing?', step: 'More input: read a profile and answer questions' },
      { title: 'My friends on the map', question: 'Can I add my own friends to the map?', step: 'Free choice: my own pins in the skin I chose' },
      { title: 'Remix: the map lights up', question: 'Can I mix sixteen sounds, the chunks and the people without help?', step: 'Fluency on known language only' },
      { title: 'My world-map card', question: 'How can I read and say where people are from on the world map?', step: 'Release: me and three friends, each with a country, read and said' },
    ],
  },
};
