// Sample On Air scenes: used by the dev preview (?demo=onair) and the tests. The real lesson (B1-S01-E4) will carry its own, approved copy.
import type { OnAirScene } from './onairLogic';

export const DEMO_SHOW: OnAirScene = {
  id: 'show', part: 5, kind: 'onair', look: 'show', title: 'Club FM · Friday live', guest: 'Mia', producer: 'Vee', plate: 'library-case-room',
  intro: 'You are the host today. Mia is shy, so react, ask about the detail, and keep her talking.',
  flag: 'miaOpenedUp', flagAt: 5,
  exchanges: [
    { guest: 'I went to Japan last summer.', options: [
      { kind: 'react', fit: 2, text: 'Really? That sounds amazing!', reply: 'Thanks! It was the best trip of my life. The food and the trains were so different.', note: 'A reaction shows interest, so Mia wants to say more.' },
      { kind: 'ask', fit: 2, text: 'When did you go, and who did you go with?', reply: 'I went in July with my cousin. We stayed for two weeks.', note: 'Asking about the detail in the past simple keeps the talk going.' },
      { kind: 'flat', fit: 0, text: 'Oh. OK.', reply: 'Yeah.', note: 'A dead end: “Oh. OK.” gives Mia nothing to answer. React or ask.' },
    ] },
    { guest: 'I have been to Japan twice.', options: [
      { kind: 'share', fit: 1, text: 'Me too! I have been to Italy twice.', reply: 'Nice! Which city did you like best?', note: 'Sharing is friendly. Next, ask about her trip too.' },
      { kind: 'ask', fit: 2, text: 'What was it like the second time?', reply: 'Quieter. We visited a small town and the people were so kind.', note: 'What was it like? asks for a feeling, not a yes or no.' },
      { kind: 'flat', fit: 0, text: 'Good.', reply: 'Mm.', note: 'One word closes the door. Ask a question about the detail.' },
    ] },
    { guest: 'I have never tried fugu, but my cousin has.', options: [
      { kind: 'react', fit: 2, text: 'No way! Why not?', reply: 'It is the scary fish! He said it was fine, but I said no, thank you.', note: 'No way! shows surprise and Why not? asks for the reason.' },
      { kind: 'flat', fit: 0, text: 'I see.', reply: 'Yes.', note: '“I see.” does not show interest. Try a reaction with a question.' },
      { kind: 'share', fit: 1, text: 'I have never tried it either.', reply: 'Ha! Then we are both safe.', note: 'Good sharing. A question would help her say more.' },
    ] },
    { guest: 'Next summer I want to go to Peru.', options: [
      { kind: 'ask', fit: 2, text: 'Have you ever been to South America?', reply: 'No, I haven’t, but I have always wanted to see Machu Picchu.', note: 'Have you ever…? links her plan to her past.' },
      { kind: 'react', fit: 1, text: 'Wow, lucky you!', reply: 'Thank you!', note: 'Nice reaction. A follow-up question makes the answer longer.' },
      { kind: 'flat', fit: 0, text: 'OK.', reply: 'Mm-hm.', note: 'A dead end. Ask something about Peru.' },
    ] },
  ],
};

export const DEMO_TWOTRUTHS: OnAirScene = {
  id: 'truths', part: 5, kind: 'onair', look: 'twotruths', title: 'Two Truths and a Lie · live', guest: 'Mia', producer: 'Vee', plate: 'library-case-room',
  intro: 'Mia will tell you three experiences. Two are true and one is a lie. Ask follow-up questions and find it.',
  flag: 'caughtLie',
  minProbes: 3,
  lieId: 'b',
  claims: [
    { id: 'a', text: 'I have been to Japan twice.', probes: [
      { q: 'When did you go the first time?', a: 'In 2022, with my family.' },
      { q: 'Who did you go with the second time?', a: 'With my cousin, last July.' },
    ] },
    { id: 'b', text: 'I have never eaten sushi.', probes: [
      { q: 'Where did you eat in Japan?', a: 'In Tokyo. The sushi bar near the station was great!', tell: true },
      { q: 'What is your favourite food?', a: 'Ramen, I think.' },
    ] },
    { id: 'c', text: 'I have climbed Mount Fuji.', probes: [
      { q: 'When did you climb it?', a: 'Last summer, early in the morning.' },
      { q: 'What was it like?', a: 'Cold at the top, but the sunrise was beautiful.' },
    ] },
  ],
  why: 'she ate sushi in Tokyo last summer.',
  explain: 'Right! “I have never eaten sushi” cannot be true: Mia says she ate it in Tokyo. “Never” and a finished time do not go together.',
  sayFrame: 'I think number {n} is the lie, because {why}',
};
