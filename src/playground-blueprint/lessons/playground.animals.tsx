
import { useCallback, useEffect, useState } from "react";
import { LessonShell, type PhaseDef } from "@/playground-blueprint/components/LessonShell";
import { VocabularyPhase } from "@/playground-blueprint/components/phases/Vocabulary";
import { PracticePhase } from "@/playground-blueprint/components/phases/Practice";
import { ModelingPhase } from "@/playground-blueprint/components/phases/Modeling";
import { SentencePhase } from "@/playground-blueprint/components/phases/Sentence";
import { PhonicsPhase } from "@/playground-blueprint/components/phases/Phonics";
import { BlendingPhase } from "@/playground-blueprint/components/phases/Blending";
import { SpellingPhase } from "@/playground-blueprint/components/phases/Spelling";
import { CoolDownPhase } from "@/playground-blueprint/components/phases/CoolDown";
import { MemoryMatchPhase } from "@/playground-blueprint/components/phases/MemoryMatch";
import { ChantPhase } from "@/playground-blueprint/components/phases/Chant";
import { BrainBreakPhase, TapToCatch, PicturePuzzle } from "@/playground-blueprint/components/phases/BrainBreak";
import { Puzzle, Hand } from "lucide-react";
import { ANIMALS } from "@/playground-blueprint/lib/animals";
import { useLessonVocab } from "@/playground-blueprint/lib/useDynamicVocab";

/**
 * ============================================================================
 *  LESSON 1 — PETS / ANIMALS · BLUEPRINT
 * ============================================================================
 *  Target total time: ~35–40 minutes (30+ min minimum).
 *  Phase timing budget (teacher-led):
 *    1. Vocabulary    ~4 min   — meet 6 pets, tap & hear each name
 *    2. Practice      ~4 min   — listen & match
 *    3. Memory game   ~5 min   — picture↔word pairs (new game)
 *    4. Modeling      ~3 min   — "In the forest" listen-along
 *    5. Sentence      ~4 min   — "It is a ___"
 *    6. Phonics /c/   ~3 min
 *    7. Blending      ~3 min   — c-a-t → cat
 *    8. Spelling      ~4 min   — letter drag
 *    9. Chant         ~3 min   — call & response sentence chant (new)
 *    10. Cool down    ~2 min
 *  Total: 35 min of student-on-task time.
 * ============================================================================
 */

const PHASES: PhaseDef[] = [
  { id: "vocab", label: "Vocabulary" },
  { id: "practice", label: "Practice" },
  { id: "memory", label: "Memory game" },
  { id: "modeling", label: "Modeling" },
  { id: "sentence", label: "Sentence" },
  { id: "phonics", label: "Phonics /c/" },
  { id: "blend", label: "Blending" },
  { id: "spell", label: "Spelling" },
  { id: "chant", label: "Chant" },
  { id: "break", label: "Brain break" },
  { id: "cool", label: "Cool down" },
];

// Chant lines are derived from AI-generated vocab using L1's sentence frame.
// No bundled example chant — empty array when no vocab is available yet.
function buildChantLines(vocab: { name: string }[]): string[] {
  if (!vocab.length) return [];
  return vocab.slice(0, 4).map((v) => {
    const article = /^[aeiou]/i.test(v.name) ? "an" : "a";
    return `It is ${article} ${v.name}.`;
  });
}


const STORAGE_KEY = "playground-animals-progress";

function AnimalsLesson() {
  const [idx, setIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  // AI vocab when a unit is present; otherwise the bundled ANIMALS fallback.
  const vocab = useLessonVocab(1, ANIMALS);
  const chantLines = buildChantLines(vocab);


  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { idx: number; completed: number[] };
        setIdx(parsed.idx);
        setCompleted(new Set(parsed.completed));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ idx, completed: Array.from(completed) }),
      );
    } catch {
      /* ignore */
    }
  }, [idx, completed]);

  const markComplete = useCallback(
    (i: number) => setCompleted((c) => new Set(c).add(i)),
    [],
  );

  const onPrev = () => setIdx((i) => Math.max(0, i - 1));
  const onNext = () => setIdx((i) => Math.min(PHASES.length - 1, i + 1));

  const canAdvance = completed.has(idx);

  const titles = [
    { t: "Meet the words", s: "New vocabulary to learn" },
    { t: "Let's practise!", s: "Listen, match, and remember" },
    { t: "Memory game 🧠", s: "Flip two cards — find the pair" },
    { t: "Model with Pip", s: "Listen to the model sentences" },
    { t: "Make a sentence", s: "Use the sentence frame" },
    { t: "Phonic sound", s: "Listen carefully" },
    { t: "Blend the sounds", s: "Put the sounds together" },
    { t: "Spell the word", s: "Place the letters in order" },
    { t: "Sing & chant 🎵", s: "Repeat after me" },
    { t: "Brain break 🧩", s: "Puzzle or maze — your pick!" },
    { t: "Cool down", s: "You did it!" },
  ];


  return (
    <LessonShell
      phases={PHASES}
      currentIndex={idx}
      onPrev={onPrev}
      onNext={onNext}
      title={titles[idx].t}
      subtitle={titles[idx].s}
      canAdvance={canAdvance}
      finishedCelebration={idx === PHASES.length - 1 && completed.has(idx)}
    >
      {idx === 0 && <VocabularyPhase onComplete={() => markComplete(0)} />}
      {idx === 1 && <PracticePhase onComplete={() => markComplete(1)} />}
      {idx === 2 && <MemoryMatchPhase items={vocab} onComplete={() => markComplete(2)} />}
      {idx === 3 && <ModelingPhase onComplete={() => markComplete(3)} />}
      {idx === 4 && <SentencePhase onComplete={() => markComplete(4)} />}
      {idx === 5 && <PhonicsPhase onComplete={() => markComplete(5)} />}
      {idx === 6 && <BlendingPhase onComplete={() => markComplete(6)} />}
      {idx === 7 && <SpellingPhase onComplete={() => markComplete(7)} />}
      {idx === 8 && <ChantPhase lines={chantLines} onComplete={() => markComplete(8)} />}
      {idx === 9 && (
        <BrainBreakPhase
          onComplete={() => markComplete(9)}
          games={[
            {
              id: "puzzle",
              label: "Pet Picture Puzzle",
              icon: <Puzzle className="h-4 w-4" />,
              render: ({ onSolved }) => (
                <PicturePuzzle image={vocab[0].image} label={vocab[0].name} onSolved={onSolved} />
              ),
            },
            {
              id: "bones",
              label: "Feed the pets 🦴",
              icon: <Hand className="h-4 w-4" />,
              render: ({ onSolved }) => (
                <TapToCatch
                  onSolved={onSolved}
                  config={{
                    emojis: ["🦴", "🐾", "🥩"],
                    target: 6,
                    cta: "Tap the bones and treats to feed the pets!",
                    background: "bg-amber-100/70",
                  }}
                />
              ),
            },
          ]}
        />
      )}
      {idx === 10 && <CoolDownAutoComplete onComplete={() => markComplete(10)} />}
    </LessonShell>
  );
}

function CoolDownAutoComplete({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  return <CoolDownPhase />;
}

export default AnimalsLesson;
