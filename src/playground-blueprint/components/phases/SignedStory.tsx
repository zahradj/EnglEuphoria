import { useEffect, useRef, useState } from "react";
import { Volume2, Play, Pause, RotateCcw, Hand } from "lucide-react";
import { TeacherNotes } from "@/playground-blueprint/components/TeacherNotes";
import { speak } from "@/playground-blueprint/lib/speech";
import type { StoryPage } from "@/playground-blueprint/lib/storybook";

/**
 * Signed Story — auto-playing read-along that previews the whole story
 * BEFORE the lesson begins. The teacher (or audio) reads each page while
 * mimed gestures ("signs") are shown for the key words. Mirrors a Story Sign
 * routine: students watch, listen, and copy the gesture before any task.
 */

// Word → gesture cue shown as a chip the teacher acts out.
const SIGNS: Record<string, string> = {
  cat: "🐱 paws on cheeks",
  dog: "🐶 pant + wag",
  tiger: "🐯 claws + roar",
  monkey: "🐒 scratch head",
  fish: "🐟 hands together, wiggle",
  crab: "🦀 pinch fingers",
  jungle: "🌴 arms = tall trees",
  sea: "🌊 wave arms",
  friends: "🤝 hands together",
  big: "🙌 arms wide",
  small: "🤏 fingers pinch",
  white: "☁️ point to a cloud",
  brown: "🟫 point to wood",
  orange: "🟧 point to orange",
  red: "🟥 point to red",
};

function signsFor(sentence: string): { word: string; cue: string }[] {
  const out: { word: string; cue: string }[] = [];
  const seen = new Set<string>();
  for (const raw of sentence.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/)) {
    if (SIGNS[raw] && !seen.has(raw)) {
      seen.add(raw);
      out.push({ word: raw, cue: SIGNS[raw] });
    }
  }
  return out;
}

export function SignedStoryPhase({
  pages,
  title,
  onComplete,
}: {
  pages: StoryPage[];
  title: string;
  onComplete?: () => void;
}) {
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const p = pages[page];

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const playAll = () => {
    if (playing) return;
    setPlaying(true);
    let i = page;
    const step = () => {
      const cur = pages[i];
      if (!cur) {
        setPlaying(false);
        onComplete?.();
        return;
      }
      setPage(i);
      speak(cur.text.join(" "));
      // ~2.4s per short sentence is a comfortable read-aloud pace for ages 4–9
      const dur = Math.max(4000, cur.text.join(" ").length * 80);
      timer.current = window.setTimeout(() => {
        i += 1;
        step();
      }, dur);
    };
    step();
  };

  const stop = () => {
    setPlaying(false);
    if (timer.current) window.clearTimeout(timer.current);
    window.speechSynthesis?.cancel?.();
  };

  return (
    <div className="space-y-6">
      <TeacherNotes>
        <p className="mb-2">
          <strong>Signed Story — before we start:</strong> watch the whole story
          first. Read each sentence slowly and act out the highlighted signs.
          Ask the student to copy the gesture before moving on.
        </p>
        <p>
          Use <em>Play whole story</em> for an auto read-along, or tap a
          sentence to hear it one at a time.
        </p>
      </TeacherNotes>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden rounded-3xl">
          <img
            src={p.image}
            alt={`${title} — page ${page + 1}`}
            className="h-full w-full object-cover"
            width={1024}
            height={1024}
            loading="lazy"
          />
        </div>

        <div className="space-y-3">
          {p.text.map((s, i) => {
            const cues = signsFor(s);
            return (
              <div key={i} className="glass-card rounded-2xl p-4">
                <button
                  onClick={() => speak(s)}
                  className="flex w-full items-center gap-3 text-left text-xl font-bold text-[color:var(--playground-ink)]"
                >
                  <Volume2 className="h-5 w-5 shrink-0 text-[color:var(--playground-primary)]" />
                  {s}
                </button>
                {cues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cues.map((c) => (
                      <span
                        key={c.word}
                        className="inline-flex items-center gap-1 rounded-full bg-[color:var(--playground-primary)]/15 px-3 py-1 text-sm font-bold text-[color:var(--playground-ink)]"
                      >
                        <Hand className="h-3.5 w-3.5" />
                        <strong>{c.word}</strong> · {c.cue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2 pt-2">
            {!playing ? (
              <button
                onClick={playAll}
                className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-extrabold text-white"
                style={{ background: "var(--playground-primary)" }}
              >
                <Play className="h-5 w-5" /> Play whole story
              </button>
            ) : (
              <button
                onClick={stop}
                className="glass-card inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-extrabold text-[color:var(--playground-ink)]"
              >
                <Pause className="h-5 w-5" /> Pause
              </button>
            )}
            <button
              onClick={() => {
                stop();
                setPage(0);
              }}
              className="glass-card inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-bold text-[color:var(--playground-ink)]"
            >
              <RotateCcw className="h-5 w-5" /> Restart
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setPage((i) => Math.max(0, i - 1))}
          disabled={page === 0}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          ← Previous page
        </button>
        <div className="flex gap-2">
          {pages.map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-8 rounded-full transition"
              style={{
                background:
                  i <= page
                    ? "var(--playground-primary)"
                    : "color-mix(in oklab, var(--playground-primary) 18%, white)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setPage((i) => Math.min(pages.length - 1, i + 1))}
          disabled={page === pages.length - 1}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          Next page →
        </button>
      </div>
    </div>
  );
}
