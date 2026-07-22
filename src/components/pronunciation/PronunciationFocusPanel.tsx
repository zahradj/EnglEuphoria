import { CheckCircle2, AlertTriangle, XCircle, Mic } from 'lucide-react';
import type { PronunciationRunResult } from '@/pronunciation';

interface Props {
  result: PronunciationRunResult;
}

export function PronunciationFocusPanel({ result }: Props) {
  const { focus, active_layers, micro_moments, validation } = result;

  if (!active_layers.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        No pronunciation layers active for this lesson.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Mic className="h-4 w-4" /> Pronunciation Focus
        </h3>
        {validation.passed ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Validated
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <XCircle className="h-3.5 w-3.5" /> Issues
          </span>
        )}
      </header>

      <p className="text-sm font-medium text-foreground">{focus.pronunciation_focus}</p>

      <div className="flex flex-wrap gap-1.5">
        {active_layers.map((l) => (
          <span key={l} className="rounded-md bg-muted px-2 py-0.5 text-xs">
            layer: {l}
          </span>
        ))}
      </div>

      {focus.target_sounds.length > 0 && (
        <Row label="Sounds" items={focus.target_sounds} />
      )}
      {focus.stress_patterns.length > 0 && (
        <Row label="Stress" items={focus.stress_patterns} />
      )}
      {focus.intonation_patterns.length > 0 && (
        <Row label="Intonation" items={focus.intonation_patterns} />
      )}
      {focus.connected_speech_targets.length > 0 && (
        <Row label="Connected speech" items={focus.connected_speech_targets} />
      )}

      {micro_moments.length > 0 && (
        <section className="space-y-1 pt-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Micro-moments ({micro_moments.length})
          </h4>
          <ul className="space-y-1 text-xs">
            {micro_moments.map((m) => (
              <li key={m.id} className="flex items-start gap-2">
                <span className="mt-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  slide {m.attached_to_slide_index ?? '?'}
                </span>
                <span className="text-foreground">
                  <strong>{m.trigger_word_or_phrase}</strong> — {m.hint}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <section className="space-y-1 pt-2 text-xs">
          {validation.errors.map((e, i) => (
            <div key={`e${i}`} className="flex items-start gap-2 text-destructive">
              <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{e.message}</span>
            </div>
          ))}
          {validation.warnings.map((w, i) => (
            <div key={`w${i}`} className="flex items-start gap-2 text-amber-600">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{w.message}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function Row({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="text-xs">
      <span className="font-medium text-muted-foreground">{label}: </span>
      <span className="text-foreground">{items.join(' · ')}</span>
    </div>
  );
}
