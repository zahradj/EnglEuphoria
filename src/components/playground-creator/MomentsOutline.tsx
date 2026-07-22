/**
 * MomentsOutline — read-only projection of the current deck into the
 * Lesson → Moments → Scenes hierarchy.
 *
 * Persistence still flows through Slide[] (out-of-scope to migrate), but the
 * creator chrome now speaks the moment-first vocabulary mandated by the
 * runtime contract. No "slide" or "page" wording is rendered here.
 */
import { useMemo } from 'react';
import type { Slide } from '@/pages/PlaygroundDemo';
import { slidesToLesson } from '@/game-runtime/bridge';
import { MOMENT_LABELS, type LessonMoment, type MomentKind } from '@/game-runtime';

interface Props {
  slides: Slide[];
  title: string;
  selectedSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

const MOMENT_TONE: Record<MomentKind, string> = {
  intro_moment: 'bg-amber-100 text-amber-800 border-amber-300',
  discovery_moment: 'bg-sky-100 text-sky-800 border-sky-300',
  practice_moment: 'bg-violet-100 text-violet-800 border-violet-300',
  challenge_moment: 'bg-rose-100 text-rose-800 border-rose-300',
  story_moment: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  reward_moment: 'bg-orange-100 text-orange-800 border-orange-300',
};

const SCENE_EMOJI: Record<string, string> = {
  IntroScene: '👋',
  PhonicsScene: '🔊',
  VocabScene: '🃏',
  QuizScene: '❓',
  DragScene: '🖱️',
  MatchScene: '🔗',
  FillBlankScene: '✏️',
  StoryScene: '📖',
  EndScene: '🏆',
};

export function MomentsOutline({ slides, title, selectedSlideIndex, onSelectSlide }: Props) {
  // Re-derive the moment grouping any time slides change. Pure projection.
  const { moments, sceneToSlide } = useMemo(() => {
    const { lesson } = slidesToLesson(slides, { id: 'preview', title });
    // Map each *playable* slide (in order) to its slide index. Skipped slides
    // are absent; synthesized intro/reward blocks have no slide and map to -1.
    const playableSlideIndices: number[] = [];
    slides.forEach((s, i) => {
      const t = (s as any).type;
      const PLAYABLE = new Set([
        'intro', 'phonics_focus', 'vocab_solo', 'multiple', 'truefalse',
        'fill', 'drag', 'match', 'storybook', 'lesson_summary',
      ]);
      if (PLAYABLE.has(t)) playableSlideIndices.push(i);
    });
    // Walk the compiled blocks; the bridge prepends an intro (no slide) if
    // the first playable slide isn't an intro, and always appends a summary.
    const blocks = lesson.moments.flatMap((m: LessonMoment) => m.blocks);
    const map: number[] = [];
    let cursor = 0;
    blocks.forEach((b, bi) => {
      const isLeadingSynthIntro =
        bi === 0 && b.type === 'intro' &&
        (playableSlideIndices.length === 0 || (slides[playableSlideIndices[0]] as any).type !== 'intro');
      const isTrailingSynthSummary =
        bi === blocks.length - 1 && b.type === 'lesson_summary' &&
        (playableSlideIndices.length === 0 ||
          (slides[playableSlideIndices[playableSlideIndices.length - 1]] as any).type !== 'lesson_summary');
      if (isLeadingSynthIntro || isTrailingSynthSummary) {
        map.push(-1);
      } else {
        map.push(playableSlideIndices[cursor] ?? -1);
        cursor += 1;
      }
    });
    return { moments: lesson.moments, sceneToSlide: map };
  }, [slides, title]);

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-orange-200 p-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wide">Moments · Scenes</h3>
        <span className="text-[10px] font-bold text-slate-500">
          {moments.length} moment{moments.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {moments.map((m, mi) => {
          const tone = MOMENT_TONE[m.kind];
          let sceneCursor = 0;
          // sum of scenes before this moment for global indexing into sceneToSlide
          for (let k = 0; k < mi; k++) sceneCursor += moments[k].blocks.length;
          return (
            <div key={m.id} className={`rounded-xl border ${tone} p-2`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {mi + 1}. {MOMENT_LABELS[m.kind]}
                </span>
                <span className="text-[10px] opacity-70">{m.blocks.length} scene{m.blocks.length === 1 ? '' : 's'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {m.blocks.map((b, si) => {
                  const sceneGlobalIdx = sceneCursor + si;
                  const slideIdx = sceneToSlide[sceneGlobalIdx];
                  const sceneKind = SCENE_EMOJI[
                    ({
                      intro: 'IntroScene', phonics_focus: 'PhonicsScene', vocab_solo: 'VocabScene',
                      multiple_choice: 'QuizScene', drag_and_drop: 'DragScene', match: 'MatchScene',
                      fill_in_blank: 'FillBlankScene', storybook: 'StoryScene', lesson_summary: 'EndScene',
                    } as Record<string, string>)[b.type]
                  ] ?? '•';
                  const active = slideIdx === selectedSlideIndex;
                  return (
                    <button
                      key={si}
                      type="button"
                      disabled={slideIdx < 0}
                      onClick={() => slideIdx >= 0 && onSelectSlide(slideIdx)}
                      className={`text-[11px] font-semibold rounded-md px-2 py-1 border transition active:scale-95 ${
                        active
                          ? 'bg-white ring-2 ring-orange-500 border-orange-500'
                          : 'bg-white/70 border-white hover:bg-white'
                      } ${slideIdx < 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={slideIdx < 0 ? 'Auto-added by the engine' : `Scene ${sceneGlobalIdx + 1}`}
                    >
                      <span className="mr-1">{sceneKind}</span>
                      {sceneGlobalIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-2 px-1 leading-snug">
        Moments shape the pacing students feel — Welcome → Discovery → Challenge → Practice → Story → Reward.
      </p>
    </div>
  );
}
