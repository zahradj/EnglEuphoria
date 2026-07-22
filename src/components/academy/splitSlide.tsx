import React from 'react';
import { BookOpen, Headphones, Sparkles, Target } from 'lucide-react';
import type { Slide, Block } from '@/pages/AcademyDemo';

/**
 * Maps an Academy slide to a "static" context panel rendered in the left pane
 * of <AcademyWorkspace>. The interactive slide itself stays on the right.
 *
 * Returns null when there is no meaningful passive context — caller should
 * render a generic Focus panel in that case.
 */
export function staticContextForSlide(slide: Slide): React.ReactNode {
  switch (slide.type) {
    case 'reading_passage':
      return (
        <ContextCard icon={<BookOpen className="h-4 w-4" />} eyebrow="Reading">
          <h3 className="mb-3 text-lg font-semibold text-slate-100">{slide.title}</h3>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-300">
            {slide.passage}
          </p>
        </ContextCard>
      );

    case 'listening':
      return (
        <ContextCard icon={<Headphones className="h-4 w-4" />} eyebrow="Transcript">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-300">
            {slide.transcript}
          </p>
        </ContextCard>
      );

    case 'vocab':
      return (
        <ContextCard icon={<Sparkles className="h-4 w-4" />} eyebrow="Word in focus">
          <div className="text-3xl font-bold tracking-tight text-indigo-300">{slide.word}</div>
          <div className="mt-3 text-sm text-slate-300">{slide.definition}</div>
          {slide.example && (
            <div className="mt-4 rounded-md border-l-2 border-indigo-500/60 bg-slate-900/40 px-3 py-2 text-sm italic text-slate-400">
              “{slide.example}”
            </div>
          )}
        </ContextCard>
      );

    case 'grammar_pattern':
      return (
        <ContextCard icon={<Target className="h-4 w-4" />} eyebrow="Pattern">
          <h3 className="mb-3 text-base font-semibold text-slate-100">{slide.title}</h3>
          <div className="space-y-1.5">
            {slide.rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr] gap-3 rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm"
              >
                <div className="text-slate-300">{r.a}</div>
                <div className="font-medium text-indigo-300">{r.b}</div>
              </div>
            ))}
          </div>
          {slide.rule && (
            <div className="mt-3 text-xs text-slate-400">{slide.rule}</div>
          )}
        </ContextCard>
      );

    case 'role_play':
      return (
        <ContextCard icon={<Sparkles className="h-4 w-4" />} eyebrow="Scene">
          <h3 className="mb-3 text-base font-semibold text-slate-100">{slide.title}</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="rounded-md bg-slate-900/40 px-3 py-2">
              <span className="text-xs uppercase tracking-wide text-indigo-400">A · </span>
              {slide.lineA}
            </div>
            <div className="rounded-md bg-slate-900/40 px-3 py-2">
              <span className="text-xs uppercase tracking-wide text-purple-400">B · </span>
              {slide.lineB}
            </div>
          </div>
        </ContextCard>
      );

    default:
      return null;
  }
}

const BLOCK_HINTS: Record<Block, string> = {
  warmup: 'Loosen up. Get talking. No pressure.',
  vocab: 'Learn the words you need today.',
  reading: 'Understand the text in context.',
  grammar: 'Notice the pattern, then use it.',
  practice: 'Try it. Get it wrong. Try again.',
  interactive: 'Put it together with a partner.',
  speaking: 'Just speak. Bravery beats perfect.',
};

export function FocusPanel({
  lessonTitle,
  blockLabel,
  block,
  slideIndex,
  totalSlides,
}: {
  lessonTitle: string;
  blockLabel: string;
  block: Block;
  slideIndex: number;
  totalSlides: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
        {blockLabel}
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
        {lessonTitle}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        {BLOCK_HINTS[block]}
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-indigo-500"
            style={{ width: `${((slideIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>
        <span className="font-mono tabular-nums">
          {slideIndex + 1}/{totalSlides}
        </span>
      </div>
    </div>
  );
}

function ContextCard({
  icon,
  eyebrow,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
        {icon}
        {eyebrow}
      </div>
      {children}
    </div>
  );
}
