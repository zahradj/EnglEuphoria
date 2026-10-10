// Standalone preview of the Academy Deck (dev + artifact). Options: ?art=/academy-art  ?teacher=1 (open any slide)  ?slide=N
import { createRoot } from 'react-dom/client';
import { Deck } from '../Deck';
import { SIGN_ME_UP } from '../lessons/signMeUp';

const q = new URLSearchParams(window.location.search);
document.body.style.margin = '0';
const art = q.get('art') ?? (window as unknown as { __ACADEMY_ART__?: string }).__ACADEMY_ART__ ?? undefined;
createRoot(document.getElementById('root')!).render(<Deck script={SIGN_ME_UP} artBase={art} teacher={q.get('teacher') === '1'} />);
