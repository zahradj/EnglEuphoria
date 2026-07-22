import { useRef, useState } from "react";
import { GhostButton, PrimaryButton, QuestShell } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import { LISTENING, type Track } from "../levels";
import type { AnswerRecord } from "../useLesson";
import { supabase } from "@/integrations/supabase/client";

export function Listening({
  onDone,
  record,
  track,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  track: Track;
}) {
  const item = LISTENING[track];
  const [picked, setPicked] = useState<string | null>(null);
  const [played, setPlayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = async () => {
    try {
      if (audioRef.current && audioUrlRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setPlayed(true);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
        body: { text: item.script },
      });
      if (error) throw error;
      const blob =
        data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      await audio.play();
      setPlayed(true);
    } catch (e) {
      console.error("ElevenLabs TTS failed, falling back to browser TTS", e);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(item.script);
        u.rate = 0.95;
        u.lang = "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        setPlayed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const pick = (o: string) => {
    if (picked) return;
    setPicked(o);
    const correct = o === item.answer;
    record({ quest: "Listening", prompt: item.question, answer: o, correct });
  };

  return (
    <QuestShell
      emoji="🎧"
      title="Listening Lab"
      subtitle="Tap play, listen, then choose the right answer."
      footer={
        <PrimaryButton disabled={!picked} onClick={onDone}>
          Continue →
        </PrimaryButton>
      }
    >
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={play}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display font-bold text-primary-foreground bg-brand-emerald shadow-md hover:brightness-105 disabled:opacity-60"
        >
          {loading ? "Loading…" : played ? "🔁 Play again" : "▶️ Play audio"}
        </button>
        <GhostButton type="button" onClick={() => setShowScript((s) => !s)}>
          {showScript ? "Hide script" : "Show script"}
        </GhostButton>
      </div>
      {showScript && (
        <p className="rounded-2xl bg-secondary/50 border-2 border-border p-4 text-sm text-muted-foreground italic mb-4">
          “{item.script}”
        </p>
      )}
      <p className="font-display font-bold text-brand-emerald-deep">{item.question}</p>
      <div className="grid gap-2 mt-3">
        {item.options.map((o) => {
          const state =
            picked == null
              ? "idle"
              : o === item.answer
              ? "correct"
              : o === picked
              ? "wrong"
              : "idle";
          return (
            <ChoiceButton key={o} state={state} onClick={() => pick(o)}>
              {o}
            </ChoiceButton>
          );
        })}
      </div>
    </QuestShell>
  );
}
