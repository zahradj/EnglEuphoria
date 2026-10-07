import type { KidsOption, SceneSpec, ScenePrep } from './kidsBank';

/**
 * Small pictures drawn in code, so the placement test needs no generated artwork: "where is it" scenes (on / under /
 * in / behind / in front of / beside), counting cards, size pictures, tick and cross, and picture pairs.
 */

type Box = { x: number; y: number; size: number };

const TABLE_X = 60;
const TABLE_W = 130;

function tableSlot(prep: ScenePrep, size: number): Box {
  switch (prep) {
    case 'on': return { x: TABLE_X + TABLE_W / 2 - size / 2, y: 82 - size, size };
    case 'under': return { x: TABLE_X + TABLE_W / 2 - size / 2, y: 144 - size, size };
    default: return { x: 6, y: 144 - size, size }; // beside (left of the table)
  }
}

export function SceneArt({ scene, className }: { scene: SceneSpec; className?: string }) {
  const { ref, prep, subject, extra } = scene;

  if (ref === 'table') {
    const main = tableSlot(prep, prep === 'under' ? 46 : 54);
    const second = extra ? tableSlot(extra.prep, extra.prep === 'under' ? 40 : 44) : null;
    // "two on the table": put the second picture beside the first, not on top of it
    if (second && extra && extra.prep === prep) second.x = main.x + (main.x > TABLE_X + 40 ? -second.size - 2 : main.size + 2);
    return (
      <svg viewBox="0 0 200 160" className={className} role="img" aria-hidden>
        <rect x="0" y="146" width="200" height="14" fill="#f7e7c1" />
        {/* things under the table are drawn first so the legs stay in front */}
        {prep === 'under' && <image href={subject} {...pos(main)} />}
        {extra?.prep === 'under' && second && <image href={extra.src} {...pos(second)} />}
        <rect x={TABLE_X + 7} y="92" width="8" height="54" rx="2" fill="#a0642d" />
        <rect x={TABLE_X + TABLE_W - 15} y="92" width="8" height="54" rx="2" fill="#a0642d" />
        <rect x={TABLE_X} y="82" width={TABLE_W} height="12" rx="4" fill="#c98a45" stroke="#8a5424" strokeWidth="1.5" />
        {prep !== 'under' && <image href={subject} {...pos(main)} />}
        {extra && extra.prep !== 'under' && second && <image href={extra.src} {...pos(second)} />}
      </svg>
    );
  }

  // box. Each preposition must read at a glance, so the picture is set up differently for each one:
  //  in:     open top, the thing sits INSIDE (lower part hidden by the front of the box)
  //  on:     sitting on the top
  //  behind: the box is moved left and the thing stands partly hidden behind its right side
  //  front:  the thing stands nearer to us than the box, below its base line
  const boxBody = (dx = 0) => (
    <g transform={`translate(${dx} 0)`}>
      <rect x="70" y="88" width="80" height="56" rx="4" fill="#d9a35b" stroke="#8a5424" strokeWidth="2" />
      <rect x="70" y="88" width="80" height="9" rx="3" fill="#c28a40" stroke="#8a5424" strokeWidth="1.5" />
      <rect x="100" y="97" width="20" height="10" rx="2" fill="#f1d9a8" />
    </g>
  );
  return (
    <svg viewBox="0 0 200 160" className={className} role="img" aria-hidden>
      <rect x="0" y="146" width="200" height="14" fill="#f7e7c1" />
      {prep === 'in' && (
        <>
          <ellipse cx="110" cy="88" rx="40" ry="9" fill="#5b3a17" />
          <image href={subject} x="84" y="56" width="52" height="52" />
          {boxBody()}
        </>
      )}
      {prep === 'behind' && (
        <>
          <image href={subject} x="104" y="76" width="66" height="66" />
          {boxBody(-24)}
        </>
      )}
      {prep === 'on' && (
        <>
          {boxBody()}
          <image href={subject} x="84" y="36" width="52" height="52" />
        </>
      )}
      {prep === 'front' && (
        <>
          {boxBody(-8)}
          <image href={subject} x="106" y="96" width="56" height="56" />
        </>
      )}
      {(prep === 'beside' || prep === 'under') && (
        <>
          {boxBody()}
          <image href={subject} x="8" y="94" width="52" height="52" />
        </>
      )}
    </svg>
  );
}

const pos = (b: Box) => ({ x: b.x, y: b.y, width: b.size, height: b.size });

export function CountArt({ src, n, className }: { src: string; n: number; className?: string }) {
  const size = n <= 2 ? 'w-[42%]' : n <= 4 ? 'w-[34%]' : 'w-[28%]';
  return (
    <div className={`flex flex-wrap items-center justify-center gap-1 ${className ?? ''}`} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <img key={i} src={src} alt="" className={`${size} object-contain`} draggable={false} />
      ))}
    </div>
  );
}

export function MarkArt({ ok, className }: { ok: boolean; className?: string }) {
  return ok ? (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="tick">
      <circle cx="50" cy="50" r="42" fill="#dcfce7" stroke="#22c55e" strokeWidth="5" />
      <path d="M28 52 L44 68 L74 34" fill="none" stroke="#16a34a" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="cross">
      <circle cx="50" cy="50" r="42" fill="#fee2e2" stroke="#ef4444" strokeWidth="5" />
      <path d="M32 32 L68 68 M68 32 L32 68" fill="none" stroke="#dc2626" strokeWidth="11" strokeLinecap="round" />
    </svg>
  );
}

/** The inside of one answer card. */
export function OptionArt({ option }: { option: KidsOption }) {
  switch (option.kind) {
    case 'img':
      return (
        <div className="absolute inset-0 flex items-end justify-center p-3">
          <img
            src={option.src}
            alt=""
            draggable={false}
            className="max-h-full max-w-full object-contain select-none"
            style={{ width: `${(option.scale ?? 1) * 100}%`, height: `${(option.scale ?? 1) * 100}%`, objectPosition: 'bottom' }}
          />
        </div>
      );
    case 'letter':
      return <span className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold text-slate-800 select-none" style={{ fontFamily: "'Fredoka', 'Comic Sans MS', system-ui, sans-serif" }}>{option.text}</span>;
    case 'count':
      return <CountArt src={option.src} n={option.n} className="absolute inset-0 p-3" />;
    case 'scene':
      return <SceneArt scene={option.scene} className="absolute inset-0 h-full w-full" />;
    case 'mark':
      return <MarkArt ok={option.ok} className="absolute inset-0 m-auto h-[70%] w-[70%]" />;
    case 'pair':
      return (
        <div className="absolute inset-0 flex items-center justify-center gap-1 p-2">
          <img src={option.srcs[0]} alt="" className="h-[55%] w-[42%] object-contain" draggable={false} />
          {option.ordered ? (
            <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-slate-400" aria-hidden><path d="M3 10h12m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-slate-400" aria-hidden><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
          )}
          <img src={option.srcs[1]} alt="" className="h-[55%] w-[42%] object-contain" draggable={false} />
        </div>
      );
  }
}
