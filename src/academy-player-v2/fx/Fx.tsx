import type { Burst, Confetti, Floater } from './useFx';

const CONFETTI_TONES = ['#fbbf24', '#14b8a6', '#a187f2', '#f0745f', '#4ba383', '#c3b0fb'];
const SPARKS = 12;

/** Renders the effects of useFx over the stage. Purely visual (aria-hidden). Motion is CSS only and is switched off by Calm mode. */
export function FxLayer({ bursts, floaters, confettis = [] }: { bursts: Burst[]; floaters: Floater[]; confettis?: Confetti[] }) {
  return (
    <div className="av-fx" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="av-burst" data-tone={b.tone} style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          <em className="av-burst-ring" />
          {Array.from({ length: SPARKS }, (_, i) => (
            <i key={i} data-shape={i % 3} style={{ ['--a' as string]: `${i * (360 / SPARKS) + (i % 2 ? 9 : 0)}deg`, ['--d' as string]: `${46 + (i % 4) * 14}px`, ['--s' as string]: `${0.7 + (i % 3) * 0.28}` }} />
          ))}
        </span>
      ))}
      {floaters.map((f) => <span key={f.id} className="av-float" data-tone={f.tone} style={{ left: `${f.x}%`, top: `${f.y}%` }}>{f.text}</span>)}
      {confettis.map((c) => (
        <span key={c.id} className="av-confetti">
          {Array.from({ length: 34 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 29 + 7) % 100}%`, background: CONFETTI_TONES[i % CONFETTI_TONES.length], animationDelay: `${(i % 9) * 70}ms`, animationDuration: `${1500 + (i % 5) * 220}ms`, ['--r' as string]: `${(i % 2 ? 1 : -1) * (180 + (i % 7) * 60)}deg`, ['--dx' as string]: `${((i % 7) - 3) * 14}px` }} />
          ))}
        </span>
      ))}
    </div>
  );
}
