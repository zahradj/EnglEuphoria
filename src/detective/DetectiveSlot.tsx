import { useMemo, useRef, useState } from 'react';
import type { DetectiveEvent, DetectiveSlotProps } from './types';

export default function DetectiveSlot(props: DetectiveSlotProps) {
  const { case: kase, onEvent, onComplete } = props;
  const [asked, setAsked] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Array<{ suspect: string; clue: string }>>([]);
  const [phase, setPhase] = useState<'investigate' | 'accuse' | 'done'>('investigate');
  const [outcome, setOutcome] = useState<'win' | 'lose' | null>(null);
  const events = useRef<DetectiveEvent[]>([]);
  const startedAt = useRef(Date.now());

  const budgetLeft = kase.question_budget - asked.size;
  const culprit = useMemo(() => kase.suspects.find((s) => s.is_culprit)!, [kase]);

  const ask = (qId: string) => {
    if (asked.has(qId) || budgetLeft <= 0) return;
    const q = kase.question_pool.find((x) => x.id === qId);
    if (!q) return;
    const suspect = kase.suspects.find((s) => s.id === q.suspect_id);
    const next = new Set(asked); next.add(qId);
    setAsked(next);
    setRevealed((r) => [...r, { suspect: suspect?.name ?? '?', clue: q.reveals }]);
    const evt: DetectiveEvent = { type: 'ask', payload: { question_id: qId }, ms_elapsed: Date.now() - startedAt.current };
    events.current.push(evt);
    onEvent?.(evt);
    if (next.size >= kase.question_budget) setPhase('accuse');
  };

  const accuse = (suspectId: string) => {
    const correct = suspectId === culprit.id;
    const evt: DetectiveEvent = { type: 'accuse', payload: { suspect_id: suspectId, correct }, ms_elapsed: Date.now() - startedAt.current };
    events.current.push(evt);
    onEvent?.(evt);
    setOutcome(correct ? 'win' : 'lose');
    setPhase('done');
    onComplete?.({
      solved: correct,
      questions_used: asked.size,
      ms_elapsed: Date.now() - startedAt.current,
      events: events.current,
    });
  };

  if (phase === 'done' && outcome) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center space-y-3">
        <div className="text-4xl">{outcome === 'win' ? '🕵️' : '🔍'}</div>
        <h3 className="text-xl font-semibold">
          {outcome === 'win' ? 'Case closed!' : 'The trail went cold.'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {outcome === 'win' ? kase.epilogue.win : kase.epilogue.lose}
        </p>
        <p className="text-xs text-muted-foreground">Culprit: {culprit.name} — {culprit.role}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {kase.setting_image_url && (
        <div className="aspect-video bg-muted">
          <img src={kase.setting_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <span>{kase.title}</span>
          <span>Questions left: {Math.max(0, budgetLeft)}</span>
        </div>
        <p className="text-sm leading-relaxed">{kase.briefing}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {kase.suspects.map((s) => (
            <button
              key={s.id}
              disabled={phase !== 'accuse'}
              onClick={() => phase === 'accuse' && accuse(s.id)}
              className={`rounded-xl border p-3 text-left transition ${
                phase === 'accuse' ? 'hover:bg-destructive/10 hover:border-destructive' : 'opacity-90'
              }`}
            >
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.role}</div>
            </button>
          ))}
        </div>

        {phase === 'investigate' && (
          <div>
            <div className="text-xs font-medium mb-2 text-muted-foreground">Ask a question:</div>
            <div className="grid gap-2">
              {kase.question_pool.filter((q) => !asked.has(q.id)).map((q) => (
                <button
                  key={q.id}
                  onClick={() => ask(q.id)}
                  className="text-left rounded-xl border bg-background hover:bg-accent px-4 py-3 text-sm"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'accuse' && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-center">
            🚨 Out of questions — pick a suspect above to accuse.
          </div>
        )}

        {revealed.length > 0 && (
          <div className="rounded-xl bg-muted/50 p-3 space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Clues gathered</div>
            {revealed.map((r, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{r.suspect}:</span> {r.clue}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
