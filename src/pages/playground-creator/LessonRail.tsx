import { PLAYGROUND_UNIT_LESSONS, resolveLessonTitle, type PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";
import type { PlaygroundUnit } from "@/playground-blueprint/types";

// Backdrop world → tiny visual swatch (emoji + gradient). Keeps authors oriented
// when a unit is themed (Space, Kitchen, Forest…) vs. plain topic-only.
const THEME_SWATCH: Array<{ test: RegExp; emoji: string; gradient: string }> = [
  { test: /space|astronaut|rocket|planet|galaxy|star/i, emoji: "🚀", gradient: "from-indigo-500 to-violet-700" },
  { test: /kitchen|food|cook|market|meal|snack|fruit|vegetable/i, emoji: "🍳", gradient: "from-amber-400 to-rose-500" },
  { test: /forest|jungle|tree|woods|nature/i, emoji: "🌲", gradient: "from-emerald-500 to-green-700" },
  { test: /ocean|sea|beach|underwater|fish|shark/i, emoji: "🌊", gradient: "from-sky-400 to-blue-700" },
  { test: /farm|barn|cow|sheep|tractor/i, emoji: "🚜", gradient: "from-lime-500 to-yellow-600" },
  { test: /castle|knight|dragon|fairy|princess/i, emoji: "🏰", gradient: "from-fuchsia-500 to-purple-700" },
  { test: /city|street|park|playground|neighborhood/i, emoji: "🏙️", gradient: "from-slate-400 to-slate-700" },
  { test: /school|classroom|book|pen/i, emoji: "🎒", gradient: "from-cyan-400 to-blue-600" },
  { test: /family|home|house/i, emoji: "🏡", gradient: "from-orange-400 to-rose-500" },
  { test: /animal|pet|zoo/i, emoji: "🦊", gradient: "from-orange-400 to-amber-600" },
  { test: /weather|rain|sun|snow/i, emoji: "☀️", gradient: "from-yellow-300 to-orange-500" },
];

function themeSwatch(theme?: string) {
  const t = (theme || "").trim();
  if (!t) return null;
  return THEME_SWATCH.find((s) => s.test.test(t)) ?? { emoji: "🌟", gradient: "from-orange-400 to-rose-500" };
}

export function LessonRail({
  unit,
  activeLesson,
  onSelect,
}: {
  unit: PlaygroundUnit;
  activeLesson: PlaygroundLessonNumber;
  onSelect: (n: PlaygroundLessonNumber) => void;
}) {
  const theme = (unit as any)?.unit_theme as string | undefined;
  const swatch = themeSwatch(theme);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-orange-700">
          Lessons
        </div>
        {swatch && theme ? (
          <div
            className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${swatch.gradient} px-2 py-0.5 text-[10px] font-bold text-white shadow-sm`}
            title={`Backdrop world: ${theme}`}
          >
            <span>{swatch.emoji}</span>
            <span className="truncate max-w-[80px]">{theme}</span>
          </div>
        ) : null}
      </div>
      {PLAYGROUND_UNIT_LESSONS.map((tpl) => {
        const n = tpl.lesson_number as PlaygroundLessonNumber;
        const lesson = unit.lessons.find((l) => l.lesson_number === n);
        const pageCount = lesson?.pages?.length ?? 0;
        const hasHw = !!lesson?.homework;
        const active = n === activeLesson;
        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`w-full rounded-xl border p-2 text-left transition ${
              active
                ? "border-[#FE6A2F] bg-[#FE6A2F]/10 shadow-sm"
                : "border-orange-100 bg-white hover:border-orange-200 hover:bg-orange-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FE6A2F] text-xs font-bold text-white">
                  {n}
                </div>
                {swatch ? (
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${swatch.gradient} text-[10px] shadow-sm`}
                    title={theme}
                  >
                    {swatch.emoji}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-800">
                  {pageCount}p
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    hasHw ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                  }`}
                  title={hasHw ? "Homework attached" : "No homework yet"}
                >
                  HW
                </span>
              </div>
            </div>
            <div className="mt-1 text-xs font-semibold text-orange-950">{resolveLessonTitle(unit.unit_topic, lesson, n)}</div>
          </button>
        );
      })}
    </div>
  );
}
