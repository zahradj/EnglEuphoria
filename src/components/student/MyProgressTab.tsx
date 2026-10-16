import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Target, Star, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useSmartSkillMap } from '@/hooks/useSmartSkillMap';
import { useStudentStreak } from '@/hooks/useStudentStreak';
import { useResumeTarget } from '@/hooks/useResumeTarget';
import { useMyProgress } from '@/hooks/useMyProgress';
import { SkillRadar } from './progress/SkillRadar';
import {
  SKILL_TAB,
  focusSkill,
  masteryLevel,
  normalizeSkills,
  ringPercent,
  skillStars,
  weeklyLessonTarget,
} from '@/lib/progress/progressMath';

const HUB_COLOR = { playground: '#f97316', academy: '#7c3aed', professional: '#059669' } as const;

const openTab = (tab: string) =>
  window.dispatchEvent(new CustomEvent('student-dashboard:open-tab', { detail: { tab } }));

function Ring({ percent, color, children }: { percent: number; color: string; children: React.ReactNode }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - percent / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">{children}</div>
    </div>
  );
}

/**
 * "My Progress": one page that answers "where am I, what changed, what should I do next?"
 * Built only from data the app already collects. A student is compared with their own past only.
 */
export const MyProgressTab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { studentLevel } = useStudentLevel();
  const hub = studentLevel ?? 'academy';
  const color = HUB_COLOR[hub];
  const isKid = hub === 'playground';

  const { data: skillMap } = useSmartSkillMap(hub);
  const { data: streak } = useStudentStreak();
  const { data: next } = useResumeTarget();
  const { data: progress } = useMyProgress();

  const skills = useMemo(() => normalizeSkills(skillMap?.tree?.roots), [skillMap]);
  const focus = useMemo(() => focusSkill(skills), [skills]);
  const anySkill = skills.some((s) => s.hasItems);

  const target = weeklyLessonTarget(progress?.goalText);
  const done = progress?.lessonsThisWeek ?? 0;
  const goalMet = done >= target;

  const skillName = (domain: string) => t('st.skill.domain.' + domain, domain);
  const levelName = (pct: number, has: boolean) => {
    const lvl = masteryLevel(pct, has);
    return t('st.mpg.lvl.' + lvl, lvl);
  };

  const nextTitle = next?.lessonTitle ?? t('st.mpg.aLesson', 'Your lesson');
  const nextKind = next?.kind ?? 'idle';
  const nextHref = next?.lessonId ? `/lesson/${next.lessonId}` : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('st.mpg.title', 'My Progress')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('st.mpg.sub', 'Where you are now, and what to do next. You are only compared with your own past.')}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* This week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" style={{ color }} />
              {t('st.mpg.week', 'This week')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-5">
            <Ring percent={ringPercent(done, target)} color={color}>
              <div>
                <div className="text-2xl font-bold leading-none">{done}/{target}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">{t('st.mpg.lessons', 'lessons')}</div>
              </div>
            </Ring>
            <div className="space-y-2 min-w-0">
              <p className="text-sm font-medium">
                {goalMet
                  ? t('st.mpg.goalMet', 'Weekly goal reached. Great work!')
                  : t('st.mpg.toGo', { n: target - done, defaultValue: 'Lessons to go this week: {{n}}' })}
              </p>
              {progress?.goalText && (
                <p className="text-xs text-muted-foreground truncate">
                  {t('st.mpg.yourGoal', { goal: progress.goalText, defaultValue: 'Your goal: {{goal}}' })}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {t('st.mpg.streak', { n: streak?.current_streak ?? 0, defaultValue: 'Day streak: {{n}}' })}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  {t('st.mpg.best', { n: streak?.longest_streak ?? 0, defaultValue: 'Best: {{n}}' })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next step */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" style={{ color }} />
              {t('st.mpg.nextStep', 'Your next step')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextKind !== 'idle' && nextHref ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {nextKind === 'resume' ? t('st.mpg.continue', 'Continue') : t('st.mpg.upNext', 'Up next')}
                  </div>
                  <div className="font-semibold truncate">{nextTitle}</div>
                </div>
                <Button asChild style={{ backgroundColor: color }} className="shrink-0 text-white hover:opacity-90">
                  <Link to={nextHref}>
                    {nextKind === 'resume' ? t('st.mpg.resume', 'Resume') : t('st.mpg.start', 'Start')}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('st.mpg.caughtUp', "You're all caught up. Nice!")}</p>
            )}

            {focus && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3">
                <p className="text-sm">
                  {t('st.mpg.focus', { skill: skillName(focus.domain), defaultValue: 'Practice {{skill}} next: it has the most room to grow.' })}
                </p>
                <Button variant="outline" size="sm" className="shrink-0" onClick={() => openTab(SKILL_TAB[focus.domain] ?? 'learning-path')}>
                  {t('st.mpg.practise', 'Practice')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" style={{ color }} />
            {t('st.mpg.skills', 'Your skills')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!anySkill ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {t('st.mpg.skillsEmpty', 'Finish your first lesson to see your skills grow.')}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 items-center">
              {!isKid && (
                <SkillRadar
                  color={color}
                  axes={skills.map((s) => ({ key: s.domain, label: skillName(s.domain), pct: s.pct }))}
                  ariaLabel={t('st.mpg.radarLabel', {
                    list: skills.map((s) => `${skillName(s.domain)} ${s.pct}%`).join(', '),
                    defaultValue: 'Skill profile: {{list}}',
                  })}
                />
              )}
              <ul className={isKid ? 'space-y-4 md:col-span-2' : 'space-y-3'}>
                {skills.map((s) => (
                  <li key={s.domain}>
                    <div className="flex items-center justify-between gap-3 text-sm mb-1">
                      <span className="font-medium">{skillName(s.domain)}</span>
                      {isKid ? (
                        <span aria-label={t('st.mpg.starsOf', { n: skillStars(s.pct, s.hasItems), defaultValue: '{{n}} of 5 stars' })} className="text-lg tracking-wider text-yellow-500">
                          {'★'.repeat(skillStars(s.pct, s.hasItems))}
                          <span className="text-muted-foreground/30">{'★'.repeat(5 - skillStars(s.pct, s.hasItems))}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground tabular-nums">
                          {levelName(s.pct, s.hasItems)}{s.hasItems ? ` · ${s.pct}%` : ''}
                        </span>
                      )}
                    </div>
                    {isKid ? (
                      <p className="text-xs text-muted-foreground">{levelName(s.pct, s.hasItems)}</p>
                    ) : (
                      <Progress value={s.pct} className="h-2" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent wins */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5" style={{ color }} />
            {t('st.mpg.wins', 'Recent wins')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(progress?.recent.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">{t('st.mpg.winsEmpty', 'Finished lessons will show up here.')}</p>
          ) : (
            <ul className="divide-y">
              {progress!.recent.map((w) => (
                <li key={w.lessonId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="truncate">{w.title ?? t('st.mpg.aLesson', 'Your lesson')}</span>
                  </span>
                  {w.completedAt && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(w.completedAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProgressTab;
