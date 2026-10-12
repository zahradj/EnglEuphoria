// Standalone preview (dev + artifact). Without ?mode= a small picker offers the lesson deck and the homework quest.
// Options: ?lesson=fake-or-real (default: Sign Me Up)  ?art=/academy-art  ?teacher=0 (turn OFF review mode: by default the preview lets you open any slide and press Next freely)  ?mode=lesson|homework  ?demo=0 (real calendar unlocking)
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Deck } from '../Deck';
import { HomeworkApp } from '../homework/Homework';
import { SIGN_ME_UP } from '../lessons/signMeUp';
import { PATTERN_LAB } from '../lessons/patternLab';
import { SIGN_ME_UP_2 } from '../lessons/signMeUp2';

const q = new URLSearchParams(window.location.search);
const art = q.get('art') ?? (window as unknown as { __ACADEMY_ART__?: string }).__ACADEMY_ART__ ?? undefined;

function Preview() {
  const [mode, setMode] = useState<string | null>(q.get('mode'));
  if (mode === 'lesson') return <Deck script={q.get('lesson') === 'fake-or-real' ? PATTERN_LAB : q.get('lesson') === 'sign-me-up-2' ? SIGN_ME_UP_2 : SIGN_ME_UP} artBase={art} teacher={q.get('teacher') !== '0'} freeNext={q.get('teacher') !== '0'} />;
  if (mode === 'homework') return <HomeworkApp artBase={art} demo={q.get('demo') !== '0'} />;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(160deg,#f5f3ff,#e9e0ff)', color: '#1e1b4b', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: 0 }}>Academy · Sign Me Up</h1>
      {[['lesson', 'The lesson (60 minutes)', 'Eight parts: words, modelling, games, mission, release.'], ['homework', 'Daily 10 homework quest', 'A hub, an adventure map of chests, short recall games.']].map(([id, name, blurb]) => (
        <button key={id} type="button" onClick={() => setMode(id)} style={{ width: 'min(440px, 100%)', textAlign: 'left', padding: '14px 18px', borderRadius: 16, border: '2px solid #c4b5fd', background: '#fff', font: 'inherit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(90,50,190,0.15)' }}>
          <strong style={{ display: 'block', fontSize: '1.1rem', color: '#4c1d95' }}>{name}</strong>
          <span>{blurb}</span>
        </button>
      ))}
    </div>
  );
}

document.body.style.margin = '0';
createRoot(document.getElementById('root')!).render(<Preview />);
