import React from 'react';
import { Pen } from 'lucide-react';
import { GrammarMarkup } from '../grammarMarkup';

interface EditorialGrammarProps {
  slide: any;
}

/**
 * Whitelist sanitizer: keeps only color-coding spans the AI is allowed to emit.
 * Allowed: <span class="text-blue-600 font-bold">…</span>
 *          <span class="text-red-600 font-bold">…</span>
 *          <span class="text-green-600 font-bold">…</span>
 * Everything else is escaped so no arbitrary HTML can render.
 */
function sanitizeGrammarHtml(input: string): string {
  if (!input) return '';
  const PLACEHOLDER_OPEN = '\u0001';
  const PLACEHOLDER_CLOSE = '\u0002';

  // 1. Replace allowed <span> tags with placeholders.
  const allowedClasses = new Set([
    'text-blue-600 font-bold',
    'text-red-600 font-bold',
    'text-green-600 font-bold',
  ]);
  const colorMap: Record<string, string> = {
    'text-blue-600 font-bold': 'B',
    'text-red-600 font-bold': 'R',
    'text-green-600 font-bold': 'G',
  };

  let working = input.replace(
    /<span\s+(?:class|className)=["']([^"']+)["']\s*>/gi,
    (_m, cls: string) => {
      const norm = cls.trim();
      if (allowedClasses.has(norm)) return `${PLACEHOLDER_OPEN}${colorMap[norm]}${PLACEHOLDER_OPEN}`;
      return '';
    },
  );
  working = working.replace(/<\/span>/gi, PLACEHOLDER_CLOSE);

  // 2. Escape every remaining HTML character.
  const escaped = working
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Re-inject the safe spans.
  return escaped
    .replace(new RegExp(`${PLACEHOLDER_OPEN}B${PLACEHOLDER_OPEN}`, 'g'), '<span class="text-blue-600 font-bold">')
    .replace(new RegExp(`${PLACEHOLDER_OPEN}R${PLACEHOLDER_OPEN}`, 'g'), '<span class="text-red-600 font-bold">')
    .replace(new RegExp(`${PLACEHOLDER_OPEN}G${PLACEHOLDER_OPEN}`, 'g'), '<span class="text-green-600 font-bold">')
    .replace(new RegExp(PLACEHOLDER_CLOSE, 'g'), '</span>');
}

const HAS_GRAMMAR_TAGS = /<\s*(verb|noun|adjective|adj|target)\s*>/i;
const SafeHtml: React.FC<{ html: string; className?: string }> = ({ html, className }) => {
  if (HAS_GRAMMAR_TAGS.test(html || '')) {
    return <GrammarMarkup text={html} className={className} />;
  }
  return <span className={className} dangerouslySetInnerHTML={{ __html: sanitizeGrammarHtml(html) }} />;
};

export default function EditorialGrammar({ slide }: EditorialGrammarProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const ruleText = payload.rule_text || payload.rule || payload.pattern || '';
  const formula = payload.formula || '';
  const commonSignals = payload.common_signals || '';
  const examplesRaw: any[] = Array.isArray(payload.examples) ? payload.examples
    : Array.isArray(payload.sample_sentences) ? payload.sample_sentences
    : [];
  const examples: string[] = examplesRaw
    .map((ex) => (typeof ex === 'string' ? ex : ex?.text || ex?.sentence || ''))
    .filter(Boolean);
  const explanation = payload.explanation || slide?.description || '';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-start gap-3">
        <Pen className="w-8 h-8 text-violet-500 mt-1 flex-shrink-0" />
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
          {slide.title || 'Grammar Focus'}
        </h2>
      </div>

      {/* Sentence Formula (highlighted) */}
      {formula && (
        <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-3">Formula</p>
          <SafeHtml
            html={formula}
            className="block font-mono text-xl md:text-2xl text-slate-800 leading-relaxed"
          />
        </div>
      )}

      {/* Rule */}
      {ruleText && (
        <div className="bg-slate-50 rounded-xl p-6 md:p-8 border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Rule</p>
          <SafeHtml
            html={ruleText}
            className="block text-base md:text-lg text-slate-800 leading-relaxed whitespace-pre-wrap"
          />
        </div>
      )}

      {explanation && (
        <SafeHtml
          html={explanation}
          className="block text-lg text-slate-600 leading-relaxed whitespace-pre-line"
        />
      )}

      {/* Common Signals */}
      {commonSignals && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm font-semibold text-amber-700 mb-1">Common Signals</p>
          <SafeHtml html={commonSignals} className="block text-sm text-amber-800" />
        </div>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Examples</p>
          {examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl bg-white border border-slate-200 px-5 py-4 shadow-sm"
            >
              <SafeHtml html={ex} className="block text-lg md:text-xl text-slate-800 leading-relaxed" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
