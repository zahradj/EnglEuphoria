import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Rocket, Briefcase, UserPlus, ClipboardCheck, Target,
  Gamepad2, ClipboardList, RotateCcw, TrendingUp, Award, Flame,
} from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { SkillRadarChart } from '@/components/landing/SkillRadarChart';

const HUBS = [
  {
    id: 'playground',
    icon: Sparkles,
    name: 'The Playground',
    ageLabel: 'Kids 5–12',
    cefr: 'Pre-A1 → B1',
    body: 'A gamified forest world where every lesson is an adventure. Animated mascots guide the story, rewards celebrate every milestone, and grammar stays implicit — taught through play, never drilled.',
    from: '#FF9F1C',
    to: '#FFBF00',
  },
  {
    id: 'academy',
    icon: Rocket,
    name: 'The Academy',
    ageLabel: 'Teens 13–17',
    cefr: 'Pre-A1 → C1',
    body: 'Project-based lessons built around identity, pop culture, and real debate — up through exam-prep register at the top levels. No textbook filler, just language that matters to a teenager’s actual life.',
    from: '#6366F1',
    to: '#A855F7',
  },
  {
    id: 'success',
    icon: Briefcase,
    name: 'The Success Hub',
    ageLabel: 'Adults 18+',
    cefr: 'Pre-A1 → C1',
    body: 'Structured business English: negotiation, interviews, presentations, and networking, with lexical precision as the focus once fluency is established. Efficient sessions, measurable progress.',
    from: '#10B981',
    to: '#059669',
  },
];

const LESSON_STEPS = [
  {
    icon: UserPlus,
    title: 'A live teacher, one-on-one',
    body: 'Every class is real-time video with your own teacher — not a pre-recorded course. You pick who you learn with and when.',
  },
  {
    icon: Target,
    title: 'One clear objective per lesson',
    body: 'Each lesson targets a specific, CEFR-aligned skill — a grammar pattern, a vocabulary set, a functional phrase — never a pile of unrelated content in one sitting.',
  },
  {
    icon: Gamepad2,
    title: 'Interactive, not passive',
    body: 'Vocabulary and grammar are practiced through games, roleplay, stories, and speaking challenges built into the lesson itself — never a slide deck to sit through.',
  },
  {
    icon: ClipboardList,
    title: 'Wrap-up and quick homework',
    body: 'Your teacher rates the class and logs what was covered; a short, gamified homework set reinforces that exact lesson’s objective before the next class.',
  },
];

const PROGRESS_POINTS = [
  {
    icon: ClipboardCheck,
    title: 'Placement in ~10 minutes',
    body: 'An adaptive test finds your real starting CEFR level before your first paid lesson — no guessing, no generic level-1 default.',
  },
  {
    icon: RotateCcw,
    title: 'Never lost, never skipped',
    body: 'Finish a lesson and your next class picks up the next one automatically. If one doesn’t get finished, you simply pick it back up next time — nothing lost, nothing skipped.',
  },
  {
    icon: TrendingUp,
    title: 'A skill radar, not just a grade',
    body: 'Vocabulary, grammar accuracy, fluency, and listening are tracked separately after every class, so progress is visible skill by skill.',
  },
];

