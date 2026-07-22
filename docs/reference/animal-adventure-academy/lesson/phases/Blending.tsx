import { useState } from "react";
import { speak } from "@/lib/lesson/speech";

const BLEND_WORDS = [
  { word: "cat", sounds: ["c", "a", "t"], say: ["kuh", "ah", "tuh"] },
  { word: "cow", sounds: ["c", "ow"], say: ["kuh", "ow"] },
  { word: "cup", sounds: ["c", "u", "p"], say: ["kuh", "uh", "puh"] },
];

export function BlendingPhase({ onComplete }: { onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const w = BLEND_WORDS[idx];
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [blended, setBlended] = useState(false);

  const tap = (i: number) => {
    speak(w.say[i], { rate: 0.65 });
    setTapped((s) => new Set(s).add(i));
  };
  const blend = () => {
    speak(w.word);
    setBlended(true);
  };
  const next = () => {
    if (idx + 1 >= BLEND_WORDS.length) onComplete();
    else {
      setIdx((i) => i + 1);
      setTapped(new Set());
      setBlended(false);
    }
  };

  const allTapped = tapped.size === w.sounds.length;

  return (
    <div className="text-center">
      <p className="text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Tap each sound, then blend them together
      </p>

      <div
        className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 transition-all duration-500"
        style={{ gap: blended ? "0px" : undefined }}
      >
        {w.sounds.map((s, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            className="shadow-playground-soft flex h-28 w-28 items-center justify-center rounded-3xl text-5xl font-black text-white transition hover:scale-105"
            style={{
              background: tapped.has(i)
                ? "var(--playground-primary)"
                : "color-mix(in oklab, var(--playground-primary) 55%, white)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {blended && (
        <p className="animate-lesson-pop mt-6 text-6xl font-black text-[color:var(--playground-primary)]">
          {w.word}!
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={blend}
          disabled={!allTapped}
          className="shadow-playground rounded-2xl px-8 py-4 text-xl font-extrabold text-white transition hover:scale-105 disabled:opacity-40"
          style={{ background: "var(--playground-primary)" }}
        >
          Blend! 🎉
        </button>
        {blended && (
          <button
            onClick={next}
            className="glass-card rounded-2xl px-8 py-4 text-xl font-extrabold text-[color:var(--playground-ink)] transition hover:scale-105"
          >
            {idx + 1 >= BLEND_WORDS.length ? "Done" : "Next word →"}
          </button>
        )}
      </div>

      <p className="mt-6 text-sm font-medium text-[color:var(--playground-ink)]/60">
        Word {idx + 1} of {BLEND_WORDS.length}
      </p>
    </div>
  );
}
