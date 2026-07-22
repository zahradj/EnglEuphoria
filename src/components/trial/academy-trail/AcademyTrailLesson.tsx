import { useState } from "react";
import { useLesson } from "./useLesson";
import { HUD } from "./HUD";
import { Confetti } from "./Confetti";
import { WelcomeCard } from "./WelcomeCard";
import { RoadmapCard } from "./RoadmapCard";
import { WarmUp } from "./quests/WarmUp";
import { Vocabulary } from "./quests/Vocabulary";
import { Grammar } from "./quests/Grammar";
import { Reading } from "./quests/Reading";
import { Listening } from "./quests/Listening";
import { Speaking } from "./quests/Speaking";
import { Results } from "./quests/Results";
import { useTrailSync } from "../useTrailSync";

const QUESTS = [
  "warmup",
  "vocab",
  "grammar",
  "reading",
  "listening",
  "speaking",
  "results",
] as const;
const MAX_XP = 250;

type Stage = "welcome" | "roadmap" | "quests";

/**
 * Self-contained Academy Hub 30-minute Trail Lesson.
 * When `roomId` + `role` are supplied, teacher progress is broadcast to
 * the student via Supabase Realtime (useTrailSync).
 */
export function AcademyTrailLesson({
  roomId,
  role,
}: { roomId?: string; role?: "teacher" | "student" } = {}) {
  const [stage, setStage] = useState<Stage>("welcome");
  const lesson = useLesson();
  const current = QUESTS[Math.min(lesson.questIndex, QUESTS.length - 1)];

  const { isFollower } = useTrailSync({
    roomId,
    role,
    hub: "academy",
    state: { stage, questIndex: lesson.questIndex, difficulty: lesson.difficulty },
    onRemote: (s) => {
      if (s.stage && s.stage !== stage) setStage(s.stage);
      if (typeof s.questIndex === "number" && s.questIndex !== lesson.questIndex) {
        lesson.setQuestIndex(s.questIndex);
      }
      if (s.difficulty && s.difficulty !== lesson.difficulty) {
        lesson.setDifficulty(s.difficulty);
      }
    },
  });

  const goBack = () => {
    if (isFollower) return;
    if (stage === "quests") {
      if (lesson.questIndex === 0) setStage("roadmap");
    } else if (stage === "roadmap") {
      setStage("welcome");
    }
  };

  const goNext = () => {
    if (isFollower) return;
    if (stage === "welcome") setStage("roadmap");
    else if (stage === "roadmap") setStage("quests");
    else if (stage === "quests" && current !== "results") lesson.next();
  };

  const canGoBack = !isFollower && !(stage === "welcome");
  const canGoNext = !isFollower && !(stage === "quests" && current === "results");

  // Followers should not advance the local quest via child components.
  const advance = isFollower ? () => {} : lesson.next;

  return (
    <div className="font-display text-foreground pb-24">
      {stage === "welcome" && (
        <WelcomeCard
          onContinue={() => (isFollower ? undefined : setStage("roadmap"))}
          difficulty={lesson.difficulty}
          setDifficulty={isFollower ? () => {} : lesson.setDifficulty}
        />
      )}

      {stage === "roadmap" && (
        <main className="pb-10">
          <RoadmapCard onStart={() => (isFollower ? undefined : setStage("quests"))} />
        </main>
      )}

      {stage === "quests" && (
        <main className="pb-10">
          <HUD
            xp={lesson.xp}
            maxXp={MAX_XP}
            streak={lesson.streak}
            questIndex={lesson.questIndex}
            totalQuests={QUESTS.length - 1}
            difficulty={lesson.difficulty}
            setDifficulty={isFollower ? () => {} : lesson.setDifficulty}
          />
          <Confetti trigger={lesson.confetti} />
          {current === "warmup" && (
            <WarmUp onDone={advance} record={lesson.record} difficulty={lesson.difficulty} />
          )}
          {current === "vocab" && (
            <Vocabulary onDone={advance} record={lesson.record} difficulty={lesson.difficulty} />
          )}
          {current === "grammar" && (
            <Grammar onDone={advance} record={lesson.record} difficulty={lesson.difficulty} />
          )}
          {current === "reading" && (
            <Reading onDone={advance} record={lesson.record} difficulty={lesson.difficulty} />
          )}
          {current === "listening" && (
            <Listening onDone={advance} record={lesson.record} difficulty={lesson.difficulty} />
          )}
          {current === "speaking" && (
            <Speaking onDone={advance} record={lesson.record} difficulty={lesson.difficulty} />
          )}
          {current === "results" && (
            <Results
              answers={lesson.answers}
              xp={lesson.xp}
              difficulty={lesson.difficulty}
              onRestart={() => {
                if (isFollower) return;
                setStage("welcome");
                window.location.reload();
              }}
            />
          )}
        </main>
      )}

      {/* Persistent navigation bar (Academy purple) */}
      <div className="sticky bottom-0 left-0 right-0 z-30 mt-4 flex items-center justify-between gap-3 border-t border-purple-200/60 bg-white/85 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-white px-5 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Back
        </button>
        <div className="text-xs font-medium uppercase tracking-wide text-purple-700/70">
          {isFollower ? "Following teacher · " : ""}
          {stage === "quests" ? `${current}` : stage}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="inline-flex items-center gap-2 rounded-full bg-purple-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default AcademyTrailLesson;
