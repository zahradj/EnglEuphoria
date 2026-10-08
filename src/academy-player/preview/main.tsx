// Standalone preview of the Academy lesson player (dev only): open /academy-player-preview.html
// Options: ?theme=explorer|studio  ?art=/academy-art  (real art base)  ?start=1 (skip the start gate)
import { createRoot } from 'react-dom/client';
import { AcademyPlayer } from '../AcademyPlayer';
import { A1S01E1 } from '../samples/a1s01e1';

const q = new URLSearchParams(window.location.search);
document.body.style.margin = '0';
createRoot(document.getElementById('root')!).render(
  <AcademyPlayer script={A1S01E1} theme={q.get('theme') === 'explorer' ? 'explorer' : 'studio'} artBase={q.get('art') ?? undefined} autoStart={q.get('start') === '1'} />,
);