const GAMIFICATION = [
  { icon: Award, title: 'Achievement badges', body: 'Earned for completed lessons and mastered skills — never for meaningless clicks.' },
  { icon: Flame, title: 'Daily streaks', body: 'Momentum you can see, with room to recover a missed day instead of losing everything.' },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Same Skill Tracker preview used on the homepage (PersonalizedPathSection.tsx)
 *  — reuses the real SkillRadarChart component and its i18n copy directly,
 *  per direct request to match the homepage's own style rather than a
 *  bespoke chart. */
function SkillTrackerPreview({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();
  return (
    <div className={`rounded-3xl p-6 md:p-10 ${
      isDark
        ? 'bg-white/[0.03] border border-white/[0.06]'
        : 'bg-white border border-slate-100 shadow-[0_8px_32px_rgba(15,23,42,0.04)]'
    }`}>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span className={`inline-block text-[11px] font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full ${
            isDark ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
          }`}>
            {t('lp.skills.eyebrow')}
          </span>
          <h3 className={`text-2xl md:text-3xl font-extrabold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('lp.skills.heading')}
          </h3>
          <p className={`text-base leading-relaxed mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('lp.skills.desc')}
          </p>
          <ul className="space-y-2.5">
            {(['speaking', 'listening', 'reading', 'writing', 'vocabulary', 'grammar'] as const).map((s) => (
              <li key={s} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
                {t(`lp.skills.${s}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <SkillRadarChart size={280} />
        </div>
      </div>
    </div>
  );
}

export default function PlatformMethodology() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  const cardBase = isDark
    ? 'bg-slate-900/60 border-white/10'
    : 'bg-white border-slate-200';
  const bodyText = isDark ? 'text-slate-400' : 'text-slate-600';
  const headingText = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="space-y-20">
      {/* Three hubs */}
      <section aria-labelledby="hubs-heading">
        <FadeIn>
          <h2 id="hubs-heading" className={`text-2xl md:text-3xl font-bold mb-2 ${headingText}`}>
            Three hubs, one CEFR framework
          </h2>
          <p className={`max-w-2xl mb-8 ${bodyText}`}>
            Every learner is taught inside the hub built for their stage of life — but all three share the same
            underlying CEFR progression, so level actually means the same thing everywhere on the platform.
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {HUBS.map((hub, i) => (
            <FadeIn key={hub.id} delay={i * 0.1}>
              <div className={`relative h-full rounded-3xl border p-6 overflow-hidden ${cardBase}`}>
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[70px]"
                  style={{ backgroundColor: hub.from, opacity: isDark ? 0.12 : 0.08 }}
                />
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `linear-gradient(135deg, ${hub.from}, ${hub.to})` }}
                  >
                    <hub.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${headingText}`}>{hub.name}</h3>
                  <div className="flex items-center gap-2 mb-4 text-xs font-semibold">
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{hub.ageLabel}</span>
                    <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>·</span>
                    <span style={{ color: hub.from }}>{hub.cefr}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${bodyText}`}>{hub.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Inside a lesson */}
      <section aria-labelledby="lesson-heading">
        <FadeIn>
          <h2 id="lesson-heading" className={`text-2xl md:text-3xl font-bold mb-2 ${headingText}`}>
            Inside a lesson
          </h2>
          <p className={`max-w-2xl mb-8 ${bodyText}`}>
            The same structure repeats every class, in every hub — only the theme, pace, and vocabulary change.
          </p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 gap-5">
          {LESSON_STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.08}>
              <div className={`h-full rounded-2xl border p-6 ${cardBase}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  isDark ? 'bg-indigo-500/15' : 'bg-indigo-50'
                }`}>
                  <step.icon className={`w-5 h-5 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
                </div>
                <h3 className={`font-bold mb-2 ${headingText}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${bodyText}`}>{step.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Placement & progress */}
      <section aria-labelledby="progress-heading">
        <FadeIn>
          <h2 id="progress-heading" className={`text-2xl md:text-3xl font-bold mb-2 ${headingText}`}>
            Placement &amp; progress
          </h2>
          <p className={`max-w-2xl mb-8 ${bodyText}`}>
            Where you start and what comes next are both handled for you — with a teacher able to override either
            one at any time.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="mb-8">
            <SkillTrackerPreview isDark={isDark} />
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-5">
          {PROGRESS_POINTS.map((point, i) => (
            <FadeIn key={point.title} delay={i * 0.1}>
              <div className={`h-full rounded-2xl border p-6 ${cardBase}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'
                }`}>
                  <point.icon className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                </div>
                <h3 className={`font-bold mb-2 ${headingText}`}>{point.title}</h3>
                <p className={`text-sm leading-relaxed ${bodyText}`}>{point.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Gamification with purpose */}
      <section aria-labelledby="game-heading">
        <FadeIn>
          <h2 id="game-heading" className={`text-2xl md:text-3xl font-bold mb-2 ${headingText}`}>
            Gamification with a purpose
          </h2>
          <p className={`max-w-2xl mb-8 ${bodyText}`}>
            Game mechanics wrap around the pedagogy — they never replace it. No points for meaningless clicks,
            no timers that punish experimentation.
          </p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 gap-5">
          {GAMIFICATION.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.1}>
              <div className={`h-full rounded-2xl border p-6 flex items-start gap-4 ${cardBase}`}>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-amber-500/15' : 'bg-amber-50'
                }`}>
                  <item.icon className={`w-5 h-5 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h3 className={`font-bold mb-1 ${headingText}`}>{item.title}</h3>
                  <p className={`text-sm leading-relaxed ${bodyText}`}>{item.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
