import { useEffect, useMemo, useState } from "react";
import { useLessonPhonicWords, useLessonPhonicLetter } from "@/playground-blueprint/lib/useDynamicVocab";
import { speak } from "@/playground-blueprint/lib/speech";
import { Volume2, CheckCircle2 } from "lucide-react";

export function PhonicsPhase({ onComplete }: { onComplete: () => void }) {
  const PHONIC_C_WORDS = useLessonPhonicWords(1);
  const phonicLetter = useLessonPhonicLetter(1);
  const [heardSound, setHeardSound] = useState(false);
  const [heardWords, setHeardWords] = useState<Set<string>>(new Set());
  const [matchStarted, setMatchStarted] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);

  const wordsReady = heardSound && heardWords.size === PHONIC_C_WORDS.length;

  // Deterministic-but-shuffled prompt order
  const order = useMemo(
    () => PHONIC_C_WORDS.map((w, i) => ({ w, i })).sort((a, b) => ((a.w.name.charCodeAt(0) + a.i) % 7) - ((b.w.name.charCodeAt(0) + b.i) % 7)).map((x) => x.w),
    [PHONIC_C_WORDS],
  );
  const target = order[roundIdx];

  useEffect(() => {
    const id = setTimeout(() => speak("kuh kuh kuh", { rate: 0.7 }), 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (matchStarted && target) {
      const id = setTimeout(() => speak(target.name, { rate: 0.7 }), 250);
      return () => clearTimeout(id);
    }
  }, [matchStarted, roundIdx, target]);

  useEffect(() => {
    if (matchStarted && matchedCount >= order.length) {
      const id = setTimeout(onComplete, 600);
      return () => clearTimeout(id);
    }
  }, [matchStarted, matchedCount, order.length, onComplete]);

  function handlePick(name: string) {
    if (!target || feedback === "correct") return;
    if (name === target.name) {
      setFeedback("correct");
      speak("Yes!", { rate: 0.9 });
      setTimeout(() => {
        setMatchedCount((c) => c + 1);
        setFeedback(null);
        setRoundIdx((i) => Math.min(i + 1, order.length - 1));
      }, 700);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
  }

  return (
    <div className="text-center">
      <p className="text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Today's sound is /{phonicLetter}/
      </p>
      <button
        onClick={() => {
          speak("kuh kuh kuh", { rate: 0.7 });
          setHeardSound(true);
        }}
        className="shadow-playground mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-[2rem] text-8xl font-black text-white transition hover:scale-105 active:scale-95"
        style={{ background: "var(--playground-primary)" }}
      >
        {phonicLetter.toUpperCase()}{phonicLetter}
      </button>
      <p className="mt-3 text-base text-[color:var(--playground-ink)]/70">
        Tap the letter to hear the sound
      </p>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-[color:var(--playground-ink)]">
          Words that start with /{phonicLetter}/
        </h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {PHONIC_C_WORDS.map((w) => (
            <button
              key={w.name}
              onClick={() => {
                speak(`kuh, ${w.name}`, { rate: 0.75 });
                setHeardWords((s) => new Set(s).add(w.name));
              }}
              className="glass-card flex flex-col items-center gap-2 rounded-3xl p-4 transition hover:scale-105"
              style={{
                outline: heardWords.has(w.name) ? "3px solid var(--playground-primary)" : "none",
              }}
            >
              <img src={w.image} alt={w.name} className="h-24 w-24 object-contain sm:h-32 sm:w-32" />
              <span className="text-2xl font-extrabold capitalize text-[color:var(--playground-ink)]">
                <span className="text-[color:var(--playground-primary)]">{w.name.charAt(0)}</span>
                {w.name.slice(1)}
              </span>
              <Volume2 className="h-5 w-5 text-[color:var(--playground-ink)]/50" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Listen & Match practice ─────────────────────────────── */}
      {wordsReady && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-[color:var(--playground-ink)]">
            Listen &amp; Match
          </h3>
          <p className="mt-1 text-sm text-[color:var(--playground-ink)]/70">
            Listen to Pip, then tap the picture you hear.
          </p>

          {!matchStarted ? (
            <button
              onClick={() => setMatchStarted(true)}
              className="shadow-playground mt-4 rounded-full px-6 py-3 text-lg font-extrabold text-white transition hover:scale-105 active:scale-95"
              style={{ background: "var(--playground-primary)" }}
            >
              Start listening game
            </button>
          ) : (
            <>
              <button
                onClick={() => target && speak(target.name, { rate: 0.7 })}
                className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-white/70 px-5 py-2 text-base font-bold text-[color:var(--playground-ink)] shadow"
              >
                <Volume2 className="h-5 w-5" /> Play again
              </button>

              <div className="mt-2 text-sm text-[color:var(--playground-ink)]/60">
                {Math.min(matchedCount + 1, order.length)} / {order.length}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                {PHONIC_C_WORDS.map((w) => {
                  const isCorrect = feedback === "correct" && target?.name === w.name;
                  const isWrong = feedback === "wrong" && target?.name !== w.name;
                  return (
                    <button
                      key={`lm-${w.name}`}
                      onClick={() => handlePick(w.name)}
                      className="glass-card relative flex flex-col items-center gap-2 rounded-3xl p-4 transition hover:scale-105 active:scale-95"
                      style={{
                        outline: isCorrect ? "3px solid var(--playground-primary)" : "none",
                        opacity: isWrong ? 0.5 : 1,
                      }}
                    >
                      <img src={w.image} alt={w.name} className="h-24 w-24 object-contain sm:h-32 sm:w-32" />
                      {isCorrect && (
                        <CheckCircle2 className="absolute right-2 top-2 h-6 w-6 text-[color:var(--playground-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
