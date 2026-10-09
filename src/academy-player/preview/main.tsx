// Standalone preview of the Academy lesson player (dev only): open /academy-player-preview.html
// Options: ?theme=explorer|studio  ?art=/academy-art  (real art base)  ?start=1 (skip the start gate)  ?lesson=A1-S01-E1|A1-S01-E2
// Without ?lesson= a small picker lets you choose the lesson.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AcademyPlayer } from '../AcademyPlayer';
import { A1S01E1 } from '../samples/a1s01e1';
import { A1S01E2 } from '../samples/a1s01e2';

const q = new URLSearchParams(window.location.search);
const LESSONS = [
  { id: 'A1-S01-E1', script: A1S01E1, name: 'Lesson 1 · Who Are You?', blurb: 'Introduce yourself: name, age, country, hobby, family.' },
  { id: 'A1-S01-E2', script: A1S01E2, name: 'Lesson 2 · Sign Me Up', blurb: 'Sign up at the club desk: spell your name, numbers, nationality.' },
];

function Preview() {
  const [id, setId] = useState<string | null>(q.get('lesson'));
  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(160deg,#f5f3ff,#e9e0ff)', color: '#1e1b4b', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ margin: 0 }}>Academy lessons</h1>
        {LESSONS.map((l) => (
          <button key={l.id} type="button" onClick={() => setId(l.id)} style={{ width: 'min(440px, 100%)', textAlign: 'left', padding: '14px 18px', borderRadius: 16, border: '2px solid #c4b5fd', background: '#fff', font: 'inherit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(90,50,190,0.15)' }}>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#4c1d95' }}>{l.name}</strong>
            <span>{l.blurb}</span>
          </button>
        ))}
      </div>
    );
  }
  return <AcademyPlayer key={lesson.id} script={lesson.script} theme={q.get('theme') === 'explorer' ? 'explorer' : 'studio'} artBase={q.get('art') ?? (window as unknown as { __ACADEMY_ART__?: string }).__ACADEMY_ART__ ?? undefined} autoStart={q.get('start') === '1'} />;
}

document.body.style.margin = '0';
createRoot(document.getElementById('root')!).render(<Preview />);
