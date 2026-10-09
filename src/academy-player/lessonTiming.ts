// Estimated student-screen time per beat, and per run-of-show segment for a simulated play-through.
// The numbers are planning estimates (seconds a typical A1 teen needs on that screen), not measurements; they exist so a lesson
// that is "too thin for its hour" fails a test instead of being noticed by the owner. Pure; no React.
import { initState, step, type PlayerEvent } from './engine';
import type { Beat, SceneScript } from './scriptTypes';

const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

export function beatSeconds(b: Beat): number {
  switch (b.t) {
    case 'say':
      // read-and-repeat adds the time to say (or type) the line; memorise mode is mostly recall time
      return 4 + 0.45 * words(b.text) + (b.repeat ? 18 : 0) + (b.hide ? 14 : 0);
    case 'cloze':
      return 15 + b.bank.length * 9;
    case 'trains':
    case 'layout':
      return 0;
    case 'choice':
      return 25;
    case 'chat':
      return b.messages.length * 8 + (b.reply ? 25 : 8);
    case 'panels':
      return b.panels.length * 14 + 20;
    case 'flash':
      return b.noCheck ? b.cards.length * 14 : b.cards.length * 30 + b.cards.length * 8; // meet (a full page per word) [+ the picture check]
    case 'build':
      return 20 + 9 * (words(b.target) + (b.extraTiles?.length ?? 0));
    case 'record':
      return b.hideModel ? 110 : 80;
    case 'ticks':
      return b.items.length * 22;
    case 'sort':
      return b.cards.length * 7 + 10;
    case 'match':
      return b.drag ? b.pairs.length * 8 + 10 : b.pairs.length * 11 + 15;
    case 'profile':
      return 25 + (b.hotspots?.length ?? 0) * 28;
    case 'form':
      return b.fields.length * 18 + 15;
    default:
      return 0;
  }
}

/** Play the lesson with the first correct answer each time and the given dial index; returns seconds per segment (0..7). */
export function segmentSeconds(script: SceneScript, dial = 1, seed = 3): number[] {
  const out = new Array<number>(8).fill(0);
  let s = initState(script, seed);
  for (let guard = 0; guard < 2000 && !s.finished; guard++) {
    const b = script.beats[s.beatIndex];
    out[s.stage.segment] += beatSeconds(b);
    let e: PlayerEvent = { type: 'next' };
    if (b.t === 'choice') {
      const c = b.options.findIndex((o) => o.correct);
      e = { type: 'choose', index: c >= 0 ? c : b.options.some((o) => o.set?.dial) ? dial : 0 };
    } else if (b.t === 'chat' && b.reply) e = { type: 'choose', index: b.reply.options.findIndex((o) => o.correct) };
    else if (b.t === 'sort') e = { type: 'fill', values: { [b.key]: b.cards.length } };
    else if (b.t === 'form') e = { type: 'fill', values: Object.fromEntries(b.fields.map((f) => [f.key, f.kind === 'text' ? 'Sam' : f.options![0]])) };
    else if (b.t === 'record' && b.hideModel) e = { type: 'fill', values: { exitPeeked: false, exitText: 'x' } };
    s = step(script, s, e);
  }
  return out;
}
