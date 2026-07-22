/**
 * AlphabetArcadePhase — end-of-lesson bonus mini-game module.
 *
 * Pedagogy (Playground Pre-A1 → A1, Cambridge phonics stage):
 *   - Reinforces letter recognition, phoneme awareness, and letter ordering
 *     using the CURRENT lesson's vocabulary as the letter source (no
 *     generic filler).
 *   - Rotates 3 game formats so children never repeat the same task twice:
 *       1. Letter Blocks   — tap scrambled letter tiles in order to spell a
 *                            target word from the lesson.
 *       2. Listen & Pick   — Web Speech API says a letter/phoneme; child
 *                            taps the matching tile from 4 choices.
 *       3. Sound Hunt      — grid of letters; child taps every tile whose
 *                            sound matches the target phoneme.
 *   - Bravery > correctness: wrong taps shake gently, correct taps burst
 *     into confetti-style motion. No score punishment.
 *
 * Contract:
 *   - Bound to lesson.vocab (first letters) and lesson.phonics_focus when
 *     present. Falls back to a curated safe alphabet subset when a lesson
 *     has no vocab, so it always renders.
 *   - Deterministic content selection (no Math.random for pedagogy) —
 *     seeded by lesson_number so the same lesson always shows the same
 *     rounds.
 *   - Zero external network dependencies. Uses `window.speechSynthesis`
 *     when available; silently degrades on unsupported browsers.
 */
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────
interface AlphabetArcadePhaseProps {
  lessonNumber: number;
  vocab: string[];
  phonicsFocus?: string;
  onComplete: () => void;
}

type GameKind =
  | "letter_blocks"
  | "listen_and_pick"
  | "sound_hunt"
  | "missing_letter"
  | "case_pairs"
  | "rhyme_match"
  | "beginning_sound"
  | "blend_builder"
  | "syllable_clap";

// Which archetypes are best matched by the lesson's phonics focus.
// Digraphs/blends (2 letters like "sh", "ch", "bl") → BlendBuilder.
// Single letters or vowel patterns → BeginningSound.
// Every focus benefits from SyllableClap for rhythm awareness.
function selectPhonicsGames(focus: string | undefined): GameKind[] {
  const f = (focus ?? "").trim().toLowerCase();
  const isDigraph = /^[a-z]{2,3}$/.test(f);
  const isSingleLetter = /^[a-z]$/.test(f);
  const set: GameKind[] = ["syllable_clap"];
  if (isDigraph) set.unshift("blend_builder");
  if (isSingleLetter || !f) set.unshift("beginning_sound");
  return set;
}

// ─── Deterministic helpers ────────────────────────────────────────────────
const FALLBACK_WORDS = ["cat", "dog", "sun", "hat", "bus"];

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.pitch = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch {
    /* noop */
  }
}

