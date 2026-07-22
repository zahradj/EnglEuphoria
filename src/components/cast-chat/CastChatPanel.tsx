/**
 * CastChatPanel — Reusable Cast Chat Quest UI.
 *
 * Phase 2: Embeddable post-lesson reinforcement chat. Same engine used by the
 * standalone /games/cast-chat-quest page and by in-lesson "Practice with a
 * character" modals. Honors hub tone profiles + Socratic Tutor Contract via the
 * `cast-chat-quest` edge function.
 */
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Mic, Send, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listCastForHub, characterPromptCard } from "@/services/castVault";
import type { CastVaultCharacter } from "@/storybook/types";
import { supabase } from "@/integrations/supabase/client";
import type { Hub } from "@/governance/types";
import { toast } from "sonner";

const HUB_THEME: Record<Hub, { ring: string; bg: string; chip: string; label: string }> = {
  playground: { ring: "ring-orange-400", bg: "from-orange-50 to-yellow-50", chip: "bg-orange-100 text-orange-900", label: "Playground" },
  academy:    { ring: "ring-violet-400", bg: "from-violet-50 to-indigo-50", chip: "bg-violet-100 text-violet-900", label: "Academy" },
  success:    { ring: "ring-emerald-400", bg: "from-emerald-50 to-teal-50", chip: "bg-emerald-100 text-emerald-900", label: "Success" },
};

type Turn = { role: "tutor" | "learner"; text: string };
type AIReply = { reply: string; state: "talking" | "listening" | "celebrating"; score: number; hint?: string; badge?: string };

export interface CastChatPanelProps {
  hub: Hub;
  topic?: string;
  cefr?: string;
  /** Optional vocab to seed the scene (lesson reinforcement use-case). */
  lessonVocab?: string[];
  totalTurns?: number;
  /** When true, drops the outer page padding/gradient so it fits inside a dialog. */
  compact?: boolean;
}

