import { useEffect, useMemo, useState } from "react";
import { speak } from "@/playground-blueprint/lib/speech";
import { Volume2 } from "lucide-react";
import { TeacherNotes } from "@/playground-blueprint/components/TeacherNotes";
import confetti from "canvas-confetti";
import catImg from "@/playground-blueprint/assets/animals/cat.png";
import cowImg from "@/playground-blueprint/assets/animals/cow.png";
import carImg from "@/playground-blueprint/assets/animals/car.png";
import monkeyImg from "@/playground-blueprint/assets/animals/monkey.png";
import fishImg from "@/playground-blueprint/assets/animals/ocean-fish.png";
import moonImg from "@/playground-blueprint/assets/phonics/moon.png";
import mouseImg from "@/playground-blueprint/assets/phonics/mouse.png";
import frogImg from "@/playground-blueprint/assets/phonics/frog.png";
import footImg from "@/playground-blueprint/assets/phonics/foot.png";

export type PhonicsItem = {
  letter: string; // uppercase, e.g. "C"
  sound: string; // tts e.g. "kuh kuh kuh"
  label: string; // /c/
  words: { name: string; emoji: string; image?: string }[];
};

export const PHONICS_BANK: PhonicsItem[] = [
  {
    letter: "C",
    sound: "kuh kuh kuh",
    label: "/c/",
    words: [
      { name: "cat", emoji: "🐱", image: catImg },
      { name: "cow", emoji: "🐮", image: cowImg },
      { name: "car", emoji: "🚗", image: carImg },
    ],
  },
  {
    letter: "M",
    sound: "mmm mmm mmm",
    label: "/m/",
    words: [
      { name: "monkey", emoji: "🐒", image: monkeyImg },
      { name: "moon", emoji: "🌙", image: moonImg },
      { name: "mouse", emoji: "🐭", image: mouseImg },
    ],
  },
  {
    letter: "F",
    sound: "fff fff fff",
    label: "/f/",
    words: [
      { name: "fish", emoji: "🐟", image: fishImg },
      { name: "frog", emoji: "🐸", image: frogImg },
      { name: "foot", emoji: "🦶", image: footImg },
    ],
  },
];

type Round = {
  image?: string;
  emoji: string;
  word: string;
  answer: string; // letter
  choices: string[]; // letters
};

function shuffle<T>(a: T[]): T[] {
  return [...a].sort(() => Math.random() - 0.5);
}

function buildRounds(bank: PhonicsItem[]): Round[] {
  const letters = bank.map((b) => b.letter);
  const rs: Round[] = [];
  bank.forEach((b) => {
    b.words.forEach((w) => {
      rs.push({
        emoji: w.emoji,
        image: w.image,
        word: w.name,
        answer: b.letter,
        choices: shuffle(letters),
      });
    });
  });
  return shuffle(rs);
}

export function PhonicsReviewPhase({
  onComplete,
  bank = PHONICS_BANK,
  hint = "Listen to the word, then tap the letter that makes its first sound.",
}: {
  onComplete?: () => void;
  bank?: PhonicsItem[];
  hint?: string;
}) {
  const rounds = useMemo(() => buildRounds(bank), [bank]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const r = rounds[i];

  useEffect(() => {
    const id = setTimeout(() => speak(r.word, { rate: 0.8 }), 250);
    return () => clearTimeout(id);
  }, [r.word]);

  const pick = (letter: string) => {
    if (picked) return;
    setPicked(letter);
    const correct = letter === r.answer;
    const item = bank.find((b) => b.letter === r.answer)!;
    if (correct) {
      setScore((s) => s + 1);
      speak(`${item.sound}, ${r.word}`, { rate: 0.75 });
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } else {
      speak(`${item.sound}, ${r.word}`, { rate: 0.7 });
    }
    setTimeout(() => {
      if (i + 1 >= rounds.length) {
        onComplete?.();
      } else {
        setI((x) => x + 1);
        setPicked(null);
      }
    }, 1500);
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Phonics review">
        <p>
          <strong>Aim:</strong> map each word to its starting sound across /c/, /m/, /f/.
          <strong> Time:</strong> 4–5 min.
        </p>
        <p>{hint}</p>
      </TeacherNotes>

      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
          Round {i + 1} / {rounds.length} · score {score}
        </p>

        <button
          onClick={() => speak(r.word, { rate: 0.75 })}
          className="glass-card mx-auto mt-4 flex flex-col items-center gap-2 rounded-3xl px-8 py-6 transition hover:scale-105"
        >
          {r.image ? (
            <img
              src={r.image}
              alt={r.word}
              loading="lazy"
              width={512}
              height={512}
              className="h-28 w-28 object-contain sm:h-32 sm:w-32"
            />
          ) : (
            <span className="text-7xl sm:text-8xl" aria-hidden>
              {r.emoji}
            </span>
          )}
          <span className="inline-flex items-center gap-2 text-xl font-extrabold capitalize text-[color:var(--playground-ink)]">
            <Volume2 className="h-5 w-5" /> {r.word}
          </span>
        </button>

        <p className="mt-6 text-lg font-semibold text-[color:var(--playground-ink)]/80">
          Which letter makes the first sound?
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {r.choices.map((L) => {
            const isPick = picked === L;
            const correct = picked && L === r.answer;
            return (
              <button
                key={L}
                disabled={!!picked}
                onClick={() => pick(L)}
                className="shadow-playground flex h-24 w-24 items-center justify-center rounded-3xl text-5xl font-black text-white transition hover:scale-105 active:scale-95 disabled:opacity-80"
                style={{
                  background: correct
                    ? "#10b981"
                    : isPick
                      ? "#ef4444"
                      : "var(--playground-primary)",
                }}
              >
                {L}
                {L.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
