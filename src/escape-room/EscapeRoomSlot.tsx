import { useMemo, useRef, useState } from 'react';
import type { EscapeEvent, EscapeRoomSlotProps, Puzzle } from './types';

/** Picks the Academy-only look when `themed`; every other hub (Playground, Success) keeps its original classes. */
const themedCls = (themed: boolean, original: string, academy: string) => (themed ? academy : original);

/** Deterministic Escape Room runner. No AI at render time. */
export default function EscapeRoomSlot(props: EscapeRoomSlotProps) {
  const { room, onEvent, onComplete } = props;
  const themed = props.hub === 'academy';
  const [doorIdx, setDoorIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const events = useRef<EscapeEvent[]>([]);
  const startedAt = useRef(Date.now());
  const doorStartedAt = useRef(Date.now());

  const door = room.doors[doorIdx];

  const finalize = () => {
    setDone(true);
    onComplete?.({
      solved: events.current.filter((e) => e.solved).length,
      total: events.current.length,
      total_attempts: events.current.reduce((n, e) => n + e.attempts, 0),
      ms_elapsed: Date.now() - startedAt.current,
      events: events.current,
    });
  };

  const check = (correct: boolean) => {
    const next = attempts + 1;
    setAttempts(next);
    if (!correct) {
      setShowHint(true);
      return;
    }
    const evt: EscapeEvent = {
      door_id: door.id,
      kind: door.kind,
      solved: true,
      attempts: next,
      ms_elapsed: Date.now() - doorStartedAt.current,
    };
    events.current.push(evt);
    onEvent?.(evt);
    setFeedback(door.solve_feedback);
    setTimeout(() => {
      setFeedback(null);
      setShowHint(false);
      setAttempts(0);
      if (doorIdx + 1 >= room.doors.length) return finalize();
      doorStartedAt.current = Date.now();
      setDoorIdx((i) => i + 1);
    }, 1100);
  };

  if (done) {
    return (
      <div className={themedCls(themed, "rounded-2xl border bg-card p-8 text-center space-y-3", "rounded-2xl border-2 border-emerald-700 bg-white text-slate-900 p-8 text-center space-y-3 shadow-2xl")}>
        <div className="text-4xl">🗝️</div>
        <h3 className="text-xl font-semibold">You escaped!</h3>
        <p className={themedCls(themed, "text-sm text-muted-foreground", "text-sm text-slate-700")}>{room.final_reward.message}</p>
        <p className={themedCls(themed, "text-xs text-muted-foreground", "text-xs text-slate-600")}>
          {events.current.filter((e) => e.solved).length} / {events.current.length} doors solved
        </p>
      </div>
    );
  }

  return (
    <div className={themedCls(themed, "rounded-2xl border bg-card overflow-hidden", "rounded-2xl border-2 border-emerald-700 bg-white text-slate-900 overflow-hidden shadow-2xl")}>
      {door.image_url && (
        <div className={themedCls(themed, "aspect-video bg-muted", "h-[24vh] min-h-[130px] bg-emerald-950")}>
          <img src={door.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6 space-y-4">
        <div className={themedCls(themed, "flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground", "flex items-center justify-between text-xs font-bold uppercase tracking-wide text-emerald-800")}>
          <span>{door.door_label}</span>
          <span>Door {doorIdx + 1} / {room.doors.length}</span>
        </div>
        <p className="text-base leading-relaxed">{door.door_narration}</p>

        <PuzzleBody puzzle={door} onAttempt={check} themed={themed} />

        {showHint && !feedback && (
          <div className={themedCls(themed, "rounded-xl bg-muted p-3 text-sm", "rounded-xl border border-amber-300 bg-amber-100 p-3 text-sm text-slate-900")}>💡 {door.hint}</div>
        )}
        {feedback && (
          <div className={themedCls(themed, "rounded-xl bg-primary/10 p-3 text-sm", "rounded-xl border border-emerald-300 bg-emerald-100 p-3 text-sm text-emerald-900")}>✅ {feedback}</div>
        )}
      </div>
    </div>
  );
}

function PuzzleBody({ puzzle, onAttempt, themed }: { puzzle: Puzzle; onAttempt: (correct: boolean) => void; themed: boolean }) {
  const [pick, setPick] = useState<string>('');
  const [order, setOrder] = useState<string[]>([]);

  const shuffled = useMemo(() => {
    if (puzzle.kind === 'order') return [...puzzle.tokens].sort(() => 0.5 - Math.random());
    return null;
  }, [puzzle]);

  if (puzzle.kind === 'unscramble') {
    return (
      <div className="space-y-3">
        <div className={themedCls(themed, "text-2xl tracking-[0.3em] font-mono text-center", "text-2xl tracking-[0.3em] font-mono text-center text-slate-900")}>{puzzle.scrambled.toUpperCase()}</div>
        <input
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          className={themedCls(themed, "w-full rounded-lg border bg-background px-3 py-2", "w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-slate-900")}
          placeholder="Type the word"
        />
        <button
          onClick={() => onAttempt(pick.trim().toLowerCase() === puzzle.answer.toLowerCase())}
          className={themedCls(themed, "w-full rounded-xl bg-primary text-primary-foreground py-2 font-medium", "w-full rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 py-2 font-semibold")}
        >
          Unlock
        </button>
      </div>
    );
  }

  if (puzzle.kind === 'cloze' || puzzle.kind === 'odd_one_out' || puzzle.kind === 'riddle') {
    const options =
      puzzle.kind === 'cloze' ? puzzle.options :
      puzzle.kind === 'odd_one_out' ? puzzle.items :
      puzzle.options;
    const answer = puzzle.answer;
    return (
      <div className="space-y-3">
        {puzzle.kind === 'cloze' && <p className={themedCls(themed, "text-lg font-medium text-center", "text-lg font-semibold text-center text-slate-900")}>{puzzle.sentence}</p>}
        {puzzle.kind === 'riddle' && (
          <ul className={themedCls(themed, "space-y-1 text-sm text-muted-foreground", "space-y-1 text-sm text-slate-700")}>
            {puzzle.clues.map((c, i) => <li key={i}>• {c}</li>)}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onAttempt(o === answer)}
              className={themedCls(themed, "rounded-xl border bg-background hover:bg-accent px-4 py-3 text-sm", "rounded-xl border-2 border-slate-300 bg-white text-slate-900 hover:bg-emerald-50 hover:border-emerald-500 px-4 py-3 text-sm font-medium")}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // order
  return (
    <div className="space-y-3">
      <div className={themedCls(themed, "min-h-[3rem] rounded-lg border-2 border-dashed p-2 flex flex-wrap gap-2", "min-h-[3rem] rounded-lg border-2 border-dashed border-emerald-600 bg-emerald-50 p-2 flex flex-wrap gap-2")}>
        {order.map((t, i) => (
          <button key={`${t}-${i}`} onClick={() => setOrder(order.filter((_, j) => j !== i))}
                  className={themedCls(themed, "rounded bg-primary/20 px-2 py-1 text-sm", "rounded bg-emerald-200 text-slate-900 px-2 py-1 text-sm font-medium")}>{t}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(shuffled ?? []).filter((t) => !order.includes(t)).map((t) => (
          <button key={t} onClick={() => setOrder([...order, t])}
                  className={themedCls(themed, "rounded border bg-background px-2 py-1 text-sm", "rounded border-2 border-slate-300 bg-white text-slate-900 px-2 py-1 text-sm font-medium")}>{t}</button>
        ))}
      </div>
      <button
        onClick={() => onAttempt(order.join(' ') === (puzzle as { answer: string[] }).answer.join(' '))}
        className={themedCls(themed, "w-full rounded-xl bg-primary text-primary-foreground py-2 font-medium", "w-full rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 py-2 font-semibold")}
      >
        Unlock
      </button>
    </div>
  );
}