export function CastChatPanel({
  hub,
  topic: topicProp,
  cefr,
  lessonVocab,
  totalTurns = 5,
  compact = false,
}: CastChatPanelProps) {
  const theme = HUB_THEME[hub];
  const resolvedCefr = cefr ?? (hub === "playground" ? "A1" : hub === "academy" ? "B1" : "B2");

  const [cast, setCast] = useState<CastVaultCharacter[]>([]);
  const [chosen, setChosen] = useState<CastVaultCharacter | null>(null);
  const [topic, setTopic] = useState(topicProp || "everyday conversation");
  const [history, setHistory] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"idle" | "listening" | "talking" | "celebrating">("idle");
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState("");
  const [badge, setBadge] = useState("");
  const turnNumber = useMemo(() => history.filter((t) => t.role === "learner").length + 1, [history]);
  const done = turnNumber > totalTurns;

  useEffect(() => {
    const fallback: CastVaultCharacter[] = [
      {
        id: `__default_${hub}`,
        hub,
        name: hub === "playground" ? "Coach Pip" : hub === "academy" ? "Mentor Vee" : "Coach Sol",
        role: "Friendly English coach who roleplays everyday scenes",
        personality_traits: { warm: true, encouraging: true, playful: hub === "playground" },
        visual_blueprint: {} as never,
        voice_id: null,
        avatar_url: null,
        signature_traits: ["patient", "encouraging", "uses simple language"],
        is_shared: true,
        created_by: "system",
      },
    ];
    listCastForHub(hub, { includeShared: true })
      .then((list) => setCast(list && list.length > 0 ? list : fallback))
      .catch(() => setCast(fallback));
  }, [hub]);

  // Auto-select when only one option is available (e.g. fallback Coach) so chat
  // is never empty in the in-lesson reinforcement view.
  useEffect(() => {
    if (compact && cast.length === 1 && !chosen) setChosen(cast[0]);
  }, [compact, cast, chosen]);

  useEffect(() => {
    if (topicProp) setTopic(topicProp);
  }, [topicProp]);

  async function callAI(userMessage: string, turn: number): Promise<AIReply | null> {
    if (!chosen) return null;
    const characterCard = characterPromptCard(chosen);
    const { data, error } = await supabase.functions.invoke("cast-chat-quest", {
      body: {
        characterCard,
        hub,
        cefr: resolvedCefr,
        topic,
        history,
        userMessage,
        turn,
        totalTurns,
        lessonVocab: lessonVocab ?? [],
      },
    });
    if (error) { toast.error("AI hiccup — try again."); return null; }
    return data as AIReply;
  }

  async function startScene() {
    if (!chosen) return;
    setLoading(true); setState("talking");
    const r = await callAI("", 1);
    if (r) {
      setHistory([{ role: "tutor", text: r.reply }]);
      setHint(r.hint || ""); setState(r.state); setBadge(r.badge || "");
    }
    setLoading(false);
  }

  async function send() {
    const text = draft.trim();
    if (!text || loading || done) return;
    setDraft(""); setLoading(true); setState("listening");
    const nextHistory: Turn[] = [...history, { role: "learner", text }];
    setHistory(nextHistory);
    const r = await callAI(text, turnNumber);
    if (r) {
      setHistory([...nextHistory, { role: "tutor", text: r.reply }]);
      setScore((s) => s + (r.score || 0));
      setHint(r.hint || ""); setState(r.state); setBadge(r.badge || "");
      if (turnNumber >= totalTurns) setState("celebrating");
    }
    setLoading(false);
  }

  function reset() {
    setHistory([]); setScore(0); setHint(""); setBadge(""); setState("idle"); setChosen(null);
  }

  const outer = compact
    ? ""
    : `min-h-screen bg-gradient-to-br ${theme.bg} p-4 md:p-8`;

  return (
    <div className={outer}>
      <div className={compact ? "" : "max-w-3xl mx-auto"}>
        <header className="flex items-center justify-between mb-4">
          <div>
            <Badge className={theme.chip}>{theme.label} • Cast Chat Quest</Badge>
            {!compact && (
              <>
                <h1 className="text-3xl font-bold mt-2">🎭 Cast Chat Quest</h1>
                <p className="text-muted-foreground text-sm">
                  Roleplay with a character from your vault. {totalTurns} turns. Be brave!
                </p>
              </>
            )}
            {compact && lessonVocab?.length ? (
              <div className="text-xs text-muted-foreground mt-1">
                Try to use: <b>{lessonVocab.slice(0, 6).join(", ")}</b>
              </div>
            ) : null}
          </div>
          {chosen && <Button variant="outline" size="sm" onClick={reset}>New scene</Button>}
        </header>

        {!chosen && (
          <Card className="p-4 md:p-6">
            <h2 className="font-semibold mb-3">Pick your scene partner</h2>
            {cast.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No characters in the {theme.label} vault yet. Create one in the Cast Vault first.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cast.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setChosen(c)}
                    className={`text-left p-3 rounded-xl border bg-white hover:shadow transition ring-0 hover:${theme.ring} hover:ring-2`}
                  >
                    <div className="aspect-square rounded-lg bg-muted mb-2 overflow-hidden flex items-center justify-center">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{c.role}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Scene topic (e.g. ordering ice cream)"
              />
            </div>
          </Card>
        )}

        {chosen && history.length === 0 && (
          <Card className="p-6 text-center">
            <div className="mb-4 mx-auto w-24 h-24 rounded-full overflow-hidden bg-muted ring-4 ring-offset-2 ring-offset-white">
              {chosen.avatar_url ? (
                <img src={chosen.avatar_url} alt={chosen.name} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="m-auto" />
              )}
            </div>
            <p className="font-semibold">{chosen.name} is ready to play.</p>
            <p className="text-sm text-muted-foreground mb-4">Topic: {topic}</p>
            <Button onClick={startScene} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Start scene
            </Button>
          </Card>
        )}

        {chosen && history.length > 0 && (
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden bg-muted ring-2 ${theme.ring} ${
                    state === "talking" ? "animate-pulse" : ""
                  }`}
                >
                  {chosen.avatar_url ? (
                    <img src={chosen.avatar_url} alt={chosen.name} className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="m-auto" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">{chosen.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{state}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Turn {Math.min(turnNumber, totalTurns)}/{totalTurns}
                </div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {score} pts
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 mb-3">
              {history.map((t, i) => (
                <div key={i} className={`flex ${t.role === "learner" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm ${
                      t.role === "learner" ? "bg-foreground text-background" : "bg-muted"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> thinking…
                </div>
              )}
            </div>

            {hint && !done && (
              <div className={`text-xs px-3 py-2 rounded-lg ${theme.chip} mb-2`}>💡 Try: “{hint}”</div>
            )}

            {!done ? (
              <div className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Your reply…"
                  disabled={loading}
                />
                <Button onClick={send} disabled={loading || !draft.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
                <Button variant="outline" disabled title="Voice coming soon">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-1">🎉 Scene complete!</div>
                <div className="text-sm text-muted-foreground mb-2">
                  You scored <b>{score}</b> points with {chosen.name}.
                </div>
                {badge && <Badge className={theme.chip + " text-base px-3 py-1"}>{badge}</Badge>}
                <div className="mt-4">
                  <Button onClick={reset}>Play again</Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default CastChatPanel;
