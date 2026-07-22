import { useEffect, useState } from "react";
import { speak } from "@/playground-blueprint/lib/speech";
import { Volume2, Mic } from "lucide-react";
import { TeacherNotes } from "@/playground-blueprint/components/TeacherNotes";

/**
 * Call-and-response chant (~3–5 min).
 * Plays a short rhythmic line, the student repeats it. After all lines the
 * phase auto-completes. Reusable: pass any list of chant lines.
 *
 * Classroom use: teacher claps the rhythm while the student repeats. This
 * doubles oral repetitions of the lesson's target sentence frame.
 */
export function ChantPhase({
  lines,
  onComplete,
}: {
  lines: string[];
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<"hear" | "repeat">("hear");
  const line = lines[idx];

  useEffect(() => {
    setStage("hear");
    speak(line);
  }, [line]);

  const repeated = () => {
    if (idx + 1 >= lines.length) {
      onComplete();
      return;
    }
    setIdx((i) => i + 1);
  };

  return (
    <div className="text-center">
      <TeacherNotes>
        Chant time! Press Hear, listen, then press My turn and have the student
        repeat the line out loud. Clap a 1-2-3 rhythm to keep it musical. Go
        through all {lines.length} lines.
      </TeacherNotes>
      <div
        className="glass-card mx-auto mt-5 max-w-lg rounded-3xl p-8 text-3xl font-black leading-tight text-[color:var(--playground-ink)] sm:text-4xl"
      >
        🎵 {line} 🎵
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => speak(line)}
          className="glass-card inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-extrabold text-[color:var(--playground-ink)]"
        >
          <Volume2 className="h-5 w-5" /> Hear it
        </button>
        <button
          onClick={() => setStage("repeat")}
          className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-extrabold text-white"
          style={{ background: "var(--playground-primary)" }}
        >
          <Mic className="h-5 w-5" /> My turn
        </button>
        {stage === "repeat" && (
          <button
            onClick={repeated}
            className="animate-lesson-pop shadow-playground inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            I said it! →
          </button>
        )}
      </div>
    </div>
  );
}
