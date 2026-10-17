// Dev-only preview of the Academy player v2: open /academy-player-v2-preview.html  (?i=1 opens at a page, ?calm=1)
import '@/lib/i18n';
import { createRoot } from 'react-dom/client';
import { LessonPlayer } from '../LessonPlayer';
import type { LessonScript } from '../types';

const q = new URLSearchParams(window.location.search);
const script: LessonScript = {
  blueprintId: 'B1-S01-E3',
  title: 'Preview lesson',
  criteria: ['Build a correct “I have / I have never + participle” sentence.', 'Ask “Have you ever …?” and answer it.', 'Choose been or gone for a short scene and say why.'],
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  partMinutes: [5, 7, 8, 12, 14, 8, 4, 2],
  scenes: [
    { id: 'lobby', part: 0, kind: 'lobby', plate: 'library-case-room', heading: 'Been or gone?', sub: 'Case file 3' } as never,
    {
      id: 'story', part: 2, kind: 'comic', title: 'Theo’s trip', plate: 'library-case-room',
      beats: [
        { plate: 'story-b1s3-1', caption: 'Theo tells us where he has been. Listen for the pattern.', spots: { Vee: { x: 3, y: 26, w: 38 }, Theo: { x: 58, y: 12, w: 38 } }, lines: [{ who: 'Vee', text: 'Where have you been, Theo?' }, { who: 'Theo', text: 'I have never been to Lisbon.' }] },
        { plate: 'library-case-room', lines: [{ who: 'Theo', text: 'I have been to Rome twice!', sfx: 'Wow' }] },
        { plate: 'story-b1s3-3', lines: [{ who: 'Vee', text: 'Interesting. Let us look at the pattern.' }] },
      ],
    } as never,
  ],
};
if (q.get('calm')) window.localStorage.setItem('academy-player-prefs-v2', JSON.stringify({ calm: true, sound: false }));
createRoot(document.getElementById('root')!).render(<LessonPlayer script={script} ephemeral index={q.get('i') ? Number(q.get('i')) : undefined} role={q.get('i') ? 'teacher' : 'solo'} />);