// ─── Root component ───────────────────────────────────────────────────────
export function AlphabetArcadePhase({
  lessonNumber,
  vocab,
  phonicsFocus,
  onComplete,
}: AlphabetArcadePhaseProps) {
  const words = useMemo(() => {
    const clean = (vocab ?? [])
      .filter((w) => typeof w === "string" && /^[a-zA-Z]{2,6}$/.test(w))
      .map((w) => w.toLowerCase());
    return clean.length >= 2 ? clean.slice(0, 4) : FALLBACK_WORDS;
  }, [vocab]);

  const [round, setRound] = useState(0);
  // Deterministic 3-game session per lesson:
  //   1. one phonics-focus-driven game (picked from focus)
  //   2. two general-alphabet games from the rotating pool
  const games: GameKind[] = useMemo(() => {
    const phonicsPool = selectPhonicsGames(phonicsFocus);
    const phonicsPick = phonicsPool[lessonNumber % phonicsPool.length];
    const pool: GameKind[] = [
      "letter_blocks",
      "listen_and_pick",
      "sound_hunt",
      "missing_letter",
      "case_pairs",
      "rhyme_match",
    ];
    const rest = seededShuffle(pool, lessonNumber * 13 + 7).slice(0, 2);
    return [phonicsPick, ...rest];
  }, [lessonNumber, phonicsFocus]);
  const current = games[round % games.length];

  const advance = useCallback(() => {
    if (round + 1 >= games.length) onComplete();
    else setRound((r) => r + 1);
  }, [round, games.length, onComplete]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[720px] flex-col items-center justify-between gap-4 p-4">
      {/* Header ribbon */}
      <div className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Sparkles className="h-4 w-4" />
          Alphabet Arcade
        </div>
        <div className="flex gap-1.5">
          {games.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-6 rounded-full transition ${
                i <= round ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Active game */}
      <div className="flex flex-1 w-full items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current + round}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {current === "letter_blocks" && (
              <LetterBlocks
                word={words[round % words.length]}
                seed={lessonNumber * 31 + round}
                onWin={advance}
              />
            )}
            {current === "listen_and_pick" && (
              <ListenAndPick words={words} seed={lessonNumber + round} onWin={advance} />
            )}
            {current === "sound_hunt" && (
              <SoundHunt
                targetLetter={
                  (phonicsFocus?.trim()?.[0] || words[0][0]).toLowerCase()
                }
                seed={lessonNumber * 7 + round}
                onWin={advance}
              />
            )}
            {current === "missing_letter" && (
              <MissingLetter
                word={words[round % words.length]}
                seed={lessonNumber * 17 + round}
                onWin={advance}
              />
            )}
            {current === "case_pairs" && (
              <CasePairs seed={lessonNumber * 23 + round} words={words} onWin={advance} />
            )}
            {current === "rhyme_match" && (
              <RhymeMatch seed={lessonNumber * 29 + round} words={words} onWin={advance} />
            )}
            {current === "beginning_sound" && (
              <BeginningSound
                words={words}
                focus={phonicsFocus}
                seed={lessonNumber * 37 + round}
                onWin={advance}
              />
            )}
            {current === "blend_builder" && (
              <BlendBuilder
                blend={(phonicsFocus ?? "sh").toLowerCase()}
                words={words}
                seed={lessonNumber * 41 + round}
                onWin={advance}
              />
            )}
            {current === "syllable_clap" && (
              <SyllableClap
                word={words[round % words.length]}
                seed={lessonNumber * 43 + round}
                onWin={advance}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Bonus round — great job practicing your letters!
      </p>
    </div>
  );
}

// ─── Game 1: Letter Blocks ────────────────────────────────────────────────
function LetterBlocks({
  word,
  seed,
  onWin,
}: {
  word: string;
  seed: number;
  onWin: () => void;
}) {
  const letters = useMemo(() => word.split(""), [word]);
  const scrambled = useMemo(() => seededShuffle(letters, seed), [letters, seed]);
  const [picked, setPicked] = useState<number[]>([]);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  const pick = (i: number) => {
    if (picked.includes(i)) return;
    const nextExpected = letters[picked.length];
    if (scrambled[i] === nextExpected) {
      const next = [...picked, i];
      setPicked(next);
      speak(scrambled[i]);
      if (next.length === letters.length) {
        speak(word);
        setTimeout(onWin, 900);
      }
    } else {
      setWrongIdx(i);
      setTimeout(() => setWrongIdx(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-center text-lg font-bold text-foreground">
        Tap the letters in order to spell:
      </h2>
      <div className="flex gap-2">
        {letters.map((l, i) => (
          <motion.div
            key={`slot-${i}`}
            animate={
              picked.length > i ? { scale: [1.2, 1] } : { scale: 1 }
            }
            className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-black uppercase ${
              picked.length > i
                ? "border-primary bg-primary/10 text-primary"
                : "border-dashed border-muted-foreground/30 text-muted-foreground/40"
            }`}
          >
            {picked.length > i ? l : "?"}
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {scrambled.map((l, i) => (
          <motion.button
            key={`tile-${i}`}
            onClick={() => pick(i)}
            disabled={picked.includes(i)}
            whileTap={{ scale: 0.9 }}
            animate={wrongIdx === i ? { x: [-6, 6, -4, 4, 0] } : {}}
            className={`h-16 w-16 rounded-2xl text-3xl font-black uppercase shadow-md transition ${
              picked.includes(i)
                ? "bg-muted text-muted-foreground/40 opacity-40"
                : "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground hover:shadow-lg"
            }`}
          >
            {l}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Game 2: Listen & Pick ────────────────────────────────────────────────
function ListenAndPick({
  words,
  seed,
  onWin,
}: {
  words: string[];
  seed: number;
  onWin: () => void;
}) {
  // Build 4 unique starting letters from vocab.
  const options = useMemo(() => {
    const set = new Set<string>();
    for (const w of words) set.add(w[0].toLowerCase());
    const fill = "abcdefghijklmnopqrstuvwxyz".split("");
    for (const l of seededShuffle(fill, seed)) {
      if (set.size >= 4) break;
      set.add(l);
    }
    return seededShuffle([...set], seed).slice(0, 4);
  }, [words, seed]);
  const target = options[seed % options.length];
  const [status, setStatus] = useState<null | "right" | "wrong">(null);

  useEffect(() => {
    const t = setTimeout(() => speak(target.toUpperCase()), 350);
    return () => clearTimeout(t);
  }, [target]);

  const pick = (l: string) => {
    if (l === target) {
      setStatus("right");
      speak(l);
      setTimeout(onWin, 800);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-center text-lg font-bold text-foreground">
        Listen and tap the letter you hear
      </h2>
      <Button
        size="lg"
        variant="secondary"
        onClick={() => speak(target.toUpperCase())}
        className="gap-2 rounded-full"
      >
        <Volume2 className="h-5 w-5" />
        Play again
      </Button>
      <div className="grid grid-cols-2 gap-4">
        {options.map((l) => (
          <motion.button
            key={l}
            onClick={() => pick(l)}
            whileTap={{ scale: 0.92 }}
            animate={
              status === "right" && l === target
                ? { scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }
                : status === "wrong"
                  ? { x: [-4, 4, -3, 3, 0] }
                  : {}
            }
            className="h-24 w-24 rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-5xl font-black uppercase text-accent-foreground shadow-lg"
          >
            {l}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Game 3: Sound Hunt ───────────────────────────────────────────────────
function SoundHunt({
  targetLetter,
  seed,
  onWin,
}: {
  targetLetter: string;
  seed: number;
  onWin: () => void;
}) {
  // 12-tile grid: 4 targets + 8 distractors, deterministically placed.
  const tiles = useMemo(() => {
    const distractors = "abcdefghijklmnopqrstuvwxyz"
      .split("")
      .filter((c) => c !== targetLetter);
    const chosen = [
      targetLetter,
      targetLetter,
      targetLetter,
      targetLetter,
      ...seededShuffle(distractors, seed).slice(0, 8),
    ];
    return seededShuffle(chosen, seed + 5).map((l, i) => ({ id: i, letter: l }));
  }, [targetLetter, seed]);

  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const targetCount = tiles.filter((t) => t.letter === targetLetter).length;

  useEffect(() => {
    if (found.length === targetCount) {
      speak(`Great! ${targetLetter.toUpperCase()}`);
      const t = setTimeout(onWin, 900);
      return () => clearTimeout(t);
    }
  }, [found, targetCount, onWin, targetLetter]);

  const tap = (id: number, letter: string) => {
    if (found.includes(id)) return;
    if (letter === targetLetter) {
      setFound((f) => [...f, id]);
      speak(letter);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <h2 className="text-center text-lg font-bold text-foreground">
        Tap every{" "}
        <span className="inline-block rounded-lg bg-primary px-3 py-1 text-primary-foreground">
          {targetLetter.toUpperCase()}
        </span>{" "}
        you can find
      </h2>
      <p className="text-sm text-muted-foreground">
        Found {found.length} / {targetCount}
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {tiles.map((t) => {
          const isFound = found.includes(t.id);
          return (
            <motion.button
              key={t.id}
              onClick={() => tap(t.id, t.letter)}
              disabled={isFound}
              whileTap={{ scale: 0.9 }}
              animate={
                isFound
                  ? { scale: [1, 1.25, 1], backgroundColor: undefined }
                  : wrong === t.id
                    ? { x: [-4, 4, -3, 3, 0] }
                    : {}
              }
              className={`h-16 w-16 rounded-xl text-2xl font-black uppercase shadow-md transition ${
                isFound
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {t.letter}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game 4: Missing Letter ───────────────────────────────────────────────
function MissingLetter({
  word,
  seed,
  onWin,
}: {
  word: string;
  seed: number;
  onWin: () => void;
}) {
  const missingIdx = useMemo(() => seed % word.length, [word, seed]);
  const answer = word[missingIdx];
  const options = useMemo(() => {
    const set = new Set<string>([answer]);
    const fill = "abcdefghijklmnopqrstuvwxyz".split("").filter((c) => c !== answer);
    for (const l of seededShuffle(fill, seed)) {
      if (set.size >= 4) break;
      set.add(l);
    }
    return seededShuffle([...set], seed + 3);
  }, [answer, seed]);
  const [status, setStatus] = useState<null | "right" | "wrong">(null);

  useEffect(() => {
    const t = setTimeout(() => speak(word), 300);
    return () => clearTimeout(t);
  }, [word]);

  const pick = (l: string) => {
    if (l === answer) {
      setStatus("right");
      speak(word);
      setTimeout(onWin, 800);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-center text-lg font-bold text-foreground">
        Which letter is missing?
      </h2>
      <div className="flex gap-2">
        {word.split("").map((l, i) => (
          <div
            key={i}
            className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-black uppercase ${
              i === missingIdx
                ? status === "right"
                  ? "border-2 border-primary bg-primary/20 text-primary"
                  : "border-2 border-dashed border-primary/60 text-primary/40"
                : "bg-muted text-foreground"
            }`}
          >
            {i === missingIdx && status !== "right" ? "?" : l}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((l) => (
          <motion.button
            key={l}
            onClick={() => pick(l)}
            whileTap={{ scale: 0.92 }}
            animate={
              status === "wrong" ? { x: [-4, 4, -3, 3, 0] } : {}
            }
            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-4xl font-black uppercase text-primary-foreground shadow-lg"
          >
            {l}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Game 5: Case Pairs (uppercase ↔ lowercase memory match) ─────────────
function CasePairs({
  seed,
  words,
  onWin,
}: {
  seed: number;
  words: string[];
  onWin: () => void;
}) {
  const letters = useMemo(() => {
    const set = new Set<string>();
    for (const w of words) set.add(w[0].toLowerCase());
    const fill = "abcdefghijklmnopqrstuvwxyz".split("");
    for (const l of seededShuffle(fill, seed)) {
      if (set.size >= 4) break;
      set.add(l);
    }
    return [...set].slice(0, 4);
  }, [words, seed]);

  const tiles = useMemo(
    () =>
      seededShuffle(
        letters.flatMap((l, i) => [
          { id: `u${i}`, label: l.toUpperCase(), key: l },
          { id: `l${i}`, label: l, key: l },
        ]),
        seed + 11,
      ),
    [letters, seed],
  );

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  const tap = (id: string, key: string) => {
    if (flipped.includes(id) || matched.includes(key)) return;
    const next = [...flipped, id];
    if (next.length === 2) {
      const [aId, bId] = next;
      const a = tiles.find((t) => t.id === aId)!;
      const b = tiles.find((t) => t.id === bId)!;
      speak(key);
      if (a.key === b.key && a.id !== b.id) {
        setTimeout(() => {
          setMatched((m) => {
            const nm = [...m, a.key];
            if (nm.length === letters.length) setTimeout(onWin, 600);
            return nm;
          });
          setFlipped([]);
        }, 400);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    } else {
      setFlipped(next);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <h2 className="text-center text-lg font-bold text-foreground">
        Match the big and small letters
      </h2>
      <div className="grid grid-cols-4 gap-2.5">
        {tiles.map((t) => {
          const revealed = flipped.includes(t.id) || matched.includes(t.key);
          return (
            <motion.button
              key={t.id}
              onClick={() => tap(t.id, t.key)}
              whileTap={{ scale: 0.9 }}
              animate={matched.includes(t.key) ? { scale: [1, 1.15, 1] } : {}}
              className={`h-16 w-16 rounded-xl text-2xl font-black shadow-md transition ${
                matched.includes(t.key)
                  ? "bg-primary text-primary-foreground"
                  : revealed
                    ? "bg-accent text-accent-foreground"
                    : "bg-gradient-to-br from-primary/80 to-primary/50 text-primary-foreground"
              }`}
            >
              {revealed ? t.label : "?"}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game 6: Rhyme Match (ending-sound family) ────────────────────────────
const RHYME_FAMILIES: Record<string, string[]> = {
  at: ["cat", "hat", "bat", "mat", "rat"],
  og: ["dog", "log", "fog", "hog"],
  un: ["sun", "run", "fun", "bun"],
  ig: ["pig", "big", "wig", "dig"],
  ed: ["bed", "red", "led", "fed"],
  op: ["top", "hop", "mop", "pop"],
};

function RhymeMatch({
  seed,
  words,
  onWin,
}: {
  seed: number;
  words: string[];
  onWin: () => void;
}) {
  const families = Object.keys(RHYME_FAMILIES);
  const family = useMemo(() => {
    // Prefer a family that overlaps lesson vocab.
    const match = families.find((fam) =>
      words.some((w) => w.toLowerCase().endsWith(fam)),
    );
    return match ?? families[seed % families.length];
  }, [words, seed, families]);
  const anchor = useMemo(
    () => seededShuffle(RHYME_FAMILIES[family], seed)[0],
    [family, seed],
  );
  const options = useMemo(() => {
    const rhyme = seededShuffle(RHYME_FAMILIES[family].filter((w) => w !== anchor), seed)[0];
    const others = families
      .filter((f) => f !== family)
      .flatMap((f) => RHYME_FAMILIES[f]);
    const distractors = seededShuffle(others, seed + 2).slice(0, 3);
    return seededShuffle([rhyme, ...distractors], seed + 4);
  }, [family, anchor, seed, families]);
  const answerSuffix = family;
  const [status, setStatus] = useState<null | "right" | "wrong">(null);

  useEffect(() => {
    const t = setTimeout(() => speak(anchor), 300);
    return () => clearTimeout(t);
  }, [anchor]);

  const pick = (w: string) => {
    if (w.endsWith(answerSuffix)) {
      setStatus("right");
      speak(w);
      setTimeout(onWin, 800);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <h2 className="text-center text-lg font-bold text-foreground">
        Which word rhymes with{" "}
        <span className="inline-block rounded-lg bg-primary px-3 py-1 text-primary-foreground">
          {anchor}
        </span>
        ?
      </h2>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => speak(anchor)}
        className="gap-2 rounded-full"
      >
        <Volume2 className="h-4 w-4" />
        Hear again
      </Button>
      <div className="grid grid-cols-2 gap-3">
        {options.map((w) => (
          <motion.button
            key={w}
            onClick={() => pick(w)}
            whileTap={{ scale: 0.92 }}
            animate={
              status === "wrong" ? { x: [-4, 4, -3, 3, 0] } : {}
            }
            className="h-16 w-32 rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-2xl font-black text-accent-foreground shadow-lg"
          >
            {w}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Game 7: Beginning Sound (phonics-focus driven) ───────────────────────
function BeginningSound({
  words,
  focus,
  seed,
  onWin,
}: {
  words: string[];
  focus?: string;
  seed: number;
  onWin: () => void;
}) {
  const target = useMemo(() => {
    const preferred = words.find(
      (w) => focus && w.toLowerCase().startsWith(focus.toLowerCase()),
    );
    return (preferred ?? words[seed % words.length]).toLowerCase();
  }, [words, focus, seed]);
  const answer = target[0];
  const options = useMemo(() => {
    const set = new Set<string>([answer]);
    const fill = "abcdefghijklmnopqrstuvwxyz".split("").filter((c) => c !== answer);
    for (const l of seededShuffle(fill, seed)) {
      if (set.size >= 4) break;
      set.add(l);
    }
    return seededShuffle([...set], seed + 5);
  }, [answer, seed]);
  const [status, setStatus] = useState<null | "right" | "wrong">(null);

  useEffect(() => {
    const t = setTimeout(() => speak(target), 300);
    return () => clearTimeout(t);
  }, [target]);

  const pick = (l: string) => {
    if (l === answer) {
      setStatus("right");
      speak(`${l}, ${target}`);
      setTimeout(onWin, 900);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-center text-lg font-bold text-foreground">
        Which sound does <span className="text-primary">{target}</span> start with?
      </h2>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => speak(target)}
        className="gap-2 rounded-full"
      >
        <Volume2 className="h-4 w-4" />
        Hear again
      </Button>
      <div className="grid grid-cols-2 gap-3">
        {options.map((l) => (
          <motion.button
            key={l}
            onClick={() => pick(l)}
            whileTap={{ scale: 0.92 }}
            animate={status === "wrong" ? { x: [-4, 4, -3, 3, 0] } : {}}
            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-4xl font-black uppercase text-primary-foreground shadow-lg"
          >
            {l}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Game 8: Blend Builder (digraph / consonant blend) ────────────────────
function BlendBuilder({
  blend,
  words,
  seed,
  onWin,
}: {
  blend: string;
  words: string[];
  seed: number;
  onWin: () => void;
}) {
  // Anchor to a lesson word that contains the blend when possible.
  const anchor = useMemo(() => {
    const match = words.find((w) => w.toLowerCase().includes(blend.toLowerCase()));
    return (match ?? `${blend}op`).toLowerCase();
  }, [words, blend]);
  const rime = anchor.replace(blend.toLowerCase(), "") || "op";
  // Present 3 onset tiles (the target blend + 2 distractors) → build the word.
  const distractors = useMemo(() => {
    const bank = ["sh", "ch", "th", "bl", "cl", "fl", "gr", "st"].filter(
      (b) => b !== blend.toLowerCase(),
    );
    return seededShuffle(bank, seed).slice(0, 2);
  }, [blend, seed]);
  const tiles = useMemo(
    () => seededShuffle([blend.toLowerCase(), ...distractors], seed + 3),
    [blend, distractors, seed],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<null | "right" | "wrong">(null);

  useEffect(() => {
    const t = setTimeout(() => speak(anchor), 300);
    return () => clearTimeout(t);
  }, [anchor]);

  const pick = (b: string) => {
    if (b === blend.toLowerCase()) {
      setPicked(b);
      setStatus("right");
      speak(anchor);
      setTimeout(onWin, 900);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-center text-lg font-bold text-foreground">
        Build the word: pick the sound that starts{" "}
        <span className="text-primary">{anchor}</span>
      </h2>
      <div className="flex items-center gap-1">
        <div
          className={`flex h-16 min-w-[64px] items-center justify-center rounded-xl px-3 text-3xl font-black uppercase ${
            picked
              ? "border-2 border-primary bg-primary/10 text-primary"
              : "border-2 border-dashed border-muted-foreground/40 text-muted-foreground/40"
          }`}
        >
          {picked ?? "?"}
        </div>
        <div className="flex h-16 items-center justify-center rounded-xl bg-muted px-3 text-3xl font-black uppercase text-foreground">
          {rime}
        </div>
      </div>
      <div className="flex gap-3">
        {tiles.map((b) => (
          <motion.button
            key={b}
            onClick={() => pick(b)}
            disabled={status === "right"}
            whileTap={{ scale: 0.92 }}
            animate={status === "wrong" ? { x: [-4, 4, -3, 3, 0] } : {}}
            className="h-16 w-20 rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-2xl font-black uppercase text-accent-foreground shadow-lg"
          >
            {b}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Game 9: Syllable Clap ────────────────────────────────────────────────
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 1;
  const groups = w.match(/[aeiouy]+/g) ?? [];
  let n = groups.length;
  if (w.endsWith("e") && n > 1) n -= 1;
  return Math.max(1, n);
}

function SyllableClap({
  word,
  seed,
  onWin,
}: {
  word: string;
  seed: number;
  onWin: () => void;
}) {
  const answer = useMemo(() => countSyllables(word), [word]);
  const [claps, setClaps] = useState(0);
  const [status, setStatus] = useState<null | "right" | "wrong">(null);

  useEffect(() => {
    const t = setTimeout(() => speak(word), 300);
    return () => clearTimeout(t);
  }, [word]);

  const clap = () => {
    if (status === "right") return;
    setClaps((c) => c + 1);
  };

  const check = () => {
    if (claps === answer) {
      setStatus("right");
      speak(`${word}. ${answer} claps!`);
      setTimeout(onWin, 900);
    } else {
      setStatus("wrong");
      setTimeout(() => {
        setStatus(null);
        setClaps(0);
      }, 500);
    }
  };

  // seed unused visually but kept for parity with sibling APIs
  void seed;

  return (
    <div className="flex flex-col items-center gap-5">
      <h2 className="text-center text-lg font-bold text-foreground">
        Clap the syllables in <span className="text-primary">{word}</span>
      </h2>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => speak(word)}
        className="gap-2 rounded-full"
      >
        <Volume2 className="h-4 w-4" />
        Hear again
      </Button>
      <motion.button
        onClick={clap}
        whileTap={{ scale: 0.85 }}
        animate={status === "wrong" ? { x: [-6, 6, -4, 4, 0] } : {}}
        className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary/70 text-6xl shadow-xl"
      >
        👏
      </motion.button>
      <div className="flex gap-2">
        {Array.from({ length: Math.max(claps, 1) }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-8 rounded-full ${
              i < claps ? "bg-primary" : "bg-primary/20"
            }`}
          />
        ))}
      </div>
      <Button onClick={check} disabled={claps === 0 || status === "right"}>
        I'm done ({claps} clap{claps === 1 ? "" : "s"})
      </Button>
    </div>
  );
}

// ─── Skip helper (rendered by phaseAdapter externally) ────────────────────
export function AlphabetArcadeSkipRow({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="flex w-full justify-end">
      <Button variant="ghost" size="sm" onClick={onSkip} className="gap-1">
        Skip <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default AlphabetArcadePhase;
