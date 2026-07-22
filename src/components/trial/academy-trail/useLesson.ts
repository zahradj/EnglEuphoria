import { useState, useCallback } from "react";
import type { Difficulty } from "./levels";

export type AnswerRecord = {
  questId: string;
  itemId: string;
  prompt: string;
  correct: boolean | "partial";
  skill: "warmup" | "vocab" | "grammar" | "reading" | "listening" | "speaking";
};

export function useLesson() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [questIndex, setQuestIndex] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");

  const record = useCallback((rec: AnswerRecord) => {
    setAnswers((a) => [...a.filter((x) => x.itemId !== rec.itemId), rec]);
    if (rec.correct === true) {
      setXp((x) => x + 10);
      setStreak((s) => {
        const next = s + 1;
        if (next % 3 === 0) setConfetti(Date.now());
        return next;
      });
    } else if (rec.correct === "partial") {
      setXp((x) => x + 5);
      setStreak(0);
    } else {
      setStreak(0);
    }
  }, []);

  const next = useCallback(() => {
    setConfetti(Date.now());
    setQuestIndex((i) => i + 1);
  }, []);

  return { xp, streak, answers, questIndex, setQuestIndex, confetti, difficulty, setDifficulty, record, next, setConfetti };
}
