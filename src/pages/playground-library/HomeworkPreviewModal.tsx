import { X, Ear, ListOrdered, Mic } from 'lucide-react';
import { buildHomeworkContent } from '@/services/sceneLessonCompletionService';
import { getSceneLesson } from '@/content/playground-library/sceneLessonRegistry';
import { getWelcomeTownLesson } from '@/content/playground-library/welcomeTownLessonRegistry';

const WELCOME_TOWN_FORMATS = new Set(['wt-rich', 'wt-a2-rich']);

interface HomeworkPreviewModalProps {
  lessonId: string;
  title: string;
  contentFormat: string;
  unitNumber: number;
  lessonNumber: number;
  onClose: () => void;
}

/**
 * Creator-facing preview of the homework a lesson will auto-generate —
 * same buildHomeworkContent() call the student flow makes on real
 * completion (sceneLessonCompletionService.ts), just run here against the
 * lesson's own scene data ahead of time so a content creator can see what
 * it looks like and judge whether it needs changing, without waiting for
 * a real student to finish the lesson first. Read-only for now — editing
 * comes later if it turns out to be needed.
 */
export function HomeworkPreviewModal({
  lessonId,
  title,
  contentFormat,
  unitNumber,
  lessonNumber,
  onClose,
}: HomeworkPreviewModalProps) {
  const isWelcomeTown = WELCOME_TOWN_FORMATS.has(contentFormat);
  const welcomeTownLesson = isWelcomeTown ? getWelcomeTownLesson(contentFormat, unitNumber, lessonNumber) : null;
  const scenes = isWelcomeTown ? welcomeTownLesson?.scenes ?? null : getSceneLesson(unitNumber, lessonNumber);

  const homework = scenes ? buildHomeworkContent(scenes as any, title, lessonId) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:bg-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 text-white" style={{ background: 'linear-gradient(135deg, #FFB37A 0%, #FE6A2F 55%, #C84810 100%)' }}>
          <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">
            Unit {unitNumber} · Lesson {lessonNumber} — Homework preview
          </span>
          <h2 className="mt-1 text-2xl font-black leading-tight">{title}</h2>
          <p className="mt-2 text-xs leading-relaxed opacity-90">
            This is exactly what gets generated for a student the moment they finish this lesson — pulled
            straight from its own scenes, not written separately.
          </p>
        </div>

        {!homework ? (
          <div className="p-8 text-center">
            <p className="font-bold text-slate-700">No scene data found for this lesson yet.</p>
            <p className="mt-1 text-sm text-slate-500">Homework can't be generated until the lesson itself is built.</p>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Ear className="h-4 w-4 text-[#FE6A2F]" />
                <h3 className="text-sm font-black uppercase tracking-wide text-[#FE6A2F]">
                  1. Recognition — {homework.activity_1_recognition.instructions}
                </h3>
              </div>
              <div className="space-y-2">
                {homework.activity_1_recognition.items.map((item, i) => (
                  <div key={i} className="rounded-xl border-2 border-orange-100 bg-orange-50/50 p-3">
                    <p className="text-sm font-bold text-slate-800">🔊 "{item.audio_text}"</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Correct: <span className="font-bold text-emerald-700">{item.correct_answer}</span>
                      {item.wrong_options.length > 0 && (
                        <> · Distractors: {item.wrong_options.join(', ')}</>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-[#FE6A2F]" />
                <h3 className="text-sm font-black uppercase tracking-wide text-[#FE6A2F]">
                  2. Word order — {homework.activity_2_syntax.instructions}
                </h3>
              </div>
              <div className="space-y-2">
                {homework.activity_2_syntax.items.map((item, i) => (
                  <div key={i} className="rounded-xl border-2 border-orange-100 bg-orange-50/50 p-3">
                    <p className="text-sm text-slate-500">{item.scrambled_words.join(' / ')}</p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">→ {item.correct_order}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#FE6A2F]" />
                <h3 className="text-sm font-black uppercase tracking-wide text-[#FE6A2F]">
                  3. Speaking — {homework.activity_3_production.instructions}
                </h3>
              </div>
              <div className="rounded-xl border-2 border-orange-100 bg-orange-50/50 p-3">
                <p className="text-sm font-bold text-slate-800">"{homework.activity_3_production.prompt}"</p>
                {homework.activity_3_production.target_words_to_detect && homework.activity_3_production.target_words_to_detect.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Listens for: {homework.activity_3_production.target_words_to_detect.join(', ')}
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeworkPreviewModal;
