// Standalone preview of the Academy lesson (dev only): open /academy-player-preview.html
// Default = live one-to-one classroom (teacher + student on one screen). ?solo=1 = the student player alone.
// Options: ?theme=explorer|studio  ?art=/academy-art  (real art base)  ?start=1 (solo only: skip the start gate)
import { createRoot } from 'react-dom/client';
import { AcademyPlayer } from '../AcademyPlayer';
import { LiveClassroom } from '../live/LiveClassroom';
import { A1S01E1 } from '../samples/a1s01e1';
import { A1S01E1_PLAN } from '../../curriculum/academy/sessions/a1s01e1';

const q = new URLSearchParams(window.location.search);
const art = q.get('art') ?? (window as unknown as { __ACADEMY_ART__?: string }).__ACADEMY_ART__ ?? undefined;
const theme = q.get('theme') === 'explorer' ? 'explorer' : 'studio';
document.body.style.margin = '0';
createRoot(document.getElementById('root')!).render(
  q.get('solo') === '1' ? <AcademyPlayer script={A1S01E1} theme={theme} artBase={art} autoStart={q.get('start') === '1'} /> : <LiveClassroom script={A1S01E1} plan={A1S01E1_PLAN} artBase={art} theme={theme} />,
);
