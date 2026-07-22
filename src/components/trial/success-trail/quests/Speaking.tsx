import { useRef, useState } from "react";
import { GhostButton, PrimaryButton, QuestShell } from "../QuestShell";
import { SPEAKING, type Track } from "../levels";
import type { AnswerRecord } from "../useLesson";

export function Speaking({
  onDone,
  record,
  track,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  track: Track;
}) {
  const prompts = SPEAKING[track];
  const [i, setI] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setAudioUrl(null);
    } catch {
      record({ quest: "Speaking", prompt: prompts[i], answer: "(microphone unavailable)" });
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
    record({ quest: "Speaking", prompt: prompts[i], answer: "(spoken response recorded)" });
  };

  const next = () => {
    setAudioUrl(null);
    if (i + 1 < prompts.length) setI(i + 1);
    else onDone();
  };

  return (
    <QuestShell
      emoji="🎤"
      title="Speaking Challenge"
      subtitle={`Prompt ${i + 1} of ${prompts.length}`}
      footer={
        <div className="flex flex-col sm:flex-row gap-3">
          <GhostButton type="button" onClick={onDone}>Skip stop</GhostButton>
          <PrimaryButton onClick={next}>{i + 1 < prompts.length ? "Next prompt →" : "See results →"}</PrimaryButton>
        </div>
      }
    >
      <p className="text-lg sm:text-xl font-display font-semibold text-brand-emerald-deep">
        {prompts[i]}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            onClick={start}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display font-bold text-primary-foreground bg-brand-emerald shadow-md hover:brightness-105"
          >
            🎙️ Start recording
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display font-bold text-destructive-foreground bg-destructive shadow-md animate-pulse"
          >
            ⏹ Stop
          </button>
        )}
        {audioUrl && <audio src={audioUrl} controls className="max-w-full" />}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Recording stays in your browser only.
      </p>
    </QuestShell>
  );
}
