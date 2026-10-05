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
          <h3 className="ag-title mb-3 text-xl">{slide.title}</h3>
          <p className="ag-prompt whitespace-pre-line text-base leading-relaxed">
            {slide.passage}
          </p>
        </ContextCard>
      );

    case 'listening':
      return (
        <ContextCard icon={<Headphones className="h-4 w-4" />} eyebrow="Transcript">
          <p className="ag-prompt whitespace-pre-line text-base leading-relaxed">
            {slide.transcript}
          </p>
        </ContextCard>
      );

    case 'vocab':
      return (
        <ContextCard icon={<Sparkles className="h-4 w-4" />} eyebrow="Word in focus">
          <div className="ag-title text-4xl">{slide.word}</div>
          <div className="ag-prompt mt-3 text-base">{slide.definition}</div>
          {slide.example && (
            <div className="ag-muted mt-4 border-l-4 border-[#86ecff] pl-3 text-base italic">
              “{slide.example}”
            </div>
          )}
        </ContextCard>
      );

    case 'grammar_pattern':
      return (
        <ContextCard icon={<Target className="h-4 w-4" />} eyebrow="Pattern">
          <h3 className="ag-title mb-3 text-lg">{slide.title}</h3>
          <div className="space-y-1.5">
            {slide.rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr] gap-3 border-b border-white/15 py-2 text-base"
              >
                <div className="ag-prompt">{r.a}</div>
                <div className="font-bold" style={{ color: "#86ecff" }}>{r.b}</div>
              </div>
            ))}
          </div>
          {slide.rule && (
            <div className="ag-muted mt-3 text-sm">{slide.rule}</div>
          )}
        </ContextCard>
      );

    case 'role_play':
      return (
        <ContextCard icon={<Sparkles className="h-4 w-4" />} eyebrow="Scene">
          <h3 className="ag-title mb-3 text-lg">{slide.title}</h3>
          <div className="space-y-2 text-base">
            <div className="ag-prompt py-1">
              <span className="ag-chip">A · </span>
              {slide.lineA}
            </div>
            <div className="ag-prompt py-1">
              <span className="ag-chip">B · </span>
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
    <div className="p-2 md:p-4">
      <div className="ag-chip">
        {blockLabel}
      </div>
      <h2 className="ag-title mt-2 text-3xl">
        {lessonTitle}
      </h2>
      <p className="ag-prompt mt-3 text-base leading-relaxed">
        {BLOCK_HINTS[block]}
      </p>
      <div className="ag-muted mt-6 flex items-center gap-2 text-xs">
        <div className="ag-bar flex-1">
          <i style={{ width: `${((slideIndex + 1) / totalSlides) * 100}%` }} />
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
    <div className="p-2 md:p-4">
      <div className="ag-chip mb-4">
        {icon}
        {eyebrow}
      </div>
      {children}
    </div>
  );
}
