import { useEffect, useMemo, useState, type ReactNode } from "react";
import confetti from "canvas-confetti";
import { Puzzle, Footprints, RefreshCw, CheckCircle2, Hand } from "lucide-react";
import { TeacherNotes } from "@/components/lesson/TeacherNotes";

/**
 * ============================================================================
 *  BRAIN BREAK PHASE (reusable, topic-aware)
 * ============================================================================
 *  A short, low-pressure "filler" phase for the end of a lesson. The phase
 *  takes a list of `games` so each unit can offer mini-games that match its
 *  topic (Pets → Picture Puzzle + Pet Maze, Ocean → Fish-catch + Sea Puzzle,
 *  Family → Family Tree builder, Fruits → Pick from the garden, etc.).
 *
 *  Three reusable game primitives ship in this file:
 *    🧩 PicturePuzzle  — 3×3 scrambled hero image. Tap 2 tiles to swap.
 *    🐾 GridMaze       — small grid maze. Tap an adjacent cell to walk.
 *    👋 TapToCatch     — emojis bounce around; tap N to "catch" them.
 *
 *  Each lesson picks 2–3 of them with topic-specific config (emojis, image,
 *  labels). New topic games can be added as standalone components and
 *  plugged into a lesson's `games` array — no change to BrainBreakPhase.
 *
 *  Any game that fires `onSolved` once will unlock the phase so the lesson
 *  can advance to Cool Down. Students may keep playing after that.
 * ============================================================================
 */

export type BrainBreakGame = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Render the game. Call `onSolved` the first time it is finished. */
  render: (props: { onSolved: () => void }) => ReactNode;
};

