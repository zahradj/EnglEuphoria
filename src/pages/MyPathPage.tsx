import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Clock, Target, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ImprovedProtectedRoute } from '@/components/auth/ImprovedProtectedRoute';
import { ProfileCompletionBanner } from '@/components/student/ProfileCompletionBanner';
import {
  HUB_BRAND,
  hubToDashboardRoute,
  type HubType,
} from '@/lib/hubAssignment';
import { LearningPathTab } from '@/components/student/LearningPathTab';

type ProfileSlice = {
  hub_type: HubType | null;
  cefr_level: string | null;
  lesson_duration: number | null;
  weekly_goal: string | null;
  interests: string[] | null;
  age: number | null;
  learning_reason: string | null;
  placement_test_score: number | null;
};

const CEFR_LADDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

function MyPathInner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileSlice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('hub_type, cefr_level, lesson_duration, weekly_goal, student_level, interests, age, learning_reason, placement_test_score')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error('My Path: failed to fetch profile', error);
      setProfile({
        hub_type: ((data as any)?.hub_type ?? (data as any)?.student_level ?? 'playground') as HubType,
        cefr_level: (data as any)?.cefr_level ?? 'A1',
        lesson_duration: (data as any)?.lesson_duration ?? null,
        weekly_goal: (data as any)?.weekly_goal ?? null,
        interests: (data as any)?.interests ?? null,
        age: (data as any)?.age ?? null,
        learning_reason: (data as any)?.learning_reason ?? null,
        placement_test_score: (data as any)?.placement_test_score ?? null,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const hub = (profile?.hub_type ?? 'playground') as HubType;
  const brand = HUB_BRAND[hub];
  const cefr = (profile?.cefr_level ?? 'A1').toUpperCase();
  const ladderIndex = useMemo(
    () => Math.max(0, CEFR_LADDER.indexOf(cefr as (typeof CEFR_LADDER)[number])),
    [cefr],
  );

  if (loading || !profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background to-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ProfileCompletionBanner />

        {/* Branded hero banner */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${brand.gradient} p-6 text-white shadow-xl sm:p-8`}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80">
              <Sparkles className="h-4 w-4" />
              Your Learning Path
            </div>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Welcome to the {brand.label} {brand.emoji}
            </h1>
            <p className="mt-1 text-sm text-white/85">{brand.tagline}</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <BannerStat
                icon={<Trophy className="h-4 w-4" />}
                label="Starting level"
                value={cefr}
              />
              <BannerStat
                icon={<Clock className="h-4 w-4" />}
                label="Lesson length"
                value={profile.lesson_duration ? `${profile.lesson_duration} min` : '—'}
              />
              <BannerStat
                icon={<Target className="h-4 w-4" />}
                label="Weekly goal"
                value={profile.weekly_goal ?? '—'}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                onClick={() => navigate(hubToDashboardRoute(hub))}
                className="rounded-full bg-white text-foreground hover:bg-white/90"
              >
                Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* CEFR ladder — visualises where the student starts */}
        <section aria-label="CEFR progression" className="mt-6">
          <div className="flex items-center justify-between">
            {CEFR_LADDER.map((lvl, i) => {
              const reached = i <= ladderIndex;
              const isCurrent = i === ladderIndex;
              return (
                <div key={lvl} className="flex flex-1 flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                      isCurrent
                        ? `border-transparent text-white shadow-lg ${
                            hub === 'playground'
                              ? 'bg-[#FE6A2F]'
                              : hub === 'academy'
                                ? 'bg-[#6B21A8]'
                                : 'bg-[#059669]'
                          }`
                        : reached
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {lvl}
                  </div>
                  {i < CEFR_LADDER.length - 1 && (
                    <div
                      className={`mt-[-22px] h-0.5 w-full ${
                        i < ladderIndex ? 'bg-primary/40' : 'bg-border'
                      }`}
                      style={{ marginLeft: '50%' }}
                      aria-hidden
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            You’re starting at <span className={`font-semibold ${brand.textClass}`}>{cefr}</span>.
            Every lesson moves you one step closer to fluency.
          </p>
        </section>

        {/* Onboarding snapshot — shows the data the student gave us */}
        {(profile.interests?.length || profile.age || profile.learning_reason || profile.placement_test_score != null) && (
          <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Your profile
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.age != null && (
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Age</span>
                  <span className="text-sm font-semibold text-foreground">{profile.age}</span>
                </div>
              )}
              {profile.learning_reason && (
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Why I'm learning</span>
                  <span className="text-sm font-semibold text-foreground">{profile.learning_reason}</span>
                </div>
              )}
              {profile.placement_test_score != null && (
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Placement score</span>
                  <span className="text-sm font-semibold text-foreground">{profile.placement_test_score}%</span>
                </div>
              )}
              {profile.interests?.length ? (
                <div className="sm:col-span-2 rounded-xl bg-muted/50 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1.5">Interests</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i) => (
                      <span
                        key={i}
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${brand.textClass} bg-background`}
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* Existing visual roadmap */}
        <section className="mt-8">
          <LearningPathTab />
        </section>
      </div>
    </div>
  );
}

function BannerStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm ring-1 ring-white/20">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/80">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

export default function MyPathPage() {
  return (
    <ImprovedProtectedRoute requiredRole="student">
      <MyPathInner />
    </ImprovedProtectedRoute>
  );
}
