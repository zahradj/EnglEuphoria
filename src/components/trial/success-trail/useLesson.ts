import { useState, useCallback } from "react";
import type { Difficulty, Track } from "./levels";

export type AnswerRecord = {
  quest: string;
  prompt: string;
  answer: string;
  correct?: boolean;
};

export function useLesson() {
  const [track, setTrack] = useState<Track>("professionals");
  const [difficulty, setDifficulty] = useState<Difficulty>("B1");
  const [questIndex, setQuestIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [confetti, setConfetti] = useState(0);

  const record = useCallback((r: AnswerRecord) => {
    setAnswers((prev) => [...prev, r]);
    if (r.correct) {
      setXp((x) => x + 25);
      setStreak((s) => s + 1);
      setConfetti((c) => c + 1);
    } else if (r.correct === false) {
      setStreak(0);
      setXp((x) => x + 5);
    } else {
      setXp((x) => x + 15);
    }
  }, []);

  const next = useCallback(() => {
    setQuestIndex((i) => i + 1);
  }, []);

  const prev = useCallback(() => {
    setQuestIndex((i) => Math.max(0, i - 1));
  }, []);

  return {
    track,
    setTrack,
    difficulty,
    setDifficulty,
    questIndex,
    setQuestIndex,
    xp,
    streak,
    answers,
    confetti,
    record,
    next,
    prev,
  };
}
