/**
 * Standalone Alphabet Arcade page — /arcade/alphabet
 *
 * Playground-only bonus arcade room. Wraps the in-lesson
 * AlphabetArcadePhase so students can replay letter + phoneme games
 * outside of a scheduled lesson (e.g. when a teacher has extra time).
 *
 * Vocab source: pulled from the student's most recent Playground lesson
 * so games always reinforce the CURRENT curriculum rather than random
 * filler. Falls back to safe CVC set inside the phase component.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlphabetArcadePhase } from "@/components/playground-player/AlphabetArcadePhase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { emitArcadeEvents } from "@/arcade/observer";

export default function AlphabetArcadeStandalone() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vocab, setVocab] = useState<string[]>([]);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [phonicsFocus, setPhonicsFocus] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("curriculum_lessons")
        .select("lesson_number, vocab_words, phonics_focus")
        .eq("hub", "playground")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !data) return;
      const raw = (data as { vocab_words?: unknown }).vocab_words;
      const words = Array.isArray(raw)
        ? raw.map((v) => (typeof v === "string" ? v : (v as { word?: string })?.word)).filter(Boolean) as string[]
        : [];
      setVocab(words);
      setLessonNumber(Number((data as { lesson_number?: number }).lesson_number) || 1);
      setPhonicsFocus((data as { phonics_focus?: string }).phonics_focus);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const key = useMemo(() => `${lessonNumber}-${vocab.join(",")}`, [lessonNumber, vocab]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-orange-50 to-yellow-50 p-4 sm:p-8">
      <div className="mx-auto max-w-[720px] space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/arcade")} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Arcade
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-600">
            <Sparkles className="h-4 w-4" /> Alphabet Arcade
          </div>
        </div>

        <div className="rounded-3xl bg-card p-4 shadow-lg ring-1 ring-orange-200/60 min-h-[520px]">
          {done ? (
            <div className="flex h-[480px] flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-yellow-300 shadow-xl">
                  <span className="text-6xl">🅰️</span>
                </div>
                <span className="absolute -bottom-2 -right-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow-md">
                  NEW!
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Alphabet Ace sticker unlocked!</h2>
              <p className="text-muted-foreground">You practiced letters, sounds and rhymes.</p>
              <div className="flex gap-2">
                <Button onClick={() => setDone(false)}>Play again</Button>
                <Button variant="outline" onClick={() => navigate("/arcade")}>
                  Back to Arcade
                </Button>
              </div>
            </div>
          ) : (
            <AlphabetArcadePhase
              key={key}
              lessonNumber={lessonNumber}
              vocab={vocab}
              phonicsFocus={phonicsFocus}
              onComplete={() => {
                setDone(true);
                if (user?.id) {
                  emitArcadeEvents([
                    {
                      type: "arcade_completed",
                      studentId: user.id,
                      hub: "playground",
                      payload: {
                        game_id: "alphabet_arcade",
                        lesson_number: lessonNumber,
                        phonics_focus: phonicsFocus ?? null,
                        vocab_count: vocab.length,
                        sticker_awarded: "alphabet_ace",
                        xp: 25,
                      },
                    },
                  ]);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
