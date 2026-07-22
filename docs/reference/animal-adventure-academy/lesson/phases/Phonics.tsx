import { useEffect, useState } from "react";
import { PHONIC_C_WORDS } from "@/lib/lesson/animals";
import { speak } from "@/lib/lesson/speech";
import { Volume2 } from "lucide-react";

export function PhonicsPhase({ onComplete }: { onComplete: () => void }) {
  const [heardSound, setHeardSound] = useState(false);
  const [heardWords, setHeardWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = setTimeout(() => speak("kuh kuh kuh", { rate: 0.7 }), 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (heardSound && heardWords.size === PHONIC_C_WORDS.length) {
      const id = setTimeout(onComplete, 500);
      return () => clearTimeout(id);
    }
  }, [heardSound, heardWords, onComplete]);

  return (
    <div className="text-center">
      <p className="text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Today's sound is /c/
      </p>
      <button
        onClick={() => {
          speak("kuh kuh kuh", { rate: 0.7 });
          setHeardSound(true);
        }}
        className="shadow-playground mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-[2rem] text-8xl font-black text-white transition hover:scale-105 active:scale-95"
        style={{ background: "var(--playground-primary)" }}
      >
        Cc
      </button>
      <p className="mt-3 text-base text-[color:var(--playground-ink)]/70">
        Tap the letter to hear the sound
      </p>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-[color:var(--playground-ink)]">
          Words that start with /c/
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
    </div>
  );
}
