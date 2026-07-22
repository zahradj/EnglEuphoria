import React from 'react';
import { Rocket, BookOpen, Sparkles } from 'lucide-react';
import {
  NOVAKID_LEVELS_ORDERED,
  NOVAKID_SPEAKING_COURSE,
  type NovakidLevel,
} from '@/data/novakidLevels';

/**
 * Novakid-style "Levels and Courses" reference panel.
 * Renders L0–L4 as a stepped row of cards plus a Speaking Courses sidecar.
 * Flat 2.0 — no shadows on cards beyond a soft elevation; hub-themed accents.
 */

const HUB_ACCENT: Record<NovakidLevel['hub'], { header: string; badge: string; border: string; chip: string }> = {
  playground: {
    header: 'bg-amber-500 text-white',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200',
    border: 'border-amber-300/70 dark:border-amber-700/50',
    chip: 'bg-amber-400 text-amber-950',
  },
  academy: {
    header: 'bg-indigo-600 text-white',
    badge: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200',
    border: 'border-indigo-300/70 dark:border-indigo-700/50',
    chip: 'bg-indigo-500 text-white',
  },
};

const READING_BANNER: Record<NovakidLevel['reading'], string> = {
  none: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  learning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  reading: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  confident: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
};

function ageLabel(level: NovakidLevel): string {
  if (level.ageMax) return `${level.ageMin}–${level.ageMax} y.o.`;
  return `${level.ageMin}+ y.o.`;
}

function LevelCard({ level, lift }: { level: NovakidLevel; lift: number }) {
  const accent = HUB_ACCENT[level.hub];
  return (
    <article
      className={`relative flex flex-col rounded-2xl border ${accent.border} bg-card overflow-hidden`}
      style={{ marginTop: `${lift}px` }}
      aria-label={`${level.label}, ${level.subtitle}`}
    >
      <header className="px-4 pt-4 pb-3 text-center">
        <h3 className="text-lg font-bold text-foreground">{level.label}</h3>
        <p className="text-xs text-muted-foreground italic mt-0.5">{level.subtitle}</p>
      </header>
      <div className={`${accent.header} text-center py-2 text-sm font-semibold`}>
        {ageLabel(level)}
      </div>

      <div className="flex-1 p-4 space-y-3 text-sm">
        <p>
          <span className="font-semibold">Reading: </span>
          <span className="text-muted-foreground">{level.readingLabel}</span>
        </p>

        {level.grammar.length > 0 && (
          <div>
            <p className="font-semibold mb-1">Grammar:</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              {level.grammar.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        )}

        {level.vocabulary.length > 0 && (
          <p>
            <span className="font-semibold">Vocabulary: </span>
            <span className="text-muted-foreground">{level.vocabulary.join(', ')}</span>
          </p>
        )}

        <p>
          <span className="font-semibold">Speaking: </span>
          <span className="text-muted-foreground">{level.speaking}</span>
        </p>
      </div>

      <footer className={`text-center text-xs font-bold py-2 ${READING_BANNER[level.reading]}`}>
        {level.reading === 'none' && 'No reading'}
        {level.reading === 'learning' && 'Learning to read'}
        {level.reading === 'reading' && 'Reading'}
        {level.reading === 'confident' && 'Confident reader'}
      </footer>
    </article>
  );
}

function SpeakingCard() {
  const level = NOVAKID_SPEAKING_COURSE;
  return (
    <article className="rounded-2xl border border-amber-300/70 dark:border-amber-700/50 bg-amber-50/60 dark:bg-amber-950/20 overflow-hidden">
      <header className="px-4 pt-4 pb-2 text-center">
        <h3 className="text-lg font-bold inline-flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-amber-600" aria-hidden />
          {level.label}
        </h3>
      </header>
      <div className="bg-indigo-600 text-white text-center py-2 text-sm font-semibold">
        {ageLabel(level)}
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div>
          <p className="font-semibold">Time2Talk:</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            <li>Focus on speaking</li>
            <li>A wide variety of grammar constructions</li>
            <li>Recommended after at least half of Level 3 or 4</li>
            <li>Can be done alongside the general course</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Virtual Explorer:</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            <li>Level B1+</li>
            <li>Good knowledge of vocabulary and grammar</li>
            <li>Better suited for older kids</li>
            <li>Recommended after Level 4, or for students older than 10 y.o. fluent in English</li>
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function LevelsAndCourses() {
  // Stepped lift (px) for L0 → L4 to mimic the Novakid staircase.
  const lifts = [120, 90, 60, 30, 0];

  return (
    <section
      aria-label="Levels and courses"
      className="rounded-3xl border border-border bg-card p-6 md:p-8"
    >
      <header className="flex items-center gap-3 mb-6">
        <Rocket className="w-7 h-7 text-indigo-600" aria-hidden />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Levels and courses</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {NOVAKID_LEVELS_ORDERED.map((level, i) => (
            <LevelCard key={level.id} level={level} lift={lifts[i] ?? 0} />
          ))}
        </div>
        <div className="md:col-span-1">
          <SpeakingCard />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        <div className="rounded-xl bg-amber-400 text-amber-950 font-bold text-center py-2 text-sm">
          No prior knowledge needed
        </div>
        <div className="rounded-xl bg-amber-400 text-amber-950 font-bold text-center py-2 text-sm">
          +CLIL lessons are included
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground inline-flex items-start gap-2">
        <BookOpen className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
        <span>
          <span className="text-foreground font-semibold">*Students who are fluent but can’t read</span>{' '}
          should be placed at <span className="font-semibold">Level 0 or 1</span> based on their age.
        </span>
      </p>
    </section>
  );
}