export function BrainBreakPhase({
  games,
  // Back-compat: if no games array is given, fall back to the original
  // Puzzle + Maze tabs using these props.
  heroImage,
  heroLabel,
  onComplete,
}: {
  games?: BrainBreakGame[];
  heroImage?: string;
  heroLabel?: string;
  onComplete: () => void;
}) {
  const fallback: BrainBreakGame[] = [
    {
      id: "puzzle",
      label: "Picture Puzzle",
      icon: <Puzzle className="h-4 w-4" />,
      render: ({ onSolved }) => (
        <PicturePuzzle image={heroImage ?? ""} label={heroLabel ?? "picture"} onSolved={onSolved} />
      ),
    },
    {
      id: "maze",
      label: "Animal Maze",
      icon: <Footprints className="h-4 w-4" />,
      render: ({ onSolved }) => <GridMaze emoji="🐾" goal="🍖" onSolved={onSolved} />,
    },
  ];

  const list = games && games.length > 0 ? games : fallback;
  const [active, setActive] = useState<string>(list[0].id);
  const [done, setDone] = useState(false);

  const finishOnce = () => {
    if (!done) {
      setDone(true);
      onComplete();
    }
  };

  const current = list.find((g) => g.id === active) ?? list[0];

  return (
    <div className="space-y-5">
      <TeacherNotes>
        Brain break! Pick a quick game while the student rests their voice.
        The games match today's topic — they're optional, perfect for the
        last 5 minutes of class or as a reward.
      </TeacherNotes>

      <div className="flex flex-wrap justify-center gap-2">
        {list.map((g) => (
          <TabBtn key={g.id} active={active === g.id} onClick={() => setActive(g.id)}>
            {g.icon} {g.label}
          </TabBtn>
        ))}
      </div>

      {current.render({ onSolved: finishOnce })}

      {done && (
        <p className="flex items-center justify-center gap-2 text-base font-extrabold text-emerald-600">
          <CheckCircle2 className="h-5 w-5" /> Brain break unlocked! Keep playing or tap Next.
        </p>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition ${
        active
          ? "shadow-playground text-white"
          : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
      }`}
      style={active ? { background: "var(--playground-primary)" } : undefined}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Game 1 · Picture Puzzle (3×3 swap-to-solve)                                */
/* -------------------------------------------------------------------------- */

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // make sure it isn't already solved
  if (a.every((v, i) => v === arr[i])) return shuffled(arr);
  return a;
}

export function PicturePuzzle({
  image,
  label,
  onSolved,
}: {
  image: string;
  label: string;
  onSolved: () => void;
}) {
  const solved = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);
  const [order, setOrder] = useState<number[]>(() => shuffled(solved));
  const [selected, setSelected] = useState<number | null>(null);
  const isSolved = order.every((v, i) => v === i);

  useEffect(() => {
    if (isSolved) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      onSolved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolved]);

  const tap = (i: number) => {
    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    setOrder((arr) => {
      const n = [...arr];
      [n[selected], n[i]] = [n[i], n[selected]];
      return n;
    });
    setSelected(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/70">
        Tap two tiles to swap them. Build the picture of the {label}.
      </p>
      <div
        className="glass-card mx-auto grid aspect-square w-full max-w-sm grid-cols-3 grid-rows-3 gap-1 overflow-hidden rounded-3xl p-1"
      >
        {order.map((piece, i) => {
          const row = Math.floor(piece / 3);
          const col = piece % 3;
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              aria-label={`Tile ${i + 1}`}
              className={`relative overflow-hidden rounded-xl transition ${
                selected === i
                  ? "ring-4 ring-[color:var(--playground-primary)]"
                  : "hover:scale-[1.02]"
              } ${isSolved ? "ring-2 ring-emerald-400" : ""}`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "300% 300%",
                backgroundPosition: `${col * 50}% ${row * 50}%`,
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => {
            setOrder(shuffled(solved));
            setSelected(null);
          }}
          className="glass-card inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold"
        >
          <RefreshCw className="h-4 w-4" /> Shuffle again
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Game 2 · Animal Maze (tap adjacent cells to reach the goal)                */
/* -------------------------------------------------------------------------- */

// 6×6 hand-crafted maze. "." = path, "#" = wall, "S" = start, "G" = goal.
const MAZE: string[][] = [
  ["S", ".", "#", ".", ".", "."],
  ["#", ".", "#", ".", "#", "."],
  [".", ".", ".", ".", "#", "."],
  [".", "#", "#", ".", ".", "."],
  [".", "#", ".", ".", "#", "#"],
  [".", ".", ".", "#", ".", "G"],
];

export function GridMaze({
  emoji,
  goal,
  onSolved,
}: {
  emoji: string;
  goal: string;
  onSolved: () => void;
}) {
  const start: [number, number] = [0, 0];
  const goalPos: [number, number] = [5, 5];
  const [pos, setPos] = useState<[number, number]>(start);
  const [steps, setSteps] = useState(0);
  const won = pos[0] === goalPos[0] && pos[1] === goalPos[1];

  useEffect(() => {
    if (won) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      onSolved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const tap = (r: number, c: number) => {
    if (won) return;
    const cell = MAZE[r][c];
    if (cell === "#") return;
    const [pr, pc] = pos;
    const isAdj = Math.abs(pr - r) + Math.abs(pc - c) === 1;
    if (!isAdj) return;
    setPos([r, c]);
    setSteps((n) => n + 1);
  };

  const reset = () => {
    setPos(start);
    setSteps(0);
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/70">
        Tap a neighbour cell to move {emoji} to the {goal}. Avoid the walls!
      </p>
      <div className="glass-card mx-auto w-full max-w-sm rounded-3xl p-3">
        <div className="grid grid-cols-6 gap-1">
          {MAZE.map((row, r) =>
            row.map((cell, c) => {
              const here = pos[0] === r && pos[1] === c;
              const isStart = r === start[0] && c === start[1];
              const isGoal = r === goalPos[0] && c === goalPos[1];
              const isWall = cell === "#";
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => tap(r, c)}
                  disabled={isWall}
                  aria-label={isWall ? "Wall" : `Cell ${r},${c}`}
                  className={`flex aspect-square items-center justify-center rounded-lg text-xl font-extrabold transition ${
                    isWall
                      ? "bg-[color:var(--playground-ink)]/80"
                      : here
                        ? "bg-[color:var(--playground-primary)] text-white"
                        : isGoal
                          ? "bg-amber-200"
                          : isStart
                            ? "bg-emerald-100"
                            : "bg-white/70 hover:scale-105"
                  }`}
                >
                  {here ? emoji : isGoal ? goal : ""}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <span className="text-sm font-bold text-[color:var(--playground-ink)]/70">
          Steps: {steps}
        </span>
        <button
          onClick={reset}
          className="glass-card inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold"
        >
          <RefreshCw className="h-4 w-4" /> Start over
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Game 3 · Tap-to-Catch (topic-aware bouncing targets)                       */
/* -------------------------------------------------------------------------- */
/**
 * Generic catch-the-topic game. Configure with:
 *   - emojis      : array of emoji targets (e.g. ["🐟","🐠"], ["🦋"], ["🍎","🥕"])
 *   - target      : how many to catch before the game completes
 *   - background  : a Tailwind color/class for the playfield tint
 *   - cta         : verb that fits the topic ("Catch", "Pick", "Find")
 *   - hint        : optional one-liner under the title
 *
 * Examples:
 *   Ocean       → emojis: ["🐟","🐠"], cta: "Catch the fish!"
 *   Jungle      → emojis: ["🦋","🐛"], cta: "Catch the butterflies!"
 *   Pets        → emojis: ["🦴","🐾"], cta: "Find the bones!"
 *   Fruit/Veg   → emojis: ["🍎","🥕","🍓","🥦"], cta: "Pick from the garden!"
 *   Family      → emojis: ["💝","🌷"], cta: "Collect gifts for the family!"
 */
export type TapToCatchConfig = {
  emojis: string[];
  target: number;
  cta: string;
  hint?: string;
  background?: string;
};

export function TapToCatch({
  config,
  onSolved,
}: {
  config: TapToCatchConfig;
  onSolved: () => void;
}) {
  const [score, setScore] = useState(0);
  const [tick, setTick] = useState(0);

  // make N targets with random positions; re-rolled when `tick` changes
  const targets = useMemo(() => {
    const N = Math.max(5, config.target + 3);
    return Array.from({ length: N }, (_, i) => ({
      id: `${tick}-${i}`,
      emoji: config.emojis[i % config.emojis.length],
      x: Math.random() * 80 + 5, // 5–85 %
      y: Math.random() * 70 + 5,
    }));
  }, [tick, config.emojis, config.target]);

  const [caught, setCaught] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (score >= config.target) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      onSolved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const tap = (id: string) => {
    if (caught.has(id)) return;
    setCaught((s) => new Set(s).add(id));
    setScore((n) => n + 1);
  };

  const reset = () => {
    setScore(0);
    setCaught(new Set());
    setTick((t) => t + 1);
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/70">
        {config.cta} {config.hint && <span className="opacity-70">· {config.hint}</span>}
      </p>
      <div
        className={`relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl ${
          config.background ?? "bg-sky-100/70"
        } glass-card`}
      >
        {targets.map((t) => {
          const isCaught = caught.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => tap(t.id)}
              aria-label={t.emoji}
              className={`absolute -translate-x-1/2 -translate-y-1/2 text-4xl transition ${
                isCaught ? "scale-0 opacity-0" : "hover:scale-125"
              }`}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
            >
              {t.emoji}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3 text-sm font-bold text-[color:var(--playground-ink)]/70">
        <span>
          Score: {score} / {config.target}
        </span>
        <button
          onClick={reset}
          className="glass-card inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-bold"
        >
          <RefreshCw className="h-4 w-4" /> Play again
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Game 4 · Family Tree builder (drag/tap labels onto a tree)                 */
/* -------------------------------------------------------------------------- */
/**
 * Reserved for the future **Family** unit. Built here so the unit can drop
 * it straight into BrainBreakPhase. Renders a 3-tier tree (grandparents →
 * parents → me) with empty slots; tap a label, tap a slot, label snaps in.
 *
 * Pass a list of family-member labels in the order the student should
 * place them. Default fits a standard nuclear family.
 */
export function FamilyTreeBuilder({
  labels = ["grandma", "grandpa", "mum", "dad", "me", "sister"],
  onSolved,
}: {
  labels?: string[];
  onSolved: () => void;
}) {
  const [slots, setSlots] = useState<(string | null)[]>(() => labels.map(() => null));
  const [pool, setPool] = useState<string[]>(() => [...labels].sort(() => Math.random() - 0.5));
  const [picked, setPicked] = useState<string | null>(null);

  const done = slots.every((s, i) => s === labels[i]);

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      onSolved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const placeInSlot = (i: number) => {
    if (!picked) return;
    setSlots((arr) => {
      const n = [...arr];
      // return previous occupant to the pool
      if (n[i]) setPool((p) => [...p, n[i] as string]);
      n[i] = picked;
      return n;
    });
    setPool((p) => p.filter((w) => w !== picked));
    setPicked(null);
  };

  const reset = () => {
    setSlots(labels.map(() => null));
    setPool([...labels].sort(() => Math.random() - 0.5));
    setPicked(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/70">
        Build your family tree! Tap a label, then tap the matching spot on the tree.
      </p>
      <div className="glass-card mx-auto max-w-lg space-y-3 rounded-3xl p-4">
        {[0, 2, 4].map((rowStart) => (
          <div key={rowStart} className="flex justify-center gap-3">
            {slots.slice(rowStart, rowStart + 2).map((s, j) => {
              const i = rowStart + j;
              const correct = s === labels[i];
              return (
                <button
                  key={i}
                  onClick={() => placeInSlot(i)}
                  className={`flex h-16 min-w-[7rem] items-center justify-center rounded-2xl border-2 border-dashed px-3 text-base font-extrabold transition ${
                    s
                      ? correct
                        ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                        : "border-red-300 bg-red-100 text-red-900"
                      : "border-[color:var(--playground-primary)]/50 bg-white/70 text-[color:var(--playground-ink)]/40"
                  }`}
                >
                  {s ?? "…"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {pool.map((w) => (
          <button
            key={w}
            onClick={() => setPicked(w)}
            className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
              picked === w
                ? "shadow-playground text-white"
                : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
            }`}
            style={picked === w ? { background: "var(--playground-primary)" } : undefined}
          >
            <Hand className="mr-1 inline h-3.5 w-3.5" /> {w}
          </button>
        ))}
        <button
          onClick={reset}
          className="glass-card inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold"
        >
          <RefreshCw className="h-4 w-4" /> Reset
        </button>
      </div>
    </div>
  );
}
