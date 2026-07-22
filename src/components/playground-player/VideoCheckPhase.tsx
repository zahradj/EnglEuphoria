/**
 * VideoCheckPhase — comprehension check after a Video Lesson.
 * Renders either tap-the-picture (3 image thumbs) or yes/no (👍/👎) per
 * question kind. Reads questions from the VideoLessonSpec attached upstream.
 */
import { useState } from "react";
import { Check, X, ThumbsUp, ThumbsDown } from "lucide-react";
import type { VideoQuestion, TapPictureOption } from "@/video/types";

interface Props {
  questions: VideoQuestion[];
  onComplete: () => void;
}

export function VideoCheckPhase({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  if (!questions.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        No comprehension questions available.
      </div>
    );
  }

  const q = questions[index];

  const answer = (choice: number) => {
    const correct = choice === q.correct_index;
    setFeedback(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= questions.length) {
        onComplete();
      } else {
        setIndex((i) => i + 1);
      }
    }, 900);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      <p className="text-center text-lg font-semibold">{q.prompt_text}</p>

      {q.kind === "tap_picture" ? (
        <div className="grid grid-cols-3 gap-4">
          {(q.options as TapPictureOption[]).map((opt, i) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => answer(i)}
              disabled={feedback !== null}
              className="flex aspect-square w-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card p-3 text-sm font-medium transition hover:scale-105 disabled:opacity-60"
            >
              <span className="text-4xl" aria-hidden>
                🖼️
              </span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => answer(0)}
            disabled={feedback !== null}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/90 text-white shadow-lg hover:scale-105 disabled:opacity-60"
            aria-label="Yes"
          >
            <ThumbsUp className="h-10 w-10" />
          </button>
          <button
            type="button"
            onClick={() => answer(1)}
            disabled={feedback !== null}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/90 text-white shadow-lg hover:scale-105 disabled:opacity-60"
            aria-label="No"
          >
            <ThumbsDown className="h-10 w-10" />
          </button>
        </div>
      )}

      {feedback === "correct" && (
        <div className="flex items-center gap-2 text-green-600">
          <Check className="h-6 w-6" /> Nice!
        </div>
      )}
      {feedback === "wrong" && (
        <div className="flex items-center gap-2 text-red-600">
          <X className="h-6 w-6" /> Try the next one.
        </div>
      )}
    </div>
  );
}
