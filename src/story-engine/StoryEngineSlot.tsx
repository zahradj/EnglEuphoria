import { useMemo, useRef, useState } from 'react';
import type { StoryEngineSlotProps, StoryEvent } from './types';

/**
 * Story Engine slot — renders a StoryGraph as a Choose Your Adventure runner.
 * Deterministic; no AI at render time. Emits per-choice events + summary.
 */
export default function StoryEngineSlot(props: StoryEngineSlotProps) {
  const { graph, onEvent, onComplete } = props;
  const [currentId, setCurrentId] = useState(graph.start_node);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ending, setEnding] = useState<'success' | 'retry' | null>(null);
  const events = useRef<StoryEvent[]>([]);
  const startedAt = useRef<number>(Date.now());
  const nodeStartedAt = useRef<number>(Date.now());

  const node = useMemo(() => graph.nodes[currentId], [graph, currentId]);

  const finish = (kind: 'success' | 'retry') => {
    setEnding(kind);
    onComplete?.({
      correct: events.current.filter((e) => e.correct).length,
      total: events.current.length,
      ms_elapsed: Date.now() - startedAt.current,
      events: events.current,
      ending: kind,
    });
  };

  const choose = (choiceId: string) => {
    const choice = node?.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    const evt: StoryEvent = {
      node_id: currentId,
      choice_id: choiceId,
      correct: choice.correct,
      ms_elapsed: Date.now() - nodeStartedAt.current,
    };
    events.current.push(evt);
    onEvent?.(evt);
    setFeedback(choice.feedback);

    setTimeout(() => {
      setFeedback(null);
      if (choice.next === 'end_success') return finish('success');
      if (choice.next === 'end_retry') return finish('retry');
      nodeStartedAt.current = Date.now();
      setCurrentId(choice.next);
    }, 900);
  };

  if (ending) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center space-y-3">
        <div className="text-4xl">{ending === 'success' ? '🌟' : '💪'}</div>
        <h3 className="text-xl font-semibold">
          {ending === 'success' ? 'Adventure complete!' : 'Great effort — try again!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {events.current.filter((e) => e.correct).length} / {events.current.length} correct choices
        </p>
      </div>
    );
  }

  if (!node) return null;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {node.image_url && (
        <div className="aspect-video bg-muted">
          <img src={node.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6 space-y-4">
        {node.character && (
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{node.character}</div>
        )}
        <p className="text-base leading-relaxed">{node.narration}</p>

        {feedback ? (
          <div className="rounded-xl bg-primary/10 p-4 text-sm">{feedback}</div>
        ) : (
          <div className="grid gap-2">
            {node.choices.map((c) => (
              <button
                key={c.id}
                onClick={() => choose(c.id)}
                className="text-left rounded-xl border bg-background hover:bg-accent px-4 py-3 transition"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
