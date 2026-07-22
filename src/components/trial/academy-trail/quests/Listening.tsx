import { useState, useRef } from "react";
import { QuestShell, PrimaryButton } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import type { AnswerRecord } from "../useLesson";
import type { Difficulty } from "../levels";
import { supabase } from "@/integrations/supabase/client";

type Q = { id: string; target: string; options: string[] };

const SETS: Record<Difficulty, Q[]> = {
  "pre-a1": [
    { id: "l1", target: "I have a cat.", options: ["I have a cat.", "I have a hat.", "I had a cat."] },
    { id: "l2", target: "It is hot today.", options: ["It is cold today.", "It is hot today.", "It was hot today."] },
    { id: "l3", target: "She is my mom.", options: ["She is my mom.", "He is my mom.", "She is my friend."] },
    { id: "l4", target: "I like apples.", options: ["I like apples.", "I like onions.", "I liked apples."] },
  ],
  standard: [
    { id: "l1", target: "I have three brothers.", options: ["I have three brothers.", "I have three sisters.", "I had three brothers."] },
    { id: "l2", target: "She doesn't like coffee.", options: ["She likes coffee.", "She doesn't like coffee.", "She doesn't like tea."] },
    { id: "l3", target: "We're going to the cinema tonight.", options: ["We went to the cinema tonight.", "We're going to the kitchen tonight.", "We're going to the cinema tonight."] },
    { id: "l4", target: "If I were rich, I would travel the world.", options: ["If I am rich, I travel the world.", "If I were rich, I would travel the world.", "If I were rich, I will travel the world."] },
  ],
  challenge: [
    { id: "l1", target: "I should have called you earlier.", options: ["I should call you earlier.", "I should have called you earlier.", "I shouldn't have called you earlier."] },
    { id: "l2", target: "She's been working here for nearly a decade.", options: ["She works here for nearly a decade.", "She's been working here for nearly a decade.", "She's been working there for nearly a decade."] },
    { id: "l3", target: "Had I known, I would've left sooner.", options: ["Had I know, I would've left sooner.", "If I knew, I will leave sooner.", "Had I known, I would've left sooner."] },
    { id: "l4", target: "The proposal was unanimously approved by the committee.", options: ["The proposal was unanimously approved by the committee.", "The proposal unanimously approved the committee.", "The committee was unanimously approved by the proposal."] },
  ],
};

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
      let b64 = cacheRef.current[q.id];
      if (!b64) {
        const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
          body: { text: q.target },
        });
        if (error) throw error;
        b64 = (data as { audioContent: string }).audioContent;
        cacheRef.current[q.id] = b64;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${b64}`);
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
