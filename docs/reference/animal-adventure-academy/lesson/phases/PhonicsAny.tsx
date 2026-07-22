import { useEffect, useState } from "react";
import { speak } from "@/lib/lesson/speech";
import { Volume2 } from "lucide-react";
import { TeacherNotes } from "@/components/lesson/TeacherNotes";

export type PhonicsWord = {
  name: string;
  /** Emoji fallback used when no image is supplied. */
  emoji: string;
  /** Optional bitmap illustration (preferred — children read pictures faster). */
  image?: string;
};

export type PhonicsConfig = {
  /** Single uppercase letter to display, e.g. "M" */
  letter: string;
  /** How TTS should say the sound, e.g. "mmm mmm mmm" */
  sound: string;
  /** Short pronunciation label shown on screen, e.g. "/m/" */
  label: string;
  /** Words that begin with the sound. Provide an image when possible; emoji is the fallback. */
  words: PhonicsWord[];
  /** Optional teacher hint line. */
  hint?: string;
};

export function PhonicsAnyPhase({
  config,
  onComplete,
}: {
  config: PhonicsConfig;
  onComplete: () => void;
}) {
  const [heardSound, setHeardSound] = useState(false);
  const [heardWords, setHeardWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = setTimeout(() => speak(config.sound, { rate: 0.65 }), 300);
    return () => clearTimeout(id);
  }, [config.sound]);

  useEffect(() => {
    if (heardSound && heardWords.size === config.words.length) {
      const id = setTimeout(onComplete, 500);
      return () => clearTimeout(id);
    }
  }, [heardSound, heardWords, onComplete, config.words.length]);

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Phonics">
        <p>
          <strong>Aim:</strong> isolate the sound {config.label} and link it to 3 simple words.
          <strong> Time:</strong> 3–4 min.
        </p>
        <p>
          {config.hint ??
            "Say the sound, not the letter name. Have the student echo. Tap each word and stretch the first sound."}
        </p>
      </TeacherNotes>

      <div className="text-center">
        <p className="text-xl font-semibold text-[color:var(--playground-ink)]/80">
          Today's sound is {config.label}
        </p>
        <button
          onClick={() => {
            speak(config.sound, { rate: 0.65 });
            setHeardSound(true);
          }}
          className="shadow-playground mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-[2rem] text-8xl font-black text-white transition hover:scale-105 active:scale-95"
          style={{ background: "var(--playground-primary)" }}
        >
          {config.letter}
          {config.letter.toLowerCase()}
        </button>
        <p className="mt-3 text-base text-[color:var(--playground-ink)]/70">
          Tap the letter to hear the sound
        </p>

        <div className="mt-10">
          <h3 className="text-xl font-bold text-[color:var(--playground-ink)]">
            Words that start with {config.label}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {config.words.map((w) => (
              <button
                key={w.name}
                onClick={() => {
                  speak(`${config.sound}, ${w.name}`, { rate: 0.75 });
                  setHeardWords((s) => new Set(s).add(w.name));
                }}
                className="glass-card flex flex-col items-center gap-2 rounded-3xl p-4 transition hover:scale-105"
                style={{
                  outline: heardWords.has(w.name)
                    ? "3px solid var(--playground-primary)"
                    : "none",
                }}
              >
                {w.image ? (
                  <img
                    src={w.image}
                    alt={w.name}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-24 w-24 object-contain sm:h-32 sm:w-32"
                  />
                ) : (
                  <span className="text-6xl sm:text-7xl" aria-hidden>
                    {w.emoji}
                  </span>
                )}
                <span className="text-2xl font-extrabold capitalize text-[color:var(--playground-ink)]">
                  <span className="text-[color:var(--playground-primary)]">
                    {w.name.charAt(0)}
                  </span>
                  {w.name.slice(1)}
                </span>
                <Volume2 className="h-5 w-5 text-[color:var(--playground-ink)]/50" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
