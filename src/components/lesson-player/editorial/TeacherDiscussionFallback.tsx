import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useSlideHub } from '../SlideHubContext';

export default function TeacherDiscussionFallback({ slide }: { slide: any }) {
  const { accent, accentSoft } = useSlideHub();
  const topic =
    slide?.topic ||
    slide?.title ||
    slide?.lesson_topic ||
    'today\'s topic';
  const teacherScript = slide?.teacher_script;

  const prompts = [
    `What do you already know about ${topic}?`,
    `Have you ever experienced something like this in your own life?`,
    `How would you explain ${topic} to a friend who has never heard of it?`,
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: accentSoft }}>
          <MessageCircle className="w-6 h-6" style={{ color: accent }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Let's Talk</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            About: {topic}
          </h2>
        </div>
      </div>

      {teacherScript && (
        <p className="italic text-slate-600 border-l-4 pl-4 py-1" style={{ borderColor: accent }}>
          "{teacherScript}"
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {prompts.map((p, i) => (
          <li
            key={i}
            className="flex gap-3 items-start rounded-xl p-4 border bg-white"
            style={{ borderColor: `${accent}33` }}
          >
            <span
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: accent }}
            >
              {i + 1}
            </span>
            <p className="text-base md:text-lg text-slate-800 leading-relaxed">{p}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="self-center mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-md hover:opacity-95 transition"
        style={{ background: accent }}
      >
        <Sparkles className="w-4 h-4" /> Start Discussion
      </button>
    </div>
  );
}
