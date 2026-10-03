import { useState, useRef } from "react";
import { QuestShell, PrimaryButton } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import type { AnswerRecord } from "../useLesson";
import type { Difficulty } from "../levels";
import { placementClipUrl } from "@/components/placement/placementAudio";
import { SETS, type ListeningQ } from "../listeningSets";

type Q = ListeningQ;

export function Listening({
  onDone,
  record,
  difficulty,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  difficulty: Difficulty;
}) {
  const QUESTIONS = SETS[difficulty];
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showTeacher, setShowTeacher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const cacheRef = useRef<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const q = QUESTIONS[i];
  const isLast = i === QUESTIONS.length - 1;
  const correctIdx = q.options.indexOf(q.target);

  const playSentence = async () => {
    if (loading || playing) return;
    try {
      setLoading(true);
      // Saved clip only (made once by the bake script). No live speech generation, ever.
      let url = cacheRef.current[q.id];
      if (!url) {
        const clip = await placementClipUrl(q.target, "teacher");
        if (!clip) throw new Error("no saved clip");
        url = clip;
        cacheRef.current[q.id] = url;
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      setPlaying(true);
      setPlays((p) => p + 1);
      await audio.play();
    } catch (e) {
      console.error("TTS error", e);
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuestShell
      emoji="🎧"
      title="Listening Lab"
      subtitle="Teacher reads aloud. Pick the sentence you heard."
      footer={
        answered &&
        (isLast ? (
          <PrimaryButton onClick={onDone}>Last quest →</PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => {
              audioRef.current?.pause();
              audioRef.current = null;
              setI(i + 1);
              setAnswered(false);
              setShowTeacher(false);
              setPlays(0);
              setPlaying(false);
            }}
          >
            Next →
          </PrimaryButton>
        ))
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={playSentence}
            disabled={loading || playing}
            aria-label="Play sentence"
            className={`grid place-items-center w-14 h-14 rounded-full bg-brand-purple text-primary-foreground text-2xl shadow-lg hover:scale-105 transition disabled:opacity-70 ${playing ? "animate-pulse" : "animate-float"}`}
          >
            {loading ? "⏳" : playing ? "🔈" : "▶️"}
          </button>
          <div>
            <p className="text-sm font-semibold">Tap play to hear your teacher 🎙️</p>
            <p className="text-xs text-muted-foreground">
              {plays === 0 ? "Click the purple button to start." : `Played ${plays}× — you can replay!`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTeacher((s) => !s)}
          className="text-xs font-semibold px-3 py-2 rounded-full bg-secondary text-secondary-foreground border border-border hover:bg-accent"
        >
          {showTeacher ? "Hide teacher view" : "👩‍🏫 Teacher view"}
        </button>
      </div>
      {showTeacher && (
        <div className="mb-5 rounded-xl border-2 border-dashed border-brand-purple/50 bg-brand-purple/5 p-3 text-sm">
          <strong className="text-brand-purple-deep">Read aloud:</strong> "{q.target}"
        </div>
      )}
      <div className="grid gap-3">
        {q.options.map((opt, idx) => (
          <ChoiceButton
            key={`${q.id}-${idx}`}
            isCorrect={idx === correctIdx}
            locked={answered}
            onResolve={(c) => {
              record({ questId: "listening", itemId: q.id, prompt: q.target, correct: c, skill: "listening" });
              if (c) setAnswered(true);
            }}
          >
            {opt}
          </ChoiceButton>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Sentence {i + 1} of {QUESTIONS.length}</p>
    </QuestShell>
  );
}
