import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { drawGrammarQuestions, GrammarQuestion } from "@/data/recruitmentGrammarQuestions";
import { toast } from "@/hooks/use-toast";

const TIME_LIMIT_SECONDS = 25 * 60;
const QUESTION_COUNT = 40;

const GrammarTest: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const applicationId = params.get("applicationId") || "";
  const email = params.get("email") || "";

  const questions = useMemo<GrammarQuestion[]>(
    () => drawGrammarQuestions(QUESTION_COUNT, applicationId || undefined),
    [applicationId],
  );

  const storageKey = `grammarTest:${applicationId}`;
  const initial = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Expire after time limit window
      if (parsed?.startedAt && Date.now() - parsed.startedAt > TIME_LIMIT_SECONDS * 1000) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [storageKey]);

  const [answers, setAnswers] = useState<Record<string, number>>(initial?.answers ?? {});
  const [currentIdx, setCurrentIdx] = useState<number>(initial?.currentIdx ?? 0);
  const [startedAt] = useState<number>(initial?.startedAt ?? Date.now());
  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(0, TIME_LIMIT_SECONDS - Math.floor((Date.now() - (initial?.startedAt ?? Date.now())) / 1000)),
  );
  const [submitting, setSubmitting] = useState(false);

  // Persist progress on every change so a refresh doesn't wipe it.
  useEffect(() => {
    if (!applicationId) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers, currentIdx, startedAt }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [answers, currentIdx, startedAt, applicationId, storageKey]);

  useEffect(() => {
    if (!applicationId || !email) {
      toast({
        title: "Invalid test link",
        description: "Please submit your application first.",
        variant: "destructive",
      });
      navigate("/teach-with-us", { replace: true });
    }
  }, [applicationId, email, navigate]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const current = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (idx: number) => {
    setAnswers((a) => ({ ...a, [current.id]: idx }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        applicationId,
        email,
        answers: questions.map((q) => ({
          questionId: q.id,
          selected: answers[q.id] ?? -1,
        })),
      };
      const { data, error } = await supabase.functions.invoke("grade-grammar-test", { body: payload });
      if (error) throw error;
      const params = new URLSearchParams({
        passed: String(data.passed),
        score: String(data.score),
        total: String(data.total),
        percentage: String(data.percentage),
        email,
      });
      if (data.inviteToken) params.set("token", data.inviteToken);
      try { localStorage.removeItem(storageKey); } catch { /* noop */ }
      navigate(`/teach-with-us/grammar-test/result?${params.toString()}`, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Could not submit test", description: msg, variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (!current) return null;

  return (
    <div dir="ltr" lang="en" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4 text-left">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Grammar Proficiency Test</h1>
            <p className="text-sm text-slate-600">
              {QUESTION_COUNT} questions · 25 minutes · 85% to pass
            </p>
          </div>
          <Badge variant="outline" className="text-base px-3 py-1.5 gap-2">
            <Clock className="w-4 h-4" />
            {mm}:{ss}
          </Badge>
        </div>

        <Progress value={(answeredCount / questions.length) * 100} />
        <p className="text-xs text-slate-500 text-right">
          {answeredCount}/{questions.length} answered ({Math.round((answeredCount / questions.length) * 100)}%)
        </p>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg leading-relaxed">
                Q{currentIdx + 1} of {questions.length}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                {current.level} · {current.category}
              </p>
            </div>
            <Badge variant="secondary">{answeredCount}/{questions.length} answered</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-slate-800 font-medium">{current.question}</p>
            <div className="space-y-2">
              {current.options.map((opt, i) => {
                const selected = answers[current.id] === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      selected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          >
            Previous
          </Button>
          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? "Submitting…" : "Submit Test"}
            </Button>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-md p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
          <span>You have one attempt. The test auto-submits when the timer runs out.</span>
        </div>
      </div>
    </div>
  );
};

export default GrammarTest;
