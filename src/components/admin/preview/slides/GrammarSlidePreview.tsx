import React from 'react';
import { Lightbulb, AlertTriangle, BookOpen, Sparkles, HelpCircle, Wand2 } from 'lucide-react';

/**
 * Color-coding roles for grammar parts.
 * Inline tags supported in `pattern` / `examples` / `rule`:
 *   [verb]play[/verb][ending]ed[/ending]
 *   [adj]tall[/adj][suffix]er[/suffix] [conn]than[/conn]
 *   [aux]did[/aux] [subj]she[/subj] [time]yesterday[/time]
 */
type Role = 'verb' | 'ending' | 'adj' | 'suffix' | 'aux' | 'subj' | 'obj' | 'conn' | 'time' | 'noun';

const ROLE_STYLES: Record<Role, string> = {
  verb:   'text-rose-600 dark:text-rose-400 font-semibold',
  ending: 'text-emerald-600 dark:text-emerald-400 font-semibold',
  adj:    'text-violet-600 dark:text-violet-400 font-semibold',
  suffix: 'text-emerald-600 dark:text-emerald-400 font-semibold',
  aux:    'text-sky-600 dark:text-sky-400 font-semibold',
  subj:   'text-amber-600 dark:text-amber-400 font-semibold',
  obj:    'text-fuchsia-600 dark:text-fuchsia-400 font-semibold',
  conn:   'text-slate-500 dark:text-slate-400 italic',
  time:   'text-cyan-600 dark:text-cyan-400 font-semibold',
  noun:   'text-indigo-600 dark:text-indigo-400 font-semibold',
};

const ROLE_LABELS: Record<Role, string> = {
  verb: 'verb', ending: 'ending', adj: 'adjective', suffix: 'suffix',
  aux: 'helper', subj: 'subject', obj: 'object', conn: 'connector',
  time: 'time word', noun: 'noun',
};

const TAG_RE = /\[(verb|ending|adj|suffix|aux|subj|obj|conn|time|noun)\]([\s\S]*?)\[\/\1\]/g;

/** Render text with [role]...[/role] tags as colored spans. */
function Colored({ text }: { text: string }) {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const role = m[1] as Role;
    parts.push(
      <span key={parts.length} className={ROLE_STYLES[role]}>
        {m[2]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}</>;
}

/** Roles actually present in any of the content strings (for legend). */
function rolesUsed(strings: (string | undefined)[]): Role[] {
  const set = new Set<Role>();
  for (const s of strings) {
    if (!s) continue;
    TAG_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = TAG_RE.exec(s)) !== null) set.add(m[1] as Role);
  }
  return Array.from(set);
}

interface GrammarSlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      rule?: string;
      pattern?: string;
      examples?: string[];
      commonMistakes?: string[];
      explanation?: string;
      whenToUse?: string;
      quickTip?: string;
    };
  };
}

/**
 * Student-facing grammar card.
 * Cards are intentionally simple, visual, and labeled in plain language
 * ("What it means", "When to use it", "How to build it", "Try it like this")
 * so learners can recognize and remember the rule at a glance.
 */
export function GrammarSlidePreview({ slide }: GrammarSlidePreviewProps) {
  const {
    rule,
    pattern,
    examples,
    commonMistakes,
    explanation,
    whenToUse,
    quickTip,
  } = slide.content || {};

  const legend = rolesUsed([rule, pattern, ...(examples ?? []), ...(commonMistakes ?? [])]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Grammar focus
          </p>
          <h2 className="text-2xl font-bold leading-tight text-foreground">
            {slide.title || 'Grammar Focus'}
          </h2>
        </div>
      </div>

      {/* Color legend */}
      {legend.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Color key
          </span>
          {legend.map((r) => (
            <span key={r} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${ROLE_STYLES[r].replace(/text-/g, 'bg-').split(' ')[0]}`} />
              <span className={ROLE_STYLES[r]}>{ROLE_LABELS[r]}</span>
            </span>
          ))}
        </div>
      )}

      {/* What it means — the rule in one sentence */}
      {rule && (
        <Card
          icon={<BookOpen className="h-4 w-4" />}
          eyebrow="What it means"
          tone="primary"
        >
          <p className="text-lg font-medium leading-snug text-foreground"><Colored text={rule} /></p>
          {explanation && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {explanation}
            </p>
          )}
        </Card>
      )}

      {/* When to use it */}
      {whenToUse && (
        <Card
          icon={<HelpCircle className="h-4 w-4" />}
          eyebrow="When to use it"
          tone="info"
        >
          <p className="text-base leading-relaxed text-foreground">{whenToUse}</p>
        </Card>
      )}

      {/* How to build it — the pattern */}
      {pattern && (
        <Card
          icon={<Wand2 className="h-4 w-4" />}
          eyebrow="How to build it"
          tone="muted"
        >
          <div className="flex flex-wrap items-center gap-2">
            {pattern.split('+').map((part, i, arr) => (
              <React.Fragment key={i}>
                <code className="rounded-lg bg-background border border-border px-3 py-1.5 font-mono text-base">
                  <Colored text={part.trim()} />
                </code>
                {i < arr.length - 1 && (
                  <span className="text-lg font-bold text-muted-foreground">+</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      )}

      {/* Try it like this — examples */}
      {examples && examples.length > 0 && (
        <Card
          icon={<Sparkles className="h-4 w-4" />}
          eyebrow="Try it like this"
          tone="success"
        >
          <ul className="space-y-2">
            {examples.map((example, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-lg bg-background/60 px-3 py-2 text-foreground"
              >
                <span className="mt-0.5 font-bold text-emerald-600">✓</span>
                <span className="leading-relaxed"><Colored text={example} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Watch out for — common mistakes */}
      {commonMistakes && commonMistakes.length > 0 && (
        <Card
          icon={<AlertTriangle className="h-4 w-4" />}
          eyebrow="Watch out for"
          tone="warning"
        >
          <ul className="space-y-2">
            {commonMistakes.map((mistake, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-lg bg-background/60 px-3 py-2 text-foreground"
              >
                <span className="mt-0.5 font-bold text-rose-600">✗</span>
                <span className="leading-relaxed"><Colored text={mistake} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Quick tip — a memorable shortcut */}
      {quickTip && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-900/20">
          <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Quick tip
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
              {quickTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type Tone = 'primary' | 'info' | 'muted' | 'success' | 'warning';

const TONE_STYLES: Record<Tone, { wrap: string; eyebrow: string }> = {
  primary: {
    wrap: 'bg-primary/5 border-primary/30',
    eyebrow: 'text-primary',
  },
  info: {
    wrap: 'bg-sky-500/5 border-sky-500/30 dark:bg-sky-500/10',
    eyebrow: 'text-sky-700 dark:text-sky-300',
  },
  muted: {
    wrap: 'bg-muted border-border',
    eyebrow: 'text-muted-foreground',
  },
  success: {
    wrap: 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10',
    eyebrow: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    wrap: 'bg-rose-500/5 border-rose-500/30 dark:bg-rose-500/10',
    eyebrow: 'text-rose-700 dark:text-rose-300',
  },
};

function Card({
  icon,
  eyebrow,
  tone,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  tone: Tone;
  children: React.ReactNode;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <div className={`rounded-xl border p-5 ${styles.wrap}`}>
      <div
        className={`mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles.eyebrow}`}
      >
        {icon}
        {eyebrow}
      </div>
      {children}
    </div>
  );
}
