import { useState } from "react";

interface GreetingProps {
  greetings?: string[];
  onComplete: () => void;
}

const DEFAULT_GREETINGS = ["Hello!", "How are you?", "I am fine, thank you!"];

/** Speaks a phrase using the Web Speech API — slow + clear for Pre-A1 learners. */
function speak(text: string, rate = 0.8) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

/**
 * Pre-A1 mandatory greeting wrapper. Drills unanalyzed formulaic chunks
 * ("Hello!", "How are you?", "I am fine, thank you!") before any target vocab.
 * Confidence-only — NEVER graded or scored.
 */
export function GreetingRoutine({ greetings = DEFAULT_GREETINGS, onComplete }: GreetingProps) {
  const [step, setStep] = useState(0);

  const handleTap = () => {
    if (step < greetings.length - 1) {
      const next = step + 1;
      setStep(next);
      speak(greetings[next]);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
      <h2 className="text-4xl font-bold text-playground-primary">Let's Say Hello! 👋</h2>

      <button
        type="button"
        onClick={handleTap}
        className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-12 shadow-xl transform active:scale-95 transition cursor-pointer min-h-[80px]"
      >
        <p className="text-5xl font-extrabold tracking-wide text-[#FE6A2F]">
          {greetings[step]}
        </p>
        <p className="text-sm text-muted-foreground mt-6 animate-pulse">
          Tap to repeat and continue
        </p>
      </button>
    </div>
  );
}

export default GreetingRoutine;
