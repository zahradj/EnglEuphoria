// Dev-only preview of the Academy player v2: open /academy-player-v2-preview.html  (?i=1 opens at a page, ?calm=1)
import '@/lib/i18n';
import { createRoot } from 'react-dom/client';
import { LessonPlayer } from '../LessonPlayer';
import type { LessonScript } from '../types';
import { loadScript } from '../lessonScripts';

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
    { id: 'model', part: 3, kind: 'model', title: 'Have you ever…?', who: 'Theo', plate: 'library-case-room', steps: [{ phase: 'iDo', text: 'Have you ever been to Rome? Yes, I have.' }, { phase: 'weDo', text: 'Say it with me.' }, { phase: 'youDo', text: 'Now you ask me.' }] } as never,
    { id: 'rule', part: 3, kind: 'rule', title: 'Been or gone', who: 'Vee', plate: 'library-case-room', lines: [{ rule: 'been = went and came back', example: 'I have been to Rome.' }, { rule: 'gone = went and is still there', example: 'Theo has gone to Rome.' }] } as never,
    { id: 'sort', part: 4, kind: 'sort', title: 'Been or gone', prompt: 'Is he back, or still away?', plate: 'library-case-room', bins: [{ id: 'a', label: 'BEEN', note: 'came back' }, { id: 'b', label: 'GONE', note: 'still there' }], items: [{ id: '1', text: 'Theo has ___ to the library. (He is back.)', bin: 'a' }, { id: '2', text: 'Mia has ___ to Paris. (Still there.)', bin: 'b' }, { id: '3', text: 'I have ___ to Rome twice.', bin: 'a' }, { id: '4', text: 'Where is Ava? She has ___ out.', bin: 'b' }] } as never,
    { id: 'check', part: 5, kind: 'choice', title: 'Quick check', plate: 'library-case-room', questions: [{ q: 'Theo is back at his desk. He has ___ to the library.', options: ['been', 'gone'], answer: 0, why: 'He came back.' }] } as never,
    { id: 'wrap', part: 7, kind: 'wrap', heading: 'Case closed!', teachBack: 'When do we say been, and when gone?', plate: 'library-case-room' } as never,
  ],
};
if (q.get('calm')) window.localStorage.setItem('academy-player-prefs-v2', JSON.stringify({ calm: true, sound: false }));
const real = q.get('lesson') ? await loadScript(q.get('lesson')!) : null;
createRoot(document.getElementById('root')!).render(<LessonPlayer script={real ?? script} ephemeral index={q.get('i') ? Number(q.get('i')) : undefined} role={q.get('i') ? 'teacher' : 'solo'} />);
