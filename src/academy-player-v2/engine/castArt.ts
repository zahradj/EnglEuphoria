// The cast portraits a scene can show (cast/<name>/<mood>), derived from the scene data: the character of the scene (Cast and Badge) and every mood its reactions use
// (cheer = happy, flinch = curious, surprise = surprised, plus the holds in the view). The art check (artReview.test.ts) requires every one to be reviewed.
// Keep this table in step with the views: a new mood in a view needs a new entry here (cast.test in wave2.test.tsx checks the main ones).
import type { CastName, SceneBase } from '../types';

type Loose = SceneBase & Record<string, unknown>;
const THINK_SET = ['thinking', 'happy', 'curious'];
interface Use { who: (s: Loose) => string[]; moods: string[] }
const one = (name: CastName) => () => [name];
const field = (k: string) => (s: Loose) => [String(s[k])];

const USES: Record<string, Use> = {
  sort: { who: one('Vee'), moods: ['thinking', 'happy', 'concerned', 'curious'] },
  choice: { who: one('Vee'), moods: THINK_SET },
  build: { who: one('Vee'), moods: THINK_SET },
  write: { who: one('Vee'), moods: THINK_SET },
  forge: { who: one('Vee'), moods: ['thinking', 'happy', 'concerned', 'curious'] },
  deck: { who: one('Vee'), moods: ['happy'] },
  boss: { who: one('Theo'), moods: ['thinking', 'happy', 'concerned', 'curious'] },
  match: { who: one('Ava'), moods: THINK_SET },
  memory: { who: one('Mia'), moods: ['curious', 'happy'] },
  hunt: { who: field('who'), moods: ['curious', 'happy'] },
  teach: { who: field('who'), moods: ['talk', 'happy'] },
  cipher: { who: field('who'), moods: THINK_SET },
  rapport: { who: field('npc'), moods: ['neutral', 'happy', 'curious', 'thinking'] },
  objection: { who: field('witness'), moods: ['neutral', 'concerned', 'curious', 'happy', 'thinking', 'surprised'] },
  inspect: { who: field('chief'), moods: ['thinking', 'happy', 'curious', 'surprised'] },
  interview: {
    who: (s) => [String(s.chief), ...(Array.isArray(s.personas) ? (s.personas as { cast?: string }[]).map((p) => p.cast ?? 'Ava') : []), ...(s.voice ? [String(s.voice)] : s.look === 'lineup' ? ['Theo'] : [])],
    moods: ['neutral', 'thinking', 'happy', 'curious'],
  },
  finder: { who: field('partner'), moods: THINK_SET },
  workshop: { who: field('who'), moods: THINK_SET },
  beats: { who: field('who'), moods: THINK_SET },
  switchboard: { who: field('who'), moods: THINK_SET },
  archive: { who: field('who'), moods: THINK_SET },
  factcheck: { who: field('who'), moods: THINK_SET },
  redpen: { who: field('who'), moods: THINK_SET },
  onair: { who: (s) => [String(s.guest)], moods: ['neutral', 'curious', 'happy', 'surprised', 'thinking'] },
};

/** 'cast/<name>/<mood>' for every portrait the scene can show (lobby portraits are added by artOf) */
export function castArtOf(s: SceneBase): string[] {
  const u = USES[s.kind];
  if (!u) return [];
  const names = [...new Set(u.who(s as Loose).filter((n) => n && n !== 'undefined'))];
  return names.flatMap((n) => u.moods.map((m) => `cast/${n.toLowerCase()}/${m}`));
}
